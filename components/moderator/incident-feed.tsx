"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

type IncidentFeedProps = {
  fixtureId: string
}

export function IncidentFeed({ fixtureId }: IncidentFeedProps) {
  const [items, setItems] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const load = useCallback(async () => {
    setIsRefreshing(true)
    const { data } = await supabase
      .from('match_updates')
      .select('*')
      .eq('fixture_id', fixtureId)
      .eq('update_type', 'incident')
      .order('created_at', { ascending: false })
      .limit(30)
    const filtered = (data || []).filter((row: any) => {
      const note = typeof row?.note === 'string' ? row.note.trim() : ''
      const media = typeof row?.media_url === 'string' ? row.media_url.trim() : ''
      return note.length > 0 || media.length > 0
    })
    setItems(filtered)
    setIsRefreshing(false)
  }, [supabase, fixtureId])

  useEffect(() => {
    let isMounted = true

    // initial load
    load()

    const channel = supabase
      .channel(`match-updates:${fixtureId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_updates', filter: `fixture_id=eq.${fixtureId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const row: any = payload.new
          if (row?.update_type === 'incident') {
            const note = typeof row?.note === 'string' ? row.note.trim() : ''
            const media = typeof row?.media_url === 'string' ? row.media_url.trim() : ''
            if (note.length > 0 || media.length > 0) {
              setItems(current => [row, ...current])
            }
          }
        }
      })
      .subscribe()
    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase, fixtureId, load])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="icon" onClick={load} disabled={isRefreshing} title="Refresh highlights">
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
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


