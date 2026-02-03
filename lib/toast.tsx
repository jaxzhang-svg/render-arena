import { toast, ToastOptions, ToastPosition } from 'react-toastify'
import { ReactNode } from 'react'
import { LoginToast } from '@/components/ui/login-toast'
import { ActionToast } from '@/components/ui/action-toast'
import { LogIn } from 'lucide-react'
import { loginWithNovita } from '@/hooks/use-auth'
import { DISCORD_INVITE_URL, NOVITA_BILLING_URL } from './config'
import {
  trackLoginStarted,
  trackUpgradeButtonClicked,
  trackUpgradePromptDisplayed,
} from './analytics'

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

// Toast 节流管理
type ToastKey = 'quotaExceeded' | 'freeTierDisabled' | 'allGenerationDisabled'
const toastThrottleMap = new Map<ToastKey, boolean>()
const THROTTLE_DELAY = 5000 // 节流延迟，单位 ms

/**
 * 节流显示 toast（第一次立即执行，后续调用在延迟内忽略）
 * @param key toast 类型键
 * @param fn 实际显示 toast 的函数
 */
function throttleToast(key: ToastKey, fn: () => void) {
  if (toastThrottleMap.get(key)) {
    return
  }

  fn()

  toastThrottleMap.set(key, true)

  setTimeout(() => {
    toastThrottleMap.delete(key)
  }, THROTTLE_DELAY)
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
    message: string = 'Log in to continue',
    trigger?: 'publish' | 'like',
    options?: ToastOptions
  ) => {
    trackLoginStarted(trigger ?? 'like')
    toast(<LoginToast message={message} />, {
      ...defaultOptions,
      autoClose: false, // Don't auto-close login prompt usually
      closeOnClick: false,
      ...options,
    })
  },
  // Quota exceeded toast with configurable action
  quotaExceeded: (message: string, quotaType: 'T0' | 'T1' | 'T2', options?: ToastOptions) => {
    throttleToast('quotaExceeded', () => {
      let buttonText: string
      let buttonHref: string | undefined
      let buttonOnClick: (() => void) | undefined

      if (quotaType === 'T0') {
        trackLoginStarted('quota')
        // Anonymous user - show login button
        buttonText = 'Log in'
        buttonOnClick = () => loginWithNovita(window.location.pathname)
      } else if (quotaType === 'T1') {
        trackUpgradePromptDisplayed()
        // Authenticated user with low balance - show upgrade button
        buttonText = 'Add balance'
        buttonOnClick = () => {
          trackUpgradeButtonClicked('quota_modal')
          window.open(NOVITA_BILLING_URL, '_blank')
        }
      } else {
        // T2: Paid user with exceeded quota - show Discord button
        buttonText = 'Join Discord'
        buttonHref = DISCORD_INVITE_URL
      }

      toast(
        <ActionToast
          message={message}
          buttonText={buttonText}
          buttonHref={buttonHref}
          buttonOnClick={buttonOnClick}
          icon={quotaType === 'T0' ? <LogIn size={14} /> : undefined}
        />,
        {
          ...defaultOptions,
          autoClose: false,
          closeOnClick: false,
          ...options,
        }
      )
    })
  },
  // Free tier disabled toast
  freeTierDisabled: (message: string, isAuthenticated: boolean, options?: ToastOptions) => {
    throttleToast('freeTierDisabled', () => {
      const buttonText = isAuthenticated ? 'Add balance' : 'Log in'
      const buttonOnClick = isAuthenticated
        ? () => {
            trackUpgradeButtonClicked('overwhelming_banner')
            window.open(NOVITA_BILLING_URL, '_blank')
          }
        : () => loginWithNovita(window.location.pathname)

      toast(
        <ActionToast
          message={message}
          buttonText={buttonText}
          buttonOnClick={buttonOnClick}
          icon={!isAuthenticated ? <LogIn size={14} /> : undefined}
        />,
        {
          ...defaultOptions,
          autoClose: false,
          closeOnClick: false,
          ...options,
        }
      )
    })
  },
  // All generation disabled toast
  allGenerationDisabled: (message: string, options?: ToastOptions) => {
    throttleToast('allGenerationDisabled', () => {
      toast(
        <ActionToast message={message} buttonText="Join Discord" buttonHref={DISCORD_INVITE_URL} />,
        {
          ...defaultOptions,
          autoClose: false,
          closeOnClick: false,
          ...options,
        }
      )
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
