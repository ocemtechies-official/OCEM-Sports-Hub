import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Clock, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"

export default async function QuizResultsPage({ params }: { params: { id: string; attemptId: string } }) {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: attempt } = await supabase
    .from("quiz_attempts")
    .select("*, quiz:quizzes(*)")
    .eq("id", params.attemptId)
    .eq("user_id", user.id)
    .single()

  if (!attempt) {
    notFound()
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", params.id)
    .order("order_index")

  const percentage = Math.round((attempt.score / (attempt.total_questions * 10)) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/quiz">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-6xl font-bold text-blue-600 mb-2">{percentage}%</p>
                <p className="text-xl text-slate-600">
                  {attempt.score} out of {attempt.total_questions * 10} points
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">Correct Answers</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {attempt.answers.filter((a: any) => a.isCorrect).length} / {attempt.total_questions}
                    </p>
                  </div>
                </div>
                {attempt.time_taken && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-600">Time Taken</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <Link href={`/quiz/${params.id}`}>Retake Quiz</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/quiz">Browse Quizzes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Answer Review */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions?.map((question, index) => {
                const userAnswer = attempt.answers[index]
                const isCorrect = userAnswer?.isCorrect

                return (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 mb-2">
                          {index + 1}. {question.question_text}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-slate-600">Your answer:</p>
                            <Badge variant={isCorrect ? "default" : "destructive"} className="mt-1">
                              {userAnswer?.answer}
                            </Badge>
                          </div>
                          {!isCorrect && (
                            <div>
                              <p className="text-sm text-slate-600">Correct answer:</p>
                              <Badge variant="default" className="mt-1 bg-green-600">
                                {question.correct_answer}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
