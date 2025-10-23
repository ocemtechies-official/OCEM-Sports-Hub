import { TournamentsSkeleton } from "@/components/admin/tournaments-skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

export default function Loading() {
  return (
    <AdminPageWrapper>
      <TournamentsSkeleton />
    </AdminPageWrapper>
  )
}