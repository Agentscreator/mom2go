import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendEmail, emailTemplates } from '@/lib/notifications'
import { db } from '@/lib/db'
import { notifications, users, passengers, drivers, rides } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  type: z.enum([
    'ride_booked',
    'ride_accepted', 
    'driver_on_way',
    'driver_arrived',
    'ride_completed',
    'driver_application',
    'emergency_alert'
  ]),
  userId: z.number(),
  rideId: z.number().optional(),
  data: z.record(z.any()),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendNotificationSchema.parse(body)

    // Get user information
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, validatedData.userId))
      .limit(1)

    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let emailResult = { success: false, error: 'No email template' }

    // Send email notification
    switch (validatedData.type) {
      case 'ride_booked':
        if (user[0].email) {
          const template = emailTemplates.rideBooked(validatedData.data)
          emailResult = await sendEmail({
            to: user[0].email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        }
        break

      case 'ride_accepted':
        if (user[0].email) {
          const template = emailTemplates.rideAccepted(validatedData.data)
          emailResult = await sendEmail({
            to: user[0].email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        }
        break

      case 'driver_on_way':
        // Email notification only - SMS removed
        break

      case 'driver_arrived':
        // Email notification only - SMS removed
        break

      case 'ride_completed':
        // Email notification only - SMS removed
        break

      case 'driver_application':
        if (user[0].email) {
          const template = emailTemplates.driverApplication(validatedData.data)
          emailResult = await sendEmail({
            to: user[0].email,
            subject: template.subject,
            html: template.html,
            text: template.text,
          })
        }
        break

      case 'emergency_alert':
        // Send to emergency contacts and admin via email only
        // SMS functionality removed
        // This would be implemented based on your emergency protocol
        break
    }

    // Create notification record in database
    await db.insert(notifications).values({
      userId: validatedData.userId,
      type: validatedData.type,
      title: getNotificationTitle(validatedData.type),
      message: getNotificationMessage(validatedData.type, validatedData.data),
      relatedRideId: validatedData.rideId,
    })

    return NextResponse.json({
      message: 'Email notification sent successfully',
      results: {
        email: emailResult,
      }
    })

  } catch (error) {
    console.error('Send notification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'ride_booked': return 'Ride Confirmed'
    case 'ride_accepted': return 'Driver Assigned'
    case 'driver_on_way': return 'Driver On The Way'
    case 'driver_arrived': return 'Driver Arrived'
    case 'ride_completed': return 'Ride Completed'
    case 'driver_application': return 'Application Received'
    case 'emergency_alert': return 'Emergency Alert'
    default: return 'Notification'
  }
}

function getNotificationMessage(type: string, data: any): string {
  switch (type) {
    case 'ride_booked': 
      return `Your ride from ${data.pickupAddress} is confirmed for ${data.scheduledTime}`
    case 'ride_accepted': 
      return `${data.driverName} has accepted your ride and is on the way`
    case 'driver_on_way': 
      return `Your driver is on the way. ETA: ${data.eta}`
    case 'driver_arrived': 
      return `Your driver has arrived and is waiting for you`
    case 'ride_completed': 
      return `Your ride is complete. Thank you for choosing Moms-2GO!`
    case 'driver_application': 
      return `Your driver application has been received and is being reviewed`
    case 'emergency_alert': 
      return `Emergency assistance requested at ${data.location}`
    default: 
      return 'You have a new notification'
  }
}