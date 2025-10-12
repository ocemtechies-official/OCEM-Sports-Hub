"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Search, User, Mail, Shield } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function CreateModeratorForm() {
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [assignedSports, setAssignedSports] = useState<string[]>([])
  const [assignedVenues, setAssignedVenues] = useState<string[]>([])
  const [moderatorNotes, setModeratorNotes] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSports, setAvailableSports] = useState<string[]>([])
  const [availableVenues, setAvailableVenues] = useState<string[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

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

    loadData()
  }, [supabase])

  const searchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${searchEmail}%`)
        .limit(10)

      if (error) throw error

      setSearchResults(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchEmail(user.email)
  }

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
    
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          assignedSports: assignedSports.length > 0 ? assignedSports : null,
          assignedVenues: assignedVenues.length > 0 ? assignedVenues : null,
          moderatorNotes: moderatorNotes.trim() || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create moderator')
      }

      toast({
        title: "Success",
        description: `${selectedUser.full_name || selectedUser.email} has been made a moderator`,
      })

      router.push('/admin/moderators')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create moderator",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Search */}
      <div className="space-y-2">
        <Label htmlFor="search-email">Search User by Email</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search-email"
              placeholder="Enter email address..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchUsers())}
              className="pl-10"
            />
          </div>
          <Button type="button" onClick={searchUsers} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border rounded-lg p-2 space-y-2 max-h-40 overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.full_name || 'No name'}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                  <div className="text-xs text-slate-400">Current role: {user.role}</div>
                </div>
                <Shield className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}

        {/* Selected User */}
        {selectedUser && (
          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-green-900">
                  {selectedUser.full_name || 'No name'}
                </div>
                <div className="text-sm text-green-700">{selectedUser.email}</div>
                <div className="text-xs text-green-600">
                  Current role: {selectedUser.role}
                </div>
              </div>
            </div>
          </div>
        )}
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
          onClick={() => router.push('/admin/moderators')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!selectedUser || isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Moderator"}
        </Button>
      </div>
    </form>
  )
}
