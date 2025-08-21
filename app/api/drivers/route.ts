import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { drivers, users, rides } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'

const updateDriverSchema = z.object({
  status: z.enum(['available', 'busy', 'offline']).optional(),
  currentLatitude: z.number().optional(),
  currentLongitude: z.number().optional(),
  isApproved: z.boolean().optional(),
})

// GET /api/drivers - Get drivers (admin) or current driver profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    if (userRole === 'admin') {
      // Admin can see all drivers
      const allDrivers = await db
        .select({
          id: drivers.id,
          userId: drivers.userId,
          name: users.name,
          email: users.email,
          phone: users.phone,
          licenseNumber: drivers.licenseNumber,
          vehicleMake: drivers.vehicleMake,
          vehicleModel: drivers.vehicleModel,
          vehicleYear: drivers.vehicleYear,
          vehiclePlate: drivers.vehiclePlate,
          vehicleColor: drivers.vehicleColor,
          cprCertified: drivers.cprCertified,
          backgroundCheck: drivers.backgroundCheck,
          status: drivers.status,
          rating: drivers.rating,
          totalRides: drivers.totalRides,
          isApproved: drivers.isApproved,
          createdAt: drivers.createdAt,
        })
        .from(drivers)
        .leftJoin(users, eq(drivers.userId, users.id))
        .orderBy(desc(drivers.createdAt))

      return NextResponse.json({ drivers: allDrivers })

    } else if (userRole === 'driver') {
      // Driver can only see their own profile
      const driverProfile = await db
        .select({
          id: drivers.id,
          userId: drivers.userId,
          licenseNumber: drivers.licenseNumber,
          vehicleMake: drivers.vehicleMake,
          vehicleModel: drivers.vehicleModel,
          vehicleYear: drivers.vehicleYear,
          vehiclePlate: drivers.vehiclePlate,
          vehicleColor: drivers.vehicleColor,
          cprCertified: drivers.cprCertified,
          backgroundCheck: drivers.backgroundCheck,
          status: drivers.status,
          rating: drivers.rating,
          totalRides: drivers.totalRides,
          currentLatitude: drivers.currentLatitude,
          currentLongitude: drivers.currentLongitude,
          isApproved: drivers.isApproved,
          createdAt: drivers.createdAt,
          updatedAt: drivers.updatedAt,
        })
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)

      if (!driverProfile[0]) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
      }

      // Get recent rides for this driver
      const recentRides = await db
        .select()
        .from(rides)
        .where(eq(rides.driverId, driverProfile[0].id))
        .orderBy(desc(rides.createdAt))
        .limit(10)

      return NextResponse.json({ 
        driver: driverProfile[0],
        recentRides 
      })

    } else {
      // Passengers can see available drivers (limited info)
      const availableDrivers = await db
        .select({
          id: drivers.id,
          vehicleMake: drivers.vehicleMake,
          vehicleModel: drivers.vehicleModel,
          vehicleColor: drivers.vehicleColor,
          rating: drivers.rating,
          totalRides: drivers.totalRides,
        })
        .from(drivers)
        .where(and(
          eq(drivers.status, 'available'),
          eq(drivers.isApproved, true)
        ))

      return NextResponse.json({ drivers: availableDrivers })
    }

  } catch (error) {
    console.error('Get drivers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/drivers - Update driver status/location
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateDriverSchema.parse(body)
    
    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    if (userRole === 'admin') {
      // Admin can update any driver (for approval)
      const { driverId } = body
      if (!driverId) {
        return NextResponse.json({ error: 'Driver ID required for admin updates' }, { status: 400 })
      }

      const updatedDriver = await db
        .update(drivers)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driverId))
        .returning()

      return NextResponse.json({ 
        message: 'Driver updated successfully', 
        driver: updatedDriver[0] 
      })

    } else if (userRole === 'driver') {
      // Driver can update their own status and location
      const driver = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, userId))
        .limit(1)

      if (!driver[0]) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 })
      }

      const updateData: any = {}
      if (validatedData.status) updateData.status = validatedData.status
      if (validatedData.currentLatitude !== undefined) updateData.currentLatitude = validatedData.currentLatitude
      if (validatedData.currentLongitude !== undefined) updateData.currentLongitude = validatedData.currentLongitude

      const updatedDriver = await db
        .update(drivers)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driver[0].id))
        .returning()

      return NextResponse.json({ 
        message: 'Status updated successfully', 
        driver: updatedDriver[0] 
      })

    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

  } catch (error) {
    console.error('Update driver error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}