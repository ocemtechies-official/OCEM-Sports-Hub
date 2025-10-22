"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Edit, Calendar } from "lucide-react"

interface FixtureManagementTableProps {
  fixtures: any[]
}

export function FixtureManagementTable({ fixtures }: FixtureManagementTableProps) {
  if (fixtures.length === 0) {
    return <p className="text-center text-slate-500 py-8">No fixtures created yet</p>
  }

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    live: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-slate-100 text-slate-800",
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sport</TableHead>
          <TableHead>Match</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fixtures.map((fixture) => (
          <TableRow key={fixture.id}>
            <TableCell>
              <Badge variant="secondary">
                {fixture.sport?.icon} {fixture.sport?.name}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {fixture.team_a?.name} vs {fixture.team_b?.name}
              </div>
              {fixture.venue && <div className="text-sm text-slate-600">{fixture.venue}</div>}
            </TableCell>
            <TableCell>{format(new Date(fixture.scheduled_at), "PPp")}</TableCell>
            <TableCell>
              <Badge className={statusColors[fixture.status as keyof typeof statusColors]}>{fixture.status}</Badge>
            </TableCell>
            <TableCell>
              {fixture.status !== "scheduled" && (
                <span className="font-semibold">
                  {fixture.team_a_score} - {fixture.team_b_score}
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {/* Disable reschedule for now to avoid type conflicts */}
                <Button variant="outline" size="sm" disabled>
                  <Calendar className="mr-2 h-4 w-4" />
                  Reschedule
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}