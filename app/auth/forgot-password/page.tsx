import { Suspense } from "react"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { ForgotPasswordSkeleton } from "@/components/auth/forgot-password-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordSkeleton />}>
      <AuthLayout
        title="Forgot Password"
        description="No worries! We'll help you reset your password"
        gradientFrom="from-blue-600"
        gradientTo="to-blue-800"
        darkGradientFrom="from-blue-400"
        darkGradientTo="to-blue-600"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </Suspense>
  )
}