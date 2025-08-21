import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50)

    return NextResponse.json({ notifications: userNotifications })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = body

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds must be an array' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    // Mark notifications as read (only for the current user)
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))

    return NextResponse.json({ message: 'Notifications marked as read' })

  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}