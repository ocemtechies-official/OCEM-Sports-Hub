"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail, AlertCircle, ArrowLeft, CheckCircle, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { useAuth } from "@/components/auth/auth-provider"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/auth-validation"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState("")
  const supabase = getSupabaseBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur"
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = `${siteUrl}/auth/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo,
      })

      if (error) {
        console.error("Reset password error:", error)
        notifications.showError(
          error.message === "For security purposes, you can only request this once every 60 seconds"
            ? "Please wait 60 seconds before requesting another reset email."
            : error.message || "Failed to send reset email. Please try again."
        )
        setIsLoading(false)
        return
      }

      setEmailSent(data.email)
      setIsSuccess(true)
      notifications.showSuccess("Password reset email sent successfully!")
    } catch (error: any) {
      console.error("Reset password failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Check Your Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            We've sent a password reset link to{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {emailSent}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Didn't receive the email? Check your spam folder or try again in 60 seconds.
          </p>
        </div>

        <div className="space-y-3">
          <LoadingButton
            onClick={() => {
              setIsSuccess(false)
              setEmailSent("")
            }}
            variant="outline"
            className="w-full"
            icon={<Mail className="h-4 w-4" />}
          >
            Send Another Email
          </LoadingButton>
          
          <Link
            href="/auth/login"
            className={cn(
              "inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium",
              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
              "transition-colors duration-200"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className={cn(
                "pl-10 transition-all duration-200",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "hover:border-gray-400 dark:hover:border-gray-500",
                errors.email && "border-red-500 focus:ring-red-500 focus:border-red-500"
              )}
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <div className="flex items-center space-x-1 text-sm text-red-600 animate-in slide-in-from-left-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText="Sending reset email"
          className={cn(
            "w-full h-11 font-medium",
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
            "transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl",
            "disabled:transform-none disabled:hover:scale-100"
          )}
          icon={<Send className="h-4 w-4" />}
        >
          Send Reset Link
        </LoadingButton>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link 
          href="/auth/login" 
          className={cn(
            "inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900",
            "dark:text-gray-400 dark:hover:text-gray-100",
            "transition-colors duration-200 hover:underline underline-offset-4",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-1 py-0.5"
          )}
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}