import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CreateSportForm } from "@/components/admin/create-sport-form"

export default async function CreateSportPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/sports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sports
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add New Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateSportForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
