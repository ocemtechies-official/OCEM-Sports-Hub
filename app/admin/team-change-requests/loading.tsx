"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import AdminPageWrapper from "../admin-page-wrapper"

function TeamChangeRequestsSkeletonLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="text-center py-5">
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-full mb-5 shadow-md">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Requests List */}
      <div className="grid gap-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm text-slate-600 bg-white/50 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="mt-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <AdminPageWrapper>
      <TeamChangeRequestsSkeletonLoading />
    </AdminPageWrapper>
  )
}