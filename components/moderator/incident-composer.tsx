"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type IncidentComposerProps = {
  fixtureId: string
}

export function IncidentComposer({ fixtureId }: IncidentComposerProps) {
  const [note, setNote] = useState("")
  const [type, setType] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  const postIncident = async () => {
    if (!note && !type) return
    setIsPosting(true)
    try {
      await fetch(`/api/moderator/fixtures/${fixtureId}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, type })
      })
      setNote("")
      setType(null)
    } finally {
      setIsPosting(false)
    }
  }

  const Chip = ({ label, value }: { label: string, value: string }) => (
    <Button type="button" size="sm" variant={type === value ? 'default' : 'secondary'} onClick={() => setType(value)}>
      {label}
    </Button>
  )

  return (
    <div className="space-y-3">
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Goal by Aayush (12')" className="w-full border rounded px-3 py-2" />
      <div className="flex gap-2 flex-wrap">
        <Chip label="Goal" value="goal" />
        <Chip label="Foul" value="foul" />
        <Chip label="Point" value="point" />
        <Chip label="Wicket" value="wicket" />
      </div>
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={postIncident} disabled={isPosting}>Post</Button>
      </div>
    </div>
  )
}


