import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, Clock } from "lucide-react"

interface QuizCardProps {
  quiz: {
    id: string
    title: string
    description: string | null
    difficulty: string
    time_limit: number | null
    questions?: { count: number }[]
  }
}

export function QuizCard({ quiz }: QuizCardProps) {
  const questionCount = quiz.questions?.[0]?.count || 0

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <Badge className={difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}>
            {quiz.difficulty.toUpperCase()}
          </Badge>
        </div>
        <CardTitle className="text-xl">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>{questionCount} questions</span>
          </div>
          {quiz.time_limit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(quiz.time_limit / 60)} min</span>
            </div>
          )}
        </div>
        <Button asChild className="w-full">
          <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
