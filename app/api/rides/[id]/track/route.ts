import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rides, drivers, passengers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// GET /api/rides/[id]/track - Get real-time ride tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rideId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Get ride details with driver and passenger info
    const ride = await db
      .select({
        id: rides.id,
        passengerId: rides.passengerId,
        driverId: rides.driverId,
        pickupAddress: rides.pickupAddress,
        pickupLatitude: rides.pickupLatitude,
        pickupLongitude: rides.pickupLongitude,
        destinationAddress: rides.destinationAddress,
        destinationLatitude: rides.destinationLatitude,
        destinationLongitude: rides.destinationLongitude,
        status: rides.status,
        scheduledTime: rides.scheduledTime,
        actualPickupTime: rides.actualPickupTime,
        fareAmount: rides.fareAmount,
        isEmergency: rides.isEmergency,
        driver: {
          id: drivers.id,
          userId: drivers.userId,
          vehicleMake: drivers.vehicleMake,
          vehicleModel: drivers.vehicleModel,
          vehicleColor: drivers.vehicleColor,
          vehiclePlate: drivers.vehiclePlate,
          currentLatitude: drivers.currentLatitude,
          currentLongitude: drivers.currentLongitude,
          rating: drivers.rating,
        },
        passenger: {
          id: passengers.id,
          userId: passengers.userId,
          emergencyContactName: passengers.emergencyContactName,
          emergencyContactPhone: passengers.emergencyContactPhone,
        }
      })
      .from(rides)
      .leftJoin(drivers, eq(rides.driverId, drivers.id))
      .leftJoin(passengers, eq(rides.passengerId, passengers.id))
      .where(eq(rides.id, rideId))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Check permissions
    const userRole = session.user.role
    let hasAccess = false

    if (userRole === 'admin') {
      hasAccess = true
    } else if (userRole === 'passenger') {
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.userId, userId))
        .limit(1)
      
      if (passenger[0] && ride[0].passengerId === passenger[0].id) {
        hasAccess = true
      }
    } else if (userRole === 'driver') {
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)
      
      if (driver[0] && ride[0].driverId === driver[0].id) {
        hasAccess = true
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate estimated arrival time (simplified)
    let estimatedArrival = null
    if (ride[0].status === 'in_progress' && ride[0].driver?.currentLatitude && ride[0].driver?.currentLongitude) {
      // Simple calculation - in production, use Google Maps API for real routing
      const distance = calculateDistance(
        ride[0].driver.currentLatitude,
        ride[0].driver.currentLongitude,
        ride[0].destinationLatitude,
        ride[0].destinationLongitude
      )
      
      // Assume average speed of 25 mph in city
      const estimatedMinutes = Math.round((distance / 25) * 60)
      estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000).toISOString()
    }

    const trackingData = {
      ride: {
        id: ride[0].id,
        status: ride[0].status,
        pickupAddress: ride[0].pickupAddress,
        destinationAddress: ride[0].destinationAddress,
        scheduledTime: ride[0].scheduledTime,
        actualPickupTime: ride[0].actualPickupTime,
        fareAmount: ride[0].fareAmount,
        isEmergency: ride[0].isEmergency,
        estimatedArrival,
      },
      driver: ride[0].driver ? {
        vehicleMake: ride[0].driver.vehicleMake,
        vehicleModel: ride[0].driver.vehicleModel,
        vehicleColor: ride[0].driver.vehicleColor,
        vehiclePlate: ride[0].driver.vehiclePlate,
        currentLatitude: ride[0].driver.currentLatitude,
        currentLongitude: ride[0].driver.currentLongitude,
        rating: ride[0].driver.rating,
      } : null,
      passenger: userRole === 'driver' ? (ride[0].passenger ? {
        emergencyContactName: ride[0].passenger.emergencyContactName,
        emergencyContactPhone: ride[0].passenger.emergencyContactPhone,
      } : null) : null,
      coordinates: {
        pickup: {
          latitude: ride[0].pickupLatitude,
          longitude: ride[0].pickupLongitude,
        },
        destination: {
          latitude: ride[0].destinationLatitude,
          longitude: ride[0].destinationLongitude,
        },
        driver: ride[0].driver?.currentLatitude ? {
          latitude: ride[0].driver.currentLatitude,
          longitude: ride[0].driver.currentLongitude,
        } : null,
      }
    }

    return NextResponse.json(trackingData)

  } catch (error) {
    console.error('Track ride error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/rides/[id]/track - Update driver location during ride
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 })
    }

    const rideId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Get driver profile
    const driver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, userId))
      .limit(1)

    if (!driver[0]) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
    }

    // Verify driver is assigned to this ride
    const ride = await db
      .select()
      .from(rides)
      .where(and(
        eq(rides.id, rideId),
        eq(rides.driverId, driver[0].id)
      ))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found or not assigned to this driver' }, { status: 404 })
    }

    // Update driver location
    await db
      .update(drivers)
      .set({
        currentLatitude: latitude,
        currentLongitude: longitude,
        updatedAt: new Date(),
      })
      .where(eq(drivers.id, driver[0].id))

    return NextResponse.json({ 
      message: 'Location updated successfully',
      latitude,
      longitude 
    })

  } catch (error) {
    console.error('Update location error:', error)
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