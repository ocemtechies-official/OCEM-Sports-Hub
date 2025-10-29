"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shuffle, 
  Play, 
  CalendarPlus, 
  Trophy, 
  AlertCircle, 
  CheckCircle2,
  RotateCcw,
  Eye,
  ExternalLink,
  Save
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Team {
  id: string
  name: string
}

interface LocalFixture {
  id: string
  teamA: Team | null
  teamB: Team | null
  scheduledAt: Date | null
  venue: string
  bracketPosition: number
}

interface LocalRound {
  id: string
  roundNumber: number
  roundName: string
  fixtures: LocalFixture[]
}

interface BracketManagementProps {
  tournament: {
    id: string
    name: string
    status: string
    tournament_type: string
    start_date: string | null
    tournament_teams: Array<{
      id: string
      team_id: string
      seed: number | null
      bracket_position: number | null
      team: {
        id: string
        name: string
      }
    }>
    tournament_rounds: Array<{
      id: string
      round_name: string
      round_number: number
      total_matches: number
      completed_matches: number
      status: 'pending' | 'active' | 'completed'
      fixtures: Array<{
        id: string
        team_a_id: string | null
        team_b_id: string | null
        team_a: { id: string; name: string } | null
        team_b: { id: string; name: string } | null
        scheduled_at: string | null
        venue: string | null
        status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled'
      }>
    }>
  }
}

// Storage key for local bracket data
const getStorageKey = (tournamentId: string) => `tournament_bracket_${tournamentId}`;
const getResetFlagKey = (tournamentId: string) => `tournament_bracket_reset_${tournamentId}`;

