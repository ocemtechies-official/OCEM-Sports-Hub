"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Session, User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  profile: any | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  loading: boolean
  isAdmin: boolean
  testConnection: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
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
            toast({
              title: "Signed in",
              description: "You have been signed in successfully.",
            })
          } else if (event === "SIGNED_OUT") {
            setUser(null)
            setProfile(null)
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
            })
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
        toast({
          title: "Connection Test Failed",
          description: error.message,
          variant: "destructive",
        })
        return false
      }
      
      console.log("Connection test successful:", data)
      toast({
        title: "Connection Test Successful",
        description: "Successfully connected to Supabase",
      })
      return true
    } catch (error: any) {
      console.error("Connection test error:", error)
      toast({
        title: "Connection Test Error",
        description: error.message || "Network error - check your connection",
        variant: "destructive",
      })
      return false
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error("Sign in error:", error)
        throw error
      }
      
      console.log("Sign in successful:", data)
      setUser(data.user)
      if (data.user) {
        await fetchProfile(data.user.id)
      }
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
      
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
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
        toast({
          title: "Network Error",
          description: "Cannot reach Supabase Auth. Check internet/VPN/firewall or ad-blockers.",
          variant: "destructive",
        })
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
        throw error
      }
      
      console.log("Sign up successful:", data)
      // Note: Profile will be created by Supabase auth trigger
      // We don't set the user here because they need to verify their email first
      
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify.",
      })
      
      return { data, error: null }
    } catch (error: any) {
      console.error("Sign up failed:", error)
      let message = "Failed to create account"
      
      if (error.message) {
        message = error.message
      } else if (error.name === "AuthRetryableFetchError") {
        message = "Network error - please check your connection"
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      return { data: null, error }
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
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const isAdmin = profile?.role === "admin"

  const value = {
    user,
    profile,
    signIn,
    signUp,
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