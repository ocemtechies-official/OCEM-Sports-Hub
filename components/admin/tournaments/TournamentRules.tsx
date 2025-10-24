"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface TournamentRulesProps {
  tournament: any // TODO: Add proper type
}

export function TournamentRules({ tournament }: TournamentRulesProps) {
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState({
    scoringSystem: tournament.scoring_system || {
      win: 3,
      draw: 1,
      loss: 0,
    },
    matchRules: tournament.match_rules || {
      maxPlayers: 11,
      minPlayers: 7,
      substitutesAllowed: 5,
      extraTimeEnabled: true,
      penaltyShootoutEnabled: true,
    },
    customRules: tournament.custom_rules || "",
    tiebreakers: tournament.tiebreakers || {
      headToHead: true,
      goalDifference: true,
      goalsScored: true,
      fairPlayPoints: false,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      })

      if (!response.ok) {
        throw new Error('Failed to update tournament rules')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Tournament rules updated successfully"
      })
    } catch (error: any) {
      console.error('Error updating tournament rules:', error)
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
      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Points for Win</Label>
              <Input
                type="number"
                value={rules.scoringSystem.win}
                onChange={(e) => setRules({
                  ...rules,
                  scoringSystem: { ...rules.scoringSystem, win: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Points for Draw</Label>
              <Input
                type="number"
                value={rules.scoringSystem.draw}
                onChange={(e) => setRules({
                  ...rules,
                  scoringSystem: { ...rules.scoringSystem, draw: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Points for Loss</Label>
              <Input
                type="number"
                value={rules.scoringSystem.loss}
                onChange={(e) => setRules({
                  ...rules,
                  scoringSystem: { ...rules.scoringSystem, loss: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Match Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximum Players</Label>
              <Input
                type="number"
                value={rules.matchRules.maxPlayers}
                onChange={(e) => setRules({
                  ...rules,
                  matchRules: { ...rules.matchRules, maxPlayers: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Players</Label>
              <Input
                type="number"
                value={rules.matchRules.minPlayers}
                onChange={(e) => setRules({
                  ...rules,
                  matchRules: { ...rules.matchRules, minPlayers: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Substitutes Allowed</Label>
              <Input
                type="number"
                value={rules.matchRules.substitutesAllowed}
                onChange={(e) => setRules({
                  ...rules,
                  matchRules: { ...rules.matchRules, substitutesAllowed: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Extra Time</Label>
                <p className="text-sm text-slate-600">Enable extra time for knockout matches</p>
              </div>
              <Switch
                checked={rules.matchRules.extraTimeEnabled}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  matchRules: { ...rules.matchRules, extraTimeEnabled: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Penalty Shootout</Label>
                <p className="text-sm text-slate-600">Enable penalty shootouts after extra time</p>
              </div>
              <Switch
                checked={rules.matchRules.penaltyShootoutEnabled}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  matchRules: { ...rules.matchRules, penaltyShootoutEnabled: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tiebreakers */}
      <Card>
        <CardHeader>
          <CardTitle>Tiebreakers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Head-to-Head</Label>
                <p className="text-sm text-slate-600">Use head-to-head results as first tiebreaker</p>
              </div>
              <Switch
                checked={rules.tiebreakers.headToHead}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  tiebreakers: { ...rules.tiebreakers, headToHead: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goal Difference</Label>
                <p className="text-sm text-slate-600">Use goal difference as tiebreaker</p>
              </div>
              <Switch
                checked={rules.tiebreakers.goalDifference}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  tiebreakers: { ...rules.tiebreakers, goalDifference: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goals Scored</Label>
                <p className="text-sm text-slate-600">Use total goals scored as tiebreaker</p>
              </div>
              <Switch
                checked={rules.tiebreakers.goalsScored}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  tiebreakers: { ...rules.tiebreakers, goalsScored: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fair Play Points</Label>
                <p className="text-sm text-slate-600">Use fair play points as tiebreaker</p>
              </div>
              <Switch
                checked={rules.tiebreakers.fairPlayPoints}
                onCheckedChange={(checked) => setRules({
                  ...rules,
                  tiebreakers: { ...rules.tiebreakers, fairPlayPoints: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={rules.customRules}
            onChange={(e) => setRules({ ...rules, customRules: e.target.value })}
            placeholder="Enter any additional rules or notes for the tournament..."
            rows={6}
          />
        </CardContent>
      </Card>

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
              Save Rules
            </>
          )}
        </Button>
      </div>
    </form>
  )
}