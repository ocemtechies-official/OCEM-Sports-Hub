"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

type UndoSnackbarProps = {
  fixtureId: string
}

export function UndoSnackbar({ fixtureId }: UndoSnackbarProps) {
  const [visible, setVisible] = useState(false)
  const [deadline, setDeadline] = useState<number | null>(null)

  // Simple event bus using window for demo; integrate with score update response
  useEffect(() => {
    const handler = () => {
      setVisible(true)
      setDeadline(Date.now() + 15000)
    }
    window.addEventListener('moderator:update-made', handler)
    return () => window.removeEventListener('moderator:update-made', handler)
  }, [])

  useEffect(() => {
    if (!visible || !deadline) return
    const id = setInterval(() => {
      if (Date.now() > deadline) setVisible(false)
    }, 250)
    return () => clearInterval(id)
  }, [visible, deadline])

  const undo = async () => {
    await fetch(`/api/moderator/fixtures/${fixtureId}/undo`, { method: 'POST' })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded shadow px-4 py-3 flex items-center gap-3">
      <span>Update applied</span>
      <Button size="sm" variant="secondary" onClick={undo}>Undo</Button>
    </div>
  )
}


