"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type ScoreboardControlsProps = {
  fixtureId: string
  teamAName: string
  teamBName: string
  teamAScore: number
  teamBScore: number
  status: string
  sportName?: string
}

export function ScoreboardControls({ fixtureId, teamAName, teamBName, teamAScore, teamBScore, status, sportName }: ScoreboardControlsProps) {
  const [localA, setLocalA] = useState(teamAScore)
  const [localB, setLocalB] = useState(teamBScore)
  const [localStatus, setLocalStatus] = useState(status)
  const [isSaving, setIsSaving] = useState(false)
  const [extra, setExtra] = useState<any>({})

  const applyUpdate = async (nextA: number, nextB: number, nextStatus: string) => {
    setIsSaving(true)
    try {
      await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_a_score: nextA, team_b_score: nextB, status: nextStatus, extra })
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 items-center gap-4">
        <div className="text-center">
          <div className="font-semibold">{teamAName}</div>
          <div className="text-4xl font-bold">{localA}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-500">Status</div>
          <div className="text-xl font-medium capitalize">{localStatus}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{teamBName}</div>
          <div className="text-4xl font-bold">{localB}</div>
        </div>
      </div>
      {sportName && sportName.toLowerCase() === 'cricket' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">{teamAName} Runs</label>
            <input className="w-full border rounded px-3 py-2" type="number" min={0}
              onChange={(e) => setExtra((p: any) => ({ ...p, runs_a: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">{teamBName} Runs</label>
            <input className="w-full border rounded px-3 py-2" type="number" min={0}
              onChange={(e) => setExtra((p: any) => ({ ...p, runs_b: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">{teamAName} Overs</label>
            <input className="w-full border rounded px-3 py-2" type="number" step={0.1} min={0}
              onChange={(e) => setExtra((p: any) => ({ ...p, overs_a: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">{teamBName} Overs</label>
            <input className="w-full border rounded px-3 py-2" type="number" step={0.1} min={0}
              onChange={(e) => setExtra((p: any) => ({ ...p, overs_b: Number(e.target.value) }))} />
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-center gap-3">
        <Button size="sm" disabled={isSaving} onClick={() => { const v = localA + 1; setLocalA(v); applyUpdate(v, localB, localStatus) }}>+ {teamAName}</Button>
        <Button size="sm" variant="secondary" disabled={isSaving} onClick={() => { const v = Math.max(0, localA - 1); setLocalA(v); applyUpdate(v, localB, localStatus) }}>- {teamAName}</Button>
        <Button size="sm" disabled={isSaving} onClick={() => { const v = localB + 1; setLocalB(v); applyUpdate(localA, v, localStatus) }}>+ {teamBName}</Button>
        <Button size="sm" variant="secondary" disabled={isSaving} onClick={() => { const v = Math.max(0, localB - 1); setLocalB(v); applyUpdate(localA, v, localStatus) }}>- {teamBName}</Button>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <Button size="sm" variant={localStatus === 'live' ? 'default' : 'outline'} disabled={isSaving}
          onClick={() => { setLocalStatus('live'); applyUpdate(localA, localB, 'live') }}>Live</Button>
        <Button size="sm" variant={localStatus === 'scheduled' ? 'default' : 'outline'} disabled={isSaving}
          onClick={() => { setLocalStatus('scheduled'); applyUpdate(localA, localB, 'scheduled') }}>Scheduled</Button>
        <Button size="sm" variant={localStatus === 'finished' || localStatus === 'completed' ? 'default' : 'outline'} disabled={isSaving}
          onClick={() => { setLocalStatus('finished'); applyUpdate(localA, localB, 'finished') }}>Finished</Button>
      </div>
    </div>
  )
}


