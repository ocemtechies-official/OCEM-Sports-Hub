"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface EditModeratorDialogProps {
  moderator: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditModeratorDialog({ moderator, open, onOpenChange }: EditModeratorDialogProps) {
  const [assignedSports, setAssignedSports] = useState<string[]>([])
  const [assignedVenues, setAssignedVenues] = useState<string[]>([])
  const [moderatorNotes, setModeratorNotes] = useState("")
  const [availableSports, setAvailableSports] = useState<string[]>([])
  const [availableVenues, setAvailableVenues] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Load data when dialog opens
  useEffect(() => {
    if (open && moderator) {
      setAssignedSports(moderator.assigned_sports || [])
      setAssignedVenues(moderator.assigned_venues || [])
      setModeratorNotes(moderator.moderator_notes || "")
    }
  }, [open, moderator])

  // Load available sports and venues
  useEffect(() => {
    const loadData = async () => {
      const [sportsResult, venuesResult] = await Promise.all([
        supabase.from('sports').select('name').order('name'),
        supabase.from('fixtures').select('venue').not('venue', 'is', null)
      ])

      if (sportsResult.data) {
        setAvailableSports(sportsResult.data.map(s => s.name))
      }

      if (venuesResult.data) {
        const uniqueVenues = [...new Set(venuesResult.data.map(f => f.venue).filter(Boolean))]
        setAvailableVenues(uniqueVenues.sort())
      }
    }

    if (open) {
      loadData()
    }
  }, [open, supabase])

  const handleSportToggle = (sport: string) => {
    setAssignedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    )
  }

  const handleVenueToggle = (venue: string) => {
    setAssignedVenues(prev => 
      prev.includes(venue) 
        ? prev.filter(v => v !== venue)
        : [...prev, venue]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/moderators', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: moderator.id,
          assignedSports: assignedSports.length > 0 ? assignedSports : null,
          assignedVenues: assignedVenues.length > 0 ? assignedVenues : null,
          moderatorNotes: moderatorNotes.trim() || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update moderator')
      }

      toast({
        title: "Success",
        description: "Moderator assignments updated successfully",
      })

      onOpenChange(false)
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update moderator",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Moderator Assignments</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="p-4 border rounded-lg bg-slate-50">
            <div className="font-medium">{moderator?.full_name || 'No name'}</div>
            <div className="text-sm text-slate-500">{moderator?.email}</div>
            <div className="text-xs text-slate-400">Current role: {moderator?.role}</div>
          </div>

          {/* Sports Assignment */}
          <div className="space-y-3">
            <Label>Assigned Sports</Label>
            <div className="text-sm text-slate-600 mb-2">
              Select sports this moderator can manage. Leave empty to allow all sports.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
              {availableSports.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport}`}
                    checked={assignedSports.includes(sport)}
                    onCheckedChange={() => handleSportToggle(sport)}
                  />
                  <Label htmlFor={`sport-${sport}`} className="text-sm">
                    {sport}
                  </Label>
                </div>
              ))}
            </div>
            {assignedSports.length > 0 && (
              <div className="text-sm text-slate-500">
                Selected: {assignedSports.join(', ')}
              </div>
            )}
          </div>

          {/* Venues Assignment */}
          <div className="space-y-3">
            <Label>Assigned Venues (Optional)</Label>
            <div className="text-sm text-slate-600 mb-2">
              Select specific venues this moderator can manage. Leave empty to allow all venues.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3">
              {availableVenues.map((venue) => (
                <div key={venue} className="flex items-center space-x-2">
                  <Checkbox
                    id={`venue-${venue}`}
                    checked={assignedVenues.includes(venue)}
                    onCheckedChange={() => handleVenueToggle(venue)}
                  />
                  <Label htmlFor={`venue-${venue}`} className="text-sm">
                    {venue}
                  </Label>
                </div>
              ))}
            </div>
            {assignedVenues.length > 0 && (
              <div className="text-sm text-slate-500">
                Selected: {assignedVenues.join(', ')}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this moderator..."
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Assignments"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
