import { isAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { SportsManagement } from "@/components/admin/sports-management"

export default async function AdminSportsPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch all sports with enhanced data
  const { data: sports } = await supabase
    .from("sports")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sports Management</h1>
          <p className="text-slate-600 mt-1">Manage all sports and their configurations</p>
        </div>
        <Button asChild>
          <Link href="/admin/sports/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Sport
          </Link>
        </Button>
      </div>

      <SportsManagement initialSports={sports || []} />
    </div>
  )
}
