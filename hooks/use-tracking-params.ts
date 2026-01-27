'use client'

import { useEffect, useState } from 'react'
import type { TrackingParams } from '@/lib/tracking'
import { initTracking, getStoredTrackingParams } from '@/lib/tracking'

/**
 * Hook to capture and access tracking parameters
 *
 * - Automatically captures tracking params on first mount
 * - Stores params in localStorage for persistence
 * - Returns current tracking params
 *
 * Usage in root layout to initialize tracking:
 * ```tsx
 * export default function Layout({ children }) {
 *   useTrackingParams(); // Initialize tracking once
 *   return children;
 * }
 * ```
 */
export function useTrackingParams(): TrackingParams | null {
  const [params, setParams] = useState<TrackingParams | null>(null)

  // Initialization on mount: setParams is intentionally called synchronously.
  // initTracking() and getStoredTrackingParams() are pure functions with no dependencies.
  // This is a standard initialization pattern.
  useEffect(() => {
    // Initialize tracking on first mount only
    initTracking()
    // eslint-disable-next-line
    setParams(getStoredTrackingParams())
  }, [])

  return params
}
