"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Download, Edit, Trash2, Copy, Eye, BarChart } from "lucide-react"
import { notifications } from "@/lib/notifications"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string | null
  difficulty: string
  time_limit: number | null
  is_active: boolean
  created_at: string
  questions?: { count: number }[]
}

interface EnhancedQuizTableProps {
  quizzes: Quiz[]
}

export function EnhancedQuizTable({ quizzes }: EnhancedQuizTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"title" | "difficulty" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null)
  const [duplicatingQuiz, setDuplicatingQuiz] = useState<string | null>(null)

  // Filter and sort quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = quizzes.filter(quiz => {
      const matchesSearch = 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDifficulty = difficultyFilter === "all" || quiz.difficulty === difficultyFilter
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && quiz.is_active) ||
        (statusFilter === "inactive" && !quiz.is_active)

      return matchesSearch && matchesDifficulty && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 }
          comparison = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
                      difficultyOrder[b.difficulty as keyof typeof difficultyOrder]
          break
        case "date":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [quizzes, searchTerm, difficultyFilter, statusFilter, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedQuizzes.length / itemsPerPage)
  const paginatedQuizzes = filteredAndSortedQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const activeCount = quizzes.filter(q => q.is_active).length
  const inactiveCount = quizzes.filter(q => !q.is_active).length
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions?.[0]?.count || 0), 0)

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedQuizzes.size === paginatedQuizzes.length) {
      setSelectedQuizzes(new Set())
    } else {
      setSelectedQuizzes(new Set(paginatedQuizzes.map(q => q.id)))
    }
  }

  const toggleSelectQuiz = (quizId: string) => {
    const newSelected = new Set(selectedQuizzes)
    if (newSelected.has(quizId)) {
      newSelected.delete(quizId)
    } else {
      newSelected.add(quizId)
    }
    setSelectedQuizzes(newSelected)
  }

  // Bulk export
  const handleBulkExport = () => {
    const selectedQuizData = quizzes.filter(q => selectedQuizzes.has(q.id))
    const csv = [
      ["Title", "Difficulty", "Questions", "Time Limit", "Status", "Created"],
      ...selectedQuizData.map(q => [
        q.title,
        q.difficulty,
        q.questions?.[0]?.count || 0,
        q.time_limit ? `${q.time_limit}s` : "No limit",
        q.is_active ? "Active" : "Inactive",
        new Date(q.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quizzes-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    notifications.showSuccess(`Exported ${selectedQuizzes.size} quizzes`)
    setSelectedQuizzes(new Set())
  }

  // Delete quiz handler
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    setDeletingQuiz(quizId)
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete quiz')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Quiz deleted successfully"
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error deleting quiz:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete quiz"
      })
    } finally {
      setDeletingQuiz(null)
    }
  }

  // Duplicate quiz handler
  const handleDuplicateQuiz = async (quizId: string) => {
    if (!confirm('Create a copy of this quiz?')) {
      return
    }

    setDuplicatingQuiz(quizId)
    try {
      // First get the quiz data
      const quizResponse = await fetch(`/api/admin/quizzes/${quizId}`)
      if (!quizResponse.ok) {
        throw new Error('Failed to fetch quiz data')
      }
      
      const { data: quizData } = await quizResponse.json()

      // Create the duplicate
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${quizData.title} (Copy)`,
          description: quizData.description,
          difficulty: quizData.difficulty,
          time_limit: quizData.time_limit,
          is_active: false, // Start as inactive
          questions: quizData.questions?.map((q: any) => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation
          })) || []
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to duplicate quiz')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Quiz duplicated successfully"
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      console.error('Error duplicating quiz:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to duplicate quiz"
      })
    } finally {
      setDuplicatingQuiz(null)
    }
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    hard: "bg-red-100 text-red-800 border-red-200",
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{quizzes.length}</p>
          <p className="text-sm text-slate-600 mt-1">Total Quizzes</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-sm text-slate-600 mt-1">Active</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
          <p className="text-sm text-slate-600 mt-1">Total Questions</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          {selectedQuizzes.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected ({selectedQuizzes.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedQuizzes(new Set())}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        
        <Select value={difficultyFilter} onValueChange={(value) => {
          setDifficultyFilter(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Created</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="difficulty">Difficulty</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedQuizzes.size === paginatedQuizzes.length && paginatedQuizzes.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuizzes.length > 0 ? (
              paginatedQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuizzes.has(quiz.id)}
                      onCheckedChange={() => toggleSelectQuiz(quiz.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{quiz.title}</div>
                      {quiz.description && (
                        <div className="text-sm text-slate-500 truncate max-w-md">
                          {quiz.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}>
                      {quiz.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{quiz.questions?.[0]?.count || 0}</span>
                  </TableCell>
                  <TableCell>
                    {quiz.time_limit ? `${quiz.time_limit}s` : <span className="text-gray-400">No limit</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.is_active ? "default" : "secondary"}>
                      {quiz.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/quiz/${quiz.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Quiz
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Quiz
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicateQuiz(quiz.id)}
                            disabled={duplicatingQuiz === quiz.id}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {duplicatingQuiz === quiz.id ? "Duplicating..." : "Duplicate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/analytics`}>
                              <BarChart className="h-4 w-4 mr-2" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                            disabled={deletingQuiz === quiz.id}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingQuiz === quiz.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No quizzes found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredAndSortedQuizzes.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedQuizzes.length)} of{" "}
              {filteredAndSortedQuizzes.length} quizzes
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
