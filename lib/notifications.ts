"use client"

import { showToast as toast } from '@/components/ui/toast'

export interface NotificationOptions {
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  style?: React.CSSProperties
  className?: string
  icon?: string
}

class NotificationManager {
  private defaultOptions: NotificationOptions = {
    duration: 4000,
    position: 'top-right',
  }

  private getOptions(options?: NotificationOptions) {
    return { ...this.defaultOptions, ...options }
  }

  showSuccess(notification: { title?: string; description: string } | string, options?: NotificationOptions) {
    const opts = this.getOptions(options)
    
    if (typeof notification === 'string') {
      return toast.success({
        title: 'Success',
        description: notification,
        duration: opts.duration,
      })
    }
    
    return toast.success({
      title: notification.title || 'Success',
      description: notification.description,
      duration: opts.duration,
    })
  }

  showError(notification: { title?: string; description: string }, options?: NotificationOptions) {
    const opts = this.getOptions(options)
    return toast.error({
      title: notification.title || 'Error',
      description: notification.description,
      duration: opts.duration,
    })
  }

  showWarning(message: string, options?: NotificationOptions) {
    const opts = this.getOptions(options)
    return toast.warning({
      title: 'Warning',
      description: message,
      duration: opts.duration,
    })
  }

  showInfo(message: string, options?: NotificationOptions) {
    const opts = this.getOptions(options)
    return toast.info({
      title: 'Info',
      description: message,
      duration: opts.duration,
    })
  }

  showLoading(message: string, options?: NotificationOptions) {
    const opts = this.getOptions(options)
    return toast.info({
      title: 'Loading',
      description: message,
      duration: opts.duration,
    })
  }

  showCustom(
    content: React.ReactNode, 
    options?: NotificationOptions & { type?: 'success' | 'error' | 'warning' | 'info' }
  ) {
    const opts = this.getOptions(options)
    
    // Convert content to string for title/description
    const contentStr = content?.toString() || ''
    
    switch (options?.type) {
      case 'success':
        return toast.success({
          title: 'Success',
          description: contentStr,
          duration: opts.duration,
        })
      case 'error':
        return toast.error({
          title: 'Error',
          description: contentStr,
          duration: opts.duration,
        })
      case 'warning':
        return toast.warning({
          title: 'Warning',
          description: contentStr,
          duration: opts.duration,
        })
      case 'info':
      default:
        return toast.info({
          title: 'Info',
          description: contentStr,
          duration: opts.duration,
        })
    }
  }

  dismiss() {
    toast.dismiss()
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: NotificationOptions
  ) {
    const opts = this.getOptions(options)
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      duration: opts.duration,
    })
  }
}

export const notifications = new NotificationManager()
export default notifications