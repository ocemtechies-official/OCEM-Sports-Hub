"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Lock, AlertCircle, CheckCircle, Key } from "lucide-react"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/auth-validation"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const supabase = getSupabaseBrowserClient()

  // Log when isLoading changes
  useEffect(() => {
    console.log("isLoading state changed to:", isLoading)
  }, [isLoading])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur"
  })

  const passwordValue = watch("password") as string

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          setIsValidSession(false)
        } else if (session) {
          setIsValidSession(true)
        } else {
          setIsValidSession(false)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
        setIsValidSession(false)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isValidSession) {
      notifications.showError("Invalid or expired reset link. Please request a new password reset.")
      return
    }

    console.log("Setting isLoading to true")
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        console.error("Password update error:", error)
        notifications.showError(
          error.message || "Failed to update password. Please try again."
        )
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      notifications.showSuccess("Password updated successfully!")
      
      // Don't set loading to false here, let success state handle UI
      // Redirect to login after success
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: any) {
      console.error("Password reset failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Key className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verifying Reset Link...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your password reset link.
          </p>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invalid Reset Link
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            This password reset link is invalid or has expired. Please request a new password reset.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/auth/forgot-password">
            <LoadingButton
              className={cn(
                "w-full h-12 font-medium rounded-xl",
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
                "text-white border-0",
                "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                "shadow-lg hover:shadow-xl hover:shadow-blue-500/30"
              )}
            >
              Request New Reset Link
            </LoadingButton>
          </Link>
          
          <Link
            href="/auth/login"
            className={cn(
              "inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium",
              "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
              "transition-colors duration-200"
            )}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Password Reset Complete!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
        </div>

        <LoadingButton
          loading={true}
          loadingText="Redirecting to login"
          className={cn(
            "w-full h-12 font-medium rounded-xl",
            "bg-gradient-to-r from-blue-600 to-blue-700",
            "dark:from-blue-500 dark:to-blue-600",
            "text-white border-0",
            "shadow-lg"
          )}
        >
          Redirecting...
        </LoadingButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Set New Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a strong, unique password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Password Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="password" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Enter your new password"
            showStrengthIndicator={true}
            showGenerateButton={true}
            fillConfirmPassword={true}
            confirmPasswordSetter={(value) => setValue("confirmPassword", value)}
            className={cn(
              "transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "hover:border-gray-400 dark:hover:border-gray-500",
              errors.password && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
            )}
            disabled={isLoading}
            value={passwordValue || ""}
            onPasswordGenerated={(newPassword) => {
              setValue("password", newPassword)
              // Also set the confirm password when a new password is generated
              setValue("confirmPassword", newPassword)
            }}
            {...register("password")}
          />
          {errors.password && (
            <div className="flex items-center space-x-1 text-sm text-red-600 animate-in slide-in-from-left-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="confirmPassword" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm New Password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your new password"
            className={cn(
              "transition-all duration-200",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "hover:border-gray-400 dark:hover:border-gray-500",
              errors.confirmPassword && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
            )}
            disabled={isLoading}
            value={watch("confirmPassword") || ""}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <div className="flex items-center space-x-1 text-sm text-red-600 animate-in slide-in-from-left-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.confirmPassword.message}</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText="Updating password..."
          className={cn(
            "w-full h-12 font-medium rounded-xl",
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
            "text-white border-0",
            "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl hover:shadow-blue-500/30",
            "disabled:transform-none disabled:hover:scale-100"
          )}
          icon={<Key className="h-4 w-4" />}
          disabled={isLoading}
        >
          Update Password
        </LoadingButton>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}