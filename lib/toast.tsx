import { toast, ToastOptions, ToastPosition } from 'react-toastify'
import { ReactNode } from 'react'
import { LoginToast } from '@/components/ui/login-toast'

// Default configuration
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
}

// Custom toast wrapper
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options })
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options })
  },
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options })
  },
  warning: (message: string, options?: ToastOptions) => {
    toast.warn(message, { ...defaultOptions, ...options })
  },
  // Custom login toast
  login: (
    message: string = 'Please login to continue',
    fingerprint?: string | null,
    options?: ToastOptions
  ) => {
    toast(<LoginToast message={message} fingerprint={fingerprint} />, {
      ...defaultOptions,
      autoClose: false, // Don't auto-close login prompt usually
      closeOnClick: false,
      ...options,
    })
  },
  // Dynamic positioning helper (can be expanded based on page logic)
  show: (
    message: ReactNode,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    pageContext?: string
  ) => {
    let position: ToastPosition = 'top-right'

    // Example logic for "different pages different places"
    if (pageContext === 'playground') {
      position = 'bottom-right'
    } else if (pageContext === 'gallery') {
      position = 'top-center'
    }

    const func = toast[type] || toast.info
    func(message, { ...defaultOptions, position })
  },
}
