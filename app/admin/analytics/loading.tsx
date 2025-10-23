import { AnalyticsSkeleton } from "@/components/admin/analytics-skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

export default function AnalyticsLoading() {
  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-accent animate-pulse rounded-full" />
              <div className="h-10 w-80 bg-accent animate-pulse rounded" />
            </div>
            <div className="h-5 w-96 bg-accent animate-pulse rounded mt-2" />
          </div>
        </div>
        
        <AnalyticsSkeleton />
      </div>
    </AdminPageWrapper>
  )
}