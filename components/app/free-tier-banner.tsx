'use client'

import { FREE_TIER_DISABLED, ALL_GENERATION_DISABLED, NOVITA_BILLING_URL } from '@/lib/config'
import { X } from 'lucide-react'
import { useState } from 'react'

export function FreeTierBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Initialize with localStorage check
    if (typeof window !== 'undefined') {
      const wasDismissed = localStorage.getItem('freeTierBannerDismissed')
      return (FREE_TIER_DISABLED || ALL_GENERATION_DISABLED) && !wasDismissed
    }
    return FREE_TIER_DISABLED || ALL_GENERATION_DISABLED
  })

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('freeTierBannerDismissed', 'true')
  }

  if ((!FREE_TIER_DISABLED && !ALL_GENERATION_DISABLED) || !isVisible) {
    return null
  }

  // Show different message based on which mode is active
  const isFullDisabled = ALL_GENERATION_DISABLED

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-2 items-center justify-center">
            <div className="size-2 animate-pulse rounded-full bg-amber-500" />
          </div>
          <p className="font-sans text-sm font-medium text-amber-900">
            {isFullDisabled ? (
              <>Due to overwhelming demand, our service is temporarily paused. We&apos;ll be back online soon!</>
            ) : (
              <>
                Due to overwhelming demand, free tier access is temporarily paused.{' '}
                <a
                  href={NOVITA_BILLING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 hover:text-amber-700"
                >
                  Upgrade
                </a>
                {' '}to continue generating.
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex size-6 items-center justify-center rounded-full hover:bg-amber-200/50 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="size-4 text-amber-700" />
        </button>
      </div>
    </div>
  )
}
