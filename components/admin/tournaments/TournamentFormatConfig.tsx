"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface TournamentFormatConfigProps {
  tournament: any // TODO: Add proper type
}

export function TournamentFormatConfig({ tournament }: TournamentFormatConfigProps) {
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState({
    type: tournament.tournament_type || "single_elimination",
    seedingEnabled: true,
    thirdPlaceMatch: false,
    matchFormat: "best_of_1",
    groupStageEnabled: false,
    numberOfGroups: 2,
    teamsPerGroup: 4,
    teamsAdvancingPerGroup: 2,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/format`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(format),
      })

      if (!response.ok) {
        throw new Error('Failed to update tournament format')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Tournament format updated successfully"
      })
    } catch (error: any) {
      console.error('Error updating tournament format:', error)
      notifications.showError({
        title: "Error",
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* Tournament Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Format Type</Label>
              <Select
                value={format.type}
                onValueChange={(value) => setFormat({ ...format, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_elimination">Single Elimination</SelectItem>
                  <SelectItem value="double_elimination">Double Elimination</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="group_stage">Group Stage + Knockout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Match Format</Label>
              <Select
                value={format.matchFormat}
                onValueChange={(value) => setFormat({ ...format, matchFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select match format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best_of_1">Best of 1</SelectItem>
                  <SelectItem value="best_of_3">Best of 3</SelectItem>
                  <SelectItem value="best_of_5">Best of 5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Seeding</Label>
                <p className="text-sm text-slate-600">Enable team seeding for the tournament</p>
              </div>
              <Switch
                checked={format.seedingEnabled}
                onCheckedChange={(checked) => setFormat({ ...format, seedingEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Third Place Match</Label>
                <p className="text-sm text-slate-600">Include a match to determine third place</p>
              </div>
              <Switch
                checked={format.thirdPlaceMatch}
                onCheckedChange={(checked) => setFormat({ ...format, thirdPlaceMatch: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Group Stage Configuration (if enabled) */}
        {format.type === "group_stage" && (
          <Card>
            <CardHeader>
              <CardTitle>Group Stage Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Group Stage</Label>
                  <p className="text-sm text-slate-600">Start with a group stage before knockouts</p>
                </div>
                <Switch
                  checked={format.groupStageEnabled}
                  onCheckedChange={(checked) => setFormat({ ...format, groupStageEnabled: checked })}
                />
              </div>

              {format.groupStageEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Groups</Label>
                    <Select
                      value={format.numberOfGroups.toString()}
                      onValueChange={(value) => setFormat({ ...format, numberOfGroups: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of groups" />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Groups
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Teams per Group</Label>
                    <Select
                      value={format.teamsPerGroup.toString()}
                      onValueChange={(value) => setFormat({ ...format, teamsPerGroup: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teams per group" />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Teams
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Teams Advancing</Label>
                    <Select
                      value={format.teamsAdvancingPerGroup.toString()}
                      onValueChange={(value) => setFormat({ ...format, teamsAdvancingPerGroup: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teams advancing" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Top {num} Teams
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Format
            </>
          )}
        </Button>
      </div>
    </form>
  )
}