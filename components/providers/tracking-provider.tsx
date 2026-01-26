'use client'

import { useTrackingParams } from '@/hooks/use-tracking-params'

/**
 * Tracking Provider
 *
 * Initializes tracking on first page load:
 * - Captures UTM parameters from URL
 * - Stores them in localStorage for persistence
 *
 * This component should be placed in the root layout.
 */
export function TrackingProvider() {
  useTrackingParams() // Initialize tracking once

  return null // This component doesn't render anything
}
