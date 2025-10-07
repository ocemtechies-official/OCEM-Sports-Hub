import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Puzzle } from "lucide-react"

export default function ChessPuzzlesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Chess Puzzles</h1>
            <p className="text-lg text-slate-600">Sharpen your tactical skills</p>
          </div>

          <Card>
            <CardHeader>
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <Puzzle className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Chess puzzles feature is under development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                We're working on bringing you an exciting collection of chess puzzles to help improve your tactical
                skills. Check back soon!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
