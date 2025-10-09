"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { notifications } from "@/lib/notifications"
import { Session, User } from "@supabase/supabase-js"

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDuration: 60 * 60 * 1000 // 1 hour
}

interface AuthContextType {
  user: User | null
  profile: any | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithGithub: () => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  resendVerificationEmail: (email: string) => Promise<any>
  signOut: () => Promise<void>
  loading: boolean
  isAdmin: boolean
  testConnection: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Rate limiting utility
class AuthRateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }[]> = new Map()
  private blocked: Map<string, number> = new Map()

  isBlocked(key: string): boolean {
    const blockedUntil = this.blocked.get(key)
    if (!blockedUntil) return false
    
    if (Date.now() > blockedUntil) {
      this.blocked.delete(key)
      return false
    }
    
    return true
  }

  recordAttempt(key: string): { blocked: boolean; waitTime?: number } {
    if (this.isBlocked(key)) {
      const waitTime = this.blocked.get(key)! - Date.now()
      return { blocked: true, waitTime }
    }

    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove attempts older than the window
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < RATE_LIMIT_CONFIG.windowMs
    )
    
    // Add current attempt
    recentAttempts.push({ count: 1, timestamp: now })
    this.attempts.set(key, recentAttempts)
    
    // Check if we've exceeded the limit
    if (recentAttempts.length >= RATE_LIMIT_CONFIG.maxAttempts) {
      const blockUntil = now + RATE_LIMIT_CONFIG.blockDuration
      this.blocked.set(key, blockUntil)
      this.attempts.delete(key)
      return { 
        blocked: true, 
        waitTime: RATE_LIMIT_CONFIG.blockDuration 
      }
    }
    
    return { blocked: false }
  }

  getRemainingAttempts(key: string): number {
    if (this.isBlocked(key)) return 0
    
    const attempts = this.attempts.get(key) || []
    const now = Date.now()
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < RATE_LIMIT_CONFIG.windowMs
    )
    
    return Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - recentAttempts.length)
  }

  // Public methods to access private properties
  public clearAttempts(key: string): void {
    this.attempts.delete(key)
    this.blocked.delete(key)
  }

  public getBlockedUntil(key: string): number | undefined {
    return this.blocked.get(key)
  }
}

