'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export function AnalyticsEventTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const event = searchParams.get('event')

    if (event === 'signup_completed') {
      trackEvent('signup_completed')
    }
  }, [searchParams])

  return null
}
