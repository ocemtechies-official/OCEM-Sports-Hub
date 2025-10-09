import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("Initializing Supabase server client with:", { supabaseUrl, supabaseAnonKey })

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  }

  if (!supabaseUrl.startsWith('https://')) {
    throw new Error("Invalid Supabase URL: must start with https://")
  }

  if (!supabaseAnonKey.startsWith('eyJ')) {
    throw new Error("Invalid Supabase Anon Key: must be a valid JWT token")
  }

  try {
    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
    
    console.log("Supabase server client initialized successfully")
    return client
  } catch (error) {
    console.error("Failed to initialize Supabase server client:", error)
    throw new Error("Failed to initialize Supabase server client: " + (error as Error).message)
  }
}