import { getSupabaseServerClient } from "@/lib/supabase/server"
import { cache } from "react"

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getCurrentProfile = cache(async () => {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
})

export const isAdmin = cache(async () => {
  const profile = await getCurrentProfile()
  return profile?.role === "admin"
})

export const isModerator = cache(async () => {
  const profile = await getCurrentProfile()
  return profile?.role === "moderator" || profile?.role === "admin"
})

export const isModeratorOnly = cache(async () => {
  const profile = await getCurrentProfile()
  return profile?.role === "moderator"
})

// Add a function to require authentication on server components
export const requireAuth = cache(async () => {
  const user = await getCurrentUser()
  const profile = await getCurrentProfile()
  
  return { user, profile }
})

// Add a function to require admin access
export const requireAdmin = cache(async () => {
  const { user, profile } = await requireAuth()
  
  if (!user || !profile) {
    return { user: null, profile: null, isAdmin: false }
  }
  
  const isAdmin = profile.role === "admin"
  return { user, profile, isAdmin }
})

// Add a function to require moderator access
export const requireModerator = cache(async () => {
  const { user, profile } = await requireAuth()
  
  if (!user || !profile) {
    return { user: null, profile: null, isModerator: false }
  }
  
  const isModerator = profile.role === "moderator" || profile.role === "admin"
  return { user, profile, isModerator }
})

// Get moderator assignments for a user
export const getModeratorAssignments = cache(async (userId?: string) => {
  const supabase = await getSupabaseServerClient()
  const targetUserId = userId || (await getCurrentUser())?.id
  
  if (!targetUserId) {
    return null
  }
  
  const { data } = await supabase
    .rpc('get_moderator_assignments', { p_user_id: targetUserId })
  
  return data
})