'use client'

import { useFingerprint } from '@/hooks/useFingerprint'

/**
 * FingerprintProvider
 *
 * Initializes the browser fingerprint once at app startup.
 * The fingerprint is stored in a cookie, making it accessible to both client and server.
 */
export function FingerprintProvider() {
  // Initialize fingerprint (generates and stores in cookie)
  // This runs once when the app loads
  useFingerprint()

  // This component doesn't render anything
  // It only runs the side effect of initializing the fingerprint
  return null
}
