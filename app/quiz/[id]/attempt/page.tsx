import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { QuizAttempt } from "@/components/quiz/quiz-attempt"

export default async function QuizAttemptPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/auth/login?redirect=/quiz/${params.id}/attempt`)
  }

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", params.id).single()

  if (!quiz || !quiz.is_active) {
    notFound()
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", params.id)
    .order("order_index")

  if (!questions || questions.length === 0) {
    notFound()
  }

  return <QuizAttempt quiz={quiz} questions={questions} userId={user.id} />
}
