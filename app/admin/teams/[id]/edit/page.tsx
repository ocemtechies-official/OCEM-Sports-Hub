import { requireAdmin } from "@/lib/auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EditTeamForm } from "@/components/admin/edit-team-form"

interface EditTeamPageProps {
  params: { id: string }
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch the team data
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", params.id)
    .single()

  if (teamError || !team) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Team</CardTitle>
              <p className="text-sm text-slate-600">
                {team.name}
              </p>
            </CardHeader>
            <CardContent>
              <EditTeamForm team={team} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
