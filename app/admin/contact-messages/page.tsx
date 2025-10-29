"use client"

import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle, Mail, User, Calendar, MessageSquare, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { notifications } from "@/lib/notifications"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      
      setMessages(data || [])
    } catch (err) {
      console.error("Error fetching contact messages:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch messages")
      notifications.showError({
        title: "Error",
        description: "Failed to load messages. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      
      setMessages(data || [])
      notifications.showSuccess({
        title: "Success",
        description: "Messages refreshed successfully"
      })
    } catch (err) {
      console.error("Error refreshing contact messages:", err)
      notifications.showError({
        title: "Error",
        description: "Failed to refresh messages. Please try again."
      })
    } finally {
      setRefreshing(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", messageId)
      
      if (error) throw error
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ))
      
      notifications.showSuccess({
        title: "Success",
        description: "Message marked as read successfully"
      })
    } catch (err) {
      console.error("Error marking message as read:", err)
      notifications.showError({
        title: "Error",
        description: "Failed to mark message as read. Please try again."
      })
    }
  }

  const handleDeleteClick = (message: any) => {
    setMessageToDelete(message)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!messageToDelete) return
    
    try {
      setDeletingId(messageToDelete.id)
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete.id)
      
      if (error) throw error
      
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete.id))
      
      notifications.showSuccess({
        title: "Success",
        description: "Message deleted successfully"
      })
    } catch (err) {
      console.error("Error deleting message:", err)
      notifications.showError({
        title: "Error",
        description: "Failed to delete message. Please try again."
      })
    } finally {
      setDeletingId(null)
      setShowDeleteConfirm(false)
      setMessageToDelete(null)
    }
  }

  // Stats calculations
  const totalMessages = messages.length
  const unreadMessages = messages.filter(m => !m.is_read).length
  const readMessages = messages.filter(m => m.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Contact Messages</h1>
            <p className="text-lg text-slate-600">
              Manage messages sent through the contact form
            </p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Messages</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {totalMessages}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unread Messages</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {unreadMessages}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Read Messages</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {readMessages}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Messages List */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">Error loading messages: {error}</p>
                <Button 
                  onClick={fetchMessages} 
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No messages yet</h3>
                <p className="text-slate-500">Messages sent through the contact form will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`border rounded-lg p-6 transition-all duration-300 ${
                      message.is_read 
                        ? "border-slate-200 bg-white" 
                        : "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-full">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{message.name}</h3>
                          <Link 
                            href={`mailto:${message.email}`} 
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {message.email}
                          </Link>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={message.is_read ? "secondary" : "default"}
                          className={message.is_read ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                        >
                          {message.is_read ? "Read" : "Unread"}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(message.created_at), "MMM d, yyyy h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{message.subject}</h4>
                      <p className="text-slate-700 whitespace-pre-wrap">{message.message}</p>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      {!message.is_read && (
                        <Button 
                          onClick={() => markAsRead(message.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleDeleteClick(message)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message from {messageToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletingId === messageToDelete?.id}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletingId === messageToDelete?.id}
              className="flex-1"
            >
              {deletingId === messageToDelete?.id ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}