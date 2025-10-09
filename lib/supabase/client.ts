import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("Initializing Supabase client with:", { supabaseUrl, supabaseAnonKey })

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
    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client initialized successfully")
    return client
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    throw new Error("Failed to initialize Supabase client: " + (error as Error).message)
  }
}