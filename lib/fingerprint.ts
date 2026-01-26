import FingerprintJS from '@fingerprintjs/fingerprintjs'

const FP_COOKIE_KEY = 'browser_fingerprint'
const FP_COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds
let fpPromise: Promise<any> | null = null

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

/**
 * Set cookie value
 */
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof window === 'undefined') return

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Delete cookie
 */
function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return

  document.cookie = `${name}=; path=/; max-age=0`
}

/**
 * Initialize FingerprintJS and get the visitor identifier
 */
async function getFingerprintFromJS(): Promise<string> {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load()
    }

    const fp = await fpPromise
    const result = await fp.get()
    return result.visitorId
  } catch (error) {
    console.error('FingerprintJS error:', error)
    throw error
  }
}

/**
 * Fallback fingerprint generation using device characteristics
 * Used when FingerprintJS fails or is blocked
 */
function getFallbackFingerprint(): string {
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      navigator.platform,
    ]

    const str = components.join('|')
    // Simple hash function
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  } catch (error) {
    console.error('Fallback fingerprint error:', error)
    // Last resort: random ID (note: this will change on reload)
    return Math.random().toString(36).substring(2)
  }
}

/**
 * Get or create browser fingerprint
 * Attempts to load from cookie first, then generates using FingerprintJS
 */
export async function getFingerprint(): Promise<string> {
  // Try to load from cookie first
  if (typeof window !== 'undefined') {
    try {
      const stored = getCookie(FP_COOKIE_KEY)
      if (stored) {
        return stored
      }
    } catch (error) {
      console.error('Cookie read error:', error)
    }

    // Generate new fingerprint
    let fingerprint: string
    try {
      fingerprint = await getFingerprintFromJS()
    } catch (error) {
      console.warn('FingerprintJS failed, using fallback')
      fingerprint = getFallbackFingerprint()
    }

    // Store in cookie (accessible to both client and server)
    try {
      setCookie(FP_COOKIE_KEY, fingerprint, FP_COOKIE_MAX_AGE)
    } catch (error) {
      console.error('Cookie write error:', error)
    }

    return fingerprint
  }

  // Server-side: return empty string (should not be called on server)
  return ''
}

/**
 * Clear stored fingerprint (for testing or privacy)
 */
export function clearFingerprint(): void {
  if (typeof window !== 'undefined') {
    try {
      deleteCookie(FP_COOKIE_KEY)
    } catch (error) {
      console.error('Cookie delete error:', error)
    }
  }
}
