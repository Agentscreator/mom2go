"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Car,
  MapPin,
  Star,
  Clock,
  User,
  Navigation,
  Shield,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface DriverProfile {
  id: number
  licenseNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehiclePlate: string
  vehicleColor: string
  cprCertified: boolean
  backgroundCheck: boolean
  status: 'available' | 'busy' | 'offline'
  rating: number
  totalRides: number
  currentLatitude?: number
  currentLongitude?: number
  isApproved: boolean
}

interface Ride {
  id: number
  pickupAddress: string
  destinationAddress: string
  scheduledTime: string
  status: string
  fareAmount: string
  isEmergency: boolean
  passenger?: {
    name: string
    phone: string
  }
}

export default function DriverDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [driver, setDriver] = useState<DriverProfile | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [locationEnabled, setLocationEnabled] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'driver') {
      router.push('/dashboard')
      return
    }

    fetchDriverData()
    
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationEnabled(true)
          updateDriverLocation(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('Location access denied:', error)
        }
      )
    }
  }, [session, router])

  const fetchDriverData = async () => {
    try {
      const response = await fetch('/api/drivers')
      if (response.ok) {
        const data = await response.json()
        setDriver(data.driver)
        setRides(data.recentRides || [])
      }
    } catch (error) {
      console.error('Failed to fetch driver data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDriverLocation = async (latitude: number, longitude: number) => {
    try {
      await fetch('/api/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLatitude: latitude,
          currentLongitude: longitude,
        }),
      })
    } catch (error) {
      console.error('Failed to update location:', error)
    }
  }

  const updateDriverStatus = async (newStatus: 'available' | 'offline') => {
    setIsUpdating(true)
    try {
      const response = await fetch('/api/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDriver(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading driver dashboard...</p>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="font-serif font-bold text-2xl mb-2">Driver Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">
              Please contact support if you believe this is an error.
            </p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingRides = rides.filter(ride => ride.status === 'pending')
  const activeRides = rides.filter(ride => ride.status === 'in_progress')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground">Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage your availability and rides</p>
          </div>
        </div>

        {/* Driver Status */}
        {!driver.isApproved && (
          <Alert className="mb-8 border-yellow-200 bg-yellow-50">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Your driver application is under review. You will be notified once approved to start accepting rides.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Driver Profile & Status */}
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Driver Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Availability</span>
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`rounded-full px-3 py-1 ${
                        driver.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' :
                        driver.status === 'busy' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                    </Badge>
                    <Switch
                      checked={driver.status === 'available'}
                      onCheckedChange={(checked) => 
                        updateDriverStatus(checked ? 'available' : 'offline')
                      }
                      disabled={isUpdating || !driver.isApproved}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Location Sharing</span>
                  <Badge className={`rounded-full px-3 py-1 ${
                    locationEnabled ? 'bg-green-100 text-green-700 border-green-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {locationEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{driver.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rides</span>
                    <span className="font-semibold">{driver.totalRides}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Make & Model</span>
                  <span className="font-semibold">{driver.vehicleMake} {driver.vehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-semibold">{driver.vehicleYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-semibold">{driver.vehicleColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Plate</span>
                  <span className="font-semibold">{driver.vehiclePlate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CPR Certified</span>
                  {driver.cprCertified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Background Check</span>
                  {driver.backgroundCheck ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Account Approved</span>
                  {driver.isApproved ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Rides & Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Rides */}
            {activeRides.length > 0 && (
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />
                    Active Rides ({activeRides.length})
                  </CardTitle>
                  <CardDescription>
                    Rides currently in progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="p-6 bg-blue-50 rounded-2xl border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-1">
                              {ride.pickupAddress.split(',')[0]} → {ride.destinationAddress.split(',')[0]}
                            </h4>
                            {ride.passenger && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {ride.passenger.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {ride.passenger.phone}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {ride.isEmergency && (
                              <Badge variant="destructive" className="mb-2">Emergency</Badge>
                            )}
                            <p className="font-semibold">${ride.fareAmount}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button size="sm" className="rounded-xl">
                            <Navigation className="w-4 h-4 mr-2" />
                            Navigate
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Passenger
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            Complete Ride
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Rides */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Rides
                </CardTitle>
                <CardDescription>
                  Your ride history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rides.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No rides yet</h3>
                    <p className="text-muted-foreground">
                      Turn on your availability to start receiving ride requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rides.slice(0, 5).map((ride) => (
                      <div
                        key={ride.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all duration-300"
                      >
                        <div>
                          <h4 className="font-semibold mb-1">
                            {ride.pickupAddress.split(',')[0]} → {ride.destinationAddress.split(',')[0]}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(ride.scheduledTime).toLocaleDateString()}</span>
                            {ride.passenger && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {ride.passenger.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`rounded-full px-3 py-1 mb-1 ${
                              ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                              ride.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              ride.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
                          </Badge>
                          <p className="text-sm font-semibold">${ride.fareAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}