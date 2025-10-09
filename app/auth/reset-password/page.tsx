import { Suspense } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { ResetPasswordSkeleton } from "@/components/auth/reset-password-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <AuthLayout
        title="Reset Password"
        description="Enter your new password to secure your account"
        gradientFrom="from-blue-600"
        gradientTo="to-blue-800"
        darkGradientFrom="from-blue-400"
        darkGradientTo="to-blue-600"
      >
        <ResetPasswordForm />
      </AuthLayout>
    </Suspense>
  )
}