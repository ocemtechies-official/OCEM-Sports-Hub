"use client"

import { Button } from "@/components/ui/button"
import { showToast as toast } from "@/components/ui/toast"

export function NotificationTest() {
  const showSuccess = () => {
    toast.success({
      title: "Success!",
      description: "This is a success notification with a working progress bar.",
    })
  }

  const showError = () => {
    toast.error({
      title: "Error!",
      description: "This is an error notification with a working progress bar.",
    })
  }

  const showWarning = () => {
    toast.warning({
      title: "Warning!",
      description: "This is a warning notification with a working progress bar.",
    })
  }

  const showInfo = () => {
    toast.info({
      title: "Info!",
      description: "This is an info notification with a working progress bar.",
    })
  }

  const showCustomDuration = () => {
    toast.success({
      title: "Custom Duration",
      description: "This notification will disappear after 5 seconds.",
      duration: 5000,
    })
  }

  const showPromise = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(() => resolve("Data loaded successfully!"), 3000)),
      {
        loading: "Loading data...",
        success: (data) => `Success: ${data}`,
        error: "Failed to load data. Please try again.",
      }
    )
  }

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold">Notification System Test</h2>
      <p className="text-gray-600">Test all notification types with their progress bars:</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={showSuccess} variant="default">
          Show Success
        </Button>
        <Button onClick={showError} variant="destructive">
          Show Error
        </Button>
        <Button onClick={showWarning} variant="outline">
          Show Warning
        </Button>
        <Button onClick={showInfo} variant="secondary">
          Show Info
        </Button>
        <Button onClick={showCustomDuration} variant="ghost">
          Show 5s Duration
        </Button>
        <Button onClick={showPromise} variant="default">
          Show Promise
        </Button>
      </div>
    </div>
  )
}