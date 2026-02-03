import { unstable_cache, revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { FREE_TIER_DISABLED, ALL_GENERATION_DISABLED } from './config'

/**
 * Cache tags for Next.js cache invalidation
 */
export const SYSTEM_CONFIG_CACHE_TAG = 'system-config'
export const FREE_TIER_CACHE_TAG = 'system-config:free-tier'
export const ALL_GEN_CACHE_TAG = 'system-config:all-generation'

/**
 * Internal function to fetch free tier config from database
 * Wrapped with Next.js unstable_cache for optimal performance
 */
const fetchFreeTierConfig = unstable_cache(
  async (): Promise<boolean> => {
    try {
      const adminClient = await createAdminClient()
      const { data, error } = await adminClient
        .from('system_config')
        .select('value')
        .eq('key', 'free_tier_disabled')
        .single()

      if (error || !data) {
        console.warn('Failed to fetch free_tier_disabled from database, using static config')
        return FREE_TIER_DISABLED
      }

      return data.value === 'true'
    } catch (error) {
      console.error('Error fetching free_tier_disabled config:', error)
      return FREE_TIER_DISABLED
    }
  },
  ['free-tier-disabled'],
  {
    tags: [SYSTEM_CONFIG_CACHE_TAG, FREE_TIER_CACHE_TAG],
    revalidate: 30, // Revalidate every 30 seconds
  }
)

/**
 * Internal function to fetch all generation config from database
 * Wrapped with Next.js unstable_cache for optimal performance
 */
const fetchAllGenerationConfig = unstable_cache(
  async (): Promise<boolean> => {
    try {
      const adminClient = await createAdminClient()
      const { data, error } = await adminClient
        .from('system_config')
        .select('value')
        .eq('key', 'all_generation_disabled')
        .single()

      if (error || !data) {
        return ALL_GENERATION_DISABLED
      }

      return data.value === 'true'
    } catch (error) {
      console.error('Error fetching all_generation_disabled config:', error)
      return ALL_GENERATION_DISABLED
    }
  },
  ['all-generation-disabled'],
  {
    tags: [SYSTEM_CONFIG_CACHE_TAG, ALL_GEN_CACHE_TAG],
    revalidate: 30, // Revalidate every 30 seconds
  }
)

/**
 * Get free tier disabled status from database with Next.js caching
 * Falls back to static config value if database is unavailable
 *
 * Uses Next.js Data Cache with:
 * - 30 second revalidation period
 * - Tagged for selective cache invalidation
 * - Automatic request deduplication
 */
export async function getFreeTierDisabled(): Promise<boolean> {
  return fetchFreeTierConfig()
}

/**
 * Get all generation disabled status from database with Next.js caching
 * Falls back to static config value if database is unavailable
 *
 * Uses Next.js Data Cache with:
 * - 30 second revalidation period
 * - Tagged for selective cache invalidation
 * - Automatic request deduplication
 */
export async function getAllGenerationDisabled(): Promise<boolean> {
  return fetchAllGenerationConfig()
}

/**
 * Invalidate system config cache using Next.js cache revalidation
 * This triggers a revalidation of all routes that use the config
 * Call this after updating config in the database
 *
 * @param specific - Optional specific cache to invalidate ('free-tier' or 'all-generation')
 */
export async function invalidateSystemConfigCache(
  specific?: 'free-tier' | 'all-generation'
): Promise<void> {
  try {
    // Revalidate API routes that use the config
    // This will force them to re-fetch data on next request
    revalidatePath('/api/system-status', 'page')
    revalidatePath('/api/apps', 'layout') // Revalidate all app routes

    console.log(`[Cache] Invalidated system config cache${specific ? `: ${specific}` : ''}`)
  } catch (error) {
    console.error('Error invalidating system config cache:', error)
  }
}
