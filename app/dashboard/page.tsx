"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  MapPin,
  Star,
  Heart,
  Shield,
  Car,
  Plus,
  Navigation,
  Phone,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Ride {
  id: number
  pickupAddress: string
  destinationAddress: string
  scheduledTime: string
  status: string
  fareAmount: string
  isEmergency: boolean
  rating?: number
  createdAt: string
  driver?: {
    name: string
    phone: string
    vehicleMake: string
    vehicleModel: string
    vehicleColor: string
    vehiclePlate: string
  }
  passenger?: {
    name: string
    phone: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchRides()
  }, [session, status, router])

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides')
      if (response.ok) {
        const data = await response.json()
        setRides(data.rides || [])
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user.role
  const recentRides = rides.slice(0, 5)
  const completedRides = rides.filter(ride => ride.status === 'completed')
  const pendingRides = rides.filter(ride => ride.status === 'pending')
  const inProgressRides = rides.filter(ride => ride.status === 'in_progress')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4">
              <Image 
                src="/images/moms-2-go-logo.png" 
                alt="Moms-2-Go" 
                width={40} 
                height={40} 
                className="rounded-xl" 
              />
              <span className="font-serif font-bold text-lg sm:text-xl text-primary tracking-tight">
                MOMS-2-GO
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-3 py-1 text-xs sm:text-sm hidden sm:block">
                {userRole === 'passenger' ? 'Passenger' : userRole === 'driver' ? 'Driver' : 'Admin'} Dashboard
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                size="sm"
                className="rounded-2xl border-2 hover:scale-105 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-foreground mb-2">
            Welcome back, {session.user.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {userRole === 'passenger' 
              ? 'Your safe journey dashboard' 
              : userRole === 'driver'
              ? 'Ready to provide safe rides today'
              : 'System overview and management'}
          </p>
        </div>

        {/* Quick Actions */}
        {userRole === 'passenger' && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Link href="/dashboard/book-ride">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base sm:text-lg">Book a Ride</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Schedule your safe journey</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/emergency">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-red-200 bg-red-50/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-red-700">Emergency Ride</h3>
                        <p className="text-sm text-red-600">Immediate assistance needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/profile">
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/20">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Profile</h3>
                        <p className="text-sm text-muted-foreground">Manage your account</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}

        {/* Driver Quick Actions */}
        {userRole === 'driver' && (
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-green-700">Available</h3>
                  <p className="text-sm text-green-600">Ready for rides</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Navigation className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Active Requests</h3>
                  <p className="text-sm text-muted-foreground">{pendingRides.length} pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Rating</h3>
                  <p className="text-sm text-muted-foreground">4.9/5.0</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Total Rides</h3>
                  <p className="text-sm text-muted-foreground">{completedRides.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Total Rides</p>
                  <p className="text-2xl font-bold text-foreground">{rides.length}</p>
                  <p className="text-xs text-primary font-semibold">All time</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedRides.length}</p>
                  <p className="text-xs text-green-600 font-semibold">Successfully finished</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{inProgressRides.length}</p>
                  <p className="text-xs text-blue-600 font-semibold">Currently active</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground">4.9</p>
                  <p className="text-xs text-yellow-600 font-semibold">Out of 5 stars</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="font-serif font-bold text-xl sm:text-2xl">Recent Activity</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              Your latest rides and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRides.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No rides yet</h3>
                <p className="text-muted-foreground mb-4">
                  {userRole === 'passenger' 
                    ? "Ready to book your first safe ride?" 
                    : "No ride requests at the moment"}
                </p>
                {userRole === 'passenger' && (
                  <Link href="/dashboard/book-ride">
                    <Button className="rounded-2xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Your First Ride
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all duration-300 gap-4 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${
                        ride.status === 'completed' ? 'bg-green-100' :
                        ride.status === 'in_progress' ? 'bg-blue-100' :
                        ride.status === 'pending' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {ride.status === 'completed' ? (
                          <Shield className={`w-6 h-6 text-green-600`} />
                        ) : ride.status === 'in_progress' ? (
                          <Navigation className={`w-6 h-6 text-blue-600`} />
                        ) : ride.status === 'pending' ? (
                          <Clock className={`w-6 h-6 text-yellow-600`} />
                        ) : (
                          <Car className={`w-6 h-6 text-red-600`} />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">
                            {ride.pickupAddress.split(',')[0]} → {ride.destinationAddress.split(',')[0]}
                          </h3>
                          {ride.isEmergency && (
                            <Badge variant="destructive" className="text-xs">Emergency</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(ride.scheduledTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(ride.scheduledTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {userRole === 'passenger' && ride.driver && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {ride.driver.name}
                            </span>
                          )}
                          {userRole === 'driver' && ride.passenger && (
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {ride.passenger.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge 
                        className={`rounded-full px-4 py-1 mb-2 ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          ride.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          ride.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground">${ride.fareAmount}</p>
                      {ride.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{ride.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}