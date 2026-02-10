'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAuth, loginWithNovita } from '@/hooks/use-auth'
import { showToast } from '@/lib/toast'

interface UseJoinWaitlistOptions {
  source?: string
  plan?: string
  redirectHash?: string
}

interface UseJoinWaitlistReturn {
  user: ReturnType<typeof useAuth>['user']
  authLoading: ReturnType<typeof useAuth>['loading']
  isSubmitting: boolean
  hasJoined: boolean
  isCheckingStatus: boolean
  joinWaitlist: () => Promise<void>
}

export function useJoinWaitlist(options: UseJoinWaitlistOptions = {}): UseJoinWaitlistReturn {
  const { source = 'event_page', plan = 'coding_plan', redirectHash = 'waitlist' } = options
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const getNextPath = useCallback(() => {
    if (typeof window === 'undefined') {
      return '/'
    }

    const hash = redirectHash ? `#${redirectHash}` : ''
    return `${window.location.pathname}${window.location.search}${hash}`
  }, [redirectHash])

  // Check waitlist status when user is loaded
  useEffect(() => {
    if (!user || authLoading) {
      return
    }

    const checkStatus = async () => {
      setIsCheckingStatus(true)
      try {
        const response = await fetch('/api/waitlist/status')
        if (response.ok) {
          const data = await response.json()
          setHasJoined(data.joined)
        }
      } catch (error) {
        console.error('Failed to check waitlist status:', error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    checkStatus()
  }, [user, authLoading])

  const joinWaitlist = useCallback(async () => {
    if (authLoading) {
      return
    }

    if (!user) {
      loginWithNovita(getNextPath())
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, plan }),
      })

      if (response.status === 401) {
        loginWithNovita(getNextPath())
        return
      }

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        showToast.error('Failed to join waitlist. Please try again.')
        return
      }

      if (data?.status === 'already_joined') {
        showToast.info('You are already on the waitlist.')
        setHasJoined(true)
        return
      }

      showToast.success('You are on the waitlist!')
      setHasJoined(true)
    } catch (error) {
      console.error('Failed to join waitlist:', error)
      showToast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [authLoading, getNextPath, plan, source, user])

  return {
    user,
    authLoading,
    isSubmitting,
    hasJoined,
    isCheckingStatus,
    joinWaitlist,
  }
}
