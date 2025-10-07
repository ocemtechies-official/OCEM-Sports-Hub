"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"

interface QuizAttemptProps {
  quiz: any
  questions: any[]
  userId: string
}

export function QuizAttempt({ quiz, questions, userId }: QuizAttemptProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.time_limit || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return

    const timer = setInterval(() => {
      setTimeRemaining((prev: number | null) => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const supabase = getSupabaseBrowserClient()
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    // Calculate score
    const answersArray = questions.map((question, index) => {
      const userAnswer = answers[index] || ""
      const isCorrect = userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
      return {
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      }
    })

    const totalScore = answersArray.reduce((sum, a) => sum + a.points, 0)

    // Save attempt
    const { data: attempt, error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: quiz.id,
        user_id: userId,
        score: totalScore,
        total_questions: questions.length,
        answers: answersArray,
        time_taken: timeTaken,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    toast({
      title: "Quiz Submitted!",
      description: `You scored ${totalScore} points!`,
    })

    router.push(`/quiz/${quiz.id}/results/${attempt.id}`)
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{quiz.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className={timeRemaining < 60 ? "text-red-600" : "text-slate-900"}>
                      {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-600 mt-2">
                {answeredCount} of {questions.length} answered
              </p>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{question.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
              {question.question_type === "multiple_choice" && (
                <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange}>
                  <div className="space-y-3">
                    {question.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.question_type === "true_false" && (
                <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswerChange}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer">
                        False
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              )}

              {question.question_type === "fill_blank" && (
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Input
                    id="answer"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="text-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
