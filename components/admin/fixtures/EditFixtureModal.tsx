"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Trophy, Users, Clock } from "lucide-react";
import { notifications } from "@/lib/notifications";

interface Fixture {
  id: string;
  scheduled_at: string;
  venue: string | null;
  status: string;
  team_a_score: number;
  team_b_score: number;
  team_a: { id: string; name: string } | null;
  team_b: { id: string; name: string } | null;
  sport: { id: string; name: string; icon: string } | null;
}

interface EditFixtureModalProps {
  fixture: Fixture | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedFixture: Fixture) => void;
}

export function EditFixtureModal({
  fixture,
  open,
  onOpenChange,
  onSave
}: EditFixtureModalProps) {
  const [sportId, setSportId] = useState("");
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [error, setError] = useState<{title: string, description: string} | null>(null);
  const [success, setSuccess] = useState<{title: string, description: string} | null>(null);

  // Filter teams based on selected sport
  const filteredTeams = useMemo(() => {
    if (!sportId) return teams;
    return teams.filter(team => team.sport_id === sportId);
  }, [sportId, teams]);

  // Reset teams when sport changes
  const handleSportChange = (value: string) => {
    setSportId(value);
    // Reset team selections when sport changes
    setTeamAId("");
    setTeamBId("");
  };

  // Log when the fixture prop changes
  useEffect(() => {
    console.log('EditFixtureModal fixture prop changed:', fixture?.id);
  }, [fixture]);

  // Reset form when fixture changes
  useEffect(() => {
    if (fixture) {
      setSportId(fixture.sport?.id || "");
      setTeamAId(fixture.team_a?.id || "");
      setTeamBId(fixture.team_b?.id || "");
      
      // Format the date properly for datetime-local input
      if (fixture.scheduled_at) {
        const date = new Date(fixture.scheduled_at);
        
        // Handle invalid dates
        if (!isNaN(date.getTime())) {
          // Format for datetime-local input (YYYY-MM-DDTHH:mm)
          const formattedDate = date.toISOString().slice(0, 16);
          setScheduledAt(formattedDate);
        } else {
          setScheduledAt("");
        }
      } else {
        setScheduledAt("");
      }
      
      setVenue(fixture.venue || "");
      setStatus(fixture.status);
      
      // Fetch sports and teams
      fetchSportsAndTeams();
    }
  }, [fixture]); // Only run when fixture changes

  // Show notifications when error or success state changes
  useEffect(() => {
    if (error) {
      notifications.showError(error);
      // Clear the error after showing it
      setError(null);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      notifications.showSuccess(success);
      // Clear the success after showing it
      setSuccess(null);
    }
  }, [success]);

  const fetchSportsAndTeams = async () => {
    try {
      // Fetch sports
      const sportsResponse = await fetch('/api/sports');
      const sportsData = await sportsResponse.json();
      setSports(sportsData.sports || []);
      
      // Fetch teams
      const teamsResponse = await fetch('/api/teams');
      const teamsData = await teamsResponse.json();
      setTeams(teamsData.teams || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError({
        title: "Load Failed ❌",
        description: "Failed to load sports and teams"
      });
    }
  };

  const handleSave = async () => {
    if (!fixture) return;
    
    // Validate required fields
    if (!sportId || !teamAId || !teamBId || !scheduledAt) {
      setError({
        title: "Validation Error ❌",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    // Validate that team A and team B are different
    if (teamAId === teamBId) {
      setError({
        title: "Validation Error ❌",
        description: "Team A and Team B must be different"
      });
      return;
    }
    
    // Validate fixture ID
    if (!fixture.id || fixture.id === "null" || fixture.id === "") {
      setError({
        title: "Validation Error ❌",
        description: "Invalid fixture ID"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Validate and format the scheduled_at date
      let formattedScheduledAt;
      if (!scheduledAt) {
        throw new Error("Date and time are required");
      }
      
      try {
        // For datetime-local inputs, we need to handle different formats
        let isoString = scheduledAt;
        
        // Handle datetime-local format (YYYY-MM-DDTHH:mm)
        if (typeof isoString === 'string' && isoString.length === 16) {
          isoString += ":00"; // Add seconds
        }
        
        // Try to parse the date
        let date: Date;
        if (typeof isoString === 'string' && isoString.includes('T')) {
          // Try parsing as ISO string
          date = new Date(isoString);
        } else {
          // Try parsing with Z suffix
          date = new Date(isoString + "Z");
        }
        
        // Additional validation to ensure the date is reasonable
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }
        
        formattedScheduledAt = date.toISOString();
      } catch (dateError) {
        throw new Error("Invalid date format. Please check the date and time.");
      }
      
      // Prepare the data to send - EXCLUDE score fields
      const requestData: any = {
        sport_id: sportId,
        team_a_id: teamAId,
        team_b_id: teamBId,
        scheduled_at: formattedScheduledAt,
        // IMPORTANT: Do not include team_a_score or team_b_score
      };
      
      // Handle venue - ensure we're not sending "null" string
      if (venue !== undefined) {
        if (venue === "null") {
          requestData.venue = null;
        } else if (venue === null || venue === "") {
          requestData.venue = null;
        } else {
          requestData.venue = venue;
        }
      }
      
      // Handle status - ensure we're not sending "null" string
      if (status !== undefined) {
        if (status === "null") {
          requestData.status = "scheduled";
        } else if (status === null || status === "") {
          requestData.status = "scheduled";
        } else {
          requestData.status = status;
        }
      }
      
      // Double-check that we're not sending any "null" strings
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === "null") {
          requestData[key] = null;
        }
      });
      
      const response = await fetch(`/api/admin/fixtures/${fixture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = 'Failed to update fixture';
        try {
          const errorResponse = await response.json();
          
          // Handle different types of error responses
          if (errorResponse && typeof errorResponse === 'object') {
            if (errorResponse.error) {
              errorDetails = errorResponse.error;
            } else if (errorResponse.message) {
              errorDetails = errorResponse.message;
            }
            
            // If we got specific details, include them
            if (errorResponse.details) {
              errorDetails += `: ${JSON.stringify(errorResponse.details)}`;
            }
          } else if (typeof errorResponse === 'string') {
            errorDetails = errorResponse;
          }
        } catch (parseError) {
          errorDetails = `HTTP ${response.status}: ${response.statusText}`;
          
          // If response is empty, provide more context
          if (response.status === 500) {
            errorDetails = 'Server error occurred while updating fixture. Please try again.';
          } else if (response.status === 404) {
            errorDetails = 'Fixture not found or already deleted.';
          }
        }
        
        throw new Error(errorDetails);
      }
      
      const updatedFixture = await response.json();
      
      setSuccess({
        title: "Fixture Updated ✅",
        description: "Fixture details have been updated successfully"
      });
      
      // Ensure we're passing the correct fixture data
      const fixtureData = updatedFixture.data || updatedFixture;
      onSave(fixtureData);
      onOpenChange(false);
    } catch (error: any) {
      setError({
        title: "Update Failed ❌",
        description: error.message || "Failed to update fixture. Please check all fields and try again."
      });
    } finally {
      setSaving(false);
    }
  };

  if (!fixture) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="text-3xl p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
              {fixture.sport?.icon || <Trophy className="w-8 h-8 text-blue-600" />}
            </div>
            Edit Fixture
          </DialogTitle>
          <DialogDescription className="text-base pt-2 text-gray-600">
            Update fixture details. Note: Scores should be updated using the "Update Score" button.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  Match Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sport" className="font-medium">Sport *</Label>
                    <Select value={sportId} onValueChange={handleSportChange}>
                      <SelectTrigger id="sport" className="mt-1">
                        <SelectValue placeholder="Select sport" />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id} className="flex items-center gap-2">
                            <span className="mr-2">{sport.icon}</span>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="team-a" className="font-medium">Team A *</Label>
                    <Select value={teamAId} onValueChange={setTeamAId} disabled={!sportId}>
                      <SelectTrigger id="team-a" className="mt-1">
                        <SelectValue placeholder={sportId ? "Select team A" : "Select a sport first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="team-b" className="font-medium">Team B *</Label>
                    <Select value={teamBId} onValueChange={setTeamBId} disabled={!sportId}>
                      <SelectTrigger id="team-b" className="mt-1">
                        <SelectValue placeholder={sportId ? "Select team B" : "Select a sport first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeams.map((team) => (
                          <SelectItem 
                            key={team.id} 
                            value={team.id}
                            disabled={team.id === teamAId}
                          >
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Schedule & Venue
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date-time" className="font-medium">Date & Time *</Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="date-time"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => {
                          setScheduledAt(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="venue" className="font-medium">Venue</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="pl-10"
                        placeholder="Enter venue"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="status" className="font-medium">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}