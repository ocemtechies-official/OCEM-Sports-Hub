"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  User,
  Calendar
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EditModeratorDialog } from "./edit-moderator-dialog"
import { ModeratorActivityDialog } from "./moderator-activity-dialog"

interface ModeratorManagementTableProps {
  moderators: any[]
}

export function ModeratorManagementTable({ moderators }: ModeratorManagementTableProps) {
  const [editingModerator, setEditingModerator] = useState<any>(null)
  const [viewingActivity, setViewingActivity] = useState<any>(null)
  const { toast } = useToast()

  const handleRoleChange = async (moderatorId: string, newRole: 'moderator' | 'viewer') => {
    try {
      const response = await fetch('/api/admin/moderators', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: moderatorId,
          role: newRole
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast({
        title: "Success",
        description: `Role updated to ${newRole}`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800">Moderator</Badge>
      default:
        return <Badge variant="secondary">Viewer</Badge>
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Sports</TableHead>
              <TableHead>Assigned Venues</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moderators.map((moderator) => (
              <TableRow key={moderator.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-medium">{moderator.full_name || 'No name'}</div>
                      <div className="text-sm text-slate-500">{moderator.email}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {getRoleBadge(moderator.role)}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {moderator.assigned_sports && moderator.assigned_sports.length > 0 ? (
                      moderator.assigned_sports.map((sport: string) => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        {moderator.role === 'admin' ? 'All sports' : 'None assigned'}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {moderator.assigned_venues && moderator.assigned_venues.length > 0 ? (
                      moderator.assigned_venues.map((venue: string) => (
                        <Badge key={venue} variant="outline" className="text-xs">
                          {venue}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">
                        {moderator.role === 'admin' ? 'All venues' : 'None assigned'}
                      </span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(moderator.created_at)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingActivity(moderator)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Activity
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingModerator(moderator)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assignments
                      </DropdownMenuItem>
                      {moderator.role === 'moderator' && (
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(moderator.id, 'viewer')}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Moderator
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Moderator Dialog */}
      {editingModerator && (
        <EditModeratorDialog
          moderator={editingModerator}
          open={!!editingModerator}
          onOpenChange={(open) => !open && setEditingModerator(null)}
        />
      )}

      {/* Activity Dialog */}
      {viewingActivity && (
        <ModeratorActivityDialog
          moderator={viewingActivity}
          open={!!viewingActivity}
          onOpenChange={(open) => !open && setViewingActivity(null)}
        />
      )}
    </>
  )
}
