"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { GoogleIcon } from "@/components/icons/google-icon"
import { GithubIcon } from "@/components/icons/github-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import { useAuth } from "@/components/auth/auth-provider"
import { loginSchema, type LoginFormData } from "@/lib/auth-validation"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signInWithGoogle, signInWithGithub } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  })

  const watchedFields = watch()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    console.log("Login form submitted with data:", data)
    
    try {
      const { error } = await signIn(data.email, data.password, rememberMe)

      if (error) {
        console.error("Login error:", error)
        notifications.showError(
          error.message === "Invalid login credentials" 
            ? "Invalid email or password. Please check your credentials and try again."
            : error.message || "Login failed. Please try again."
        )
        setIsLoading(false)
        return
      }

      const redirect = searchParams.get("redirect") || "/"
      notifications.showSuccess("Welcome back! Login successful.")
      console.log("Login successful, redirecting to:", redirect)
      router.push(redirect)
      router.refresh()
    } catch (error: any) {
      console.error("Login failed:", error)
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in-up">
        {/* Email Field */}
        <div className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-100"
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
          <div className="flex items-center justify-between">
            <Label 
              htmlFor="password" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-fade-in-up delay-200"
            >
              Password
            </Label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Enter your password"
            className={cn(
              "transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "hover:border-blue-400 dark:hover:border-blue-500",
              "shadow-sm hover:shadow-md",
              errors.password && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
            )}
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password && (
            <div className="flex items-center space-x-1 text-sm text-red-600 animate-in slide-in-from-left-1">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2 animate-fade-in-up delay-300">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="transition-all duration-300 hover:scale-110"
          />
          <Label 
            htmlFor="remember" 
            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Remember me
          </Label>
        </div>

        {/* Submit Button */}
        <LoadingButton
          type="submit"
          loading={isLoading}
          loadingText="Signing in"
          className={cn(
            "w-full h-12 font-medium rounded-xl",
            "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
            "dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
            "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-xl hover:shadow-blue-500/30",
            "disabled:transform-none disabled:hover:scale-100",
            "animate-fade-in-up delay-400"
          )}
        >
          Sign In
        </LoadingButton>
      </form>

      {/* Social Login Buttons */}
      <div className="space-y-3 animate-fade-in-up delay-500">
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
      <div className="relative animate-fade-in-up delay-600">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
            New to OCEM Sports Hub?
          </span>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center animate-fade-in-up delay-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
        </span>
        <Link 
          href="/auth/signup" 
          className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
        >
          Create an account
        </Link>
      </div>
    </div>
  )
}