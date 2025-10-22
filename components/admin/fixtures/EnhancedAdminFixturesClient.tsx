"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { notifications } from "@/lib/notifications"
import { FixtureCard } from "@/components/admin/fixtures/FixtureCard"
import { ViewFixtureModal } from "@/components/admin/fixtures/ViewFixtureModal"
import { EditFixtureModal } from "@/components/admin/fixtures/EditFixtureModal"
import { CreateFixtureModal } from "@/components/admin/fixtures/CreateFixtureModal";
import { FixtureSkeleton } from "@/components/admin/fixtures/FixtureSkeleton"
import { ConfirmationModal } from "@/components/admin/fixtures/ConfirmationModal"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

interface Fixture {
  id: string
  scheduled_at: string
  venue: string | null
  status: string
  team_a_score: number
  team_b_score: number
  team_a: { id: string; name: string } | null
  team_b: { id: string; name: string } | null
  sport: { id: string; name: string; icon: string } | null
}

export default function EnhancedAdminFixturesClient({ initialFixtures }: { initialFixtures: Fixture[] }) {
  const router = useRouter()
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "live" | "completed" | "cancelled">("all")
  const [filterSport, setFilterSport] = useState<"all" | string>("all")
  const [viewingFixture, setViewingFixture] = useState<Fixture | null>(null)
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingFixture, setDeletingFixture] = useState<Fixture | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [availableSports, setAvailableSports] = useState<any[]>([])
  const [availableTeams, setAvailableTeams] = useState<any[]>([])

  // Log when fixtures state changes
  useEffect(() => {
  }, [fixtures]);

  // Fetch sports and teams for the create modal
  useEffect(() => {
    const fetchSportsAndTeams = async () => {
      try {
        const [sportsRes, teamsRes] = await Promise.all([
          fetch('/api/sports'),
          fetch('/api/teams')
        ]);
        
        const sportsData = await sportsRes.json();
        const teamsData = await teamsRes.json();
        
        setAvailableSports(sportsData.sports || []);
        setAvailableTeams(teamsData.teams || []);
      } catch (error) {
        console.error('Error fetching sports and teams:', error);
      }
    };
    
    fetchSportsAndTeams();
  }, []);

  // Get unique sports for filter
  const sports = Array.from(
    new Set(fixtures.map(f => f.sport?.name).filter(Boolean) as string[])
  )

  // Filter fixtures based on search term and filters
  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = 
      fixture.team_a?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.team_b?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.sport?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || fixture.status === filterStatus
    const matchesSport = filterSport === "all" || fixture.sport?.name === filterSport

    return matchesSearch && matchesStatus && matchesSport
  })

  // Stats
  const scheduledCount = fixtures.filter(f => f.status === 'scheduled').length
  const liveCount = fixtures.filter(f => f.status === 'live').length
  const completedCount = fixtures.filter(f => f.status === 'completed').length
  const cancelledCount = fixtures.filter(f => f.status === 'cancelled').length

  // Handle delete fixture request - shows confirmation modal
  const handleDeleteFixture = async (fixture: Fixture) => {
    setDeletingFixture(fixture);
    setShowDeleteConfirm(true);
  };

  // Confirm and execute fixture deletion
  const confirmDeleteFixture = async () => {
    if (!deletingFixture) return;

    try {
      setLoading(true);
      
      // Call the DELETE API endpoint to soft delete the fixture
      const response = await fetch(`/api/admin/fixtures/${deletingFixture.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete fixture');
      }

      // Update local state to remove the deleted fixture from the UI
      // This provides immediate feedback without requiring a page refresh
      setFixtures(prev => prev.filter(f => f.id !== deletingFixture.id));
      
      notifications.showSuccess({
        title: "Success",
        description: "Fixture deleted successfully"
      });
    } catch (error: any) {
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete fixture"
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeletingFixture(null);
    }
  }

  if (loading && fixtures.length === 0) {
    return <FixtureSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with enhanced styling */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Fixtures Management</h1>
          <p className="text-slate-600 mt-2 text-lg">Create and manage sports fixtures with advanced filtering</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center py-3 px-6 text-base font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg transition-all duration-200"
          >
            <Trophy className="mr-2 h-5 w-5" />
            Create Fixture
          </Button>
        </div>
      </motion.div>

      {/* Enhanced filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="border-0 shadow-lg rounded-xl bg-white/90">
          <div className="pt-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="search" className="text-sm font-medium mb-2 block">Search Fixtures</label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by team, sport or venue..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-base rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-medium mb-2 block">Fixture Status</label>
                <div>
                  <select
                    id="status"
                    value={filterStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="sport" className="text-sm font-medium mb-2 block">Sport</label>
                <div>
                  <select
                    id="sport"
                    value={filterSport}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterSport(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="all">All Sports</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <div className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 bg-white/90">
          <div className="pt-5 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="h-6 w-6 text-blue-600">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fixtures</p>
                <p className="text-2xl font-bold">{fixtures.length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 bg-white/90">
          <div className="pt-5 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="h-6 w-6 text-blue-600">▶️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 bg-white/90">
          <div className="pt-5 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="h-6 w-6 text-red-600">▶️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Live</p>
                <p className="text-2xl font-bold">{liveCount}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 bg-white/90">
          <div className="pt-5 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="h-6 w-6 text-green-600">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fixtures Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="border-0 shadow-lg rounded-xl bg-white/90">
          <div className="pb-6 p-6">
            <div className="flex items-center gap-3 text-2xl mb-2">
              <span className="h-6 w-6">📅</span>
              All Fixtures
            </div>
            <div className="text-base">
              Click on any fixture card to view or edit its details
            </div>
          </div>
          <div className="p-6">
            {filteredFixtures.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 text-gray-400 mx-auto mb-4">🔎</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No fixtures found</h3>
                <p className="text-gray-500 mb-6 text-lg">
                  {fixtures.length === 0 
                    ? "No fixtures have been created yet." 
                    : "No fixtures match your current filters."}
                </p>
                {fixtures.length > 0 && (
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setFilterSport("all");
                    }} 
                    className="py-2 px-6 text-base rounded-lg border border-slate-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredFixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      onViewDetails={(f) => setViewingFixture(f)}
                      onEdit={(f) => setEditingFixture(f)}
                      onDelete={handleDeleteFixture}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* View Detail Modal */}
      <ViewFixtureModal
        fixture={viewingFixture}
        open={!!viewingFixture}
        onOpenChange={(open) => !open && setViewingFixture(null)}
        onEdit={(f) => setEditingFixture(f)}
      />

      {/* Edit Modal */}
      <EditFixtureModal
        fixture={editingFixture}
        open={!!editingFixture}
        onOpenChange={(open) => !open && setEditingFixture(null)}
        onSave={(updatedFixture) => {
          // Update local state with the updated fixture
          setFixtures(prev => {
            const updatedFixtures = prev.map(f => 
              f.id === updatedFixture.id ? { ...updatedFixture } : f
            );
            // Create a new array reference to ensure React detects the change
            return [...updatedFixtures];
          });
          setEditingFixture(null);
        }}
      />

      {/* Delete Confirm Modal */}
      <ConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Fixture"
        description={`Are you sure you want to delete the fixture "${deletingFixture?.team_a?.name} vs ${deletingFixture?.team_b?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteFixture}
        type="warning"
        loading={loading}
      />
      
      {/* Create Fixture Modal */}
      <CreateFixtureModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onFixtureCreated={(newFixture) => {
          // Add the new fixture to the local state instead of refreshing the page
          if (newFixture) {
            setFixtures(prev => [newFixture, ...prev]);
          }
          setShowCreateModal(false);
        }}
        sports={availableSports}
        teams={availableTeams}
      />
    </div>
  )
}