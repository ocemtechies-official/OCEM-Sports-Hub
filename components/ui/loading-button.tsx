"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  icon,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(
        "relative transition-all duration-200",
        loading && "text-transparent",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText && (
            <span className="text-sm font-medium">{loadingText}</span>
          )}
        </div>
      )}
      
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
    </Button>
  )
}