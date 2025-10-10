import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for individual registration
const individualRegistrationSchema = z.object({
  sportId: z.string().min(1, "Sport ID is required"),
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  rollNumber: z.string().min(1, "Roll number is required"),
  department: z.string().min(1, "Department is required"),
  semester: z.string().min(1, "Semester is required"),
  gender: z.enum(['male', 'female', 'other']),
  contactNumber: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit phone number"),
  email: z.string().email("Must be a valid email address"),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced'])
})

type IndividualRegistrationData = z.infer<typeof individualRegistrationSchema>

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = individualRegistrationSchema.parse(body)

    // Map sport identifiers to proper names
    const sportNameMap: Record<string, string> = {
      'cricket': 'Cricket',
      'football': 'Football',
      'basketball': 'Basketball',
      'volleyball': 'Volleyball',
      'tug-of-war': 'Tug of War',
      'table-tennis': 'Table Tennis',
      'badminton': 'Badminton',
      'chess': 'Chess',
      'quiz': 'Quiz'
    }

    const sportName = sportNameMap[validatedData.sportId] || validatedData.sportId

    // Look up sport UUID from sport name
    const { data: sport, error: sportError } = await supabase
      .from('sports')
      .select('id')
      .eq('name', sportName)
      .single()

    if (sportError || !sport) {
      return NextResponse.json(
        { error: 'Invalid sport selected' },
        { status: 400 }
      )
    }

    const sportUuid = sport.id

    // Check if user can register for this sport
    const { data: canRegister } = await supabase
      .rpc('can_register_for_sport', {
        sport_uuid: sportUuid,
        reg_type: 'individual'
      })

    if (!canRegister) {
      return NextResponse.json(
        { error: 'Registration not allowed for this sport at this time' },
        { status: 400 }
      )
    }

    // Check for existing registration
    const { data: existingRegistration } = await supabase
      .from('individual_registrations')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('sport_id', sportUuid)
      .single()

    if (existingRegistration && existingRegistration.status !== 'rejected' && existingRegistration.status !== 'withdrawn') {
      return NextResponse.json(
        { error: 'You have already registered for this sport' },
        { status: 400 }
      )
    }

    // Create registration
    const { data: registration, error: registrationError } = await supabase
      .from('individual_registrations')
      .insert({
        user_id: user.id,
        sport_id: sportUuid,
        student_name: validatedData.studentName,
        roll_number: validatedData.rollNumber,
        department: validatedData.department,
        semester: validatedData.semester,
        gender: validatedData.gender,
        contact_number: validatedData.contactNumber,
        email: validatedData.email,
        skill_level: validatedData.skillLevel,
        status: 'pending'
      })
      .select()
      .single()

    if (registrationError) {
      console.error('Registration error:', registrationError)
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      )
    }

    // Update user profile with registration info if needed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        student_id: validatedData.rollNumber,
        department: validatedData.department,
        semester: validatedData.semester,
        gender: validatedData.gender,
        contact_number: validatedData.contactNumber,
        registration_completed: true
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      // Don't fail the registration if profile update fails
    }

    return NextResponse.json(
      {
        message: 'Registration submitted successfully',
        registration: registration
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Individual registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const sportId = url.searchParams.get('sportId')

    let query = supabase
      .from('individual_registrations')
      .select(`
        *,
        sports:sport_id (
          id,
          name,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false })

    if (sportId) {
      query = query.eq('sport_id', sportId)
    }

    const { data: registrations, error } = await query

    if (error) {
      console.error('Fetch registrations error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      registrations: registrations || []
    })

  } catch (error) {
    console.error('Get individual registrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}