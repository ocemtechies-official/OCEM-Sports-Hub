import { SportsSkeleton } from "@/components/admin/sports-skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

export default function Loading() {
  return (
    <AdminPageWrapper>
      <SportsSkeleton />
    </AdminPageWrapper>
  )
}