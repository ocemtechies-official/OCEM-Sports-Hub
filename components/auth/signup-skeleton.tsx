import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SignupSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400 text-base">
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>

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

            {/* Terms */}
            <div className="text-center">
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Skeleton className="w-full h-px" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Skeleton className="w-full h-px" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}