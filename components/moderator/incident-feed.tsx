"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type IncidentFeedProps = {
  fixtureId: string
}

export function IncidentFeed({ fixtureId }: IncidentFeedProps) {
  const [items, setItems] = useState<any[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const { data } = await supabase
        .from('match_updates')
        .select('*')
        .eq('fixture_id', fixtureId)
        .order('created_at', { ascending: false })
        .limit(30)
      if (isMounted) setItems(data || [])
    }
    load()

    const channel = supabase
      .channel(`match-updates:${fixtureId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_updates', filter: `fixture_id=eq.${fixtureId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems(current => [payload.new as any, ...current])
        }
      })
      .subscribe()
    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase, fixtureId])

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="border rounded p-3">
          <div className="text-xs text-slate-500">{new Date(item.created_at).toLocaleTimeString()}</div>
          {item.media_url ? (
            <div className="mt-2">
              <img src={item.media_url} alt={item.note || 'highlight'} className="rounded max-h-64 object-cover" />
            </div>
          ) : null}
          {item.note ? <p className="mt-2 text-sm">{item.note}</p> : null}
        </div>
      ))}
      {items.length === 0 ? <p className="text-sm text-slate-500">No updates yet.</p> : null}
    </div>
  )
}


