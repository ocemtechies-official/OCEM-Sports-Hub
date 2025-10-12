"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Trophy } from "lucide-react"
import { notifications } from "@/lib/notifications"

export function CreateSportForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    is_team_sport: false,
    min_players: 1,
    max_players: 1,
    description: "",
    rules: "",
    is_active: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sport')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Sport created successfully"
      })

      router.push('/admin/sports')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating sport:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to create sport"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Sport Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Cricket, Football"
              required
            />
          </div>
          <div>
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🏏"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_team_sport"
            checked={formData.is_team_sport}
            onCheckedChange={(checked) => setFormData({ ...formData, is_team_sport: checked })}
          />
          <Label htmlFor="is_team_sport">Team Sport</Label>
        </div>
      </div>

      {/* Team Sport Settings */}
      {formData.is_team_sport && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Team Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_players">Minimum Players *</Label>
              <Input
                id="min_players"
                type="number"
                min="1"
                value={formData.min_players}
                onChange={(e) => setFormData({ ...formData, min_players: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_players">Maximum Players *</Label>
              <Input
                id="max_players"
                type="number"
                min="1"
                value={formData.max_players}
                onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Description and Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Information</h3>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the sport..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="rules">Rules</Label>
          <Textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            placeholder="Basic rules of the sport..."
            rows={3}
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Status</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active (Available for registration)</Label>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preview</h3>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3">
            {formData.icon && <span className="text-2xl">{formData.icon}</span>}
            <div>
              <h4 className="font-medium">{formData.name || 'Sport Name'}</h4>
              <p className="text-sm text-gray-600">
                {formData.is_team_sport ? 'Team Sport' : 'Individual Sport'}
                {formData.is_team_sport && ` • ${formData.min_players}-${formData.max_players} players`}
              </p>
              {formData.description && (
                <p className="text-sm text-gray-500 mt-1">{formData.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Sport
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
