"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin,
  Navigation,
  Clock,
  Phone,
  Shield,
  Car,
  ArrowLeft,
  RefreshCw,
  Star,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface TrackingData {
  ride: {
    id: number
    status: string
    pickupAddress: string
    destinationAddress: string
    scheduledTime: string
    actualPickupTime?: string
    fareAmount: string
    isEmergency: boolean
    estimatedArrival?: string
  }
  driver?: {
    vehicleMake: string
    vehicleModel: string
    vehicleColor: string
    vehiclePlate: string
    currentLatitude?: number
    currentLongitude?: number
    rating: number
  }
  coordinates: {
    pickup: { latitude: number; longitude: number }
    destination: { latitude: number; longitude: number }
    driver?: { latitude: number; longitude: number }
  }
}

export default function TrackRidePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchTrackingData()

    // Set up polling for real-time updates
    intervalRef.current = setInterval(() => {
      fetchTrackingData()
    }, 10000) // Update every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [session, params.id, router])

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/rides/${params.id}/track`)
      if (response.ok) {
        const data = await response.json()
        setTrackingData(data)
        setLastUpdate(new Date())
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch tracking data')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Looking for available drivers...'
      case 'accepted': return 'Driver is on the way to pick you up'
      case 'in_progress': return 'You are on your way to destination'
      case 'completed': return 'Ride completed successfully'
      case 'cancelled': return 'Ride was cancelled'
      default: return 'Status unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ride tracking...</p>
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
            <h2 className="font-serif font-bold text-2xl mb-2">Unable to Track Ride</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="outline">Return to Dashboard</Button>
              </Link>
              <Button onClick={fetchTrackingData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trackingData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground">Track Your Ride</h1>
            <p className="text-muted-foreground">Real-time updates for your safe journey</p>
          </div>
        </div>

        {/* Emergency Alert */}
        {trackingData.ride.isEmergency && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <Shield className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Emergency Ride:</strong> Priority assistance is en route. Emergency contacts have been notified.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-lg border-0 h-96">
              <CardContent className="p-0 h-full">
                <div className="h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl flex items-center justify-center relative">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-xl mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time tracking would appear here
                    </p>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Map Integration: Google Maps API
                    </Badge>
                  </div>
                  
                  {/* Map markers simulation */}
                  <div className="absolute top-8 left-8 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute bottom-8 right-8 bg-red-500 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
                  {trackingData.coordinates.driver && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <Car className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ride Details */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Ride Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`text-base px-4 py-2 rounded-full ${getStatusColor(trackingData.ride.status)}`}>
                    {trackingData.ride.status.charAt(0).toUpperCase() + trackingData.ride.status.slice(1).replace('_', ' ')}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    {getStatusMessage(trackingData.ride.status)}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span className="font-medium">
                      {formatTime(trackingData.ride.scheduledTime)}
                    </span>
                  </div>
                  
                  {trackingData.ride.actualPickupTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Picked up</span>
                      <span className="font-medium">
                        {formatTime(trackingData.ride.actualPickupTime)}
                      </span>
                    </div>
                  )}

                  {trackingData.ride.estimatedArrival && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Arrival</span>
                      <span className="font-medium text-primary">
                        {formatTime(trackingData.ride.estimatedArrival)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fare</span>
                    <span className="font-bold text-lg">${trackingData.ride.fareAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Info */}
            {trackingData.driver && (
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Car className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{trackingData.driver.rating}</span>
                      <span className="text-muted-foreground text-sm">rating</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle</span>
                      <span className="font-medium">
                        {trackingData.driver.vehicleMake} {trackingData.driver.vehicleModel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium">{trackingData.driver.vehicleColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License Plate</span>
                      <span className="font-mono font-bold text-primary">
                        {trackingData.driver.vehiclePlate}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full rounded-2xl mt-4">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Route Details */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">From</p>
                  <p className="font-medium">{trackingData.ride.pickupAddress}</p>
                </div>
                <div className="h-px bg-border"></div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">To</p>
                  <p className="font-medium">{trackingData.ride.destinationAddress}</p>
                </div>
              </CardContent>
            </Card>

            {/* Last Update */}
            <Card className="rounded-2xl bg-muted/30 border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium">{formatTime(lastUpdate.toISOString())}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchTrackingData}
                  className="w-full mt-2 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}