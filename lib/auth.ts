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
