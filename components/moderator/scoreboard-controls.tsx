"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import "@/styles/mobile-moderator.css"

type ScoreboardControlsProps = {
  fixtureId: string
  teamAName: string
  teamBName: string
  teamAScore: number
  teamBScore: number
  status: string
  sportName?: string
}

export function ScoreboardControls({ fixtureId, teamAName, teamBName, teamAScore, teamBScore, status, sportName }: ScoreboardControlsProps) {
  const [localA, setLocalA] = useState(teamAScore)
  const [localB, setLocalB] = useState(teamBScore)
  const [localStatus, setLocalStatus] = useState(status)
  const [isSaving, setIsSaving] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)
  const [extra, setExtra] = useState<any>({})
  const sport = (sportName || '').toLowerCase()

  // Enhanced Cricket state
  const [cricketData, setCricketData] = useState({
    runs_a: 0, runs_b: 0,
    wickets_a: 0, wickets_b: 0,
    overs_a: 0, overs_b: 0,
    extras_a: 0, extras_b: 0,
    balls_faced_a: 0, balls_faced_b: 0,
    fours_a: 0, fours_b: 0,
    sixes_a: 0, sixes_b: 0,
    wides_a: 0, wides_b: 0,
    no_balls_a: 0, no_balls_b: 0,
    byes_a: 0, byes_b: 0,
    leg_byes_a: 0, leg_byes_b: 0,
    run_rate_a: 0, run_rate_b: 0
  })

  // Enhanced Basketball state  
  const [basketballData, setBasketballData] = useState({
    quarter_1_a: 0, quarter_1_b: 0,
    quarter_2_a: 0, quarter_2_b: 0,
    quarter_3_a: 0, quarter_3_b: 0,
    quarter_4_a: 0, quarter_4_b: 0,
    overtime_a: 0, overtime_b: 0,
    current_quarter: 1
  })

  const applyUpdate = async (nextA: number, nextB: number, nextStatus: string, enhancedData?: any) => {
    setIsSaving(true)
    try {
      const updateData = { 
        team_a_score: nextA, 
        team_b_score: nextB, 
        status: nextStatus, 
        extra: { 
          ...extra, 
          ...enhancedData,
          // Include sport-specific data
          ...(sport === 'cricket' && { cricket: cricketData }),
          ...(sport === 'basketball' && { basketball: basketballData })
        }
      }
      
      await fetch(`/api/moderator/fixtures/${fixtureId}/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate basketball total scores from quarters
  const calculateBasketballTotal = (team: 'a' | 'b') => {
    const { quarter_1_a, quarter_1_b, quarter_2_a, quarter_2_b, 
            quarter_3_a, quarter_3_b, quarter_4_a, quarter_4_b, 
            overtime_a, overtime_b } = basketballData
    
    if (team === 'a') {
      return quarter_1_a + quarter_2_a + quarter_3_a + quarter_4_a + overtime_a
    }
    return quarter_1_b + quarter_2_b + quarter_3_b + quarter_4_b + overtime_b
  }

  return (
    <div className="space-y-4 mobile-moderator-wrapper">
      {/* Main Scoreboard */}
      <div className="mobile-moderator-score-display mobile-moderator-main-board">
        <div className="mobile-moderator-team-column">
          <div className="font-semibold text-sm md:text-base">{teamAName}</div>
          <div className="text-3xl md:text-4xl font-bold">
            {sport === 'basketball' ? calculateBasketballTotal('a') : localA}
          </div>
        </div>
        <div className="text-center">
          <div className="text-slate-500 text-xs md:text-sm">Status</div>
          <div className="text-lg md:text-xl font-medium capitalize">{localStatus}</div>
        </div>
        <div className="mobile-moderator-team-column">
          <div className="font-semibold text-sm md:text-base">{teamBName}</div>
          <div className="text-3xl md:text-4xl font-bold">
            {sport === 'basketball' ? calculateBasketballTotal('b') : localB}
          </div>
        </div>
      </div>

      {/* Enhanced Cricket Controls */}
      {sport === 'cricket' && (
        <Card className="mobile-moderator-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cricket Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="basic" className="text-xs mobile-touch-target">Basic</TabsTrigger>
                <TabsTrigger value="detailed" className="text-xs mobile-touch-target">Detailed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{teamAName}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-600">Runs</Label>
                        <Input 
                          type="number" 
                          min={0} 
                          value={cricketData.runs_a || ''}
                          className="h-8 text-sm"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            runs_a: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Overs</Label>
                        <Input 
                          type="number" 
                          step={0.1} 
                          min={0} 
                          value={cricketData.overs_a || ''}
                          className="h-8 text-sm"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            overs_a: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{teamBName}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-600">Runs</Label>
                        <Input 
                          type="number" 
                          min={0} 
                          value={cricketData.runs_b || ''}
                          className="h-8 text-sm"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            runs_b: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Overs</Label>
                        <Input 
                          type="number" 
                          step={0.1} 
                          min={0} 
                          value={cricketData.overs_b || ''}
                          className="h-8 text-sm"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            overs_b: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{teamAName} Details</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="text-xs text-slate-600">Wickets</Label>
                        <Input 
                          type="number" 
                          min={0} 
                          max={10}
                          value={cricketData.wickets_a || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            wickets_a: Math.min(10, Number(e.target.value) || 0)
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">4s</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.fours_a || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            fours_a: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">6s</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.sixes_a || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            sixes_a: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Wides</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.wides_a || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            wides_a: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{teamBName} Details</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="text-xs text-slate-600">Wickets</Label>
                        <Input 
                          type="number" 
                          min={0} 
                          max={10}
                          value={cricketData.wickets_b || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            wickets_b: Math.min(10, Number(e.target.value) || 0)
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">4s</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.fours_b || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            fours_b: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">6s</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.sixes_b || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            sixes_b: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Wides</Label>
                        <Input 
                          type="number" 
                          min={0}
                          value={cricketData.wides_b || ''}
                          className="h-8"
                          onChange={(e) => setCricketData(prev => ({ 
                            ...prev, 
                            wides_b: Number(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">{teamAName}</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_a: prev.runs_a + 1,
                              balls_faced_a: prev.balls_faced_a + 1
                            }))
                            applyUpdate(localA + 1, localB, localStatus)
                          }}
                          className="text-xs h-8"
                        >
                          +1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_a: prev.runs_a + 4,
                              fours_a: prev.fours_a + 1,
                              balls_faced_a: prev.balls_faced_a + 1
                            }))
                            applyUpdate(localA + 4, localB, localStatus)
                          }}
                          className="text-xs h-8 bg-blue-50 border-blue-200 text-blue-700"
                        >
                          4
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_a: prev.runs_a + 6,
                              sixes_a: prev.sixes_a + 1,
                              balls_faced_a: prev.balls_faced_a + 1
                            }))
                            applyUpdate(localA + 6, localB, localStatus)
                          }}
                          className="text-xs h-8 bg-purple-50 border-purple-200 text-purple-700"
                        >
                          6
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-600">{teamBName}</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_b: prev.runs_b + 1,
                              balls_faced_b: prev.balls_faced_b + 1
                            }))
                            applyUpdate(localA, localB + 1, localStatus)
                          }}
                          className="text-xs h-8"
                        >
                          +1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_b: prev.runs_b + 4,
                              fours_b: prev.fours_b + 1,
                              balls_faced_b: prev.balls_faced_b + 1
                            }))
                            applyUpdate(localA, localB + 4, localStatus)
                          }}
                          className="text-xs h-8 bg-blue-50 border-blue-200 text-blue-700"
                        >
                          4
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCricketData(prev => ({
                              ...prev,
                              runs_b: prev.runs_b + 6,
                              sixes_b: prev.sixes_b + 1,
                              balls_faced_b: prev.balls_faced_b + 1
                            }))
                            applyUpdate(localA, localB + 6, localStatus)
                          }}
                          className="text-xs h-8 bg-purple-50 border-purple-200 text-purple-700"
                        >
                          6
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Basketball Controls */}
      {sport === 'basketball' && (
        <Card className="mobile-moderator-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Basketball Quarters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mobile-moderator-sport-inputs text-xs">
                {[1, 2, 3, 4].map((quarter) => (
                  <div key={quarter} className="text-center">
                    <Label className="mobile-moderator-label">Q{quarter}</Label>
                    <div className="space-y-1">
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={teamAName.slice(0, 3)}
                        value={basketballData[`quarter_${quarter}_a` as keyof typeof basketballData] || ''}
                        className="h-8 text-center text-xs"
                        onChange={(e) => setBasketballData(prev => ({ 
                          ...prev, 
                          [`quarter_${quarter}_a`]: Number(e.target.value) || 0 
                        }))}
                      />
                      <Input 
                        type="number" 
                        min={0} 
                        placeholder={teamBName.slice(0, 3)}
                        value={basketballData[`quarter_${quarter}_b` as keyof typeof basketballData] || ''}
                        className="h-8 text-center text-xs"
                        onChange={(e) => setBasketballData(prev => ({ 
                          ...prev, 
                          [`quarter_${quarter}_b`]: Number(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Overtime */}
              <div className="border-t pt-3">
                <Label className="text-sm font-medium mb-2 block">Overtime</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="number" 
                    min={0} 
                    placeholder={`${teamAName} OT`}
                    value={basketballData.overtime_a || ''}
                    className="h-8 text-sm"
                    onChange={(e) => setBasketballData(prev => ({ 
                      ...prev, 
                      overtime_a: Number(e.target.value) || 0 
                    }))}
                  />
                  <Input 
                    type="number" 
                    min={0} 
                    placeholder={`${teamBName} OT`}
                    value={basketballData.overtime_b || ''}
                    className="h-8 text-sm"
                    onChange={(e) => setBasketballData(prev => ({ 
                      ...prev, 
                      overtime_b: Number(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
              
              {/* Quarter Summary */}
              <div className="bg-slate-50 p-3 rounded text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div><strong>{teamAName}:</strong> {calculateBasketballTotal('a')}</div>
                  <div className="text-center"><strong>Total</strong></div>
                  <div><strong>{teamBName}:</strong> {calculateBasketballTotal('b')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing sport controls (volleyball, tennis, badminton, football) */}
      {(sport === 'volleyball' || sport === 'tennis' || sport === 'badminton') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Set Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-600 mb-1">{teamAName} Sets Won</Label>
                  <Input 
                    type="number" 
                    min={0}
                    className="h-8"
                    onChange={(e) => setExtra((p: any) => ({ ...p, sets_a: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600 mb-1">{teamBName} Sets Won</Label>
                  <Input 
                    type="number" 
                    min={0}
                    className="h-8"
                    onChange={(e) => setExtra((p: any) => ({ ...p, sets_b: Number(e.target.value) }))} 
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-600 mb-1">
                  Set Scores (comma-separated pairs, e.g. 25-18,25-22,22-25)
                </Label>
                <Input 
                  placeholder="e.g. 25-18,25-22,22-25"
                  className="h-8"
                  onChange={(e) => {
                    const txt = e.target.value.trim()
                    const parts = txt.length ? txt.split(',') : []
                    const parsed = parts.map(p => p.split('-').map(n => Number(n)))
                    setExtra((prev: any) => ({ ...prev, set_scores: parsed }))
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sport === 'football' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Football Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  id="went_to_penalties" 
                  type="checkbox" 
                  onChange={(e) => setExtra((p: any) => ({ ...p, went_to_penalties: e.target.checked }))} 
                />
                <Label htmlFor="went_to_penalties" className="text-sm">Decided by penalties</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-600 mb-1">{teamAName} Penalties</Label>
                  <Input 
                    type="number" 
                    min={0}
                    className="h-8"
                    onChange={(e) => setExtra((p: any) => ({ ...p, pens_a: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600 mb-1">{teamBName} Penalties</Label>
                  <Input 
                    type="number" 
                    min={0}
                    className="h-8"
                    onChange={(e) => setExtra((p: any) => ({ ...p, pens_b: Number(e.target.value) }))} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Update Buttons - Mobile Optimized */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button 
          size="sm" 
          disabled={!hasPermission || isSaving} 
          className="min-w-[60px] h-10 text-xs"
          onClick={() => { 
            const v = (sport === 'basketball' ? calculateBasketballTotal('a') : localA) + 1
            setLocalA(v) 
            applyUpdate(v, sport === 'basketball' ? calculateBasketballTotal('b') : localB, localStatus) 
          }}
        >
          + {teamAName.length > 8 ? teamAName.slice(0, 6) + '..' : teamAName}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          disabled={!hasPermission || isSaving} 
          className="min-w-[60px] h-10 text-xs"
          onClick={() => { 
            const v = Math.max(0, (sport === 'basketball' ? calculateBasketballTotal('a') : localA) - 1)
            setLocalA(v) 
            applyUpdate(v, sport === 'basketball' ? calculateBasketballTotal('b') : localB, localStatus) 
          }}
        >
          - {teamAName.length > 8 ? teamAName.slice(0, 6) + '..' : teamAName}
        </Button>
        <Button 
          size="sm" 
          disabled={!hasPermission || isSaving} 
          className="min-w-[60px] h-10 text-xs"
          onClick={() => { 
            const v = (sport === 'basketball' ? calculateBasketballTotal('b') : localB) + 1
            setLocalB(v) 
            applyUpdate(sport === 'basketball' ? calculateBasketballTotal('a') : localA, v, localStatus) 
          }}
        >
          + {teamBName.length > 8 ? teamBName.slice(0, 6) + '..' : teamBName}
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          disabled={!hasPermission || isSaving} 
          className="min-w-[60px] h-10 text-xs"
          onClick={() => { 
            const v = Math.max(0, (sport === 'basketball' ? calculateBasketballTotal('b') : localB) - 1)
            setLocalB(v) 
            applyUpdate(sport === 'basketball' ? calculateBasketballTotal('a') : localA, v, localStatus) 
          }}
        >
          - {teamBName.length > 8 ? teamBName.slice(0, 6) + '..' : teamBName}
        </Button>
      </div>

      {/* Status Update Buttons - Mobile Optimized */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button 
          size="sm" 
          variant={localStatus === 'live' ? 'default' : 'outline'} 
          disabled={!hasPermission || isSaving}
          className="h-10 text-xs"
          onClick={() => { 
            setLocalStatus('live') 
            applyUpdate(
              sport === 'basketball' ? calculateBasketballTotal('a') : localA, 
              sport === 'basketball' ? calculateBasketballTotal('b') : localB, 
              'live'
            ) 
          }}
        >
          Live
        </Button>
        <Button 
          size="sm" 
          variant={localStatus === 'scheduled' ? 'default' : 'outline'} 
          disabled={!hasPermission || isSaving}
          className="h-10 text-xs"
          onClick={() => { 
            setLocalStatus('scheduled') 
            applyUpdate(
              sport === 'basketball' ? calculateBasketballTotal('a') : localA, 
              sport === 'basketball' ? calculateBasketballTotal('b') : localB, 
              'scheduled'
            ) 
          }}
        >
          Scheduled
        </Button>
        <Button 
          size="sm" 
          variant={localStatus === 'finished' || localStatus === 'completed' ? 'default' : 'outline'} 
          disabled={!hasPermission || isSaving}
          className="h-10 text-xs"
          onClick={() => { 
            setLocalStatus('finished') 
            applyUpdate(
              sport === 'basketball' ? calculateBasketballTotal('a') : localA, 
              sport === 'basketball' ? calculateBasketballTotal('b') : localB, 
              'finished'
            ) 
          }}
        >
          Finished
        </Button>
      </div>
    </div>
  )
}


