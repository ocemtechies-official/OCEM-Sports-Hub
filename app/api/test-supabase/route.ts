import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    // Test the connection by fetching the current time from the database
    const { data, error } = await supabase.rpc('now')
    
    if (error) {
      console.error("Supabase connection error:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection successful",
      currentTime: data
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to connect to Supabase"
    }, { status: 500 })
  }
}