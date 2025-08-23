"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // If user is authenticated, redirect to dashboard
  if (session) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
            <div className="flex items-center gap-4">
              <Image
                src="/images/moms-2-go-car.jpg"
                alt="Moms-2GO"
                width={96}
                height={96}
                className="rounded-3xl shadow-xl opacity-90 ring-2 ring-primary/20"
              />
              <span className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight drop-shadow-sm">MOMS-2GO</span>
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
              <Link href="/auth/signin">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-3 text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                  Access Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-fade-in space-y-3 bg-background/95 backdrop-blur-sm">
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
              <Link href="/auth/signin">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-8 py-3 text-base font-medium">
                  Access Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Mobile background */}
        <div className="absolute inset-0 md:hidden">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-background-mobile.png')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/80 to-purple-800/70"></div>
        </div>
        
        {/* Desktop background */}
        <div className="absolute inset-0 hidden md:block">
          <div 
            className="w-full h-full bg-cover bg-right bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-background-desktop.png')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/60 to-transparent"></div>
        </div>
        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Column - Text Content */}
            <div className="space-y-8 lg:space-y-10 text-center lg:text-left">
              {/* Content Panel for better readability */}
              <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 shadow-2xl">
                <div className="space-y-6 sm:space-y-8">

                  <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.85] text-white tracking-tight">
                    <span className="block text-white/95 font-light">Safe Rides for</span>
                    <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent font-black">
                      Expecting Mothers
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl lg:text-2xl text-white/85 leading-relaxed font-light tracking-wide">
                    Professional transportation with CPR-certified drivers, spacious vehicles, and emergency-ready
                    technology designed specifically for your precious journey to motherhood.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-3xl px-12 sm:px-16 py-5 sm:py-6 text-lg sm:text-xl font-bold tracking-wide transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-purple-500/30 w-full border border-purple-400/30 hover:border-purple-300/50"
                >
                  Book Your Ride Now
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-3xl px-12 sm:px-16 py-5 sm:py-6 text-lg sm:text-xl font-bold tracking-wide border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 hover:scale-105 transition-all duration-500 bg-white/5 w-full sm:w-auto backdrop-blur-md"
              >
                Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 sm:gap-8 text-center flex-wrap justify-center lg:justify-start pt-8">
                <div>
                  <p className="text-4xl font-black text-white tracking-tight">24/7</p>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-widest">Available</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white tracking-tight">156</p>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-widest">Certified Drivers</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-white tracking-tight">100%</p>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-widest">Safety Record</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual Space for Background */}
            <div className="hidden lg:block">
              {/* This space allows the background image to show through */}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 sm:py-24 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 sm:space-y-6 mb-16 sm:mb-20 lg:mb-24 animate-slide-up">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground tracking-tight">
              Our Specialized Services
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-light px-4 sm:px-0">
              Comprehensive transportation solutions designed for every stage of your maternal journey
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
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
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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

      <section id="about" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-slide-up">
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full px-6 py-2 text-sm font-medium mb-6">
                  About Moms-2GO
                </Badge>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-foreground tracking-tight mb-6">
                  More Than Transportation
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed font-light mb-8">
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
                    src="/images/moms-2-go-car.jpg"
                    alt="Moms-2GO"
                    width={120}
                    height={120}
                    className="rounded-3xl mx-auto shadow-2xl opacity-90"
                  />
                  <p className="text-lg font-medium text-muted-foreground">Trusted by families nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 sm:py-24 lg:py-32 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-24 animate-slide-up">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground tracking-tight">
              What Mothers Say
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-light px-4 sm:px-0">
              Real experiences from real mothers who trust us with their most precious moments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "First-time Mom",
                content:
                  "When my water broke at 2 AM, Moms-2GO was there in 4 minutes. The driver was calm, professional, and got us to the hospital safely. I can't thank them enough!",
              },
              {
                name: "Maria Rodriguez",
                role: "Mother of Two",
                content:
                  "The peace of mind knowing I have reliable transportation for all my prenatal appointments is invaluable. The drivers are so understanding and accommodating.",
              },
              {
                name: "Jennifer Chen",
                role: "Working Mom",
                content:
                  "As a busy professional, having Moms-2GO handle my transportation needs during pregnancy was a game-changer. Reliable, safe, and always on time.",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl bg-card hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
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

      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in relative">
          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            <div className="space-y-6">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-primary-foreground tracking-tight">
                Ready for Your Safe Journey?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 leading-relaxed font-light max-w-2xl mx-auto px-4 sm:px-0">
                Join thousands of mothers who trust us for their transportation needs. Experience the difference of
                specialized maternal care.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-background hover:bg-background/90 text-foreground rounded-2xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  Book Your First Ride
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 rounded-2xl px-12 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
              >
                Call (555) 123-MOMS
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 text-primary-foreground/80">
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

      <footer className="py-12 sm:py-16 lg:py-20 bg-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <Image src="/images/moms-2-go-car.jpg" alt="Moms-2GO" width={48} height={48} className="rounded-xl opacity-85" />
                <span className="font-serif font-medium text-2xl text-background tracking-tight">MOMS-2GO</span>
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
                © 2024 Moms-2GO. Safe rides for life's precious moments.
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

    </div>
  )
}
