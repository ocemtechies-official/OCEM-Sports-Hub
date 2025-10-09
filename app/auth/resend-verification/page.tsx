import { Suspense } from "react"
import { ResendVerificationForm } from "@/components/auth/resend-verification-form"
import { ResendVerificationSkeleton } from "@/components/auth/resend-verification-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<ResendVerificationSkeleton />}>
      <AuthLayout
        title="Resend Verification Email"
        description="Enter your email address and we'll send you another verification link"
        gradientFrom="from-blue-600"
        gradientTo="to-cyan-600"
        darkGradientFrom="from-blue-400"
        darkGradientTo="to-cyan-400"
      >
        <ResendVerificationForm />
      </AuthLayout>
    </Suspense>
  )
}