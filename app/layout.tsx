import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/components/notifications/notification-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sports Week 2025 - Live Scores & Fixtures",
  description: "Track live sports fixtures, scores, quizzes, and chess tournaments",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <NotificationProvider>
          <Suspense fallback={null}>
            <Navbar />
            {children}
            <Footer />
            <Toaster />
          </Suspense>
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}