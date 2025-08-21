import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display } from "next/font/google"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Moms-2-Go | Safe Rides for Expecting & New Mothers",
  description:
    "Professional ride service for pregnant and postpartum mothers with CPR-certified drivers and emergency-ready vehicles.",
  generator: "v0.app",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} antialiased`}>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
