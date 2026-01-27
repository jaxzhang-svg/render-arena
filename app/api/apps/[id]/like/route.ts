import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/apps/[id]/like
 * 点赞/取消点赞应用
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    // 检查 App 是否存在
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('id, like_count')
      .eq('id', id)
      .single()

    if (appError || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    // Parse request body if available
    let desiredLikedState: boolean | undefined
    try {
      if (request.body) {
        const body = await request.json()
        if (typeof body.liked === 'boolean') {
          desiredLikedState = body.liked
        }
      }
    } catch {
      // Ignore JSON parse error, treat as no body
    }

    // 检查是否已点赞
    const { data: existingLike } = await adminClient
      .from('likes')
      .select('id')
      .eq('app_id', id)
      .eq('user_id', user.id)
      .single()

    let newLikeCount = app.like_count
    let liked: boolean

    if (desiredLikedState !== undefined) {
      // Explicit state requested
      if (desiredLikedState) {
        // User wants to LIKE
        if (!existingLike) {
          await adminClient.from('likes').insert({
            app_id: id,
            user_id: user.id,
          })
          newLikeCount = app.like_count + 1
        }
        liked = true
      } else {
        // User wants to UNLIKE
        if (existingLike) {
          await adminClient.from('likes').delete().eq('app_id', id).eq('user_id', user.id)
          newLikeCount = Math.max(0, app.like_count - 1)
        }
        liked = false
      }
    } else {
      // Toggle behavior (Legacy/Fallback)
      if (existingLike) {
        // 取消点赞
        await adminClient.from('likes').delete().eq('app_id', id).eq('user_id', user.id)

        newLikeCount = Math.max(0, app.like_count - 1)
        liked = false
      } else {
        // 添加点赞
        await adminClient.from('likes').insert({
          app_id: id,
          user_id: user.id,
        })

        newLikeCount = app.like_count + 1
        liked = true
      }
    }

    // 更新 app 的点赞数
    await adminClient.from('apps').update({ like_count: newLikeCount }).eq('id', id)

    return NextResponse.json({
      success: true,
      liked,
      likeCount: newLikeCount,
    })
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
