"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { notifications } from "@/lib/notifications"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // First, try to exchange any OAuth or email OTP code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession()
      if (exchangeError) {
        // Not all flows provide a code; continue to check existing session
        console.warn("Code exchange failed or not applicable:", exchangeError.message)
      }

      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        notifications.showError("Authentication error occurred.")
        router.push("/auth/login")
        return
      }
      
      if (data.session) {
        notifications.showSuccess("You have been signed in successfully.")
        
        // Check if there's a redirect URL
        const redirectTo = searchParams.get("redirect") || "/"
        router.push(redirectTo)
        router.refresh()
      } else {
        router.push("/auth/login")
      }
    }
    
    handleAuthCallback()
  }, [router, searchParams, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Completing authentication...
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please wait while we process your authentication.
        </p>
      </div>
    </div>
  )
}