"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SportFilterProps {
  sports: Array<{ id: string; name: string; icon: string | null }>
}

export function SportFilter({ sports }: SportFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedSport = searchParams.get("sport")

  const handleFilter = (sportId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sportId) {
      params.set("sport", sportId)
    } else {
      params.delete("sport")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!selectedSport ? "default" : "outline"}
        size="sm"
        onClick={() => handleFilter(null)}
        className={cn(!selectedSport && "bg-blue-600 hover:bg-blue-700")}
      >
        All Sports
      </Button>
      {sports.map((sport) => (
        <Button
          key={sport.id}
          variant={selectedSport === sport.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(sport.id)}
          className={cn(selectedSport === sport.id && "bg-blue-600 hover:bg-blue-700")}
        >
          {sport.icon} {sport.name}
        </Button>
      ))}
    </div>
  )
}
