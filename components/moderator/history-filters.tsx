"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface HistoryFiltersProps {
  currentDays: number
  currentType: string | null
  changeTypeCounts: Record<string, number>
}

export function HistoryFilters({ 
  currentDays, 
  currentType, 
  changeTypeCounts 
}: HistoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === null || value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    
    router.push(`/moderator/history?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {/* Time Period */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
            <div className="flex gap-1">
              {[1, 7, 30].map((period) => (
                <Button
                  key={period}
                  variant={currentDays === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (period === 7) {
                      updateFilter('days', null)
                    } else {
                      updateFilter('days', period.toString())
                    }
                  }}
                >
                  {period === 1 ? 'Today' : `${period} days`}
                </Button>
              ))}
            </div>
          </div>

          {/* Change Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Type:</span>
            <div className="flex gap-1">
              <Button
                variant={!currentType ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('type', null)}
              >
                All
              </Button>
              {Object.keys(changeTypeCounts).map((type) => (
                <Button
                  key={type}
                  variant={currentType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('type', type)}
                >
                  {type.replace('_', ' ')} ({changeTypeCounts[type]})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
