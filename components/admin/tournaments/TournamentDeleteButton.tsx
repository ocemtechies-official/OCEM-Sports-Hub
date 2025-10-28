"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { ConfirmationModal } from "@/components/admin/ConfirmationModal"

interface TournamentDeleteButtonProps {
  tournamentId: string
  tournamentName: string
}

export function TournamentDeleteButton({ tournamentId, tournamentName }: TournamentDeleteButtonProps) {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete tournament')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Tournament deleted successfully"
      })

      // Refresh the page to reflect the deletion
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting tournament:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete tournament"
      })
    } finally {
      setLoading(false)
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tournament"
        description={`Are you sure you want to delete the tournament "${tournamentName}"? This action cannot be undone.`}
        confirmText="Delete Tournament"
        cancelText="Cancel"
        isLoading={loading}
      />
    </>
  )
}