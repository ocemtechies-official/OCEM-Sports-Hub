import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { requireModerator } from "@/lib/auth"
import { z } from "zod"

const updateScoreSchema = z.object({
  team_a_score: z.number().int().min(0),
  team_b_score: z.number().int().min(0),
  // Accept both 'completed' and 'finished' for backward compatibility
  status: z.enum(['scheduled', 'live', 'completed', 'finished', 'cancelled']),
  expected_version: z.number().int().min(1).optional(),
  note: z.string().max(500).optional(),
  // Optional sport-specific payload to merge into fixtures.extra
  extra: z.record(z.any()).optional()
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is moderator or admin
    const { user, profile, isModerator } = await requireModerator()
    
    if (!user || !isModerator) {
      return NextResponse.json(
        { error: "Unauthorized - Moderator access required" },
        { status: 401 }
      )
    }

    const supabase = await getSupabaseServerClient()
    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = updateScoreSchema.parse(body)
    
    const {
      team_a_score,
      team_b_score,
      status,
      expected_version,
      note,
      extra
    } = validatedData
    // Normalize to 'completed' for DB consistency
    const normalizedStatusGlobal = status === 'finished' ? 'completed' : status

    // Skip RPC and use direct update for reliability
    let updatedFixture: any, error
    const shouldFallbackToDirectUpdate = true

    if (shouldFallbackToDirectUpdate) {
      // Check if user is admin or has permission to update this fixture
      if (profile.role !== 'admin') {
        // For moderators, check if they're assigned to this fixture's sport
        const { data: fixture } = await supabase
          .from('fixtures')
          .select('sport_id, venue')
          .eq('id', id)
          .single()
        
        if (!fixture) {
          return NextResponse.json(
            { error: "Fixture not found" },
            { status: 404 }
          )
        }
        
        // Check moderator assignments (if columns exist)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('assigned_sports, assigned_venues')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          const assignedSports = profileData.assigned_sports || []
          const assignedVenues = profileData.assigned_venues || []
          // If moderator has specific assignments, check them
          if (assignedSports.length > 0) {
            // assigned_sports stores sport names; map them to IDs for comparison
            const { data: sportsMap } = await supabase
              .from('sports')
              .select('id, name')
              .in('name', assignedSports)
            const assignedSportIds = (sportsMap || []).map((s: any) => s.id)

            if (!assignedSportIds.includes(fixture.sport_id)) {
              return NextResponse.json(
                { error: "You are not authorized to update this fixture" },
                { status: 403 }
              )
            }
          }
          
          if (assignedVenues.length > 0 && !assignedVenues.includes(fixture.venue)) {
            return NextResponse.json(
              { error: "You are not authorized to update this fixture" },
              { status: 403 }
            )
          }
        }
      }
      
      // Direct update fallback
      let winnerId = null
      // Determine winner when completed
      if (normalizedStatusGlobal === 'completed') {
        if (team_a_score > team_b_score) {
          // Get team_a_id for winner
          const { data: fixtureData } = await supabase
            .from('fixtures')
            .select('team_a_id')
            .eq('id', id)
            .single()
          winnerId = fixtureData?.team_a_id
        } else if (team_b_score > team_a_score) {
          // Get team_b_id for winner
          const { data: fixtureData } = await supabase
            .from('fixtures')
            .select('team_b_id')
            .eq('id', id)
            .single()
          winnerId = fixtureData?.team_b_id
        }
      }
      
      const updateData: any = {
        team_a_score,
        team_b_score,
        status: normalizedStatusGlobal,
        updated_at: new Date().toISOString()
      }
      
      // Add updated_by and version if columns exist
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'fixtures')
        .eq('table_schema', 'public')
        .in('column_name', ['updated_by', 'version', 'winner_id'])
      
      if (columns?.some(col => col.column_name === 'updated_by')) {
        updateData.updated_by = user.id
      }
      
      if (columns?.some(col => col.column_name === 'version') && typeof expected_version === 'number' && expected_version > 0) {
        updateData.version = expected_version + 1
      }

      if (columns?.some(col => col.column_name === 'winner_id')) {
        updateData.winner_id = winnerId
      }
      
      // Merge sport-specific extra payload if provided
      if (typeof extra === 'object' && extra !== null) {
        // Fetch current extra to merge
        const { data: fx } = await supabase
          .from('fixtures')
          .select('extra')
          .eq('id', id)
          .single()
        const currentExtra = (fx?.extra as Record<string, any>) || {}
        updateData.extra = { ...currentExtra, ...extra }
      }

      // Fetch previous state for audit
      const { data: prevFx } = await supabase
        .from('fixtures')
        .select('team_a_score, team_b_score, status')
        .eq('id', id)
        .maybeSingle()

      const updateResult = await supabase
        .from('fixtures')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          sport:sports(id, name, icon),
          team_a:teams!fixtures_team_a_id_fkey(id, name, logo_url),
          team_b:teams!fixtures_team_b_id_fkey(id, name, logo_url),
          updated_by_profile:profiles!fixtures_updated_by_fkey(full_name)
        `)
        .maybeSingle()
      
      updatedFixture = updateResult.data
      error = updateResult.error

      // If joined select failed or returned nothing, fall back to plain fixture select
      if (!updatedFixture || error) {
        const { data: plainFixture, error: plainErr } = await supabase
          .from('fixtures')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (plainFixture) {
          updatedFixture = plainFixture
          error = null
        } else if (plainErr) {
          error = plainErr
        }
      }

      // If update ultimately failed or produced no row, surface a clear error
      if (error || !updatedFixture) {
        console.error('Fixture update failed:', {
          fixtureId: id,
          userId: user.id,
          userRole: profile.role,
          error: error?.message,
          errorCode: error?.code,
          errorHint: error?.hint
        })

        // Check if the fixture exists but update was blocked (likely RLS)
        const { data: existingFx } = await supabase
          .from('fixtures')
          .select('id, status, team_a_score, team_b_score, sport_id, venue')
          .eq('id', id)
          .maybeSingle()
        
        if (existingFx) {
          // Enhanced error detection and user-friendly messages
          if (error?.code === '42501' || error?.message?.includes('policy')) {
            // RLS policy violation
            return NextResponse.json(
              { 
                error: "You don't have permission to update this fixture. Please check your sport/venue assignments or contact an administrator.",
                errorType: 'PERMISSION_DENIED',
                details: {
                  fixtureId: id,
                  fixtureSport: existingFx.sport_id,
                  fixtureVenue: existingFx.venue
                }
              },
              { status: 403 }
            )
          } else if (error?.code === '23505') {
            // Unique constraint violation
            return NextResponse.json(
              { 
                error: "Another update is in progress. Please wait a moment and try again.",
                errorType: 'CONCURRENT_UPDATE'
              },
              { status: 409 }
            )
          } else {
            // Generic update failure with existing fixture
            return NextResponse.json(
              { 
                error: "Failed to update fixture. The fixture exists but the update was rejected. This might be a permissions issue.",
                errorType: 'UPDATE_REJECTED',
                details: { 
                  originalError: error?.message,
                  fixtureExists: true 
                }
              },
              { status: 403 }
            )
          }
        } else {
          // Fixture doesn't exist
          return NextResponse.json(
            { 
              error: "Fixture not found or has been deleted.",
              errorType: 'NOT_FOUND'
            },
            { status: 404 }
          )
        }
      }

      // Ensure we have an updater name for client display
      let updatedByName: string | null = updatedFixture?.updated_by_profile?.full_name || null
      if (!updatedByName) {
        const { data: updaterProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()
        updatedByName = updaterProfile?.full_name || null
      }
      if (updatedFixture) {
        updatedFixture.updated_by_name = updatedByName
      }

      // Best-effort: insert an audit row into match_updates
      try {
        await supabase.from('match_updates').insert({
          fixture_id: id,
          update_type: 'score',
          note: note || null,
          prev_team_a_score: prevFx?.team_a_score ?? null,
          prev_team_b_score: prevFx?.team_b_score ?? null,
          prev_status: prevFx?.status ?? null,
          new_team_a_score: team_a_score,
          new_team_b_score: team_b_score,
          new_status: normalizedStatusGlobal,
          created_by: user.id
        })

        // Auto-post a highlight when a team's score increases
        const previousAScore = typeof prevFx?.team_a_score === 'number' ? prevFx.team_a_score : 0
        const previousBScore = typeof prevFx?.team_b_score === 'number' ? prevFx.team_b_score : 0
        const deltaA = Math.max(0, team_a_score - previousAScore)
        const deltaB = Math.max(0, team_b_score - previousBScore)

        const teamAName: string | undefined = updatedFixture?.team_a?.name || updatedFixture?.team_a_name
        const teamBName: string | undefined = updatedFixture?.team_b?.name || updatedFixture?.team_b_name

        const highlightRows: any[] = []
        if (deltaA > 0) {
          const pts = deltaA === 1 ? '1 point' : `${deltaA} points`
          const name = teamAName || 'Team A'
          highlightRows.push({
            fixture_id: id,
            update_type: 'incident',
            change_type: 'score_increase',
            note: `${name} gained ${pts}`,
            created_by: user.id
          })
        }
        if (deltaB > 0) {
          const pts = deltaB === 1 ? '1 point' : `${deltaB} points`
          const name = teamBName || 'Team B'
          highlightRows.push({
            fixture_id: id,
            update_type: 'incident',
            change_type: 'score_increase',
            note: `${name} gained ${pts}`,
            created_by: user.id
          })
        }

        // Auto-incident for status changes
        const prevStatus = prevFx?.status || null
        if (prevStatus !== normalizedStatusGlobal) {
          const statusMessage = (() => {
            switch (normalizedStatusGlobal) {
              case 'live':
                return prevStatus === 'scheduled' ? 'Match started' : 'Match is live'
              case 'completed':
                return 'Match completed'
              case 'cancelled':
                return 'Match cancelled'
              case 'scheduled':
                return 'Match scheduled'
              default:
                return `Status changed to ${normalizedStatusGlobal}`
            }
          })()
          highlightRows.push({
            fixture_id: id,
            update_type: 'incident',
            change_type: 'status_change',
            note: statusMessage,
            created_by: user.id
          })

          // If the match just completed, also post a result summary and set winner_id already handled above
          if (normalizedStatusGlobal === 'completed') {
            // Ensure team names are available
            const nameA: string = (updatedFixture?.team_a?.name || updatedFixture?.team_a_name || 'Team A') as string
            const nameB: string = (updatedFixture?.team_b?.name || updatedFixture?.team_b_name || 'Team B') as string

            let resultNote = ''
            if (typeof team_a_score === 'number' && typeof team_b_score === 'number') {
              if (team_a_score > team_b_score) {
                resultNote = `${nameA} beat ${nameB} ${team_a_score}-${team_b_score}`
                // Explicit winner announcement
                highlightRows.push({
                  fixture_id: id,
                  update_type: 'incident',
                  change_type: 'winner',
                  note: `Winner: ${nameA}`,
                  created_by: user.id
                })
              } else if (team_b_score > team_a_score) {
                resultNote = `${nameB} beat ${nameA} ${team_b_score}-${team_a_score}`
                // Explicit winner announcement
                highlightRows.push({
                  fixture_id: id,
                  update_type: 'incident',
                  change_type: 'winner',
                  note: `Winner: ${nameB}`,
                  created_by: user.id
                })
              } else {
                resultNote = `Match drawn ${team_a_score}-${team_b_score}`
              }
            } else {
              resultNote = 'Match completed'
            }

            highlightRows.push({
              fixture_id: id,
              update_type: 'incident',
              change_type: 'result',
              note: resultNote,
              created_by: user.id
            })
          }
        }

        if (highlightRows.length > 0) {
          await supabase.from('match_updates').insert(highlightRows)
        }
      } catch (_) {
        // ignore audit/highlight failure
      }
    }

    if (error) {
      console.error("Error updating fixture score:", error)
      
      const errorMessage = (error as any)?.message || String(error) || 'Unknown error'
      
      // Handle specific error cases
      if (errorMessage.includes('version_mismatch') || errorMessage.includes('Version mismatch')) {
        return NextResponse.json(
          { error: "Fixture was updated by another user. Please refresh and try again." },
          { status: 409 }
        )
      }
      
      if (errorMessage.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { error: "Too many updates. Please wait a few minutes before updating again." },
          { status: 429 }
        )
      }
      
      if (errorMessage.includes('Not authorized')) {
        return NextResponse.json(
          { error: "You are not authorized to update this fixture." },
          { status: 403 }
        )
      }
      
      if (errorMessage.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: "Insufficient permissions to update fixtures." },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to update fixture score: " + errorMessage },
        { status: 500 }
      )
    }

    if (!updatedFixture) {
      // As a last resort, return minimal fixture echo so client can proceed optimistically
      const minimalFixture: any = {
        id,
        team_a_score,
        team_b_score,
        status: normalizedStatusGlobal,
      }
      if (typeof expected_version === 'number' && expected_version > 0) {
        minimalFixture.version = expected_version + 1
      }
      return NextResponse.json({ success: true, fixture: minimalFixture, message: "Score updated successfully" })
    }

    return NextResponse.json({
      success: true,
      fixture: updatedFixture,
      message: "Score updated successfully"
    })
  } catch (error) {
    console.error("Error in update score API:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
