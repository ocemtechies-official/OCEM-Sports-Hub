import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CreateTournamentForm } from "@/components/admin/create-tournament-form"

export default async function CreateTournamentPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch sports
  const { data: sports } = await supabase
    .from("sports")
    .select("id, name, icon")
    .order("name")

  // Fetch teams with sport information
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, color, sport_id")
    .order("name")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/tournaments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Tournament</h1>
          <p className="text-lg text-slate-600">Set up a new tournament with bracket structure</p>
        </div>

        <CreateTournamentForm 
          sports={sports || []} 
          teams={teams || []} 
        />
      </main>
    </div>
  )
}