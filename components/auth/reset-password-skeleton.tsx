import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-green-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Submit Button */}
            <Skeleton className="h-11 w-full" />

            {/* Back to Login */}
            <div className="text-center">
              <Skeleton className="h-4 w-1/4 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}