import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EnhancedQuizTable } from "@/components/admin/quizzes/enhanced-quiz-table"

export default async function AdminQuizzesPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(count)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quiz Management</h1>
          <p className="text-slate-600 mt-1">Create and manage quizzes with advanced filtering</p>
        </div>
        <Button asChild>
          <Link href="/admin/quizzes/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedQuizTable quizzes={quizzes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
