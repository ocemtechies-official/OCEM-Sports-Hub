"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { User, Mail, Lock, AlertCircle, UserPlus, CheckCircle } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google-icon"
import { GithubIcon } from "@/components/icons/github-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/components/auth/auth-provider"
import { signupSchema, type SignupFormData } from "@/lib/auth-validation"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function SignupForm() {
  const router = useRouter()
  const { signUp, signInWithGoogle, signInWithGithub, resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur"
  })

  const watchedFields = watch()
  const passwordValue = watch("password") as string

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    console.log("Signup form submitted with data:", data)
    
    try {
      const { error } = await signUp(data.email, data.password, data.fullName)
      
      // Store the email for potential resend
      setSignupEmail(data.email)

      if (error) {
        console.error("Signup error:", error)
        notifications.showError(
          error.message === "User already registered"
            ? "An account with this email already exists. Please try signing in instead."
            : error.message || "Failed to create account. Please try again."
        )
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      notifications.showSuccess("Account created successfully! Please check your email to verify your account.")
      
      // Redirect to login after showing success
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error: any) {
      console.error("Signup failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error("Google sign in error:", error)
        notifications.showError(error.message || "Failed to sign in with Google. Please try again.")
      }
    } catch (error: any) {
      console.error("Google sign in failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true)
    try {
      const { error } = await signInWithGithub()
      if (error) {
        console.error("GitHub sign in error:", error)
        notifications.showError(error.message || "Failed to sign in with GitHub. Please try again.")
      }
    } catch (error: any) {
      console.error("GitHub sign in failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
    } finally {
      setIsGithubLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      const { error } = await resendVerificationEmail(signupEmail)
      if (error) {
        console.error("Resend verification email error:", error)
        notifications.showError(error.message || "Failed to resend verification email. Please try again.")
      } else {
        notifications.showSuccess("Verification email resent successfully! Please check your inbox.")
      }
    } catch (error: any) {
      console.error("Resend verification email failed:", error)
      notifications.showError("An unexpected error occurred. Please try again.")
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center animate-bounce-in">
          <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 animate-fade-in-up delay-100">
            Account Created Successfully!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up delay-200">
            We've sent you a verification email. Please check your inbox and click the link to activate your account.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in-up delay-300">
            Didn't receive the email?{" "}
            <button 
              onClick={handleResendVerification}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline transition-all duration-300 hover:scale-105"
            >
              Resend verification email
            </button>
          </p>
        </div>
        <LoadingButton
          loading={true}
          loadingText="Redirecting to login"
          className="w-full animate-fade-in-up delay-400"
        >
          Redirecting...
        </LoadingButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in-up">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="fullName" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-100"
          >
            Full Name
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-blue-500" />
            </div>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              className={cn(
                "pl-10 transition-all duration-300",
                "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
                "hover:border-blue-400 dark:hover:border-blue-500",
                "shadow-sm hover:shadow-md",
                errors.fullName && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
              )}
              disabled={isLoading}
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <div className="flex items-center space-x-1 text-sm text-red-600 animate-in slide-in-from-left-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.fullName.message}</span>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-200"
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
              placeholder="Enter your email"
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="password" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-300"
          >
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Create a strong password"
            showStrengthIndicator={true}
            showGenerateButton={true}
            fillConfirmPassword={true}
            confirmPasswordSetter={(value) => setValue("confirmPassword", value)}
            className={cn(
              "transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "hover:border-blue-400 dark:hover:border-blue-500",
              "shadow-sm hover:shadow-md",
              errors.password && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
            )}
            disabled={isLoading}
            value={passwordValue || ""}
            onPasswordGenerated={(newPassword) => {
              setValue("password", newPassword)
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
            className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-400"
          >
            Confirm Password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Confirm your password"
            className={cn(
              "transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "hover:border-blue-400 dark:hover:border-blue-500",
              "shadow-sm hover:shadow-md",
              errors.confirmPassword && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
            )}
            disabled={isLoading}
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
          loadingText="Creating account"
          className={cn(
            "w-full h-12 font-medium rounded-xl",
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
            "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl hover:shadow-blue-500/30",
            "disabled:transform-none disabled:hover:scale-100",
            "animate-fade-in-up delay-500"
          )}
          icon={<UserPlus className="h-4 w-4" />}
        >
          Create Account
        </LoadingButton>
      </form>

      {/* Terms */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 animate-fade-in-up delay-600">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:underline underline-offset-4 hover:scale-105">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-300 hover:underline underline-offset-4 hover:scale-105">
          Privacy Policy
        </Link>
      </p>

      {/* Social Login Buttons */}
      <div className="space-y-3 animate-fade-in-up delay-700">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isGithubLoading || isLoading}
            className="w-full h-12 font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group relative overflow-hidden"
          >
            {isGoogleLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <GoogleIcon className="h-5 w-5 mr-2 text-red-500 group-hover:text-red-600 transition-colors duration-300" />
                <span className="relative z-10">Google</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={isGithubLoading || isGoogleLoading || isLoading}
            className="w-full h-12 font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group relative overflow-hidden"
          >
            {isGithubLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-gray-100" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800/10 to-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <GithubIcon className="h-5 w-5 mr-2 text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300" />
                <span className="relative z-10">GitHub</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative animate-fade-in-up delay-800">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="text-center animate-fade-in-up delay-900">
        <Link 
          href="/auth/login" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          Sign in to your account
        </Link>
      </div>
    </div>
  )
}