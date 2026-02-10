import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ANONYMOUS_QUOTA, AUTHENTICATED_QUOTA, PAID_QUOTA } from '@/lib/config'
import { getNovitaBalance } from '@/lib/novita'
import { isPaidUser } from '@/lib/permissions'
import type { UserInfoResponse } from '@/types'

function getClientIP(request: NextRequest): string {
  const headersList = request.headers

  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  return '127.0.0.1'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = await createAdminClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    let userId: string | null = null
    let userEmail: string | null = null
    let novitaBalance: number | null = null
    let novitaTokenExpired = false

    if (authError || !user) {
      const clientIP = getClientIP(request)

      const { data: quotaData } = await adminClient
        .from('generation_quotas')
        .select('*')
        .eq('identifier', clientIP)
        .single()

      const usedCount = quotaData?.used_count || 0

      return NextResponse.json<UserInfoResponse>({
        user: { id: null, email: null },
        quota: {
          used: usedCount,
          limit: ANONYMOUS_QUOTA,
          remaining: Math.max(0, ANONYMOUS_QUOTA - usedCount),
          type: 'anonymous',
        },
        novitaBalance: null,
        novitaTokenExpired: false,
      })
    }

    userId = user.id
    userEmail = user.email ?? null

    novitaBalance = await getNovitaBalance()

    if (novitaBalance === null) {
      novitaTokenExpired = true
    }

    const isPaid = await isPaidUser(novitaBalance)
    const quotaLimit = getQuotaLimit(true, isPaid)
    const quotaType = isPaid ? 'paid' : 'authenticated'

    const { data: quotaData } = await adminClient
      .from('generation_quotas')
      .select('*')
      .eq('identifier', userId)
      .single()

    const usedCount = quotaData?.used_count || 0

    return NextResponse.json<UserInfoResponse>({
      user: {
        id: userId,
        email: userEmail,
      },
      quota: {
        used: usedCount,
        limit: quotaLimit,
        remaining: Math.max(0, quotaLimit - usedCount),
        type: quotaType,
      },
      novitaBalance,
      novitaTokenExpired,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getQuotaLimit(isAuthenticated: boolean, isPaid: boolean): number {
  if (!isAuthenticated) {
    return ANONYMOUS_QUOTA
  }
  if (isPaid) {
    return PAID_QUOTA
  }
  return AUTHENTICATED_QUOTA
}
