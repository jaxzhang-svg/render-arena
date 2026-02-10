import { cookies } from 'next/headers'
import { hasActiveCodingPlan } from '@/lib/novita'
import { PAID_USER_BALANCE_THRESHOLD, CODING_PLAN_PACKAGE_NAME } from '@/lib/config'

/**
 * Check if the current user (authenticated or anonymous) is the owner of an app
 *
 * @param user - The authenticated user (from supabase.auth.getUser())
 * @param app - The app object (must include user_id and fingerprint_id)
 * @param fingerprint - Optional fingerprint (if not provided, will read from cookies)
 * @returns Object with permission check results
 */
export async function checkAppOwnerPermission(
  user: { id: string } | null,
  app: { user_id: string | null; fingerprint_id: string | null }
): Promise<{
  isOwner: boolean
  isAuthenticated: boolean
  canAccess: boolean
}> {
  // Get fingerprint from cookie
  const fp = (await cookies()).get('browser_fingerprint')?.value || null

  const isAuthenticated = !!user
  const isOwner = isAuthenticated ? app.user_id === user.id : app.fingerprint_id === fp

  // Check if user can access this app
  const canAccess = isAuthenticated
    ? app.user_id === user?.id // Authenticated: must match user_id
    : app.fingerprint_id === fp // Anonymous: must match fingerprint_id

  return {
    isOwner,
    isAuthenticated,
    canAccess,
  }
}

/**
 * Check if user is a paid user (has sufficient balance OR active Coding Plan subscription)
 *
 * @param novitaBalance - User's Novita balance (in 0.0001 USD units)
 * @returns Promise<boolean> - True if user qualifies for paid tier
 */
export async function isPaidUser(novitaBalance: number | null): Promise<boolean> {
  // Check balance threshold
  if (novitaBalance !== null && novitaBalance > PAID_USER_BALANCE_THRESHOLD) {
    return true
  }

  // Check for active Coding Plan subscription
  const hasCodingPlan = await hasActiveCodingPlan(CODING_PLAN_PACKAGE_NAME)
  return hasCodingPlan
}
