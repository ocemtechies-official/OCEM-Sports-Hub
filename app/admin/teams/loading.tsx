import { TeamsSkeleton } from "@/components/admin/teams-skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

export default function Loading() {
  return (
    <AdminPageWrapper>
      <TeamsSkeleton />
    </AdminPageWrapper>
  )
}