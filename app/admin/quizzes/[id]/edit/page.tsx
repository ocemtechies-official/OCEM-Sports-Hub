import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditQuizForm } from "@/components/admin/edit-quiz-form"

interface EditQuizPageProps {
  params: { id: string }
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the quiz data
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select(`
      *,
      questions:quiz_questions(*)
    `)
    .eq("id", params.id)
    .eq("deleted_at", null)
    .single()

  if (quizError || !quiz) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Quiz</CardTitle>
              <p className="text-sm text-slate-600">
                {quiz.title}
              </p>
            </CardHeader>
            <CardContent>
              <EditQuizForm quiz={quiz} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
