"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Search, Crown } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface AdminUserManagementProps {
  users: User[]
  onUpdateUserRole: (userId: string, newRole: 'admin' | 'viewer') => Promise<{ success: boolean }>
}

export function AdminUserManagement({ users, onUpdateUserRole }: AdminUserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'viewer') => {
    setIsUpdating(userId)
    try {
      const result = await onUpdateUserRole(userId, newRole)
      if (result.success) {
        notifications.showSuccess(`User role has been updated to ${newRole}.`)
      }
    } catch (error) {
      notifications.showError("Failed to update user role. Please try again.")
    } finally {
      setIsUpdating(null)
    }
  }

  const adminCount = users.filter(u => u.role === 'admin').length
  const viewerCount = users.filter(u => u.role === 'viewer').length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{adminCount}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{viewerCount}</div>
                <div className="text-sm text-gray-600">Viewers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.full_name || 'No name provided'}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? (
                      <>
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Viewer
                      </>
                    )}
                  </Badge>
                  
                  <div className="flex gap-2">
                    {user.role === 'viewer' ? (
                      <Button
                        size="sm"
                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                        disabled={isUpdating === user.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isUpdating === user.id ? 'Updating...' : 'Make Admin'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleUpdate(user.id, 'viewer')}
                        disabled={isUpdating === user.id}
                      >
                        {isUpdating === user.id ? 'Updating...' : 'Remove Admin'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}