"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Shield, 
  ArrowLeft,
  Navigation,
  Phone,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function BookRidePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupLatitude: 0,
    pickupLongitude: 0,
    destinationAddress: '',
    destinationLatitude: 0,
    destinationLongitude: 0,
    scheduledTime: '',
    notes: '',
    isEmergency: false,
  })

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, router])

  // Simple geocoding simulation (in production, use Google Maps API)
  const geocodeAddress = async (address: string) => {
    // This is a simplified version - in production you'd use actual geocoding
    // For demo purposes, we'll use random coordinates near a city center
    const lat = 40.7128 + (Math.random() - 0.5) * 0.1
    const lng = -74.0060 + (Math.random() - 0.5) * 0.1
    return { lat, lng }
  }

  const calculateEstimatedFare = (distance: number, isEmergency: boolean) => {
    const baseFare = 5.00
    const perMileFare = 2.50
    const emergencyMultiplier = isEmergency ? 1.5 : 1
    return (baseFare + (distance * perMileFare)) * emergencyMultiplier
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const updateEstimate = async () => {
    if (formData.pickupAddress && formData.destinationAddress) {
      try {
        const pickupCoords = await geocodeAddress(formData.pickupAddress)
        const destCoords = await geocodeAddress(formData.destinationAddress)
        
        const distance = calculateDistance(
          pickupCoords.lat, pickupCoords.lng,
          destCoords.lat, destCoords.lng
        )
        
        const fare = calculateEstimatedFare(distance, formData.isEmergency)
        setEstimatedFare(fare)

        setFormData(prev => ({
          ...prev,
          pickupLatitude: pickupCoords.lat,
          pickupLongitude: pickupCoords.lng,
          destinationLatitude: destCoords.lat,
          destinationLongitude: destCoords.lng,
        }))
      } catch (error) {
        console.error('Error calculating estimate:', error)
      }
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      updateEstimate()
    }, 1000)

    return () => clearTimeout(timer)
  }, [formData.pickupAddress, formData.destinationAddress, formData.isEmergency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.pickupAddress || !formData.destinationAddress) {
        throw new Error('Please provide both pickup and destination addresses')
      }

      // Ensure coordinates are set
      if (!formData.pickupLatitude || !formData.destinationLatitude) {
        await updateEstimate()
      }

      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduledTime: formData.scheduledTime || new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book ride')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book ride')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif font-bold text-2xl mb-2">Ride Booked Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              {formData.isEmergency 
                ? 'Emergency ride request sent to nearby drivers. You will be contacted shortly.'
                : 'Your ride request has been sent to available drivers.'}
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-2 mb-4">
              Estimated Fare: ${estimatedFare?.toFixed(2)}
            </Badge>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="font-serif font-bold text-3xl text-foreground">Book a Safe Ride</h1>
            <p className="text-muted-foreground">Schedule your transportation with our certified drivers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="font-serif font-bold text-2xl">Ride Details</CardTitle>
                <CardDescription>
                  Please provide your pickup and destination information
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
                  {/* Emergency Toggle */}
                  <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-2xl">
                    <Checkbox
                      id="isEmergency"
                      checked={formData.isEmergency}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isEmergency: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="isEmergency" className="font-semibold text-red-700">
                        Emergency Ride
                      </Label>
                      <p className="text-sm text-red-600">
                        Check this for immediate assistance (labor, medical emergency)
                      </p>
                    </div>
                  </div>

                  {/* Pickup Address */}
                  <div className="space-y-2">
                    <Label htmlFor="pickup" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Pickup Address
                    </Label>
                    <Input
                      id="pickup"
                      placeholder="Enter your pickup location"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                      className="rounded-2xl h-12 border-2 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Destination Address */}
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      Destination Address
                    </Label>
                    <Input
                      id="destination"
                      placeholder="Enter your destination"
                      value={formData.destinationAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, destinationAddress: e.target.value }))}
                      className="rounded-2xl h-12 border-2 focus:border-primary"
                      required
                    />
                  </div>

                  {/* Scheduled Time */}
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Preferred Time (Optional)
                    </Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="rounded-2xl h-12 border-2 focus:border-primary"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave empty for immediate pickup
                    </p>
                  </div>

                  {/* Special Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or notes for your driver..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="rounded-2xl border-2 focus:border-primary resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !formData.pickupAddress || !formData.destinationAddress}
                    className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-12 text-base font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {isLoading 
                      ? 'Booking Your Ride...' 
                      : formData.isEmergency 
                      ? 'Request Emergency Ride' 
                      : 'Book Safe Ride'
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Ride Summary */}
          <div className="space-y-6">
            {/* Fare Estimate */}
            {estimatedFare && (
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Fare Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        ${estimatedFare.toFixed(2)}
                      </p>
                      {formData.isEmergency && (
                        <Badge variant="destructive" className="mt-2">
                          Emergency Rate Applied
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base fare</span>
                        <span>$5.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distance rate</span>
                        <span>$2.50/mile</span>
                      </div>
                      {formData.isEmergency && (
                        <div className="flex justify-between text-red-600">
                          <span>Emergency multiplier</span>
                          <span>1.5x</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Features */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Safety Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">CPR-certified drivers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Real-time GPS tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">24/7 emergency support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Pregnancy-trained drivers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Hospital direct communication</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="rounded-3xl shadow-lg border-0 bg-red-50/50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Phone className="w-5 h-5" />
                  Emergency Hotline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-700 mb-2">
                    (555) 911-MOMS
                  </p>
                  <p className="text-sm text-red-600">
                    Available 24/7 for immediate assistance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}