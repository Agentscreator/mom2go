import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { rides, payments, passengers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const createPaymentIntentSchema = z.object({
  rideId: z.number(),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'passenger') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPaymentIntentSchema.parse(body)

    const userId = parseInt(session.user.id)

    // Verify the ride belongs to this passenger
    const passenger = await db
      .select()
      .from(passengers)
      .where(eq(passengers.userId, userId))
      .limit(1)

    if (!passenger[0]) {
      return NextResponse.json({ error: 'Passenger profile not found' }, { status: 404 })
    }

    const ride = await db
      .select()
      .from(rides)
      .where(and(
        eq(rides.id, validatedData.rideId),
        eq(rides.passengerId, passenger[0].id)
      ))
      .limit(1)

    if (!ride[0]) {
      return NextResponse.json({ error: 'Ride not found or access denied' }, { status: 404 })
    }

    // Check if ride is completed
    if (ride[0].status !== 'completed') {
      return NextResponse.json({ error: 'Payment can only be processed for completed rides' }, { status: 400 })
    }

    // Check if payment already exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.rideId, validatedData.rideId))
      .limit(1)

    if (existingPayment[0] && existingPayment[0].status === 'completed') {
      return NextResponse.json({ error: 'Payment already completed for this ride' }, { status: 400 })
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(validatedData.amount * 100)

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: validatedData.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        rideId: validatedData.rideId.toString(),
        passengerId: passenger[0].id.toString(),
        userId: userId.toString(),
      },
      description: `Moms-2-Go Ride #${validatedData.rideId} - ${ride[0].pickupAddress} to ${ride[0].destinationAddress}`,
    })

    // Create or update payment record
    if (existingPayment[0]) {
      await db
        .update(payments)
        .set({
          amount: validatedData.amount.toFixed(2),
          currency: validatedData.currency.toUpperCase(),
          stripePaymentIntentId: paymentIntent.id,
          status: 'pending',
        })
        .where(eq(payments.id, existingPayment[0].id))
    } else {
      await db.insert(payments).values({
        rideId: validatedData.rideId,
        amount: validatedData.amount.toFixed(2),
        currency: validatedData.currency.toUpperCase(),
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
      })
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: validatedData.amount,
    })

  } catch (error) {
    console.error('Create payment intent error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}