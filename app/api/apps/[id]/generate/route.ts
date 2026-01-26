import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { models } from '@/lib/config'

const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY!
const NOVITA_API_URL = 'https://api.novita.ai/openai/v1/chat/completions'

// HTML 生成系统提示词

/**
 * GET /api/apps/[id]/generate
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

  // 获取 fingerprint cookie（用于匿名用户权限验证）
  const fingerprint = request.cookies.get('browser_fingerprint')?.value || null

  // 权限检查：
  // - 已登录用户：必须是 owner (user_id 匹配)
  // - 匿名用户：必须通过 fingerprint 验证 (fingerprint_id 匹配)
  const isAuthenticated = !!user
  const isOwner = app.user_id === user?.id

  if (isAuthenticated && !isOwner) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 匿名用户：检查 fingerprint_id
  if (!isAuthenticated) {
    if (app.fingerprint_id !== fingerprint) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
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
      separate_reasoning: true,
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

  // 直接透传原始 SSE 流，当前端断开时会自动中断
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