const rateLimiter = new AuthRateLimiter()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error checking session:", error)
          // This is expected when not logged in, so we don't show an error
        } else {
          console.log("Current session:", session)
          if (session) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (event: any, session: Session | null) => {
          console.log("Auth state changed:", event, session)
          if (event === "SIGNED_IN" && session) {
            setUser(session.user)
            await fetchProfile(session.user.id)
            notifications.showSuccess("You have been signed in successfully.")
          } else if (event === "SIGNED_OUT") {
            setUser(null)
            setProfile(null)
            notifications.showSuccess("You have been signed out successfully.")
          }
        }
      )
      
      return () => {
        subscription.unsubscribe()
      }
    }
    
    checkSession()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
        
      if (error) {
        // This might happen if the profile hasn't been created yet
        console.warn("Profile not found, might be created by trigger:", error)
        return
      }
      
      console.log("Profile fetched:", data)
      setProfile(data)
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    }
  }

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log("Testing Supabase connection...")
      // Try to get the current time from the database
      const { data, error } = await supabase.rpc('now')
      
      if (error) {
        console.error("Connection test failed:", error)
        notifications.showError(`Connection Test Failed: ${error.message}`)
        return false
      }
      
      console.log("Connection test successful:", data)
      notifications.showSuccess("Successfully connected to Supabase")
      return true
    } catch (error: any) {
      console.error("Connection test error:", error)
      notifications.showError(error.message || "Network error - check your connection")
      return false
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Rate limiting check
      const rateLimitKey = `signin_${email.toLowerCase()}`
      
      if (rateLimitKey && rateLimiter.isBlocked(rateLimitKey)) {
        const blockedUntil = rateLimiter.getBlockedUntil(rateLimitKey)
        if (blockedUntil) {
          const waitTime = blockedUntil - Date.now()
          const minutes = Math.ceil(waitTime / (60 * 1000))
          throw new Error(`Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
        }
      }

      console.log("Attempting to sign in with:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session persistence based on rememberMe flag
          // 'session' means the session will persist after browser close
          // 'local' means the session will persist after browser close
          // 'global' means the session will persist across tabs
          persistSession: true, // Always persist session
          storage: rememberMe ? 'local' : 'session' // Use localStorage if rememberMe, otherwise sessionStorage
        }
      })
      
      if (error) {
        console.error("Sign in error:", error)
        
        // Record failed attempt for rate limiting
        if (rateLimitKey) {
          const rateLimitResult = rateLimiter.recordAttempt(rateLimitKey)
          if (rateLimitResult.blocked) {
            const minutes = Math.ceil((rateLimitResult.waitTime || 0) / (60 * 1000))
            throw new Error(`Too many failed attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
          }
        }
        
        // Provide more specific error messages
        let errorMessage = "Login failed. Please try again."
        if (error.message) {
          if (error.message.includes("Invalid login credentials")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again."
          } else if (error.message.includes("Email not confirmed")) {
            errorMessage = "Please verify your email address before logging in."
          } else {
            errorMessage = error.message
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Clear rate limiting on successful login
      if (rateLimitKey) {
        rateLimiter.clearAttempts(rateLimitKey)
      }
      
      console.log("Sign in successful:", data)
      setUser(data.user)
      if (data.user) {
        await fetchProfile(data.user.id)
      }
      
      // Note: Success notification is handled by the login form
      
      return { data, error: null }
    } catch (error: any) {
      console.error("Sign in failed:", error)
      let message = "Failed to sign in"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthApiError") {
        message = "Invalid email or password"
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      // Note: Error notification is handled by the login form
      return { data: null, error: new Error(message) }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log("Attempting to sign in with Google")
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        console.error("Google sign in error:", error)
        throw error
      }
      
      console.log("Google sign in successful:", data)
      // The actual redirect will be handled by Supabase
      window.location.href = data.url
      
      return { data, error: null }
    } catch (error: any) {
      console.error("Google sign in failed:", error)
      let message = "Failed to sign in with Google"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      return { data: null, error }
    }
  }

  const signInWithGithub = async () => {
    try {
      console.log("Attempting to sign in with GitHub")
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : `${window.location.origin}/auth/callback`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        console.error("GitHub sign in error:", error)
        throw error
      }
      
      console.log("GitHub sign in successful:", data)
      // The actual redirect will be handled by Supabase
      window.location.href = data.url
      
      return { data, error: null }
    } catch (error: any) {
      console.error("GitHub sign in failed:", error)
      let message = "Failed to sign in with GitHub"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Rate limiting check
      const rateLimitKey = `signup_${email.toLowerCase()}`
      
      if (rateLimitKey && rateLimiter.isBlocked(rateLimitKey)) {
        const blockedUntil = rateLimiter.getBlockedUntil(rateLimitKey)
        if (blockedUntil) {
          const waitTime = blockedUntil - Date.now()
          const minutes = Math.ceil(waitTime / (60 * 1000))
          throw new Error(`Too many signup attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
        }
      }

      console.log("Attempting to sign up with:", email)
      // Reachability check: surface network/CORS blockers early to avoid opaque "Failed to fetch"
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase environment variables are missing")
        }
        const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          credentials: "omit",
          cache: "no-store",
        })
        if (!res.ok) {
          console.warn("Auth settings returned status:", res.status)
        }
      } catch (netErr: any) {
        console.error("Supabase auth endpoint unreachable:", netErr)
        notifications.showError("Cannot reach Supabase Auth. Check internet/VPN/firewall or ad-blockers.")
        return { data: null, error: netErr }
      }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : `${window.location.origin}/auth/callback`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "viewer",
          },
          emailRedirectTo: redirectTo,
        },
      })
      
      if (error) {
        console.error("Sign up error:", error)
        
        // Record failed attempt for rate limiting
        if (rateLimitKey) {
          const rateLimitResult = rateLimiter.recordAttempt(rateLimitKey)
          if (rateLimitResult.blocked) {
            const minutes = Math.ceil((rateLimitResult.waitTime || 0) / (60 * 1000))
            throw new Error(`Too many signup attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
          }
        }
        
        // Provide more specific error messages
        let errorMessage = "Failed to create account. Please try again."
        if (error.message) {
          if (error.message.includes("User already registered")) {
            errorMessage = "An account with this email already exists. Please try signing in instead."
          } else if (error.message.includes("Password is too weak")) {
            errorMessage = "Password is too weak. Please choose a stronger password."
          } else if (error.message.includes("Email rate limit exceeded")) {
            errorMessage = "Too many signup attempts. Please try again later."
          } else {
            errorMessage = error.message
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Clear rate limiting on successful signup
      if (rateLimitKey) {
        rateLimiter.clearAttempts(rateLimitKey)
      }
      
      console.log("Sign up successful:", data)
      // Note: Profile will be created by Supabase auth trigger
      // We don't set the user here because they need to verify their email first
      
      // Note: Success notification is handled by the signup form
      
      return { data, error: null }
    } catch (error: any) {
      console.error("Sign up failed:", error)
      let message = "Failed to create account"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      // Note: Error notification is handled by the signup form
      return { data: null, error: new Error(message) }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      // Rate limiting check
      const rateLimitKey = `resend_${email.toLowerCase()}`
      
      if (rateLimitKey && rateLimiter.isBlocked(rateLimitKey)) {
        const blockedUntil = rateLimiter.getBlockedUntil(rateLimitKey)
        if (blockedUntil) {
          const waitTime = blockedUntil - Date.now()
          const minutes = Math.ceil(waitTime / (60 * 1000))
          throw new Error(`Too many resend attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
        }
      }

      console.log("Attempting to resend verification email to:", email)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = siteUrl ? `${siteUrl}/auth/callback` : `${window.location.origin}/auth/callback`
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectTo,
        }
      })
      
      if (error) {
        console.error("Resend verification email error:", error)
        
        // Record failed attempt for rate limiting
        if (rateLimitKey) {
          const rateLimitResult = rateLimiter.recordAttempt(rateLimitKey)
          if (rateLimitResult.blocked) {
            const minutes = Math.ceil((rateLimitResult.waitTime || 0) / (60 * 1000))
            throw new Error(`Too many resend attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`)
          }
        }
        
        // Provide more specific error messages
        let errorMessage = "Failed to resend verification email. Please try again."
        if (error.message) {
          if (error.message.includes("For security purposes, you can only request this once every 60 seconds")) {
            errorMessage = "Please wait 60 seconds before requesting another verification email."
          } else if (error.message.includes("User not found")) {
            errorMessage = "No account found with this email address."
          } else {
            errorMessage = error.message
          }
        }
        
        throw new Error(errorMessage)
      }
      
      // Clear rate limiting on successful resend
      if (rateLimitKey) {
        rateLimiter.clearAttempts(rateLimitKey)
      }
      
      console.log("Verification email resent successfully")
      return { error: null }
    } catch (error: any) {
      console.error("Resend verification email failed:", error)
      let message = "Failed to resend verification email"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      return { error: new Error(message) }
    }
  }

  const signOut = async () => {
    try {
      console.log("Attempting to sign out")
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      setUser(null)
      setProfile(null)
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Sign out failed:", error)
      let message = "Failed to sign out"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      notifications.showError(message)
    }
  }

  const isAdmin = profile?.role === "admin"

  const value = {
    user,
    profile,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signUp,
    resendVerificationEmail,
    signOut,
    loading,
    isAdmin,
    testConnection
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Add the missing export
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}