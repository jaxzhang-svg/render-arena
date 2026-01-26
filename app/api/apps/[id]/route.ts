import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { App, AppDetailResponse } from '@/types'
import DOMPurify from 'isomorphic-dompurify'
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer'

/**
 * GET /api/apps/[id]
 * 获取 App 详情
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取请求中的 fingerprint (从 query 参数)
    const { searchParams } = new URL(request.url)
    const fingerprint = searchParams.get('fingerprint')

    // 获取 App
    const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

    if (error || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 检查权限：私有 app 只有作者可以查看
    // 已登录用户：检查 user_id
    // 未登录用户：检查 fingerprint_id
    const isOwner = app.user_id === user?.id || (!user && app.fingerprint_id === fingerprint)

    if (!app.is_public && !isOwner) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 检查当前用户是否已点赞
    let isLiked = false
    if (user) {
      const { data: like } = await adminClient
        .from('likes')
        .select('id')
        .eq('app_id', id)
        .eq('user_id', user.id)
        .single()
      isLiked = !!like
    }

    const response: AppDetailResponse = {
      app: {
        ...app,
        isOwner,
        isLiked,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/apps/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/apps/[id]
 * 更新 App 信息
 *
 * 权限检查：
 * - 已登录用户：必须是 app 的 owner (user_id 匹配)
 * - 未登录用户：必须提供匹配的 fingerprint_id
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 获取 App 并验证权限 (需要 fingerprint_id 用于匿名用户检查)
    const { data: app, error: fetchError } = await adminClient
      .from('apps')
      .select('user_id, fingerprint_id')
      .eq('id', id)
      .single()

    if (fetchError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // 权限检查：已登录用户检查 user_id，未登录用户检查 fingerprint_id
    const isAuthenticated = !!user
    const isOwner = app.user_id === user?.id
    const fingerprint = body.fingerprint

    // 已登录用户：必须是 owner
    if (isAuthenticated && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 未登录用户：必须提供匹配的 fingerprint_id
    if (!isAuthenticated) {
      if (!fingerprint) {
        return NextResponse.json({ error: 'Fingerprint required for anonymous users' }, { status: 403 })
      }
      if (app.fingerprint_id !== fingerprint) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // 允许更新的字段
    const allowedFields = [
      'name',
      'description',
      'html_content_a',
      'html_content_b',
      'duration_a',
      'tokens_a',
      'duration_b',
      'tokens_b',
    ]
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field]
        // Sanitize string fields
        if (typeof value === 'string') {
          value = DOMPurify.sanitize(value, DOMPURIFY_CONFIG)
        }
        updateData[field] = value
      }
    }

    const { error: updateError } = await adminClient.from('apps').update(updateData).eq('id', id)

    if (updateError) {
      console.error('Error updating app:', updateError)
      return NextResponse.json({ error: 'Failed to update app' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/apps/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
