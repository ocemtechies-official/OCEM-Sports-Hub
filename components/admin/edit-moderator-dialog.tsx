"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { SupabaseClient } from '@supabase/supabase-js'

interface EditModeratorDialogProps {
  moderator: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Sport {
  name: string
}

interface Fixture {
  venue: string | null
}

export function EditModeratorDialog({ moderator, open, onOpenChange }: EditModeratorDialogProps) {
  const [assignedSports, setAssignedSports] = useState<string[]>([])
  const [assignedVenues, setAssignedVenues] = useState<string[]>([])
  const [moderatorNotes, setModeratorNotes] = useState("")
  const [availableSports, setAvailableSports] = useState<string[]>([])
  const [availableVenues, setAvailableVenues] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allowAllSports, setAllowAllSports] = useState<boolean>(false)
  const [allowAllVenues, setAllowAllVenues] = useState<boolean>(false)

  const { toast } = useToast()
  const supabase: SupabaseClient = getSupabaseBrowserClient()

  // Load data when dialog opens
  useEffect(() => {
    if (open && moderator) {
      setAssignedSports(moderator.assigned_sports || [])
      setAssignedVenues(moderator.assigned_venues || [])
      setModeratorNotes(moderator.moderator_notes || "")
      // If assignments are null treat as allow all; if array (incl. empty), it's specific/none
      setAllowAllSports(moderator.assigned_sports === null)
      setAllowAllVenues(moderator.assigned_venues === null)
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
        setAvailableSports(sportsResult.data.map((s: Sport) => s.name))
      }

      if (venuesResult.data) {
        const uniqueVenues = [...new Set(venuesResult.data.map((f: Fixture) => f.venue).filter(Boolean))] as string[]
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
          // null means global access; empty array means no access; non-empty array means specific
          assignedSports: allowAllSports ? null : assignedSports,
          assignedVenues: allowAllVenues ? null : assignedVenues,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col sm:max-w-5xl lg:max-w-6xl">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-2xl font-bold">Edit Moderator Assignments</DialogTitle>
          <p className="text-sm text-muted-foreground">Manage sports and venues this moderator can oversee</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit} className="space-y-8 py-2">
            {/* User Info */}
            <div className="p-5 border rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                    {(moderator?.full_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{moderator?.full_name || 'No name'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{moderator?.email}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wide">Role: {moderator?.role}</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sports Assignment */}
              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">Sports Assignment</h3>
                      <p className="text-sm text-muted-foreground">Select specific sports or enable global access</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                      <Checkbox
                        id="allow-all-sports"
                        checked={allowAllSports}
                        onCheckedChange={(checked) => setAllowAllSports(!!checked)}
                      />
                      <Label htmlFor="allow-all-sports" className="text-sm font-medium cursor-pointer">
                        Allow all sports
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <div className="p-4 border-b bg-slate-50 dark:bg-slate-700 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200">Available Sports</h4>
                      <span className="text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-full">
                        {availableSports.length} total
                      </span>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableSports.map((sport) => (
                        <div 
                          key={sport} 
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                            assignedSports.includes(sport) 
                              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          } ${allowAllSports ? 'opacity-60' : ''}`}
                        >
                          <Checkbox
                            id={`sport-${sport}`}
                            checked={assignedSports.includes(sport)}
                            onCheckedChange={() => handleSportToggle(sport)}
                            disabled={allowAllSports}
                            className="size-5"
                          />
                          <Label 
                            htmlFor={`sport-${sport}`} 
                            className={`text-sm flex-1 cursor-pointer select-none ${
                              allowAllSports 
                                ? 'text-slate-400 dark:text-slate-500' 
                                : assignedSports.includes(sport)
                                  ? 'text-blue-700 dark:text-blue-300 font-medium'
                                  : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sport}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!allowAllSports && assignedSports.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Selected Sports</h4>
                      <span className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        {assignedSports.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assignedSports.map((sport) => (
                        <span 
                          key={sport} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 shadow-sm"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Venues Assignment */}
              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">Venues Assignment</h3>
                      <p className="text-sm text-muted-foreground">Select specific venues or enable global access</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                      <Checkbox
                        id="allow-all-venues"
                        checked={allowAllVenues}
                        onCheckedChange={(checked) => setAllowAllVenues(!!checked)}
                      />
                      <Label htmlFor="allow-all-venues" className="text-sm font-medium cursor-pointer">
                        Allow all venues
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <div className="p-4 border-b bg-slate-50 dark:bg-slate-700 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-700 dark:text-slate-200">Available Venues</h4>
                      <span className="text-xs font-medium bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-full">
                        {availableVenues.length} total
                      </span>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableVenues.map((venue) => (
                        <div 
                          key={venue} 
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                            assignedVenues.includes(venue) 
                              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          } ${allowAllVenues ? 'opacity-60' : ''}`}
                        >
                          <Checkbox
                            id={`venue-${venue}`}
                            checked={assignedVenues.includes(venue)}
                            onCheckedChange={() => handleVenueToggle(venue)}
                            disabled={allowAllVenues}
                            className="size-5"
                          />
                          <Label 
                            htmlFor={`venue-${venue}`} 
                            className={`text-sm flex-1 cursor-pointer select-none ${
                              allowAllVenues 
                                ? 'text-slate-400 dark:text-slate-500' 
                                : assignedVenues.includes(venue)
                                  ? 'text-green-700 dark:text-green-300 font-medium'
                                  : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {venue}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {!allowAllVenues && assignedVenues.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-200">Selected Venues</h4>
                      <span className="text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                        {assignedVenues.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {assignedVenues.map((venue) => (
                        <span 
                          key={venue} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 shadow-sm"
                        >
                          {venue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Admin Notes</h3>
                <p className="text-sm text-muted-foreground">Add any notes about this moderator (optional)</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 border shadow-sm p-1">
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this moderator..."
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  rows={4}
                  className="resize-none border-0 focus-visible:ring-0 p-4"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 border-t pt-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 h-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2 h-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                "Update Assignments"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}