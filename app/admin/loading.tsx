import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton"
import AdminPageWrapper from "./admin-page-wrapper"

export default function AdminLoading() {
  return (
    <AdminPageWrapper>
      <AdminDashboardSkeleton />
    </AdminPageWrapper>
  )
}