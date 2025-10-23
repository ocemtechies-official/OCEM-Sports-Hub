import { UsersSkeleton } from "@/components/admin/users-skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

export default function Loading() {
  return (
    <AdminPageWrapper>
      <UsersSkeleton />
    </AdminPageWrapper>
  )
}