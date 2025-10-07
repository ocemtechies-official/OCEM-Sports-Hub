"use client"

import type React from "react"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Subscribe to fixture status changes
    const fixturesChannel = supabase
      .channel("fixture-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fixtures",
        },
        async (payload) => {
          const oldStatus = payload.old.status
          const newStatus = payload.new.status

          // Notify when match goes live
          if (oldStatus === "scheduled" && newStatus === "live") {
            const { data: fixture } = await supabase
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

            if (fixture) {
              toast({
                title: "Match Started!",
                description: `${fixture.team_a?.name} vs ${fixture.team_b?.name} is now live`,
              })
            }
          }

          // Notify when match completes
          if (oldStatus === "live" && newStatus === "completed") {
            const { data: fixture } = await supabase
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

            if (fixture) {
              toast({
                title: "Match Completed!",
                description: `${fixture.team_a?.name} ${fixture.team_a_score} - ${fixture.team_b_score} ${fixture.team_b?.name}`,
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(fixturesChannel)
    }
  }, [supabase, toast])

  return <>{children}</>
}
