"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { FixtureCard } from "@/components/fixtures/fixture-card"

interface LiveFixturesRealtimeProps {
  initialFixtures: any[]
}

export function LiveFixturesRealtime({ initialFixtures }: LiveFixturesRealtimeProps) {
  const [fixtures, setFixtures] = useState(initialFixtures)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Subscribe to changes in fixtures table
    const channel = supabase
      .channel("live-fixtures")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fixtures",
          filter: "status=eq.live",
        },
        async (payload) => {
          console.log("[v0] Real-time fixture update:", payload)

          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            // Fetch the complete fixture with relations
            const { data: updatedFixture } = await supabase
              .from("fixtures")
              .select(
                `
                *,
                sport:sports(*),
                team_a:teams!fixtures_team_a_id_fkey(*),
                team_b:teams!fixtures_team_b_id_fkey(*)
              `,
              )
              .eq("id", payload.new.id)
              .single()

            if (updatedFixture) {
              setFixtures((current) => {
                const index = current.findIndex((f) => f.id === updatedFixture.id)
                if (index >= 0) {
                  const updated = [...current]
                  updated[index] = updatedFixture
                  return updated
                } else {
                  return [...current, updatedFixture]
                }
              })
            }
          } else if (payload.eventType === "DELETE") {
            setFixtures((current) => current.filter((f) => f.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">No live matches at the moment</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fixtures.map((fixture) => (
        <a key={fixture.id} href={`/match/${fixture.id}`}>
          <FixtureCard fixture={fixture} isLive />
        </a>
      ))}
    </div>
  )
}
