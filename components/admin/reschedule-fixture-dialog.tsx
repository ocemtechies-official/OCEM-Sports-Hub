"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Fixture {
  id: string
  scheduled_at: string
  venue: string | null
  status: string
  team_a_score: number
  team_b_score: number
  team_a: { id: string; name: string } | null
  team_b: { id: string; name: string } | null
  sport: { id: string; name: string } | null
}

interface RescheduleFixtureDialogProps {
  fixture: Fixture
  onSuccess?: () => void
}

export function RescheduleFixtureDialog({ fixture, onSuccess }: RescheduleFixtureDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newDateTime, setNewDateTime] = useState(
    new Date(fixture.scheduled_at).toISOString().slice(0, 16)
  )

  const handleReschedule = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport_id: fixture.sport?.id,
          team_a_id: fixture.team_a?.id,
          team_b_id: fixture.team_b?.id,
          scheduled_at: new Date(newDateTime).toISOString(),
          venue: fixture.venue,
          status: fixture.status,
          team_a_score: fixture.team_a_score,
          team_b_score: fixture.team_b_score,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reschedule fixture')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Fixture rescheduled successfully"
      })

      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error rescheduling fixture:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to reschedule fixture"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 py-1.5 text-xs font-medium rounded-md hover:shadow-sm transition-colors hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Fixture</DialogTitle>
          <DialogDescription>
            Change the date and time for {fixture.team_a?.name} vs {fixture.team_b?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-datetime">New Date & Time</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="new-datetime"
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Current Schedule:</span>
            </div>
            <div>
              {new Date(fixture.scheduled_at).toLocaleString()}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={loading}
            className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Rescheduling...
              </>
            ) : (
              "Reschedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}