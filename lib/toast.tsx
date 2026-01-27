import { toast, ToastOptions, ToastPosition } from 'react-toastify'
import { ReactNode } from 'react'
import { LoginToast } from '@/components/ui/login-toast'
import { ActionToast } from '@/components/ui/action-toast'
import { LogIn } from 'lucide-react'
import { loginWithNovita } from '@/hooks/use-auth'
import { DISCORD_INVITE_URL, NOVITA_BILLING_URL } from './config'

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
  login: (message: string = 'Please login to continue', trigger?: 'quota' | 'publish' | 'like', options?: ToastOptions) => {
    toast(<LoginToast message={message} trigger={trigger} />, {
      ...defaultOptions,
      autoClose: false, // Don't auto-close login prompt usually
      closeOnClick: false,
      ...options,
    })
  },
  // Quota exceeded toast with configurable action
  quotaExceeded: (message: string, quotaType: 'T0' | 'T1' | 'T2', options?: ToastOptions) => {
    let buttonText: string
    let buttonHref: string | undefined
    let buttonOnClick: (() => void) | undefined

    if (quotaType === 'T0') {
      // Anonymous user - show login button
      buttonText = 'Login'
      buttonOnClick = () => loginWithNovita(window.location.pathname)
    } else if (quotaType === 'T1') {
      // Authenticated user with low balance - show upgrade button
      buttonText = 'Upgrade'
      buttonHref = NOVITA_BILLING_URL
    } else {
      // T2: Paid user with exceeded quota - show Discord button
      buttonText = 'Join Discord'
      buttonHref = DISCORD_INVITE_URL
    }

    toast(<ActionToast message={message} buttonText={buttonText} buttonHref={buttonHref} buttonOnClick={buttonOnClick} icon={quotaType === 'T0' ? <LogIn size={14} /> : undefined} />, {
      ...defaultOptions,
      autoClose: false,
      closeOnClick: false,
      ...options,
    })
  },
  // Free tier disabled toast
  freeTierDisabled: (message: string, isAuthenticated: boolean, options?: ToastOptions) => {
    const buttonText = isAuthenticated ? 'Upgrade' : 'Login'
    const buttonHref = isAuthenticated ? NOVITA_BILLING_URL : undefined
    const buttonOnClick = isAuthenticated ? undefined : () => loginWithNovita(window.location.pathname)

    toast(<ActionToast message={message} buttonText={buttonText} buttonHref={buttonHref} buttonOnClick={buttonOnClick} icon={!isAuthenticated ? <LogIn size={14} /> : undefined} />, {
      ...defaultOptions,
      autoClose: false,
      closeOnClick: false,
      ...options,
    })
  },
  // All generation disabled toast
  allGenerationDisabled: (message: string, options?: ToastOptions) => {
    toast(<ActionToast message={message} buttonText="Join Discord" buttonHref={DISCORD_INVITE_URL} />, {
      ...defaultOptions,
      autoClose: false,
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
