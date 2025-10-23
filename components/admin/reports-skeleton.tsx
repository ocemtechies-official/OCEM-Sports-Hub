"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-6 w-96 mt-2" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Reports - Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-2"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports - Fixtures */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2"><Skeleton className="h-4 w-20" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-20" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-2"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports - Quizzes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg">
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2"><Skeleton className="h-4 w-20" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                    <th className="text-left p-2"><Skeleton className="h-4 w-16" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="p-2"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}