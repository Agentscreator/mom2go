"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Heart, Shield, Car, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { z } from 'zod'

const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  isPregnant: z.boolean(),
  dueDate: z.string().optional(),
})

const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  licenseNumber: z.string().min(5, 'License number is required'),
  vehicleMake: z.string().min(2, 'Vehicle make is required'),
  vehicleModel: z.string().min(2, 'Vehicle model is required'),
  vehicleYear: z.number().min(2000, 'Vehicle must be 2000 or newer'),
  vehiclePlate: z.string().min(2, 'License plate is required'),
  vehicleColor: z.string().min(2, 'Vehicle color is required'),
})

export default function SignUpPage() {
  const [userType, setUserType] = useState<'passenger' | 'driver'>('passenger')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Passenger form state
  const [passengerData, setPassengerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    isPregnant: true,
    dueDate: '',
  })

  // Driver form state
  const [driverData, setDriverData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehiclePlate: '',
    vehicleColor: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let validatedData
      let payload

      if (userType === 'passenger') {
        validatedData = passengerSchema.parse(passengerData)
        payload = {
          ...validatedData,
          role: 'passenger',
        }
      } else {
        validatedData = driverSchema.parse(driverData)
        payload = {
          ...validatedData,
          role: 'driver',
        }
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/signin?message=Registration successful! Please sign in.')
      }, 2000)

    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError(error instanceof Error ? error.message : 'Registration failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif font-bold text-2xl mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-4">
              {userType === 'driver' 
                ? 'Your driver application has been submitted for review. You will be notified once approved.'
                : 'Your account has been created successfully.'}
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      
      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/images/moms-2-go-new.jpg"
              alt="Moms-2GO"
              width={56}
              height={56}
              className="rounded-2xl shadow-lg ring-2 ring-primary/20"
            />
            <span className="font-serif font-bold text-3xl text-primary tracking-tight">
              MOMS-2GO
            </span>
          </div>
          <h1 className="font-serif font-bold text-4xl text-foreground mb-4 leading-tight">
            Join Our Community
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            Create your account to start your safe journey with certified drivers
          </p>
        </div>

        <Card className="rounded-3xl shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="font-serif font-bold text-2xl text-foreground">Sign Up</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">
              Choose your role and create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {error && (
              <Alert className="mb-6 border-destructive/50 text-destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={userType} onValueChange={(value) => setUserType(value as 'passenger' | 'driver')}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="passenger" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Passenger
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Driver
                </TabsTrigger>
              </TabsList>

              <TabsContent value="passenger">
                <div className="mb-6 p-4 bg-primary/5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">For Expecting & New Mothers</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Safe, reliable transportation with CPR-certified drivers during your maternal journey.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={passengerData.name}
                        onChange={(e) => setPassengerData({...passengerData, name: e.target.value})}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={passengerData.phone}
                        onChange={(e) => setPassengerData({...passengerData, phone: e.target.value})}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={passengerData.email}
                      onChange={(e) => setPassengerData({...passengerData, email: e.target.value})}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={passengerData.password}
                      onChange={(e) => setPassengerData({...passengerData, password: e.target.value})}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPregnant"
                      checked={passengerData.isPregnant}
                      onCheckedChange={(checked) => setPassengerData({...passengerData, isPregnant: checked as boolean})}
                    />
                    <Label htmlFor="isPregnant" className="text-sm">
                      I am currently pregnant
                    </Label>
                  </div>

                  {passengerData.isPregnant && (
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Expected Due Date (Optional)</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={passengerData.dueDate}
                        onChange={(e) => setPassengerData({...passengerData, dueDate: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        placeholder="Contact person"
                        value={passengerData.emergencyContactName}
                        onChange={(e) => setPassengerData({...passengerData, emergencyContactName: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        placeholder="(555) 123-4567"
                        value={passengerData.emergencyContactPhone}
                        onChange={(e) => setPassengerData({...passengerData, emergencyContactPhone: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-base font-semibold"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Passenger Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="driver">
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">Driver Application</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Join our team of certified professionals providing safe transportation for mothers.
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Subject to background check and approval
                  </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverName">Full Name</Label>
                      <Input
                        id="driverName"
                        placeholder="Your full name"
                        value={driverData.name}
                        onChange={(e) => setDriverData({...driverData, name: e.target.value})}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverPhone">Phone Number</Label>
                      <Input
                        id="driverPhone"
                        placeholder="(555) 123-4567"
                        value={driverData.phone}
                        onChange={(e) => setDriverData({...driverData, phone: e.target.value})}
                        className="rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverEmail">Email</Label>
                    <Input
                      id="driverEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={driverData.email}
                      onChange={(e) => setDriverData({...driverData, email: e.target.value})}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverPassword">Password</Label>
                    <Input
                      id="driverPassword"
                      type="password"
                      placeholder="Create a strong password"
                      value={driverData.password}
                      onChange={(e) => setDriverData({...driverData, password: e.target.value})}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Driver's License Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="License number"
                      value={driverData.licenseNumber}
                      onChange={(e) => setDriverData({...driverData, licenseNumber: e.target.value})}
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Vehicle Information</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicleMake">Make</Label>
                        <Input
                          id="vehicleMake"
                          placeholder="Toyota"
                          value={driverData.vehicleMake}
                          onChange={(e) => setDriverData({...driverData, vehicleMake: e.target.value})}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleModel">Model</Label>
                        <Input
                          id="vehicleModel"
                          placeholder="Camry"
                          value={driverData.vehicleModel}
                          onChange={(e) => setDriverData({...driverData, vehicleModel: e.target.value})}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleYear">Year</Label>
                        <Input
                          id="vehicleYear"
                          type="number"
                          placeholder="2020"
                          value={driverData.vehicleYear}
                          onChange={(e) => setDriverData({...driverData, vehicleYear: parseInt(e.target.value)})}
                          className="rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehiclePlate">License Plate</Label>
                        <Input
                          id="vehiclePlate"
                          placeholder="ABC1234"
                          value={driverData.vehiclePlate}
                          onChange={(e) => setDriverData({...driverData, vehiclePlate: e.target.value})}
                          className="rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleColor">Color</Label>
                        <Input
                          id="vehicleColor"
                          placeholder="Silver"
                          value={driverData.vehicleColor}
                          onChange={(e) => setDriverData({...driverData, vehicleColor: e.target.value})}
                          className="rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-base font-semibold"
                  >
                    {isLoading ? 'Submitting Application...' : 'Submit Driver Application'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}