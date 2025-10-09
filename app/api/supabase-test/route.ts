import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Starting Supabase server test")
    
    // Get Supabase client
    const supabase = await getSupabaseServerClient()
    
    // Test 1: Try to connect by getting the current time
    const { data: timeData, error: timeError } = await supabase.rpc('now')
    
    if (timeError) {
      console.error("Time test failed:", timeError)
      return NextResponse.json({ 
        success: false, 
        error: "Time test failed: " + timeError.message 
      }, { status: 500 })
    }
    
    console.log("Time test successful:", timeData)
    
    // Test 2: Try to access a simple table (if it exists)
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    // We don't care if this fails due to no data, just that the connection works
    console.log("Table test completed:", tableError ? tableError.message : "Success")
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase server connection successful",
      time: timeData
    })
  } catch (error: any) {
    console.error("Supabase server test failed:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Unknown error"
    }, { status: 500 })
  }
}