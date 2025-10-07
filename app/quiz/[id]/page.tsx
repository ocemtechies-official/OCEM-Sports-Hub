import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Brain, Trophy, ArrowLeft } from "lucide-react"

export default async function QuizDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(count)")
    .eq("id", params.id)
    .single()

  if (!quiz || !quiz.is_active) {
    notFound()
  }

  const questionCount = quiz.questions?.[0]?.count || 0

  // Check if user has already attempted this quiz
  let userAttempt = null
  if (user) {
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", params.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    userAttempt = attempt
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/quiz">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <Badge className={difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}>
                  {quiz.difficulty.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{quiz.title}</CardTitle>
              <CardDescription className="text-base mt-2">{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Brain className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600">Questions</p>
                    <p className="text-lg font-semibold text-slate-900">{questionCount}</p>
                  </div>
                </div>
                {quiz.time_limit && (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <div>
                      <p className="text-sm text-slate-600">Time Limit</p>
                      <p className="text-lg font-semibold text-slate-900">{Math.floor(quiz.time_limit / 60)} minutes</p>
                    </div>
                  </div>
                )}
              </div>

              {userAttempt && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">Your Best Score</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {userAttempt.score} / {userAttempt.total_questions * 10}
                  </p>
                </div>
              )}

              {user ? (
                <Button asChild className="w-full" size="lg">
                  <Link href={`/quiz/${params.id}/attempt`}>{userAttempt ? "Retake Quiz" : "Start Quiz"}</Link>
                </Button>
              ) : (
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-600 mb-4">You need to sign in to take this quiz</p>
                  <Button asChild>
                    <Link href={`/auth/login?redirect=/quiz/${params.id}`}>Sign In</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
