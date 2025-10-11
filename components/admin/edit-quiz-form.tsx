"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, Plus, Trash2, Brain, Clock, Copy } from "lucide-react"
import { notifications } from "@/lib/notifications"

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  description: string | null
  difficulty: string
  time_limit: number | null
  is_active: boolean
  created_at: string
  questions: Question[]
}

interface EditQuizFormProps {
  quiz: Quiz
}

export function EditQuizForm({ quiz }: EditQuizFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: quiz.title,
    description: quiz.description || "",
    difficulty: quiz.difficulty,
    time_limit: quiz.time_limit?.toString() || "",
    is_active: quiz.is_active
  })
  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions.map((q, index) => ({
      ...q,
      id: q.id || (index + 1).toString()
    }))
  )

  const addQuestion = () => {
    const newQuestion: Question = {
      id: (questions.length + 1).toString(),
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: ""
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question_text.trim() && 
      q.options.every(opt => opt.trim()) && 
      q.explanation.trim()
    )

    if (validQuestions.length === 0) {
      notifications.showError({
        title: "Error",
        description: "Please add at least one valid question"
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
          questions: validQuestions.map(q => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation
          }))
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update quiz')
      }

      notifications.showSuccess({
        title: "Success",
        description: "Quiz updated successfully"
      })

      router.push('/admin/quizzes')
      router.refresh()
    } catch (error: any) {
      console.error('Error updating quiz:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to update quiz"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
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

      router.push('/admin/quizzes')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting quiz:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to delete quiz"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicate = async () => {
    if (!confirm('Create a copy of this quiz?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${formData.title} (Copy)`,
          description: formData.description,
          difficulty: formData.difficulty,
          time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
          is_active: false, // Start as inactive
          questions: questions.map(q => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation
          }))
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

      router.push('/admin/quizzes')
      router.refresh()
    } catch (error: any) {
      console.error('Error duplicating quiz:', error)
      notifications.showError({
        title: "Error",
        description: error.message || "Failed to duplicate quiz"
      })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quiz Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quiz Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter quiz description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_limit">Time Limit (seconds)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                  placeholder="No limit"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">
                  {formData.is_active ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Add questions for your quiz. Each question must have 4 options.
              </CardDescription>
            </div>
            <Button type="button" onClick={addQuestion} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                    placeholder="Enter your question here..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Answer Options *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {String.fromCharCode(65 + optionIndex)}
                        </Badge>
                        <Input
                          value={option}
                          onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                        <input
                          type="radio"
                          name={`correct_${question.id}`}
                          checked={question.correct_answer === optionIndex}
                          onChange={() => updateQuestion(question.id, 'correct_answer', optionIndex)}
                          className="w-4 h-4"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Select the radio button next to the correct answer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Explanation *</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    placeholder="Explain why this is the correct answer..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Quiz
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDuplicate}
            disabled={loading}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/quizzes')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.title.trim()}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Quiz
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
