import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { payments, notifications } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status
    const payment = await db
      .update(payments)
      .set({
        status: 'completed',
        processedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
      .returning()

    if (payment[0]) {
      // Get ride and passenger info for notification
      const rideId = payment[0].rideId
      const userId = paymentIntent.metadata.userId

      if (userId) {
        // Send success notification
        await db.insert(notifications).values({
          userId: parseInt(userId),
          type: 'payment_success',
          title: 'Payment Successful',
          message: `Your payment of $${payment[0].amount} has been processed successfully.`,
          relatedRideId: rideId,
        })
      }
    }

    console.log('Payment succeeded:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status
    const payment = await db
      .update(payments)
      .set({
        status: 'failed',
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
      .returning()

    if (payment[0]) {
      const rideId = payment[0].rideId
      const userId = paymentIntent.metadata.userId

      if (userId) {
        // Send failure notification
        await db.insert(notifications).values({
          userId: parseInt(userId),
          type: 'payment_failed',
          title: 'Payment Failed',
          message: `Your payment of $${payment[0].amount} could not be processed. Please try again or contact support.`,
          relatedRideId: rideId,
        })
      }
    }

    console.log('Payment failed:', paymentIntent.id)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}