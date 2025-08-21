import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rides, drivers, passengers, notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const updateRideSchema = z.object({
  status: z.enum(['accepted', 'in_progress', 'completed', 'cancelled']).optional(),
  actualPickupTime: z.string().optional(),
  actualDropoffTime: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
})

// GET /api/rides/[id] - Get specific ride
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

    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, rideId))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Check if user has access to this ride
    if (session.user.role === 'passenger') {
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.userId, userId))
        .limit(1)

      if (!passenger[0] || ride[0].passengerId !== passenger[0].id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (session.user.role === 'driver') {
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)

      if (!driver[0] || ride[0].driverId !== driver[0].id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    // Admin users can access any ride

    return NextResponse.json({ ride: ride[0] })
  } catch (error) {
    console.error('Get ride error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/rides/[id] - Update ride status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateRideSchema.parse(body)
    
    const rideId = parseInt(params.id)
    const userId = parseInt(session.user.id)

    // Get the ride
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, rideId))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Check permissions based on user role
    if (session.user.role === 'driver') {
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)

      if (!driver[0] || ride[0].driverId !== driver[0].id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Drivers can update status and pickup/dropoff times
      const updateData: any = {}
      if (validatedData.status) updateData.status = validatedData.status
      if (validatedData.actualPickupTime) updateData.actualPickupTime = new Date(validatedData.actualPickupTime)
      if (validatedData.actualDropoffTime) updateData.actualDropoffTime = new Date(validatedData.actualDropoffTime)

      const updatedRide = await db
        .update(rides)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(rides.id, rideId))
        .returning()

      // Send notification to passenger
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.id, ride[0].passengerId))
        .limit(1)

      if (passenger[0]) {
        await db.insert(notifications).values({
          userId: passenger[0].userId,
          type: 'ride_update',
          title: 'Ride Status Update',
          message: `Your ride status has been updated to: ${validatedData.status}`,
          relatedRideId: rideId,
        })
      }

      return NextResponse.json({ 
        message: 'Ride updated successfully', 
        ride: updatedRide[0] 
      })

    } else if (session.user.role === 'passenger') {
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.userId, userId))
        .limit(1)

      if (!passenger[0] || ride[0].passengerId !== passenger[0].id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      // Passengers can only rate and provide feedback after completion
      if (ride[0].status !== 'completed') {
        return NextResponse.json({ 
          error: 'Can only rate completed rides' 
        }, { status: 400 })
      }

      const updateData: any = {}
      if (validatedData.rating) updateData.rating = validatedData.rating
      if (validatedData.feedback) updateData.feedback = validatedData.feedback

      const updatedRide = await db
        .update(rides)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(rides.id, rideId))
        .returning()

      // Update driver's average rating
      if (validatedData.rating && ride[0].driverId) {
        const driverRides = await db
          .select()
          .from(rides)
          .where(and(
            eq(rides.driverId, ride[0].driverId),
            eq(rides.status, 'completed')
          ))

        const totalRatings = driverRides.filter(r => r.rating !== null)
        const averageRating = totalRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings.length

        await db
          .update(drivers)
          .set({ 
            rating: parseFloat(averageRating.toFixed(1)),
            totalRides: driverRides.length,
          })
          .where(eq(drivers.id, ride[0].driverId))
      }

      return NextResponse.json({ 
        message: 'Rating submitted successfully', 
        ride: updatedRide[0] 
      })

    } else {
      // Admin can update anything
      const updateData: any = {}
      if (validatedData.status) updateData.status = validatedData.status
      if (validatedData.actualPickupTime) updateData.actualPickupTime = new Date(validatedData.actualPickupTime)
      if (validatedData.actualDropoffTime) updateData.actualDropoffTime = new Date(validatedData.actualDropoffTime)
      if (validatedData.rating) updateData.rating = validatedData.rating
      if (validatedData.feedback) updateData.feedback = validatedData.feedback

      const updatedRide = await db
        .update(rides)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(rides.id, rideId))
        .returning()

      return NextResponse.json({ 
        message: 'Ride updated successfully', 
        ride: updatedRide[0] 
      })
    }
  } catch (error) {
    console.error('Update ride error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}