"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

interface QuizManagementTableProps {
  quizzes: any[]
}

export function QuizManagementTable({ quizzes }: QuizManagementTableProps) {
  if (quizzes.length === 0) {
    return <p className="text-center text-slate-500 py-8">No quizzes created yet</p>
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.map((quiz) => {
          const questionCount = quiz.questions?.[0]?.count || 0

          return (
            <TableRow key={quiz.id}>
              <TableCell className="font-semibold">{quiz.title}</TableCell>
              <TableCell>
                <Badge className={difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}>
                  {quiz.difficulty.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{questionCount}</TableCell>
              <TableCell>
                <Badge variant={quiz.is_active ? "default" : "secondary"}>
                  {quiz.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/quiz/${quiz.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
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
