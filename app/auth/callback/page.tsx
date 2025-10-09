"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
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
        toast({
          title: "Error",
          description: "Authentication error occurred.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }
      
      if (data.session) {
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        })
        
        // Check if there's a redirect URL
        const redirectTo = searchParams.get("redirect") || "/"
        router.push(redirectTo)
        router.refresh()
      } else {
        router.push("/auth/login")
      }
    }
    
    handleAuthCallback()
  }, [router, searchParams, supabase, toast])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Processing authentication...</span>
    </div>
  )
}