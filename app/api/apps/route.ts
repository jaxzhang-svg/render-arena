import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { GalleryResponse, GalleryApp, CreateAppRequest, CreateAppResponse } from '@/types'
import DOMPurify from 'isomorphic-dompurify'

/**
 * GET /api/apps
 * 获取应用列表（画廊）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category') || 'all' // 分类筛选: all, physics, visual, game
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 构建查询 - 直接查询 apps 表（user_email 已冗余存储）
    let query = adminClient.from('apps').select('*', { count: 'exact' }).eq('is_public', true)

    // 分类筛选
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter)
    }

    // 默认按点赞数排序，增加创建时间作为二级排序保证稳定性
    query = query
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: apps, error, count } = await query

    if (error) {
      console.error('Error fetching apps:', error)
      return NextResponse.json({ error: 'Failed to fetch apps' }, { status: 500 })
    }

    // apps 表已包含 user_email，直接返回
    const appsWithLikeStatus: GalleryApp[] = (apps || []).map((app: any) => ({
      ...app,
      isLiked: false, // TODO: 需要单独查询用户点赞状态
    }))

    const response: GalleryResponse = {
      apps: appsWithLikeStatus,
      total: count || 0,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/apps:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const FREE_QUOTA = 5 // 匿名用户免费次数

/**
 * 获取客户端 IP 地址
 */
function getClientIP(request: NextRequest): string {
  const headersList = request.headers

  // 尝试从各种 header 获取真实 IP
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headersList.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // 默认返回一个占位符
  return '127.0.0.1'
}

/**
 * POST /api/apps
 * 创建 App（生成任务）
 * Formerly /api/apps/create
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppRequest = await request.json()
    const { prompt, modelA, modelB, category = '', name } = body

    // Read fingerprint from cookie (set by client-side FingerprintJS)
    const fingerprint = request.cookies.get('browser_fingerprint')?.value || null

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PROMPT', message: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!modelA || !modelB) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MODELS', message: 'Both modelA and modelB are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userId: string | null = null
    let userEmail: string | null = null

    if (user) {
      // 登录用户 - 获取用户信息
      userId = user.id

      // 从 users 表获取 email
      const { data: userData } = await adminClient
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single()

      userEmail = userData?.email || null
    } else {
      // 匿名用户 - 检查 IP 额度
      const clientIP = getClientIP(request)

      // 查询 IP 使用记录
      const { data: ipUsage, error: ipError } = await adminClient
        .from('ip_usage')
        .select('*')
        .eq('ip', clientIP)
        .single()

      if (ipError && ipError.code !== 'PGRST116') {
        // PGRST116 = 没有找到记录，这是正常的
        console.error('Error checking IP usage:', ipError)
      }

      if (ipUsage && ipUsage.used_count >= FREE_QUOTA) {
        return NextResponse.json(
          {
            success: false,
            error: 'FREE_QUOTA_EXCEEDED',
            message: 'Free credits has exhasuted, Please login to continue.',
          },
          { status: 403 }
        )
      }

      // 更新或插入 IP 使用记录
      if (ipUsage) {
        await adminClient
          .from('ip_usage')
          .update({
            used_count: ipUsage.used_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('ip', clientIP)
      } else {
        await adminClient.from('ip_usage').insert({
          ip: clientIP,
          used_count: 1,
        })
      }
    }

    // 创建 App 记录
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .insert({
        user_id: userId,
        user_email: userEmail,
        fingerprint_id: userId ? null : fingerprint || null,
        prompt: DOMPurify.sanitize(prompt.trim()),
        model_a: modelA,
        model_b: modelB,
        category: DOMPurify.sanitize(category),
        name: name ? name.slice(0, 100) : null,
      })
      .select('id')
      .single()

    if (appError) {
      console.error('Error creating app:', appError)
      return NextResponse.json(
        { success: false, error: 'CREATE_FAILED', message: 'Failed to create app' },
        { status: 500 }
      )
    }

    const response: CreateAppResponse = {
      success: true,
      appId: app.id,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in POST /api/apps:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
