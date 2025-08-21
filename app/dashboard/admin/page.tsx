"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users,
  Car,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  ArrowLeft,
  Shield,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Driver {
  id: number
  userId: number
  name: string
  email: string
  phone: string
  vehicleMake: string
  vehicleModel: string
  vehicleColor: string
  vehiclePlate: string
  rating: number
  totalRides: number
  status: string
  isApproved: boolean
  cprCertified: boolean
  backgroundCheck: boolean
  createdAt: string
}

interface Ride {
  id: number
  pickupAddress: string
  destinationAddress: string
  scheduledTime: string
  status: string
  fareAmount: string
  isEmergency: boolean
  passengerName: string
  driverName?: string
  createdAt: string
}

interface Analytics {
  totalRides: number
  totalDrivers: number
  totalRevenue: number
  averageRating: number
  emergencyRides: number
  pendingDrivers: number
  monthlyGrowth: number
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchAdminData()
  }, [session, router])

  const fetchAdminData = async () => {
    try {
      const [driversRes, ridesRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/rides'),
      ])

      if (driversRes.ok) {
        const driversData = await driversRes.json()
        setDrivers(driversData.drivers || [])
      }

      if (ridesRes.ok) {
        const ridesData = await ridesRes.json()
        setRides(ridesData.rides || [])
      }

      // Calculate analytics
      const totalRides = rides.length
      const totalDrivers = drivers.length
      const totalRevenue = rides
        .filter(ride => ride.status === 'completed')
        .reduce((sum, ride) => sum + parseFloat(ride.fareAmount || '0'), 0)
      const averageRating = drivers.length > 0 
        ? drivers.reduce((sum, driver) => sum + driver.rating, 0) / drivers.length 
        : 0
      const emergencyRides = rides.filter(ride => ride.isEmergency).length
      const pendingDrivers = drivers.filter(driver => !driver.isApproved).length

      setAnalytics({
        totalRides,
        totalDrivers,
        totalRevenue,
        averageRating,
        emergencyRides,
        pendingDrivers,
        monthlyGrowth: 15.2, // Mock data
      })

    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const approveDriver = async (driverId: number) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId,
          isApproved: true,
        }),
      })

      if (response.ok) {
        setDrivers(prev => 
          prev.map(driver => 
            driver.id === driverId 
              ? { ...driver, isApproved: true }
              : driver
          )
        )
      }
    } catch (error) {
      console.error('Failed to approve driver:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const pendingDrivers = drivers.filter(driver => !driver.isApproved)
  const recentRides = rides.slice(0, 10)
  const emergencyRides = rides.filter(ride => ride.isEmergency)

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
            <h1 className="font-serif font-bold text-3xl text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and management</p>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Rides</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalRides}</p>
                    <p className="text-xs text-green-600 font-semibold">+{analytics.monthlyGrowth}% this month</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Active Drivers</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.totalDrivers}</p>
                    <p className="text-xs text-yellow-600 font-semibold">{analytics.pendingDrivers} pending approval</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-foreground">${analytics.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-green-600 font-semibold">From completed rides</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Avg. Rating</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-yellow-600 font-semibold">Driver average</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Alerts */}
        {emergencyRides.length > 0 && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <Shield className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>{emergencyRides.length} emergency rides</strong> require attention. Monitor these rides closely.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="rides">Rides</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Pending Driver Approvals */}
            {pendingDrivers.length > 0 && (
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Pending Driver Approvals ({pendingDrivers.length})
                  </CardTitle>
                  <CardDescription>
                    Drivers waiting for approval to start accepting rides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingDrivers.slice(0, 3).map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border border-yellow-200"
                      >
                        <div>
                          <h4 className="font-semibold text-lg">{driver.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{driver.vehicleMake} {driver.vehicleModel}</span>
                            <span>{driver.vehicleColor}</span>
                            <span>{driver.vehiclePlate}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={driver.cprCertified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              CPR: {driver.cprCertified ? 'Certified' : 'Not Certified'}
                            </Badge>
                            <Badge className={driver.backgroundCheck ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              Background: {driver.backgroundCheck ? 'Cleared' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveDriver(driver.id)}
                            className="rounded-xl bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest rides and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">
                            {ride.pickupAddress.split(',')[0]} → {ride.destinationAddress.split(',')[0]}
                          </h4>
                          {ride.isEmergency && (
                            <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{ride.passengerName}</span>
                          {ride.driverName && <span>Driver: {ride.driverName}</span>}
                          <span>{new Date(ride.scheduledTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full px-3 py-1 mb-1 ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                          ride.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          ride.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
                        </Badge>
                        <p className="text-sm font-semibold">${ride.fareAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drivers" className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>
                  Manage driver approvals and monitor performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{driver.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{driver.email}</span>
                            <span>{driver.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">
                              {driver.vehicleMake} {driver.vehicleModel} ({driver.vehicleColor})
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {driver.vehiclePlate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={driver.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {driver.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge className={`${
                            driver.status === 'available' ? 'bg-green-100 text-green-700' :
                            driver.status === 'busy' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{driver.rating}</span>
                          </div>
                          <span>{driver.totalRides} rides</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rides" className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0">
              <CardHeader>
                <CardTitle>Ride Management</CardTitle>
                <CardDescription>
                  Monitor all rides and emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rides.map((ride) => (
                    <div
                      key={ride.id}
                      className={`p-6 rounded-2xl border-2 ${
                        ride.isEmergency ? 'bg-red-50 border-red-200' : 'bg-muted/30 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">
                              Ride #{ride.id}
                            </h4>
                            {ride.isEmergency && (
                              <Badge variant="destructive">Emergency</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">From:</p>
                              <p className="font-medium">{ride.pickupAddress}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">To:</p>
                              <p className="font-medium">{ride.destinationAddress}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Passenger:</p>
                              <p className="font-medium">{ride.passengerName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Driver:</p>
                              <p className="font-medium">{ride.driverName || 'Not assigned'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`rounded-full px-3 py-1 mb-2 ${
                            ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                            ride.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            ride.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
                          </Badge>
                          <p className="font-bold text-lg">${ride.fareAmount}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ride.scheduledTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Breakdown of ride types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { label: "Prenatal Appointments", percentage: 45, color: "bg-primary" },
                      { label: "Hospital Visits", percentage: 30, color: "bg-blue-500" },
                      { label: "Emergency Rides", percentage: 15, color: "bg-red-500" },
                      { label: "Postpartum Care", percentage: 10, color: "bg-green-500" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.label}</span>
                          <span className="font-bold">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className={`${item.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Monthly Growth</CardTitle>
                  <CardDescription>System metrics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">+15.2%</div>
                      <p className="text-muted-foreground">Growth this month</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">+23</div>
                        <p className="text-sm text-muted-foreground">New Drivers</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">+156</div>
                        <p className="text-sm text-muted-foreground">New Rides</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}