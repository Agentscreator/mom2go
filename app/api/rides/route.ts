import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rides, passengers, drivers, rideRequests, notifications } from '@/lib/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { z } from 'zod'

const createRideSchema = z.object({
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  destinationAddress: z.string().min(1, 'Destination address is required'),
  destinationLatitude: z.number(),
  destinationLongitude: z.number(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false),
})

// GET /api/rides - Get user's rides
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    let userRides

    if (userRole === 'passenger') {
      // Get passenger's rides
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.userId, userId))
        .limit(1)

      if (!passenger[0]) {
        return NextResponse.json({ error: 'Passenger profile not found' }, { status: 404 })
      }

      userRides = await db
        .select({
          id: rides.id,
          pickupAddress: rides.pickupAddress,
          destinationAddress: rides.destinationAddress,
          scheduledTime: rides.scheduledTime,
          actualPickupTime: rides.actualPickupTime,
          actualDropoffTime: rides.actualDropoffTime,
          status: rides.status,
          fareAmount: rides.fareAmount,
          isEmergency: rides.isEmergency,
          rating: rides.rating,
          feedback: rides.feedback,
          createdAt: rides.createdAt,
          driver: {
            name: drivers.user?.name,
            phone: drivers.user?.phone,
            vehicleMake: drivers.vehicleMake,
            vehicleModel: drivers.vehicleModel,
            vehicleColor: drivers.vehicleColor,
            vehiclePlate: drivers.vehiclePlate,
          }
        })
        .from(rides)
        .leftJoin(drivers, eq(rides.driverId, drivers.id))
        .where(eq(rides.passengerId, passenger[0].id))
        .orderBy(desc(rides.createdAt))

    } else if (userRole === 'driver') {
      // Get driver's rides
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)

      if (!driver[0]) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
      }

      userRides = await db
        .select({
          id: rides.id,
          pickupAddress: rides.pickupAddress,
          destinationAddress: rides.destinationAddress,
          scheduledTime: rides.scheduledTime,
          actualPickupTime: rides.actualPickupTime,
          actualDropoffTime: rides.actualDropoffTime,
          status: rides.status,
          fareAmount: rides.fareAmount,
          isEmergency: rides.isEmergency,
          rating: rides.rating,
          feedback: rides.feedback,
          createdAt: rides.createdAt,
          passenger: {
            name: passengers.user?.name,
            phone: passengers.user?.phone,
            emergencyContactName: passengers.emergencyContactName,
            emergencyContactPhone: passengers.emergencyContactPhone,
          }
        })
        .from(rides)
        .leftJoin(passengers, eq(rides.passengerId, passengers.id))
        .where(eq(rides.driverId, driver[0].id))
        .orderBy(desc(rides.createdAt))

    } else {
      // Admin - get all rides
      userRides = await db
        .select()
        .from(rides)
        .orderBy(desc(rides.createdAt))
    }

    return NextResponse.json({ rides: userRides })
  } catch (error) {
    console.error('Get rides error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/rides - Create a new ride
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'passenger') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createRideSchema.parse(body)

    const userId = parseInt(session.user.id)

    // Get passenger profile
    const passenger = await db
      .select()
      .from(passengers)
      .where(eq(passengers.userId, userId))
      .limit(1)

    if (!passenger[0]) {
      return NextResponse.json({ error: 'Passenger profile not found' }, { status: 404 })
    }

    // Calculate estimated fare (simple calculation for demo)
    const estimatedDistance = calculateDistance(
      validatedData.pickupLatitude,
      validatedData.pickupLongitude,
      validatedData.destinationLatitude,
      validatedData.destinationLongitude
    )
    const baseFare = 5.00
    const perMileFare = 2.50
    const emergencyMultiplier = validatedData.isEmergency ? 1.5 : 1
    const estimatedFare = (baseFare + (estimatedDistance * perMileFare)) * emergencyMultiplier

    // Create ride
    const newRide = await db.insert(rides).values({
      passengerId: passenger[0].id,
      pickupAddress: validatedData.pickupAddress,
      pickupLatitude: validatedData.pickupLatitude,
      pickupLongitude: validatedData.pickupLongitude,
      destinationAddress: validatedData.destinationAddress,
      destinationLatitude: validatedData.destinationLatitude,
      destinationLongitude: validatedData.destinationLongitude,
      scheduledTime: validatedData.scheduledTime ? new Date(validatedData.scheduledTime) : new Date(),
      notes: validatedData.notes,
      isEmergency: validatedData.isEmergency,
      fareAmount: estimatedFare.toFixed(2),
      distance: estimatedDistance,
    }).returning()

    // Find available drivers (simplified - in production, use geospatial queries)
    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(and(
        eq(drivers.status, 'available'),
        eq(drivers.isApproved, true)
      ))
      .limit(10)

    // Send ride requests to available drivers
    if (availableDrivers.length > 0) {
      const rideRequestPromises = availableDrivers.map(driver =>
        db.insert(rideRequests).values({
          rideId: newRide[0].id,
          driverId: driver.id,
        })
      )

      await Promise.all(rideRequestPromises)

      // Send notifications to drivers
      const notificationPromises = availableDrivers.map(driver =>
        db.insert(notifications).values({
          userId: driver.userId,
          type: 'ride_request',
          title: validatedData.isEmergency ? 'Emergency Ride Request' : 'New Ride Request',
          message: `New ride from ${validatedData.pickupAddress} to ${validatedData.destinationAddress}`,
          relatedRideId: newRide[0].id,
        })
      )

      await Promise.all(notificationPromises)
    }

    return NextResponse.json({
      message: 'Ride created successfully',
      ride: newRide[0],
      estimatedFare,
      availableDrivers: availableDrivers.length,
    })
  } catch (error) {
    console.error('Create ride error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}