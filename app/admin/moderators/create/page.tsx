import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { CreateModeratorForm } from "@/components/admin/create-moderator-form"

export default async function CreateModeratorPage() {
  const { user, profile, isAdmin } = await requireAdmin()
  
  if (!user || !isAdmin) {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/moderators">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Moderators
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Add New Moderator</h1>
          <p className="text-slate-600 mt-1">
            Assign moderator role and configure sport/venue permissions
          </p>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Moderator Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateModeratorForm />
        </CardContent>
      </Card>
    </div>
  )
}
