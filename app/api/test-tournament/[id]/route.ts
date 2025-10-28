import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Missing tournament ID' }, { status: 400 })
  }

  try {
    const supabase = await getSupabaseServerClient()
    
    // Check if tournament exists
    const { data: tournament, error } = await supabase
      .from("tournaments")
      .select(`
        *,
        sport:sports(*)
      `)
      .eq("id", id)
      .is("deleted_at", null) // Use .is() for proper null checking
      .single()

    if (error || !tournament) {
      return NextResponse.json({ 
        error: 'Tournament not found',
        details: error?.message || 'No tournament data returned'
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        sport: tournament.sport?.name
      }
    })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message
    }, { status: 500 })
  }
}