import AdminPageWrapper from "../admin-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminPageWrapper>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Quiz Table */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {/* Filter Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-md">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b">
                <div className="col-span-1">
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="col-span-4">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>

              {/* Table Rows */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b">
                  <div className="col-span-1">
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <div className="col-span-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="col-span-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="col-span-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded" />
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}