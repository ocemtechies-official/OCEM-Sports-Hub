"use client"

import React, { useState } from "react"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  analyzePasswordStrength, 
  generateStrongPassword, 
  type PasswordStrength 
} from "@/lib/auth-validation"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean
  showGenerateButton?: boolean
  onPasswordGenerated?: (password: string) => void
  fillConfirmPassword?: boolean
  confirmPasswordSetter?: (value: string) => void
}

export function PasswordInput({
  className,
  showStrengthIndicator = false,
  showGenerateButton = false,
  onPasswordGenerated,
  fillConfirmPassword = false,
  confirmPasswordSetter,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [strength, setStrength] = useState<PasswordStrength | null>(null)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    if (showStrengthIndicator) {
      setStrength(analyzePasswordStrength(newPassword))
    }
    onChange?.(e)
  }

  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword(16)
    if (showStrengthIndicator) {
      setStrength(analyzePasswordStrength(newPassword))
    }
    onPasswordGenerated?.(newPassword)
    
    // Fill confirm password field if requested
    if (fillConfirmPassword && confirmPasswordSetter) {
      confirmPasswordSetter(newPassword)
    }
    
    // Create a synthetic event
    const syntheticEvent = {
      target: { value: newPassword },
      currentTarget: { value: newPassword }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange?.(syntheticEvent)
  }

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return "bg-red-500"
      case 1: return "bg-orange-500"
      case 2: return "bg-yellow-500"
      case 3: return "bg-blue-500"
      case 4: return "bg-green-500"
      default: return "bg-gray-300"
    }
  }

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0: return "Very Weak"
      case 1: return "Weak"
      case 2: return "Fair"
      case 3: return "Good"
      case 4: return "Strong"
      default: return ""
    }
  }

  return (
    <div className="space-y-2">
      {/* Password input with icon - matches the pattern used in regular inputs */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4 text-gray-400"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <Input
          {...props}
          type={isVisible ? "text" : "password"}
          className={cn(
            "pl-10 pr-20 transition-all duration-300",
            "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
            className
          )}
          value={value || ""}
          onChange={handlePasswordChange}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {showGenerateButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={handleGeneratePassword}
              title="Generate strong password"
            >
              <Sparkles className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent"
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </Button>
        </div>
      </div>

      {/* Strength indicator - always rendered to prevent layout shifts */}
      <div className={cn("space-y-2", showStrengthIndicator ? "block" : "hidden")}>
        {showStrengthIndicator && value && (
          <div className="space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300 ease-in-out",
                    strength ? getStrengthColor(strength.score) : "bg-gray-300"
                  )}
                  style={{ width: strength ? `${(strength.score / 4) * 100}%` : "0%" }}
                />
              </div>
              {strength && (
                <span className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  strength.score <= 1 ? "text-red-600" :
                  strength.score <= 2 ? "text-yellow-600" :
                  strength.score <= 3 ? "text-blue-600" : "text-green-600"
                )}>
                  {getStrengthText(strength.score)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}