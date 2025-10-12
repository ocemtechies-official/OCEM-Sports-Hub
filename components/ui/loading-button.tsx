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

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(({ children, loading = false, loadingText, icon, className, disabled, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "relative transition-all duration-200",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm font-medium">
            {loadingText || "Loading..."}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span>{children}</span>
        </div>
      )}
    </Button>
  )
})
LoadingButton.displayName = "LoadingButton"