import { cookies } from 'next/headers'

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
  app: { user_id: string | null; fingerprint_id: string | null },
  fingerprint?: string | null
): Promise<{
  isOwner: boolean
  isAuthenticated: boolean
  canAccess: boolean
}> {
  // Get fingerprint from parameter or cookie
  const fp = fingerprint ?? (await cookies()).get('browser_fingerprint')?.value || null

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
