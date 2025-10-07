import { getSupabaseServerClient } from "@/lib/supabase/server"
import { QuizCard } from "@/components/quiz/quiz-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function QuizPage() {
  const supabase = await getSupabaseServerClient()

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(count)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const easyQuizzes = quizzes?.filter((q) => q.difficulty === "easy") || []
  const mediumQuizzes = quizzes?.filter((q) => q.difficulty === "medium") || []
  const hardQuizzes = quizzes?.filter((q) => q.difficulty === "hard") || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sports Trivia</h1>
          <p className="text-lg text-slate-600">Test your sports knowledge with our quizzes</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Quizzes</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {quizzes && quizzes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">No quizzes available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="easy">
            {easyQuizzes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {easyQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">No easy quizzes available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="medium">
            {mediumQuizzes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mediumQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">No medium quizzes available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="hard">
            {hardQuizzes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {hardQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">No hard quizzes available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
