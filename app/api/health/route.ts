import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Health check started")
    
    // Get Supabase client
    const supabase = await getSupabaseServerClient()
    
    // Try to get the current user (this will test the connection)
    const { data: { user }, error } = await supabase.auth.getUser()

    // It's normal to have no session during a health check.
    // Treat these as non-fatal: "Auth session missing!" and "Invalid JWT"
    const nonFatalAuthErrors = ["Invalid JWT", "Auth session missing", "Auth session missing!"]
    if (error && !nonFatalAuthErrors.includes(error.message)) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ 
        status: "error", 
        message: error.message 
      }, { status: 500 })
    }
    
    console.log("Health check completed successfully")
    return NextResponse.json({ 
      status: "ok", 
      message: "Supabase connection successful",
      user: user ? "Authenticated" : "Not authenticated"
    })
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json({ 
      status: "error", 
      message: error.message 
    }, { status: 500 })
  }
}