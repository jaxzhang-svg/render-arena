'use client'

import { trackUpgradeButtonClicked } from '@/lib/analytics'
import { NOVITA_BILLING_URL } from '@/lib/config'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SystemStatus {
  freeTierDisabled: boolean
  allGenerationDisabled: boolean
}

export function FreeTierBanner() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    freeTierDisabled: false,
    allGenerationDisabled: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fetch system status from API
    fetch('/api/system-status')
      .then(res => res.json())
      .then((data: SystemStatus) => {
        setSystemStatus(data)
        setIsLoading(false)

        // Check localStorage for dismiss status
        if (typeof window !== 'undefined') {
          const wasDismissed = localStorage.getItem('freeTierBannerDismissed')
          const shouldShow = (data.freeTierDisabled || data.allGenerationDisabled) && !wasDismissed
          setIsVisible(shouldShow)
        } else {
          setIsVisible(data.freeTierDisabled || data.allGenerationDisabled)
        }
      })
      .catch(error => {
        console.error('Failed to fetch system status:', error)
        setIsLoading(false)
      })
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('freeTierBannerDismissed', 'true')
  }

  // Don't render anything while loading or if not visible
  if (isLoading || !isVisible) {
    return null
  }

  if (!systemStatus.freeTierDisabled && !systemStatus.allGenerationDisabled) {
    return null
  }

  // Show different message based on which mode is active
  const isFullDisabled = systemStatus.allGenerationDisabled

  return (
    <div className="relative w-full border-b border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-2 items-center justify-center">
            <div className="size-2 animate-pulse rounded-full bg-amber-500" />
          </div>
          <p className="font-sans text-sm font-medium text-amber-900">
            {isFullDisabled ? (
              <>
                Due to overwhelming demand, our service is temporarily paused. We&apos;ll be back
                online soon!
              </>
            ) : (
              <>
                Due to overwhelming demand, free tier access is temporarily paused.{' '}
                <a
                  href={NOVITA_BILLING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 hover:text-amber-700"
                  onClick={() => {
                    trackUpgradeButtonClicked('overwhelming_banner')
                  }}
                >
                  Upgrade
                </a>{' '}
                to continue generating.
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-amber-200/50"
          aria-label="Dismiss"
        >
          <X className="size-4 text-amber-700" />
        </button>
      </div>
    </div>
  )
}
