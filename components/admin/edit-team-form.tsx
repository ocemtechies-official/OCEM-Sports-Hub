"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Palette, Upload, Trash2 } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Team {
  id: string
  name: string
  color: string | null
  logo_url: string | null
  created_at: string
}

interface EditTeamFormProps {
  team: Team
}

export function EditTeamForm({ team }: EditTeamFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: team.name,
    color: team.color || "#3b82f6",
    logo_url: team.logo_url || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          logo_url: formData.logo_url || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update team')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Team updated successfully"
      })

      router.push('/admin/teams')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating team:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update team"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone and will fail if the team is used in any fixtures.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/teams/${team.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete team')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Team deleted successfully"
      })

      router.push('/admin/teams')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting team:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete team"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Preview</CardTitle>
          <CardDescription>This is how your team will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: formData.color }}
            >
              {formData.name ? formData.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {formData.name || "Team Name"}
              </h3>
              <p className="text-sm text-slate-600">
                Color: {formData.color}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Team Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter team name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Team Color</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-20 h-10 p-1 border rounded"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3b82f6"
              className="flex-1"
            />
            <Palette className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo URL (Optional)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              type="url"
            />
            <Upload className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">
            Enter a URL to an image file for the team logo
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Team
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/teams')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Team
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
