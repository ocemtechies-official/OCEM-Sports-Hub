"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Save, AlertCircle } from "lucide-react"
import { format, parseISO } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { notifications } from "@/lib/notifications"
import AdminPageWrapper from "../admin-page-wrapper"

export default function SportsWeekSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Fetch current configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/sports-week-config')
        const result = await response.json()
        
        if (result.data) {
          const config = result.data
          setStartDate(format(parseISO(config.start_date), "yyyy-MM-dd'T'HH:mm"))
          if (config.end_date) {
            setEndDate(format(parseISO(config.end_date), "yyyy-MM-dd'T'HH:mm"))
          }
          setName(config.name)
          setDescription(config.description || '')
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        notifications.showError({
          title: "Error",
          description: "Failed to load current configuration"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/sports-week-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          name,
          description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update configuration')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Sports week configuration updated successfully"
      })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Error updating config:', error)
      notifications.showError({
        title: "Error",
        description: "Failed to update configuration"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div>
            <div className="h-10 w-64 bg-accent animate-pulse rounded-md"></div> {/* Title */}
            <div className="h-5 w-96 mt-2 bg-accent animate-pulse rounded-md"></div> {/* Description */}
          </div>

          {/* Alert Skeleton */}
          <div className="h-16 rounded-md border bg-accent animate-pulse"></div>

          {/* Card with Form */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-accent animate-pulse"></div>
                <div className="h-6 w-48 bg-accent animate-pulse rounded-md"></div> {/* Card Title */}
              </div>
              <div className="h-4 w-80 mt-1 bg-accent animate-pulse rounded-md"></div> {/* Card Description */}
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-6">
                {/* Event Name Field */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-accent animate-pulse rounded-md"></div> {/* Label */}
                  <div className="h-10 w-full bg-accent animate-pulse rounded-md"></div> {/* Input */}
                </div>

                {/* Start Date Field */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-accent animate-pulse rounded-md"></div> {/* Label */}
                  <div className="h-10 w-full bg-accent animate-pulse rounded-md"></div> {/* Input */}
                </div>

                {/* End Date Field */}
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-accent animate-pulse rounded-md"></div> {/* Label */}
                  <div className="h-10 w-full bg-accent animate-pulse rounded-md"></div> {/* Input */}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-accent animate-pulse rounded-md"></div> {/* Label */}
                  <div className="h-20 w-full bg-accent animate-pulse rounded-md"></div> {/* Textarea */}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <div className="h-10 w-32 bg-accent animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Sports Week Settings
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Configure the start date and other details for the sports week event.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Changes to the sports week configuration will be reflected immediately on the homepage.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sports Week Configuration
            </CardTitle>
            <CardDescription>
              Set the dates and details for the upcoming sports week event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sports Week 2025"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date and Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date and Time (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the sports week event..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}