export function BracketManagement({ tournament }: BracketManagementProps) {
  const [loading, setLoading] = useState(false)
  const [bracketGenerated, setBracketGenerated] = useState(false)
  const [fixturesCreated, setFixturesCreated] = useState(false)
  const [localRounds, setLocalRounds] = useState<LocalRound[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [tempSaved, setTempSaved] = useState(false)

  // Log the tournament data for debugging
  useEffect(() => {
    console.log('BracketManagement component mounted with tournament:', tournament);
  }, [tournament]);

  // Load bracket data from localStorage on component mount
  useEffect(() => {
    const loadLocalBracketData = () => {
      try {
        const storageKey = getStorageKey(tournament.id);
        const resetFlagKey = getResetFlagKey(tournament.id);
        
        // Check if we have a reset flag
        const wasReset = localStorage.getItem(resetFlagKey);
        
        if (wasReset) {
          // If tournament was reset, show initial state regardless of localStorage
          setLocalRounds([]);
          setBracketGenerated(false);
          setFixturesCreated(false);
          setTempSaved(false);
          
          // Don't clear the reset flag here - it should persist until generate is called
          return;
        }
        
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Convert date strings back to Date objects
          const roundsWithDates = parsedData.localRounds.map((round: any) => ({
            ...round,
            fixtures: round.fixtures.map((fixture: any) => ({
              ...fixture,
              scheduledAt: fixture.scheduledAt ? new Date(fixture.scheduledAt) : null
            }))
          }));
          
          setLocalRounds(roundsWithDates);
          setBracketGenerated(parsedData.bracketGenerated);
          setFixturesCreated(parsedData.fixturesCreated || false);
          setTempSaved(parsedData.tempSaved || false);
        } else if (tournament.tournament_rounds?.length > 0) {
          // If no local data, check if tournament has existing rounds AND fixtures
          // Only use database data if fixtures actually exist with team data
          let hasActualFixtures = false;
          for (const round of tournament.tournament_rounds) {
            if (round.fixtures && round.fixtures.length > 0) {
              // Check if any fixture has actual team data
              for (const fixture of round.fixtures) {
                if (fixture.team_a_id || fixture.team_b_id) {
                  hasActualFixtures = true;
                  break;
                }
              }
              if (hasActualFixtures) break;
            }
          }
          
          if (hasActualFixtures) {
            // Database has actual fixture data, use it
            const convertedRounds: LocalRound[] = tournament.tournament_rounds.map(round => ({
              id: round.id,
              roundNumber: round.round_number,
              roundName: round.round_name,
              fixtures: round.fixtures?.map(fixture => ({
                id: fixture.id,
                teamA: fixture.team_a ? { id: fixture.team_a.id, name: fixture.team_a.name } : 
                       (fixture.team_a_id === null && (round.round_number > 1) ? 
                         { id: `placeholder-a-${round.id}-${fixture.id}`, name: "Team A (Winner of previous match)" } : null),
                teamB: fixture.team_b ? { id: fixture.team_b.id, name: fixture.team_b.name } : 
                       (fixture.team_b_id === null && (round.round_number > 1) ? 
                         { id: `placeholder-b-${round.id}-${fixture.id}`, name: "Team B (Winner of previous match)" } : null),
                scheduledAt: fixture.scheduled_at ? new Date(fixture.scheduled_at) : null,
                venue: fixture.venue || "",
                bracketPosition: 0
              })) || []
            }));
            
            setLocalRounds(convertedRounds);
            setBracketGenerated(true);
            setFixturesCreated(true); // Set fixturesCreated to true since we have actual fixtures
          } else {
            // No actual fixtures exist, show initial state
            setLocalRounds([]);
            setBracketGenerated(false);
            setFixturesCreated(false);
          }
        } else {
          // No rounds or fixtures, show initial state
          setLocalRounds([]);
          setBracketGenerated(false);
          setFixturesCreated(false);
        }
      } catch (error) {
        console.error('Error loading local bracket data:', error);
        // Fallback to tournament data only if fixtures actually exist
        if (tournament.tournament_rounds?.length > 0) {
          let hasActualFixtures = false;
          for (const round of tournament.tournament_rounds) {
            if (round.fixtures && round.fixtures.length > 0) {
              // Check if any fixture has actual team data
              for (const fixture of round.fixtures) {
                if (fixture.team_a_id || fixture.team_b_id) {
                  hasActualFixtures = true;
                  break;
                }
              }
              if (hasActualFixtures) break;
            }
          }
          
          if (hasActualFixtures) {
            const convertedRounds: LocalRound[] = tournament.tournament_rounds.map(round => ({
              id: round.id,
              roundNumber: round.round_number,
              roundName: round.round_name,
              fixtures: round.fixtures?.map(fixture => ({
                id: fixture.id,
                teamA: fixture.team_a ? { id: fixture.team_a.id, name: fixture.team_a.name } : 
                       (fixture.team_a_id === null && (round.round_number > 1) ? 
                         { id: `placeholder-a-${round.id}-${fixture.id}`, name: "Team A (Winner of previous match)" } : null),
                teamB: fixture.team_b ? { id: fixture.team_b.id, name: fixture.team_b.name } : 
                       (fixture.team_b_id === null && (round.round_number > 1) ? 
                         { id: `placeholder-b-${round.id}-${fixture.id}`, name: "Team B (Winner of previous match)" } : null),
                scheduledAt: fixture.scheduled_at ? new Date(fixture.scheduled_at) : null,
                venue: fixture.venue || "",
                bracketPosition: 0
              })) || []
            }));
            
            setLocalRounds(convertedRounds);
            setBracketGenerated(true);
            setFixturesCreated(true); // Set fixturesCreated to true since we have actual fixtures
          } else {
            // No actual fixtures exist, show initial state
            setLocalRounds([]);
            setBracketGenerated(false);
            setFixturesCreated(false);
          }
        } else {
          // No rounds or fixtures, show initial state
          setLocalRounds([]);
          setBracketGenerated(false);
          setFixturesCreated(false);
        }
      }
    };

    loadLocalBracketData();
    
    // Listen for bracket updates and refresh from API
    const handleBracketUpdate = async (event: any) => {
      if (event.detail && event.detail.tournamentId === tournament.id) {
        // Refresh data from API when brackets are updated
        try {
          const response = await fetch(`/api/admin/tournaments/${tournament.id}`);
          if (response.ok) {
            const result = await response.json();
            const updatedTournament = result.data;
            
            // Check if tournament has actual fixtures with team data
            let hasActualFixtures = false;
            if (updatedTournament && updatedTournament.tournament_rounds) {
              for (const round of updatedTournament.tournament_rounds) {
                if (round.fixtures && round.fixtures.length > 0) {
                  // Check if any fixture has actual team data
                  for (const fixture of round.fixtures) {
                    if (fixture.team_a_id || fixture.team_b_id) {
                      hasActualFixtures = true;
                      break;
                    }
                  }
                  if (hasActualFixtures) break;
                }
              }
            }
            
            // Check if we have a reset flag
            const resetFlagKey = getResetFlagKey(tournament.id);
            const wasReset = localStorage.getItem(resetFlagKey);
            
            if (wasReset) {
              // If tournament was reset, show initial state regardless of API data
              setLocalRounds([]);
              setBracketGenerated(false);
              setFixturesCreated(false);
              setTempSaved(false);
            } else if (hasActualFixtures) {
              // Database has actual fixture data, use it
              const convertedRounds: LocalRound[] = updatedTournament.tournament_rounds.map((round: any) => ({
                id: round.id,
                roundNumber: round.round_number,
                roundName: round.round_name,
                fixtures: round.fixtures?.map((fixture: any) => ({
                  id: fixture.id,
                  teamA: fixture.team_a ? { id: fixture.team_a.id, name: fixture.team_a.name } : 
                         (fixture.team_a_id === null && (round.round_number > 1) ? 
                           { id: `placeholder-a-${round.id}-${fixture.id}`, name: "Team A (Winner of previous match)" } : null),
                  teamB: fixture.team_b ? { id: fixture.team_b.id, name: fixture.team_b.name } : 
                         (fixture.team_b_id === null && (round.round_number > 1) ? 
                           { id: `placeholder-b-${round.id}-${fixture.id}`, name: "Team B (Winner of previous match)" } : null),
                  scheduledAt: fixture.scheduled_at ? new Date(fixture.scheduled_at) : null,
                  venue: fixture.venue || "",
                  bracketPosition: 0
                })) || []
              }));
              
              setLocalRounds(convertedRounds);
              setBracketGenerated(true);
              setFixturesCreated(true);
            } else {
              // No actual fixtures exist, show initial state
              // But only if localStorage is also empty (user hasn't saved temporarily)
              const storageKey = getStorageKey(tournament.id);
              const savedData = localStorage.getItem(storageKey);
              if (!savedData) {
                setLocalRounds([]);
                setBracketGenerated(false);
                setFixturesCreated(false);
              }
            }
          }
        } catch (error) {
          console.error('Error refreshing bracket data from API:', error);
          // Fallback to localStorage/props
          loadLocalBracketData();
        }
      }
    };
    
    window.addEventListener('tournamentBracketUpdated', handleBracketUpdate as EventListener);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('tournamentBracketUpdated', handleBracketUpdate as EventListener);
    };
  }, [tournament.id, tournament.tournament_rounds]);

  // Save bracket data to localStorage whenever it changes
  useEffect(() => {
    if (bracketGenerated && localRounds.length > 0) {
      try {
        const storageKey = getStorageKey(tournament.id);
        const dataToSave = {
          bracketGenerated,
          fixturesCreated,
          localRounds: localRounds.map(round => ({
            ...round,
            fixtures: round.fixtures.map(fixture => {
              // Ensure we're properly handling the Date object
              let scheduledAtValue = null;
              if (fixture.scheduledAt instanceof Date) {
                scheduledAtValue = fixture.scheduledAt.toISOString();
              } else if (typeof fixture.scheduledAt === 'string') {
                scheduledAtValue = fixture.scheduledAt;
              }
              
              return {
                ...fixture,
                scheduledAt: scheduledAtValue
              };
            })
          })),
          tempSaved,
          lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving bracket data to localStorage:', error);
      }
    }
  }, [bracketGenerated, fixturesCreated, localRounds, tempSaved, tournament.id]);

  const handleGenerateBracket = async () => {
    setLoading(true)
    try {
      console.log('Generating bracket for tournament:', tournament.id);
      
      // Call the bracket generation API
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/generate-bracket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      console.log('Generate bracket response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Generate bracket error response:', errorData);
        throw new Error(errorData.error || 'Failed to generate bracket')
      }

      const result = await response.json()
      console.log('Generate bracket success response:', result);
      
      // Set the local rounds with the generated bracket structure
      setLocalRounds(result.localRounds)
      setBracketGenerated(true)
      setTempSaved(false) // Reset temp saved flag when generating new bracket
      
      // Clear the reset flag since we're generating new brackets
      const resetFlagKey = getResetFlagKey(tournament.id);
      localStorage.removeItem(resetFlagKey);
      
      notifications.showSuccess({
        title: "Success",
        description: "Bracket generated successfully. You can now modify the matches before saving."
      })
    } catch (error: any) {
      console.error('Error generating bracket:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to generate bracket"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBrackets = async () => {
    setLoading(true)
    try {
      // Prepare the data by converting Date objects to ISO strings
      const roundsForApi = localRounds.map(round => ({
        ...round,
        fixtures: round.fixtures.map(fixture => {
          // Ensure we're properly handling the Date object for API
          let scheduledAtValue = null;
          if (fixture.scheduledAt instanceof Date) {
            scheduledAtValue = fixture.scheduledAt.toISOString();
          } else if (typeof fixture.scheduledAt === 'string') {
            scheduledAtValue = fixture.scheduledAt;
          }
          
          return {
            ...fixture,
            scheduledAt: scheduledAtValue
          };
        })
      }));

      // Log the data being sent for debugging
      console.log('Sending bracket data to API:', { rounds: roundsForApi, tournamentId: tournament.id });

      // Save the local bracket structure to the database
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/save-brackets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: roundsForApi }),
      })

      console.log('Save brackets response status:', response.status);
      console.log('Save brackets response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Save brackets error response:', errorData);
        throw new Error(errorData.error || 'Failed to save brackets')
      }

      const result = await response.json()
      console.log('Save brackets success response:', result);
      
      // Log the exact values we're checking
      console.log('Checking result values:', { 
        createdFixtures: result.createdFixtures, 
        updatedFixtures: result.updatedFixtures,
        createdType: typeof result.createdFixtures,
        updatedType: typeof result.updatedFixtures,
        createdGreaterThanZero: result.createdFixtures > 0,
        updatedGreaterThanZero: result.updatedFixtures > 0
      });
      
      // Only set fixturesCreated to true if fixtures were actually created or updated
      if (result.createdFixtures > 0 || result.updatedFixtures > 0) {
        console.log('Setting fixturesCreated to true');
        setFixturesCreated(true);
      } else {
        console.log('Not setting fixturesCreated to true because no fixtures were created or updated');
      }
      
      // Clear localStorage after successful save
      const storageKey = getStorageKey(tournament.id);
      const resetFlagKey = getResetFlagKey(tournament.id);
      localStorage.removeItem(storageKey);
      
      // Clear the reset flag since we've successfully saved brackets
      localStorage.removeItem(resetFlagKey);
      
      setTempSaved(false); // Reset temp saved flag after saving to database
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('tournamentBracketUpdated', { detail: { tournamentId: tournament.id } }));
      
      notifications.showSuccess({
        title: "Success",
        description: "Brackets saved successfully to database."
      })
    } catch (error: any) {
      console.error('Error saving brackets:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to save brackets"
      })
    } finally {
      setLoading(false)
    }
  }

  // New function to save bracket data temporarily
  const handleSaveTemporarily = () => {
    try {
      const storageKey = getStorageKey(tournament.id);
      const resetFlagKey = getResetFlagKey(tournament.id);
      
      // Check if we have a reset flag - if so, don't allow temporary save
      const wasReset = localStorage.getItem(resetFlagKey);
      if (wasReset) {
        notifications.showError({
          title: "Error",
          description: "Cannot save temporarily after reset. Please generate new brackets first."
        });
        return;
      }
      
      const dataToSave = {
        bracketGenerated,
        fixturesCreated,
        localRounds: localRounds.map(round => ({
          ...round,
          fixtures: round.fixtures.map(fixture => {
            // Ensure we're properly handling the Date object
            let scheduledAtValue = null;
            if (fixture.scheduledAt instanceof Date) {
              scheduledAtValue = fixture.scheduledAt.toISOString();
            } else if (typeof fixture.scheduledAt === 'string') {
              scheduledAtValue = fixture.scheduledAt;
            }
            
            return {
              ...fixture,
              scheduledAt: scheduledAtValue
            };
          })
        })),
        tempSaved: true,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setTempSaved(true);
      
      notifications.showSuccess({
        title: "Saved",
        description: "Bracket data saved temporarily. It will be available when you return."
      })
    } catch (error) {
      console.error('Error saving bracket data temporarily:', error);
      notifications.showError({
        title: "Error",
        description: "Failed to save bracket data temporarily"
      })
    }
  }

  const handleCreateFixtures = async () => {
    setLoading(true)
    try {
      console.log('Creating fixtures for tournament:', tournament.id);
      
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/fixtures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      console.log('Create fixtures response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Create fixtures error response:', errorData);
        throw new Error(errorData.error || 'Failed to create fixtures')
      }

      const result = await response.json()
      console.log('Create fixtures success response:', result);
      
      setFixturesCreated(true)
      
      // Clear the reset flag since we've successfully created fixtures
      const resetFlagKey = getResetFlagKey(tournament.id);
      localStorage.removeItem(resetFlagKey);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('tournamentBracketUpdated', { detail: { tournamentId: tournament.id } }));
      
      notifications.showSuccess({
        title: "Success",
        description: `Successfully created ${result.createdFixtures} fixtures`
      })
    } catch (error: any) {
      console.error('Error creating fixtures:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to create fixtures"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetBracket = async () => {
    setLoading(true)
    try {
      console.log('Resetting bracket for tournament:', tournament.id);
      
      const response = await fetch(`/api/admin/tournaments/${tournament.id}/reset-bracket`, {
        method: 'POST',
      })

      console.log('Reset bracket response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reset bracket error response:', errorData);
        throw new Error(errorData.error || 'Failed to reset bracket')
      }

      // Clear component state
      setBracketGenerated(false)
      setLocalRounds([])
      setFixturesCreated(false)
      setShowResetDialog(false)
      setTempSaved(false)
      
      // Clear localStorage
      const storageKey = getStorageKey(tournament.id);
      const resetFlagKey = getResetFlagKey(tournament.id);
      localStorage.removeItem(storageKey);
      
      // Set reset flag to indicate tournament was reset
      localStorage.setItem(resetFlagKey, 'true');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('tournamentBracketUpdated', { detail: { tournamentId: tournament.id } }));
      
      notifications.showSuccess({
        title: "Success",
        description: "Bracket reset successfully"
      })
    } catch (error: any) {
      console.error('Error resetting bracket:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to reset bracket"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLocalFixture = (roundId: string, fixtureId: string, field: keyof LocalFixture, value: any) => {
    setLocalRounds(prev => 
      prev.map(round => {
        if (round.id === roundId) {
          return {
            ...round,
            fixtures: round.fixtures.map(fixture => {
              if (fixture.id === fixtureId) {
                return { ...fixture, [field]: value }
              }
              return fixture
            })
          }
        }
        return round
      })
    )
  }

  const getAvailableTeams = (excludeTeamId?: string | null) => {
    if (!tournament.tournament_teams) return [];
    
    const teams = tournament.tournament_teams
      .filter(tt => tt.team_id !== excludeTeamId)
      .map(tt => ({ 
        id: tt.team_id, 
        name: (tt.team && tt.team.name) ? tt.team.name : "Unknown Team" 
      }));
      
    // Add placeholder teams for later rounds
    teams.push(
      { id: "placeholder-a", name: "Team A (Winner of previous match)" },
      { id: "placeholder-b", name: "Team B (Winner of previous match)" }
    );
    
    return teams;
  }

  // Function to automatically progress winners to the next round
  const handleAutoProgress = async (completedRoundId: string) => {
  }

  // Check if a round is completed (all matches completed)
  const isRoundCompleted = (round: any) => {
    return round.fixtures.every((fixture: any) => fixture.status === 'completed');
  }

  // Check if a round is ready for activation (all fixtures have teams assigned)
  const isRoundReadyForActivation = (round: any) => {
    return round.fixtures.every((fixture: any) => 
      fixture.team_a_id !== null && fixture.team_b_id !== null
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-blue-500" />
            Bracket Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${bracketGenerated ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {bracketGenerated ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-slate-500" />
                )}
                <span className="font-medium">Bracket Generated</span>
              </div>
              <p className="text-sm text-slate-600">
                {bracketGenerated ? 'Bracket structure created' : 'Bracket not yet generated'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${fixturesCreated ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {fixturesCreated ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-slate-500" />
                )}
                <span className="font-medium">Fixtures Created</span>
              </div>
              <p className="text-sm text-slate-600">
                {fixturesCreated ? 'Matches scheduled' : 'Fixtures not yet created'}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Teams Registered</span>
              </div>
              <p className="text-sm text-slate-600">
                {tournament.tournament_teams?.length || 0} teams
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {!bracketGenerated ? (
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Bracket Not Generated
                </AlertTitle>
                <AlertDescription>
                  Generate the tournament bracket to create the match structure. This will automatically pair teams based on seeding.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Bracket Generated
                </AlertTitle>
                <AlertDescription>
                  The tournament bracket has been generated. You can now modify the matches before saving.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3">
              {!bracketGenerated ? (
                <Button 
                  onClick={handleGenerateBracket} 
                  disabled={loading || tournament.status !== 'draft'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2 h-4 w-4" />
                      Generate Bracket
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSaveBrackets} 
                    disabled={loading || localRounds.length === 0 || fixturesCreated}
                    className={`bg-gradient-to-r ${fixturesCreated ? 'from-green-500 to-green-600' : 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}`}
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Saving...
                      </>
                    ) : fixturesCreated ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Brackets Saved
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Save Brackets
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSaveTemporarily}
                    disabled={loading || localRounds.length === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Temporarily
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={localRounds.length === 0}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  
                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset Bracket
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Tournament Bracket</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reset the bracket? This will clear all bracket data and fixtures.
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2 sm:space-x-0">
                        <Button
                          variant="outline"
                          onClick={() => setShowResetDialog(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleResetBracket}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Resetting...
                            </>
                          ) : (
                            "Reset Bracket"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>

            {tournament.status !== 'draft' && (
              <Alert variant="destructive">
                <AlertTitle>Cannot Modify Tournament</AlertTitle>
                <AlertDescription>
                  This tournament is not in draft status. Only draft tournaments can have their brackets modified.
                </AlertDescription>
              </Alert>
            )}
            
            {tempSaved && (
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle className="flex items-center gap-2 text-green-800">
                  <Save className="h-4 w-4 text-green-600" />
                  Temporarily Saved
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Your bracket data has been temporarily saved and will be available when you return to this page.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Bracket Preview */}
          {showPreview && bracketGenerated && localRounds.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-4">Bracket Preview</h3>
              
              <div className="space-y-6">
                {[...localRounds].sort((a, b) => a.roundNumber - b.roundNumber).map(round => (
                  <div key={round.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 font-medium flex justify-between items-center">
                      <span>{round.roundName}</span>
                      <Badge variant="secondary">{round.fixtures?.length || 0} matches</Badge>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {round.fixtures.map(fixture => (
                        <div key={fixture.id} className="border rounded-md p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                              <Label className="text-xs text-slate-500 mb-1 block">Team A</Label>
                              <Select
                                value={fixture.teamA?.id || ""}
                                onValueChange={(value) => {
                                  // Handle placeholder teams
                                  let team = null;
                                  if (value === "placeholder-a") {
                                    team = { id: `placeholder-a-${round.id}-${fixture.id}`, name: "Team A (Winner of previous match)" };
                                  } else if (value === "placeholder-b") {
                                    team = { id: `placeholder-b-${round.id}-${fixture.id}`, name: "Team B (Winner of previous match)" };
                                  } else {
                                    team = getAvailableTeams(fixture.teamB?.id).find(t => t.id === value && !t.id.startsWith('placeholder-'));
                                  }
                                  updateLocalFixture(round.id, fixture.id, 'teamA', team || null);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Team A" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableTeams(fixture.teamB?.id).map(team => (
                                    <SelectItem key={team.id} value={team.id}>
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="text-center hidden md:block">
                              <span className="text-slate-500">VS</span>
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label className="text-xs text-slate-500 mb-1 block">Team B</Label>
                              <Select
                                value={fixture.teamB?.id || ""}
                                onValueChange={(value) => {
                                  // Handle placeholder teams
                                  let team = null;
                                  if (value === "placeholder-a") {
                                    team = { id: `placeholder-a-${round.id}-${fixture.id}`, name: "Team A (Winner of previous match)" };
                                  } else if (value === "placeholder-b") {
                                    team = { id: `placeholder-b-${round.id}-${fixture.id}`, name: "Team B (Winner of previous match)" };
                                  } else {
                                    team = getAvailableTeams(fixture.teamA?.id).find(t => t.id === value && !t.id.startsWith('placeholder-'));
                                  }
                                  updateLocalFixture(round.id, fixture.id, 'teamB', team || null);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Team B" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableTeams(fixture.teamA?.id).map(team => (
                                    <SelectItem key={team.id} value={team.id}>
                                      {team.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-xs text-slate-500 mb-1 block">Venue</Label>
                              <Input
                                value={fixture.venue}
                                onChange={(e) => updateLocalFixture(round.id, fixture.id, 'venue', e.target.value)}
                                placeholder="Venue"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-slate-500 mb-1 block">Date & Time</Label>
                              <Input
                                type="datetime-local"
                                value={fixture.scheduledAt ? new Date(fixture.scheduledAt).toISOString().slice(0, 16) : ''}
                                onChange={(e) => updateLocalFixture(round.id, fixture.id, 'scheduledAt', new Date(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleSaveBrackets} 
                  disabled={loading || localRounds.length === 0 || fixturesCreated}
                  className={fixturesCreated ? "bg-green-500" : ""}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Saving...
                    </>
                  ) : fixturesCreated ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Brackets Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Display bracket information if generated */}
          {bracketGenerated && !showPreview && localRounds.length > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-2">Bracket Details</h3>
              <p className="text-sm text-slate-600 mb-3">
                {localRounds.length} rounds generated with a total of{' '}
                {localRounds.reduce((total, round) => total + (round.fixtures?.length || 0), 0)} matches.
              </p>
              <div className="space-y-3">
                {[...localRounds].sort((a, b) => a.roundNumber - b.roundNumber).map((round) => {
                  // Find the corresponding round in the tournament data
                  const tournamentRound = tournament.tournament_rounds?.find(tr => tr.id === round.id);
                  const isCompleted = tournamentRound ? isRoundCompleted(tournamentRound) : false;
                  const isReadyForActivation = tournamentRound ? isRoundReadyForActivation(tournamentRound) : false;
                  
                  return (
                    <div key={round.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{round.roundName}</span>
                        <Badge variant="secondary">{round.fixtures?.length || 0} matches</Badge>
                        {isCompleted && (
                          <Badge variant="default" className="bg-green-500">
                            Completed
                          </Badge>
                        )}
                        {tournamentRound?.status === 'active' && (
                          <Badge variant="default" className="bg-blue-500">
                            Active
                          </Badge>
                        )}
                        {tournamentRound?.status === 'pending' && isReadyForActivation && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                            Ready for Activation
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Show message if brackets are generated but no data is available */}
          {bracketGenerated && localRounds.length === 0 && (
            <Alert>
              <AlertTitle>Bracket Data Not Loaded</AlertTitle>
              <AlertDescription>
                Bracket data appears to be missing. Please reset and regenerate the bracket.
              </AlertDescription>
              <div className="mt-4">
                <Button onClick={() => setShowResetDialog(true)} variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Bracket
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Create Fixtures Section */}
      {bracketGenerated && localRounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-green-500" />
              Create Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Once you're satisfied with the bracket structure, click "Create Fixtures" to finalize the matches in the system.
              This will create actual fixture records that can be managed in the fixture management section.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Button 
                onClick={handleCreateFixtures} 
                disabled={loading || fixturesCreated}
                className={`bg-gradient-to-r ${fixturesCreated ? 'from-green-500 to-green-600' : 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}`}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Creating...
                  </>
                ) : fixturesCreated ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Fixtures Created
                  </>
                ) : (
                  <>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Create Fixtures
                  </>
                )}
              </Button>
              
              {fixturesCreated && (
                <Button variant="outline" asChild>
                  <Link href="/admin/fixtures">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage Fixtures
                  </Link>
                </Button>
              )}
            </div>
            
            {fixturesCreated && (
              <Alert>
                <AlertTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Fixtures Created Successfully
                </AlertTitle>
                <AlertDescription>
                  Your fixtures have been created and are now available in the fixture management section.
                  You can update individual fixtures there.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}