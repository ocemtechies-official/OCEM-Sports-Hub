import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Define the shape of our contact form data
interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData: ContactFormData = await request.json()
    
    // Validate the form data
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }
    
    // Get Supabase client
    const supabase = await getSupabaseServerClient()
    
    // Insert the contact message into the database
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        is_read: false
      })
      .select()
      .single()
    
    // Check for errors
    if (error) {
      console.error("Error saving contact message:", error)
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      )
    }
    
    // Return success response
    return NextResponse.json(
      { 
        message: "Message sent successfully! We'll get back to you soon.",
        data: data
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unexpected error in contact form submission:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}