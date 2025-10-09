import { Suspense } from "react"
import { SignupForm } from "@/components/auth/signup-form"
import { SignupSkeleton } from "@/components/auth/signup-skeleton"
import { AuthLayout } from "@/components/auth/auth-layout"

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <AuthLayout
        title="Join the Hub"
        description="Create your account and become part of the OCEM Sports community"
        gradientFrom="from-blue-600"
        gradientTo="to-cyan-600"
        darkGradientFrom="from-blue-400"
        darkGradientTo="to-cyan-400"
      >
        <SignupForm />
      </AuthLayout>
    </Suspense>
  )
}