import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rides, drivers, passengers, rideRequests, notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// POST /api/rides/[id]/accept - Driver accepts a ride
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!driver[0].isApproved) {
      return NextResponse.json({ error: 'Driver not approved' }, { status: 403 })
    }

    if (driver[0].status !== 'available') {
      return NextResponse.json({ error: 'Driver not available' }, { status: 400 })
    }

    // Get the ride
    const ride = await db
      .select()
      .from(rides)
      .where(eq(rides.id, rideId))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    if (ride[0].status !== 'pending') {
      return NextResponse.json({ error: 'Ride is no longer available' }, { status: 400 })
    }

    // Check if driver has a pending request for this ride
    const rideRequest = await db
      .select()
      .from(rideRequests)
      .where(and(
        eq(rideRequests.rideId, rideId),
        eq(rideRequests.driverId, driver[0].id),
        eq(rideRequests.status, 'pending')
      ))
      .limit(1)

    if (!rideRequest[0]) {
      return NextResponse.json({ error: 'No ride request found' }, { status: 404 })
    }

    // Start transaction-like operations
    try {
      // Update ride with driver and status
      const updatedRide = await db
        .update(rides)
        .set({
          driverId: driver[0].id,
          status: 'accepted',
          updatedAt: new Date(),
        })
        .where(eq(rides.id, rideId))
        .returning()

      // Update driver status to busy
      await db
        .update(drivers)
        .set({
          status: 'busy',
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driver[0].id))

      // Update ride request status
      await db
        .update(rideRequests)
        .set({
          status: 'accepted',
          responseTime: new Date(),
        })
        .where(eq(rideRequests.id, rideRequest[0].id))

      // Cancel other pending requests for this ride
      await db
        .update(rideRequests)
        .set({
          status: 'cancelled',
          responseTime: new Date(),
        })
        .where(and(
          eq(rideRequests.rideId, rideId),
          eq(rideRequests.status, 'pending')
        ))

      // Get passenger info
      const passenger = await db
        .select()
        .from(passengers)
        .where(eq(passengers.id, ride[0].passengerId))
        .limit(1)

      if (passenger[0]) {
        // Notify passenger that ride was accepted
        await db.insert(notifications).values({
          userId: passenger[0].userId,
          type: 'ride_accepted',
          title: 'Ride Accepted!',
          message: `Your ride has been accepted. Driver: ${session.user.name}`,
          relatedRideId: rideId,
        })
      }

      // Notify other drivers that ride is no longer available
      const otherRequests = await db
        .select({ driverId: rideRequests.driverId })
        .from(rideRequests)
        .where(and(
          eq(rideRequests.rideId, rideId),
          eq(rideRequests.status, 'cancelled')
        ))

      const otherDrivers = await db
        .select({ userId: drivers.userId })
        .from(drivers)
        .where(eq(drivers.id, otherRequests[0]?.driverId))

      if (otherDrivers.length > 0) {
        const notificationPromises = otherDrivers.map(d =>
          db.insert(notifications).values({
            userId: d.userId,
            type: 'ride_unavailable',
            title: 'Ride No Longer Available',
            message: 'This ride has been accepted by another driver',
            relatedRideId: rideId,
          })
        )

        await Promise.all(notificationPromises)
      }

      return NextResponse.json({
        message: 'Ride accepted successfully',
        ride: updatedRide[0],
        passenger: {
          name: passenger[0]?.emergencyContactName,
          phone: passenger[0]?.emergencyContactPhone,
        }
      })

    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }

  } catch (error) {
    console.error('Accept ride error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}