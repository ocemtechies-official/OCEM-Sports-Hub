import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/profile - Update user profile
export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    
    // Get the user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { 
      full_name, 
      avatar_url, 
      student_id, 
      department, 
      semester, 
      contact_number,
      bio,
      address,
      city,
      date_of_birth,
      profile_visibility,
      notification_preferences,
      theme_preference,
      language_preference,
      timezone
    } = await request.json();

    // Update the profile
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        avatar_url,
        student_id,
        department,
        semester,
        contact_number,
        bio,
        address,
        city,
        date_of_birth,
        profile_visibility,
        notification_preferences,
        theme_preference,
        language_preference,
        timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in profile update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}