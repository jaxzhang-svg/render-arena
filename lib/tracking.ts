/**
 * Tracking & Attribution Utilities
 *
 * Captures marketing and referral tracking parameters for user acquisition analytics.
 * Parameters are stored in localStorage for persistence across navigation and OAuth flows.
 */

export interface TrackingParams {
  referrer?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
  landingpage?: string
}

const STORAGE_KEY = 'arena_tracking_params'

/**
 * Extract tracking parameters from URL query string and document context
 * - Returns actual values only (no defaults)
 * - Defaults are applied only when sending to main site
 */
export function extractTrackingParams(): TrackingParams {
  if (typeof window === 'undefined') {
    return {}
  }

  const urlParams = new URLSearchParams(window.location.search)

  return {
    referrer: document.referrer || undefined,
    utm_source: urlParams.get('utm_source') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    landingpage: window.location.pathname + window.location.search,
  }
}

/**
 * Store tracking parameters in localStorage
 * - Only stores actual values (no defaults)
 * - Landingpage, UTM params: only set if not exists (first visit only)
 * - Referrer: updates for external referrers only (non-Novita sites)
 */
export function storeTrackingParams(params: TrackingParams): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const existing = getStoredTrackingParams()

    // If no existing data, store everything (only defined values)
    if (!existing) {
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      )
      if (Object.keys(cleanParams).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanParams))
      }
      return
    }

    // Helper: check if referrer is from Novita
    const isNovitaReferrer = (referrer: string | null | undefined) => {
      if (!referrer) return false
      try {
        const referrerUrl = new URL(referrer)
        return (
          referrerUrl.hostname.includes('novita.ai') || referrerUrl.hostname.includes('novita.com')
        )
      } catch {
        return false
      }
    }

    // Merge logic:
    // - landingpage, utm_*: keep first value (existing takes precedence)
    // - referrer: update only if new referrer is external (non-Novita)
    const merged: TrackingParams = {
      landingpage: existing.landingpage || params.landingpage, // Keep first landingpage
      utm_source: existing.utm_source || params.utm_source, // Keep first UTM source
      utm_campaign: existing.utm_campaign || params.utm_campaign, // Keep first UTM campaign
      utm_medium: existing.utm_medium || params.utm_medium, // Keep first UTM medium
      referrer: isNovitaReferrer(existing.referrer)
        ? params.referrer && !isNovitaReferrer(params.referrer)
          ? params.referrer
          : existing.referrer // Update only if new referrer is external
        : params.referrer || existing.referrer, // Keep existing if it's already external
    }

    // Only store defined values
    const cleanMerged = Object.fromEntries(
      Object.entries(merged).filter(([_, v]) => v !== undefined)
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanMerged))
  } catch (error) {
    console.error('Failed to store tracking params:', error)
  }
}

/**
 * Retrieve tracking parameters from localStorage
 */
export function getStoredTrackingParams(): TrackingParams | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Failed to retrieve tracking params:', error)
    return null
  }
}

/**
 * Clear tracking parameters from localStorage
 */
export function clearTrackingParams(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear tracking params:', error)
  }
}

/**
 * Convert tracking params to URL query string
 * Filters out undefined values
 */
export function trackingParamsToQueryString(params: TrackingParams): string {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
  )
  return new URLSearchParams(cleanParams as Record<string, string>).toString()
}

/**
 * Append tracking params to a URL
 */
export function appendTrackingParamsToUrl(url: string, params: TrackingParams): string {
  try {
    const urlObj = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlObj.searchParams.set(key, value)
      }
    })
    return urlObj.toString()
  } catch (error) {
    console.error('Failed to append tracking params to URL:', error)
    return url
  }
}

/**
 * Apply default values for tracking parameters
 * Defaults are only applied when sending to main site, not stored in localStorage
 */
export function applyTrackingDefaults(params: TrackingParams | null): TrackingParams {
  return {
    referrer: params?.referrer,
    utm_source: params?.utm_source || 'direct',
    utm_campaign: params?.utm_campaign || 'none',
    utm_medium: params?.utm_medium || 'none',
    landingpage: params?.landingpage,
  }
}

/**
 * Initialize tracking on first page load
 * Captures params only once (attribution determined by backend)
 */
export function initTracking(): void {
  if (typeof window === 'undefined') {
    return
  }

  // Only capture if not already stored (first visit only)
  if (!getStoredTrackingParams()) {
    const params = extractTrackingParams()
    storeTrackingParams(params)
  }
}
