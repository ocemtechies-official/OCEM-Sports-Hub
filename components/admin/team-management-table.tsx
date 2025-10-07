"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users } from "lucide-react"
import Link from "next/link"

interface TeamManagementTableProps {
  teams: any[]
}

export function TeamManagementTable({ teams }: TeamManagementTableProps) {
  if (teams.length === 0) {
    return <p className="text-center text-slate-500 py-8">No teams created yet</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Players</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => {
          const playerCount = team.players?.[0]?.count || 0

          return (
            <TableRow key={team.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: team.color || "#3b82f6" }}
                  >
                    {team.name.charAt(0)}
                  </div>
                  <span className="font-semibold">{team.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border" style={{ backgroundColor: team.color || "#3b82f6" }} />
                  <span className="text-sm text-slate-600">{team.color || "#3b82f6"}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span>{playerCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/teams/${team.id}`}>View</Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
