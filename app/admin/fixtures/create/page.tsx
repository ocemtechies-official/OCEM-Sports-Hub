import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CreateFixtureForm } from "@/components/admin/create-fixture-form"

export default async function CreateFixturePage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  const [{ data: sports }, { data: teams }] = await Promise.all([
    supabase.from("sports").select("*").order("name"),
    supabase.from("teams").select("*").order("name"),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/fixtures">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Fixtures
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Fixture</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateFixtureForm sports={sports || []} teams={teams || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
