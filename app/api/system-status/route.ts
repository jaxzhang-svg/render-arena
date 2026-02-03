import { NextRequest, NextResponse } from 'next/server'
import { getFreeTierDisabled, getAllGenerationDisabled } from '@/lib/dynamic-config'

// Next.js Route Segment Config
// Optimize for dynamic data that changes based on system config
export const runtime = 'nodejs' // Use Node.js runtime for database access
export const revalidate = 30 // Revalidate every 30 seconds
export const dynamic = 'force-dynamic' // Always fetch fresh data (bypasses cache for API routes)

/**
 * GET /api/system-status
 * Returns current system configuration status
 * Used by client components to determine feature availability
 * 
 * This endpoint uses Next.js caching under the hood via getFreeTierDisabled/getAllGenerationDisabled
 * which leverage unstable_cache with 30s revalidation
 */
export async function GET(request: NextRequest) {
  try {
    const [freeTierDisabled, allGenerationDisabled] = await Promise.all([
      getFreeTierDisabled(),
      getAllGenerationDisabled(),
    ])

    return NextResponse.json({
      freeTierDisabled,
      allGenerationDisabled,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching system status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch system status',
        freeTierDisabled: false,
        allGenerationDisabled: false,
      },
      { status: 500 }
    )
  }
}
