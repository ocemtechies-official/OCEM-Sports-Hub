"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Trophy, Zap, Clock, CheckCircle, AlertCircle, Bell, Star } from "lucide-react"

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
      .limit(10) // Limit to 10 items
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
              setItems(current => {
                // Add new item at the beginning and limit to 10 items
                const newItems = [row, ...current]
                return newItems.slice(0, 10)
              })
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

  // Function to get update style based on type (similar to match detail page)
  const getUpdateStyle = (update: any) => {
    // All updates now have update_type: 'incident' but different change_type values
    const changeType = update.change_type || 'manual';
    
    switch (changeType) {
      case 'score_increase':
        return {
          bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          icon: <Trophy className="h-5 w-5 text-green-600" />,
          title: 'Score Update',
          titleColor: 'text-green-700'
        }
      case 'status_change':
        return {
          bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          icon: update.note?.includes('completed') ? <CheckCircle className="h-5 w-5 text-blue-600" /> : 
                update.note?.includes('live') ? <Zap className="h-5 w-5 text-red-500" /> : 
                <Clock className="h-5 w-5 text-blue-600" />,
          title: 'Status Change',
          titleColor: 'text-blue-700'
        }
      case 'winner':
        return {
          bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
          borderColor: 'border-amber-200',
          icon: <Star className="h-5 w-5 text-amber-500 fill-amber-500" />,
          title: 'Winner Announced',
          titleColor: 'text-amber-700'
        }
      case 'result':
        return {
          bgColor: 'bg-gradient-to-r from-purple-50 to-indigo-50',
          borderColor: 'border-purple-200',
          icon: <Trophy className="h-5 w-5 text-purple-600" />,
          title: 'Match Result',
          titleColor: 'text-purple-700'
        }
      case 'incident':
        return {
          bgColor: 'bg-gradient-to-r from-rose-50 to-pink-50',
          borderColor: 'border-rose-200',
          icon: <Bell className="h-5 w-5 text-rose-600" />,
          title: 'Incident Reported',
          titleColor: 'text-rose-700'
        }
      case 'manual':
      default:
        // Manual highlights
        return {
          bgColor: 'bg-gradient-to-r from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-200',
          icon: <AlertCircle className="h-5 w-5 text-indigo-600" />,
          title: 'Manual Highlight',
          titleColor: 'text-indigo-700'
        }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Recent Updates</h3>
        <Button variant="ghost" size="icon" onClick={load} disabled={isRefreshing} title="Refresh highlights">
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => {
          const style = getUpdateStyle(item)
          return (
            <div 
              key={item.id} 
              className={`relative border rounded-xl p-4 ${style.bgColor} ${style.borderColor} hover:shadow-md transition-all duration-300 hover:scale-[1.01] overflow-hidden`}
            >
              {/* Accent bar with matching rounded corners to parent container */}
              <div className={`absolute left-0 top-0 h-full w-1.5 rounded-l-xl ${
                item.change_type === 'score_increase' ? 'bg-gradient-to-b from-green-500 to-green-600' :
                item.change_type === 'status_change' ? 'bg-gradient-to-b from-blue-500 to-blue-600' :
                item.change_type === 'winner' ? 'bg-gradient-to-b from-amber-500 to-orange-500' :
                item.change_type === 'result' ? 'bg-gradient-to-b from-purple-500 to-purple-600' :
                item.change_type === 'incident' ? 'bg-gradient-to-b from-rose-500 to-rose-600' :
                'bg-gradient-to-b from-indigo-500 to-indigo-600'
              }`}></div>
              
              <div className="flex items-start gap-3 pl-3">
                <div className="mt-0.5">
                  {style.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${style.titleColor}`}>
                      {style.title}
                    </span>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {item.media_url ? (
                    <div className="my-3 overflow-hidden rounded-lg border bg-slate-50">
                      <img 
                        src={item.media_url} 
                        alt={item.note || 'highlight'} 
                        className="w-full max-h-48 object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  ) : null}
                  
                  {item.note ? (
                    <p className="text-slate-800">
                      {item.note.length > 150 ? `${item.note.substring(0, 150)}...` : item.note}
                    </p>
                  ) : null}
                  
                  {item.note && item.note.length > 150 ? (
                    <button 
                      onClick={() => {
                        // In a real implementation, this would expand the note
                        console.log('Show full note');
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read more
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
        {items.length === 0 ? (
          <div className="text-center py-6">
            <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 text-sm">No updates yet</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}