import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  models,
  ANONYMOUS_QUOTA,
  AUTHENTICATED_QUOTA,
  PAID_QUOTA,
  PAID_USER_BALANCE_THRESHOLD,
  FREE_TIER_DISABLED,
  ALL_GENERATION_DISABLED,
} from '@/lib/config'
import { checkAppOwnerPermission } from '@/lib/permissions'
import { getNovitaBalance } from '@/lib/novita'

const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY!
const NOVITA_API_URL = 'https://api.novita.ai/openai/v1/chat/completions'

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

function getQuotaLimit(isAuthenticated: boolean, novitaBalance: number | null): number {
  if (!isAuthenticated) {
    return ANONYMOUS_QUOTA
  }
  if (novitaBalance !== null && novitaBalance > PAID_USER_BALANCE_THRESHOLD) {
    return PAID_QUOTA
  }
  return AUTHENTICATED_QUOTA
}

async function incrementQuota(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  quotaData: { used_count: number } | null,
  identifier: string
) {
  if (quotaData) {
    await adminClient
      .from('generation_quotas')
      .update({
        used_count: quotaData.used_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('identifier', identifier)
  } else {
    await adminClient.from('generation_quotas').insert({
      identifier: identifier,
      used_count: 1,
    })
  }
}

/**
 * POST /api/apps/[id]/generate
 * 流式生成 HTML（SSE）- 直接透传 Novita API 的原始 SSE 流
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { slot, model: modelIdParam, temperature } = body

  if (!slot || !['a', 'b'].includes(slot)) {
    return new Response(JSON.stringify({ error: 'Invalid slot parameter. Must be "a" or "b"' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const clientIP = getClientIP(request)

  // 获取 App
  const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

  if (error || !app) {
    return new Response(JSON.stringify({ error: 'App not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 获取当前用户（用于权限检查）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 权限检查：只有作者或匿名创建者可以生成
  const { canAccess } = await checkAppOwnerPermission(user, app)

  if (!canAccess) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let quotaLimit: number
  let novitaBalance: number | null = null
  let identifier: string

  if (user) {
    novitaBalance = await getNovitaBalance()
    quotaLimit = getQuotaLimit(true, novitaBalance)
    identifier = user.id
  } else {
    quotaLimit = getQuotaLimit(false, null)
    identifier = clientIP
  }

  // Check if all generation is disabled
  if (ALL_GENERATION_DISABLED) {
    return new Response(
      JSON.stringify({
        error: 'ALL_GENERATION_DISABLED',
        message: 'Due to overwhelming demand, our service is temporarily paused. We&apos;ll be back online soon!'
      }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check if free tier is disabled
  if (FREE_TIER_DISABLED) {
    const isPaidUser = novitaBalance !== null && novitaBalance > PAID_USER_BALANCE_THRESHOLD

    if (!isPaidUser) {
      const message = user
        ? 'Due to overwhelming demand, free tier access is temporarily paused. Please upgrade your account to continue generating.'
        : 'Due to overwhelming demand, anonymous access is temporarily paused. Please login to continue.'

      return new Response(
        JSON.stringify({ error: 'FREE_TIER_DISABLED', message }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const { data: quotaData } = await adminClient
    .from('generation_quotas')
    .select('*')
    .eq('identifier', identifier)
    .single()

  const usedCount = quotaData?.used_count || 0

  if (usedCount >= quotaLimit) {
    let error, message;
    if (!user) {
      error = 'QUOTA_EXCEEDED_T0';
      message = `You have reached your generation limit (${usedCount}/${quotaLimit}). Please login to continue.`;
    } else if (novitaBalance == null || novitaBalance < PAID_USER_BALANCE_THRESHOLD) {
      error = 'QUOTA_EXCEEDED_T1';
      message = `You have reached your generation limit (${usedCount}/${quotaLimit}). Please upgrade your account tier to continue.`;
    } else if (novitaBalance > PAID_USER_BALANCE_THRESHOLD) {
      error = 'QUOTA_EXCEEDED_T2';
      message = `You have reached your paid generation limit (${usedCount}/${quotaLimit}). Please contact support to increase your limit.`;
    } else {
      error = 'QUOTA_EXCEEDED';
      message = `You have reached your generation limit (${usedCount}/${quotaLimit}).`;
    }
    return new Response(
      JSON.stringify({ error, message }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let modelId = slot === 'a' ? app.model_a : app.model_b

  // 如果传入了 specific model (id)，验证并使用
  if (modelIdParam) {
    const isAllowed = models.some(m => m.id === modelIdParam)
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Invalid model. Must be one of the allowed models.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 如果模型ID发生了变化，更新数据库
    if (modelId !== modelIdParam) {
      const updateField = slot === 'a' ? 'model_a' : 'model_b'
      await adminClient
        .from('apps')
        .update({ [updateField]: modelIdParam })
        .eq('id', id)

      modelId = modelIdParam
    }
  }

  // 创建 AbortController，用于在前端断开连接时取消 Novita API 请求
  const abortController = new AbortController()

  // 监听前端请求中断
  request.signal.addEventListener('abort', () => {
    abortController.abort()
  })

  // 调用 Novita API
  const response = await fetch(NOVITA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOVITA_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer. Your goal is to generate a single, self-contained HTML file for user's prompt.`,
        },
        { role: 'user', content: app.prompt },
      ],
      temperature: Number.isNaN(Number(temperature))
        ? 0.7
        : Number(temperature) < 0
          ? 0
          : Number(temperature) > 2
            ? 2
            : Number(temperature),
      max_tokens: 32000,
      stream: true,
      // separate_reasoning: true,
    }),
    signal: abortController.signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    return new Response(JSON.stringify({ error: 'Novita API error', message: errorText }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  incrementQuota(adminClient, quotaData, identifier)

  // 直接透传原始 SSE 流，当前端断开时会自动中断
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
