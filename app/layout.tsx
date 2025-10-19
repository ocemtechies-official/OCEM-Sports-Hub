import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Suspense } from "react";
import LayoutContent from "./LayoutContent";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";
import "../styles/animations.css";

// Remove the Inter font import that was causing issues with Turbopack
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// });

export const metadata: Metadata = {
  title: "OCEM Sports Hub 2025 - Live Scores & Fixtures",
  description:
    "Track live sports fixtures, scores, quizzes, and chess tournaments",
  generator: "v0.app",
  icons: {
    icon: "/favicons/favicon.ico",
    shortcut: "/favicons/favicon-16x16.png",
    apple: "/favicons/apple-touch-icon.png",
  },
};

// ✅ Separate component to use hooks (can't use usePathname in RootLayout directly)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <NotificationProvider>
            <Suspense fallback={null}>
              <Navbar />
              <LayoutContent>{children}</LayoutContent>
            </Suspense>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}