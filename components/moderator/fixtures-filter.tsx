"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, Filter } from "lucide-react"

interface FixturesFilterProps {
  currentStatus?: string
  currentSport?: string
  currentSearch?: string
  availableSports: string[]
  assignedSports: string[]
}

export function FixturesFilter({
  currentStatus,
  currentSport,
  currentSearch,
  availableSports,
  assignedSports
}: FixturesFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || "")

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`/moderator/fixtures?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("search", search.trim() || null)
  }

  const clearFilters = () => {
    setSearch("")
    router.push("/moderator/fixtures")
  }

  const hasActiveFilters = currentStatus || currentSport || currentSearch

  // Filter available sports to only show assigned ones (if not all sports)
  const filterableSports = assignedSports.length === 0 
    ? availableSports 
    : availableSports.filter(sport => assignedSports.includes(sport))

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by team name or sport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select value={currentStatus || "all"} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sport Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sport:</span>
          <Select value={currentSport || "all"} onValueChange={(value) => updateFilter("sport", value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {filterableSports.map((sport) => (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-slate-600"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {currentStatus && (
              <Badge variant="secondary" className="text-xs">
                Status: {currentStatus}
                <button
                  onClick={() => updateFilter("status", null)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentSport && (
              <Badge variant="secondary" className="text-xs">
                Sport: {currentSport}
                <button
                  onClick={() => updateFilter("sport", null)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentSearch && (
              <Badge variant="secondary" className="text-xs">
                Search: "{currentSearch}"
                <button
                  onClick={() => updateFilter("search", null)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Assignment Info */}
      {assignedSports.length > 0 && (
        <div className="text-xs text-slate-500">
          <Filter className="h-3 w-3 inline mr-1" />
          You can moderate: {assignedSports.join(", ")}
        </div>
      )}
    </div>
  )
}