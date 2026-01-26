import { cookies } from 'next/headers'

/**
 * Check if the current user (authenticated or anonymous) is the owner of an app
 *
 * @param user - The authenticated user (from supabase.auth.getUser())
 * @param app - The app object (must include user_id and fingerprint_id)
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
  const cookieStore = await cookies()
  const fingerprint = cookieStore.get('browser_fingerprint')?.value || null

  const isAuthenticated = !!user
  const isOwner = isAuthenticated ? app.user_id === user.id : app.fingerprint_id === fingerprint

  // Check if user can access this app
  const canAccess = isAuthenticated
    ? app.user_id === user?.id // Authenticated: must match user_id
    : app.fingerprint_id === fingerprint // Anonymous: must match fingerprint_id

  return {
    isOwner,
    isAuthenticated,
    canAccess,
  }
}

/**
 * Helper for API routes (uses request.cookies instead of await cookies())
 *
 * @param user - The authenticated user (from supabase.auth.getUser())
 * @param app - The app object (must include user_id and fingerprint_id)
 * @param requestCookies - The cookies from the request (request.cookies)
 * @returns Object with permission check results
 */
export function checkAppOwnerPermissionFromRequest(
  user: { id: string } | null,
  app: { user_id: string | null; fingerprint_id: string | null },
  requestCookies: RequestCookies
): {
  isOwner: boolean
  isAuthenticated: boolean
  canAccess: boolean
} {
  // Get fingerprint from request cookies
  const fingerprint = requestCookies.get('browser_fingerprint')?.value || null

  const isAuthenticated = !!user
  const isOwner = isAuthenticated ? app.user_id === user.id : app.fingerprint_id === fingerprint

  // Check if user can access this app
  const canAccess = isAuthenticated
    ? app.user_id === user?.id // Authenticated: must match user_id
    : app.fingerprint_id === fingerprint // Anonymous: must match fingerprint_id

  return {
    isOwner,
    isAuthenticated,
    canAccess,
  }
}
