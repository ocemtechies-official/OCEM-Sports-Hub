"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail, AlertCircle, ArrowLeft, CheckCircle, Send, Timer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const supabase = getSupabaseBrowserClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur"
  })

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [countdown, canResend])

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
        // Set countdown even on error to prevent spam
        if (error.message === "For security purposes, you can only request this once every 60 seconds") {
          setCanResend(false)
          setCountdown(60)
        }
        return
      }

      setEmailSent(data.email)
      setIsSuccess(true)
      setCanResend(false)
      setCountdown(60) // 60 seconds countdown
      notifications.showSuccess("Password reset email sent successfully!")
      setIsLoading(false)
    } catch (error: any) {
      console.error("Reset password failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!canResend || !emailSent) return
    
    setIsLoading(true)
    
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = `${siteUrl}/auth/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(emailSent, {
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
        // Set countdown even on error to prevent spam
        if (error.message === "For security purposes, you can only request this once every 60 seconds") {
          setCanResend(false)
          setCountdown(60)
        }
        return
      }

      setCanResend(false)
      setCountdown(60) // 60 seconds countdown
      notifications.showSuccess("Password reset email resent successfully!")
      setIsLoading(false)
    } catch (error: any) {
      console.error("Reset password failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-bounce-in">
          <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 animate-fade-in-up delay-100">
            Check Your Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto animate-fade-in-up delay-200">
            We've sent a password reset link to{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {emailSent}
            </span>
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-500 animate-fade-in-up delay-300 space-y-1">
            <p>Didn't receive the email? Check your spam or junk folder.</p>
            <p>The email may appear from <span className="font-medium">noreply@ocem-sports-hub.com</span></p>
          </div>
        </div>

        <div className="space-y-3 animate-fade-in-up delay-400">
          <LoadingButton
            onClick={handleResendEmail}
            disabled={!canResend || isLoading}
            loading={isLoading}
            loadingText="Sending..."
            className={cn(
              "w-full h-12 font-medium rounded-xl",
              "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
              "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
              "text-white border-0",
              "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              "shadow-lg hover:shadow-xl hover:shadow-blue-500/30",
              "disabled:transform-none disabled:hover:scale-100"
            )}
            icon={!canResend ? <Timer className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          >
            {!canResend ? (
              `Resend in ${countdown}s`
            ) : (
              "Resend Reset Link"
            )}
          </LoadingButton>
          
          <Link href="/auth/login" className="block">
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 font-medium rounded-xl",
                "border border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-gray-800",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "hover:border-gray-400 dark:hover:border-gray-500",
                "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                "shadow-sm hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 animate-fade-in-up">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up delay-100">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 animate-fade-in-up delay-200">
          <p>You'll receive an email with instructions to reset your password.</p>
          <p className="mt-1">Please check your spam folder if you don't see it.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in-up delay-300">
        {/* Email Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Address
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-blue-500" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className={cn(
                "pl-10 transition-all duration-300",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
                "hover:border-blue-400 dark:hover:border-blue-500",
                "shadow-sm hover:shadow-md",
                errors.email && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
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
          loadingText="Sending reset email..."
          className={cn(
            "w-full h-12 font-medium rounded-xl",
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
            "text-white border-0",
            "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl hover:shadow-blue-500/30",
            "disabled:transform-none disabled:hover:scale-100",
            "animate-fade-in-up delay-400"
          )}
          icon={!canResend && countdown > 0 ? <Timer className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          disabled={isLoading || (!canResend && countdown > 0)}
        >
          {!canResend && countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            "Send Reset Link"
          )}
        </LoadingButton>
      </form>

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-500 animate-fade-in-up delay-500">
        <p>Make sure to check your spam or junk folder if you don't receive the email within a few minutes.</p>
        <p className="mt-1">The email will come from <span className="font-medium">noreply@ocem-sports-hub.com</span></p>
      </div>

      {/* Back to Login */}
      <div className="text-center animate-fade-in-up delay-600">
        <Link href="/auth/login" className="block">
          <Button
            variant="outline"
            className={cn(
              "h-12 font-medium rounded-xl w-full",
              "border border-gray-300 dark:border-gray-600",
              "bg-white dark:bg-gray-800",
              "text-gray-700 dark:text-gray-300",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "hover:border-gray-400 dark:hover:border-gray-500",
              "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              "shadow-sm hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}