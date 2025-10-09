import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "OCEM Sports Hub 2025 - Live Scores & Fixtures",
  description: "Track live sports fixtures, scores, quizzes, and chess tournaments",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <Navbar />
              {children}
              <Footer />
              <Toaster />
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}