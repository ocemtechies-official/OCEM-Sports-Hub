import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminRegistrationsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <div className="space-y-6">
              <div className="flex space-x-4 border-b">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-20" />
                ))}
              </div>

              {/* Table Rows */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}