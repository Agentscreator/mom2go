"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentPageProps {
  params: { rideId: string }
}

interface RideData {
  id: number
  pickupAddress: string
  destinationAddress: string
  fareAmount: string
  scheduledTime: string
  status: string
  isEmergency: boolean
}

function PaymentForm({ 
  clientSecret, 
  rideData, 
  onSuccess 
}: { 
  clientSecret: string
  rideData: RideData
  onSuccess: () => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/payment/success?ride_id=${rideData.id}`,
        },
      })

      if (error) {
        setError(error.message || 'Payment failed')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="rounded-3xl shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment for this ride
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <PaymentElement />
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay ${rideData.fareAmount}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-green-50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700">Secure Payment</span>
          </div>
          <p className="text-sm text-green-600">
            Your payment information is encrypted and secure. We use Stripe for payment processing.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [rideData, setRideData] = useState<RideData | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'passenger') {
      router.push('/dashboard')
      return
    }

    fetchRideData()
  }, [session, params.rideId, router])

  const fetchRideData = async () => {
    try {
      // First, get ride data
      const rideResponse = await fetch(`/api/rides/${params.rideId}`)
      if (!rideResponse.ok) {
        throw new Error('Failed to fetch ride data')
      }
      
      const rideResult = await rideResponse.json()
      setRideData(rideResult.ride)

      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId: parseInt(params.rideId),
          amount: parseFloat(rideResult.ride.fareAmount),
          currency: 'usd',
        }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const paymentResult = await paymentResponse.json()
      setClientSecret(paymentResult.clientSecret)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-serif font-bold text-2xl mb-2">Payment Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif font-bold text-2xl mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment has been processed successfully. Thank you for choosing Moms-2-Go!
            </p>
            <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full px-4 py-2">
              Amount Paid: ${rideData?.fareAmount}
            </Badge>
            <p className="text-sm text-muted-foreground mt-4">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!rideData || !clientSecret) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground">Complete Payment</h1>
            <p className="text-muted-foreground">Secure payment for your completed ride</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ride Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle>Ride Summary</CardTitle>
                <CardDescription>
                  Review your ride details
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">From</p>
                  <p className="font-medium">{rideData.pickupAddress.split(',')[0]}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">To</p>
                  <p className="font-medium">{rideData.destinationAddress.split(',')[0]}</p>
                </div>

                <div className="h-px bg-border"></div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {new Date(rideData.scheduledTime).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {rideData.status.charAt(0).toUpperCase() + rideData.status.slice(1)}
                  </Badge>
                </div>

                {rideData.isEmergency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="destructive">Emergency</Badge>
                  </div>
                )}

                <div className="h-px bg-border"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary">${rideData.fareAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Elements 
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#0070f3',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                rideData={rideData}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  )
}