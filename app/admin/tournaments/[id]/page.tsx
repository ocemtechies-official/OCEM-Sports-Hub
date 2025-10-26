import { redirect } from "next/navigation"

export default function TournamentIDPage({ params }: { params: { id: string } }) {
  redirect(`/admin/tournaments/${params.id}/edit`)
}