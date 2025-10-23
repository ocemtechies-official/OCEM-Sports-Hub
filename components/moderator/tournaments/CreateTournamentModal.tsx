'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createBrowserClient } from '@supabase/ssr'

interface CreateTournamentModalProps {
  isOpen: boolean
  onClose: () => void
  availableSports: Array<{
    id: string
    name: string
    icon: string
  }>
  onSuccess: () => void
}

export function CreateTournamentModal({
  isOpen,
  onClose,
  availableSports,
  onSuccess
}: CreateTournamentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportId: '',
    tournamentType: 'single_elimination',
    maxTeams: '8'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('tournaments')
        .insert({
          name: formData.name,
          description: formData.description,
          sport_id: formData.sportId,
          tournament_type: formData.tournamentType,
          max_teams: parseInt(formData.maxTeams),
          status: 'draft'
        })

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating tournament:', error)
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Tournament</DialogTitle>
          <DialogDescription>
            Set up a new tournament with custom settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tournament Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter tournament name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter tournament description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select
              value={formData.sportId}
              onValueChange={(value) => setFormData({ ...formData, sportId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {availableSports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.id}>
                    <div className="flex items-center gap-2">
                      <span>{sport.icon}</span>
                      <span>{sport.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tournament Type</Label>
            <Select
              value={formData.tournamentType}
              onValueChange={(value) => setFormData({ ...formData, tournamentType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_elimination">Single Elimination</SelectItem>
                <SelectItem value="double_elimination">Double Elimination</SelectItem>
                <SelectItem value="round_robin">Round Robin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTeams">Maximum Teams</Label>
            <Select
              value={formData.maxTeams}
              onValueChange={(value) => setFormData({ ...formData, maxTeams: value })}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 Teams</SelectItem>
                <SelectItem value="8">8 Teams</SelectItem>
                <SelectItem value="16">16 Teams</SelectItem>
                <SelectItem value="32">32 Teams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}