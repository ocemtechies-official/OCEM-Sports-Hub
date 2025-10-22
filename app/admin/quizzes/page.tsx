import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { EnhancedQuizTable } from "@/components/admin/quizzes/enhanced-quiz-table"
import AdminPageWrapper from "../admin-page-wrapper"

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
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Quiz Management
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Create and manage quizzes with advanced filtering</p>
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
    </AdminPageWrapper>
  )
}