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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notifications } from "@/lib/notifications";
import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, Users, Clock, Star } from "lucide-react";

interface CreateFixtureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFixtureCreated: (fixture: any) => void;
  sports: any[];
  teams: any[];
}

export function CreateFixtureModal({
  open,
  onOpenChange,
  onFixtureCreated,
  sports,
  teams: allTeams, // Rename to allTeams to avoid confusion
}: CreateFixtureModalProps) {
  const [sportId, setSportId] = useState("");
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [venue, setVenue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter teams based on selected sport
  const filteredTeams = useMemo(() => {
    if (!sportId) return allTeams;
    return allTeams.filter(team => team.sport_id === sportId);
  }, [sportId, allTeams]);

  // Reset form when modal opens or sport changes
  useEffect(() => {
    if (open) {
      setSportId("");
      setTeamAId("");
      setTeamBId("");
      setScheduledAt("");
      setVenue("");
      setError(null);
    }
  }, [open]);

  // Reset teams when sport changes
  useEffect(() => {
    setTeamAId("");
    setTeamBId("");
  }, [sportId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!sportId || !teamAId || !teamBId || !scheduledAt) {
      setError("Please fill in all required fields");
      return;
    }

    if (teamAId === teamBId) {
      setError("Team A and Team B must be different");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create fixture via API
      const response = await fetch('/api/admin/fixtures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport_id: sportId,
          team_a_id: teamAId,
          team_b_id: teamBId,
          scheduled_at: scheduledAt,
          venue: venue || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create fixture");
      }

      notifications.showSuccess({
        title: "Fixture Created ✅",
        description: "Fixture has been created successfully!",
      });

      // Pass the complete fixture data to the parent component
      onFixtureCreated(result.data);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create fixture. Please try again.");
      notifications.showError({
        title: "Creation Failed ❌",
        description: err?.message || "Failed to create fixture. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedSport = sports.find((sport) => sport.id === sportId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] lg:max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-2xl p-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="border-b px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  Create New Fixture
                </DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Fill in the details below to schedule a new match.
                </DialogDescription>
              </div>
              {/* Small close button could be here if you have one; kept minimal to avoid changing functionality */}
            </div>
          </DialogHeader>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="p-8 space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Match Details */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  Match Details
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="sport" className="font-medium text-gray-900 text-base">
                    Sport *
                  </Label>
                  <Select value={sportId} onValueChange={setSportId} required>
                    <SelectTrigger id="sport" className="mt-2 h-12 text-base border-gray-300 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id} className="py-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{sport.icon}</span>
                            <span className="text-base">{sport.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team-a" className="font-medium text-gray-900 text-base">
                      Team A *
                    </Label>
                    <Select value={teamAId} onValueChange={setTeamAId} required disabled={!sportId}>
                      <SelectTrigger id="team-a" className="mt-2 h-12 text-base border-gray-300 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder={sportId ? "Select team A" : "Select a sport first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id} className="py-2">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-gray-500" />
                              <span className="text-base">{team.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="team-b" className="font-medium text-gray-900 text-base">
                      Team B *
                    </Label>
                    <Select value={teamBId} onValueChange={setTeamBId} required disabled={!sportId}>
                      <SelectTrigger id="team-b" className="mt-2 h-12 text-base border-gray-300 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder={sportId ? "Select team B" : "Select a sport first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeams.map((team) => (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            disabled={team.id === teamAId}
                            className="py-2"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-gray-500" />
                              <span className="text-base">{team.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule & Venue */}
            <section className="space-y-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule & Venue
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduled-at" className="font-medium text-gray-900 text-base">
                    Date & Time *
                  </Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="scheduled-at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="pl-10 h-12 text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="venue" className="font-medium text-gray-900 text-base">
                    Venue
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="venue"
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Enter venue name"
                      className="pl-10 h-12 text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Preview */}
            <section className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  Fixture Preview
                </h3>
                {/* optional small hint */}
                <p className="text-sm text-gray-500">Live preview of entered details</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm">Sport</span>
                  <span className="font-medium text-base">{selectedSport?.name || "Not selected"}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm">Match</span>
                  <span className="font-medium text-base">
                    {teamAId ? filteredTeams.find((t) => t.id === teamAId)?.name || "Team A" : "Team A"}
                    {" vs "}
                    {teamBId ? filteredTeams.find((t) => t.id === teamBId)?.name || "Team B" : "Team B"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-600 text-sm">Date</span>
                  <span className="font-medium text-base">
                    {scheduledAt ? new Date(scheduledAt).toLocaleString() : "Not scheduled"}
                  </span>
                </div>

                {venue && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm">Venue</span>
                    <span className="font-medium text-base">{venue}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
                className="px-5 py-3 rounded-lg h-12"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isCreating}
                className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white h-12"
              >
                {isCreating ? (
                  <span className="inline-flex items-center">
                    <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Creating...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <Trophy className="mr-2 h-4 w-4" />
                    Create Fixture
                  </span>
                )}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}