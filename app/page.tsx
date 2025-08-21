"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Heart,
  ArrowRight,
  Star,
  Menu,
  X,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Phone,
  Award,
  Zap,
} from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("demo")
  const [showLogin, setShowLogin] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "demo" && password === "1234") {
      setIsAuthenticated(true)
      setShowLogin(false)
    } else {
      alert("Incorrect credentials")
    }
  }

  if (isAuthenticated) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-4">
              <Image
                src="/images/moms-2-go-logo.png"
                alt="Moms-2-Go"
                width={64}
                height={64}
                className="rounded-2xl shadow-lg"
              />
              <span className="font-serif font-bold text-3xl text-primary tracking-tight">MOMS-2-GO</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Services
                </a>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  About
                </a>
                <a
                  href="#testimonials"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Reviews
                </a>
              </nav>
              <Button
                onClick={() => setShowLogin(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-3 text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t border-border/50 animate-fade-in space-y-4">
              <nav className="flex flex-col gap-4">
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Services
                </a>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  About
                </a>
                <a
                  href="#testimonials"
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  Reviews
                </a>
              </nav>
              <Button
                onClick={() => setShowLogin(true)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-3 text-base font-medium"
              >
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      <section className="relative py-32 lg:py-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center space-y-12 animate-fade-in">
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-8 py-3 text-base font-medium shadow-lg">
                ✨ Trusted by 10,000+ Mothers Nationwide
              </Badge>

              <h1 className="font-serif font-bold text-5xl lg:text-7xl xl:text-8xl leading-[0.9] text-foreground tracking-tight">
                Safe Rides for
                <br />
                <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Expecting Mothers
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light">
                Professional transportation with CPR-certified drivers, spacious vehicles, and emergency-ready
                technology designed specifically for your precious journey to motherhood.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Book Your Ride Now
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-12 py-4 text-lg font-semibold border-2 hover:scale-105 transition-all duration-300 bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 pt-16">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-background flex items-center justify-center shadow-lg"
                    >
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                  ))}
                </div>
                <div className="text-left ml-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-base text-muted-foreground font-medium">4.9/5 from 2,847 rides</p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">156</p>
                  <p className="text-sm text-muted-foreground">Certified Drivers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">Safety Record</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-6 mb-24 animate-slide-up">
            <h2 className="font-serif font-bold text-4xl lg:text-6xl text-foreground tracking-tight">
              Our Specialized Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-light">
              Comprehensive transportation solutions designed for every stage of your maternal journey
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 mb-16">
            {[
              {
                icon: Heart,
                title: "Prenatal Appointments",
                description:
                  "Comfortable rides to all your prenatal checkups with drivers trained in pregnancy care protocols.",
                features: ["Spacious vehicles", "Gentle driving", "Flexible scheduling"],
              },
              {
                icon: Shield,
                title: "Emergency Transport",
                description:
                  "Rapid response for labor onset and medical emergencies with direct hospital communication.",
                features: ["24/7 availability", "Hospital partnerships", "Emergency protocols"],
              },
              {
                icon: CheckCircle,
                title: "Postpartum Care",
                description: "Safe transportation for you and your newborn to pediatric appointments and follow-ups.",
                features: ["Infant car seats", "Gentle handling", "Quiet environment"],
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card hover:scale-105 animate-scale-in group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-10 text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="font-serif font-bold text-2xl mb-4 text-foreground">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed text-lg font-light mb-6">
                    {service.description}
                  </CardDescription>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: "Average 5min", subtitle: "Response Time" },
              { icon: Users, title: "CPR Certified", subtitle: "All Drivers" },
              { icon: MapPin, title: "GPS Tracking", subtitle: "Real-time Updates" },
              { icon: Phone, title: "24/7 Support", subtitle: "Always Available" },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-card/50 hover:bg-card transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-bold text-lg text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slide-up">
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-6 py-2 text-sm font-medium mb-6">
                  About Moms-2-Go
                </Badge>
                <h2 className="font-serif font-bold text-4xl lg:text-5xl text-foreground tracking-tight mb-6">
                  More Than Transportation
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed font-light mb-8">
                  Founded by mothers, for mothers. We understand the unique challenges and concerns that come with
                  pregnancy and early motherhood. Our mission is to provide peace of mind through safe, reliable, and
                  compassionate transportation services.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Award,
                    title: "Certified Excellence",
                    desc: "All drivers complete specialized maternal care training",
                  },
                  {
                    icon: Zap,
                    title: "Advanced Technology",
                    desc: "AI-powered emergency support and real-time monitoring",
                  },
                  { icon: Heart, title: "Compassionate Care", desc: "Understanding and empathy in every interaction" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Image
                    src="/images/moms-2-go-logo.png"
                    alt="Moms-2-Go"
                    width={120}
                    height={120}
                    className="rounded-3xl mx-auto shadow-2xl"
                  />
                  <p className="text-lg font-medium text-muted-foreground">Trusted by families nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-6 mb-24 animate-slide-up">
            <h2 className="font-serif font-bold text-4xl lg:text-6xl text-foreground tracking-tight">
              What Mothers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Real experiences from real mothers who trust us with their most precious moments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "First-time Mom",
                content:
                  "When my water broke at 2 AM, Moms-2-Go was there in 4 minutes. The driver was calm, professional, and got us to the hospital safely. I can't thank them enough!",
                rating: 5,
              },
              {
                name: "Maria Rodriguez",
                role: "Mother of Two",
                content:
                  "The peace of mind knowing I have reliable transportation for all my prenatal appointments is invaluable. The drivers are so understanding and accommodating.",
                rating: 5,
              },
              {
                name: "Jennifer Chen",
                role: "Working Mom",
                content:
                  "As a busy professional, having Moms-2-Go handle my transportation needs during pregnancy was a game-changer. Reliable, safe, and always on time.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center animate-fade-in relative">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-4xl lg:text-6xl text-primary-foreground tracking-tight">
                Ready for Your Safe Journey?
              </h2>
              <p className="text-xl text-primary-foreground/90 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of mothers who trust us for their transportation needs. Experience the difference of
                specialized maternal care.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-background hover:bg-background/90 text-foreground rounded-2xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Book Your First Ride
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-2xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
              >
                Call (555) 123-MOMS
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No signup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>24/7 availability</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Insurance accepted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 bg-foreground">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <Image src="/images/moms-2-go-logo.png" alt="Moms-2-Go" width={48} height={48} className="rounded-xl" />
                <span className="font-serif font-bold text-2xl text-background tracking-tight">MOMS-2-GO</span>
              </div>
              <p className="text-background/70 leading-relaxed mb-6 max-w-md">
                Providing safe, reliable, and compassionate transportation for expecting and new mothers across the
                nation.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-background/10 text-background border-background/20 rounded-full px-4 py-2">
                  Available 24/7
                </Badge>
                <Badge className="bg-background/10 text-background border-background/20 rounded-full px-4 py-2">
                  Nationwide Service
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-background mb-4">Services</h3>
              <ul className="space-y-2 text-background/70">
                <li>Prenatal Appointments</li>
                <li>Emergency Transport</li>
                <li>Postpartum Care</li>
                <li>Hospital Transfers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-background mb-4">Contact</h3>
              <ul className="space-y-2 text-background/70">
                <li>Emergency: (555) 911-MOMS</li>
                <li>Booking: (555) 123-MOMS</li>
                <li>support@moms2go.com</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-background/70 text-center font-light">
                © 2024 Moms-2-Go. Safe rides for life's precious moments.
              </p>
              <div className="flex items-center gap-6 text-background/70 text-sm">
                <a href="#" className="hover:text-background transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-background transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-background transition-colors">
                  Safety Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <Card className="w-full max-w-lg rounded-3xl shadow-2xl animate-scale-in">
            <CardHeader className="text-center pb-8">
              <CardTitle className="font-serif font-bold text-3xl text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground text-lg font-light">
                Access your dashboard with demo credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <div className="text-sm font-semibold text-foreground mb-3">Demo Credentials:</div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Username:</span>
                    <code className="bg-background px-3 py-1 rounded-lg text-primary font-mono font-semibold">
                      demo
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <code className="bg-background px-3 py-1 rounded-lg text-primary font-mono font-semibold">
                      1234
                    </code>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  type="text"
                  placeholder="Username"
                  className="rounded-2xl h-14 text-lg border-2 focus:border-primary"
                  defaultValue="demo"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-2xl h-14 text-lg border-2 focus:border-primary"
                />
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Access Dashboard
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                    className="rounded-2xl h-14 px-8 border-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/50 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Image src="/images/moms-2-go-logo.png" alt="Moms-2-Go" width={40} height={40} className="rounded-xl" />
              <span className="font-serif font-bold text-xl text-primary tracking-tight">MOMS-2-GO</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1">Dashboard</Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="rounded-2xl border-2 hover:scale-105 transition-all duration-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 mb-12">
          {[
            { id: "overview", label: "Overview" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-2xl px-8 py-3 text-base font-medium transition-all duration-300 hover:scale-105"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Total Rides", value: "2,847", change: "+12%", icon: Shield },
                { title: "Active Drivers", value: "156", change: "+3%", icon: CheckCircle },
                { title: "Happy Mothers", value: "1,923", change: "+18%", icon: Heart },
                { title: "Emergency Assists", value: "23", change: "+2%", icon: Star },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-2">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                        <p className="text-sm text-primary font-semibold">{stat.change} from last month</p>
                      </div>
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <stat.icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-3xl border-0 shadow-xl animate-slide-up">
              <CardHeader className="pb-8">
                <CardTitle className="font-serif font-bold text-2xl">Recent Activity</CardTitle>
                <CardDescription className="text-lg font-light">Latest rides and system updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { passenger: "Sarah M.", destination: "General Hospital", time: "2 hours ago", status: "Completed" },
                  { passenger: "Maria R.", destination: "Prenatal Clinic", time: "4 hours ago", status: "Completed" },
                  {
                    passenger: "Jennifer C.",
                    destination: "Pediatric Office",
                    time: "6 hours ago",
                    status: "Completed",
                  },
                ].map((ride, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-all duration-300"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-lg">{ride.passenger}</p>
                      <p className="text-muted-foreground">{ride.destination}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1">
                        {ride.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">{ride.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <Card className="rounded-3xl border-0 shadow-xl animate-fade-in">
            <CardHeader className="pb-8">
              <CardTitle className="font-serif font-bold text-2xl">Service Analytics</CardTitle>
              <CardDescription className="text-lg font-light">Key performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="font-serif font-bold text-xl">Service Distribution</h3>
                    <div className="space-y-6">
                      {[
                        { label: "Prenatal Appointments", percentage: 45, color: "bg-primary" },
                        { label: "Hospital Visits", percentage: 30, color: "bg-secondary" },
                        { label: "Postpartum Care", percentage: 25, color: "bg-primary/60" },
                      ].map((item, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{item.label}</span>
                            <span className="font-bold text-lg">{item.percentage}%</span>
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
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-serif font-bold text-xl">Monthly Growth</h3>
                    <div className="h-64 bg-muted/30 rounded-2xl flex items-center justify-center">
                      <p className="text-muted-foreground font-light text-lg">Chart visualization area</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
