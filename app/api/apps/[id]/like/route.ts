import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMockMode, mockUser } from '@/lib/mock-data';
import { toggleMockLike } from '@/lib/mock-store';

/**
 * POST /api/apps/[id]/like
 * 点赞/取消点赞应用
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Mock mode - use in-memory store
    if (isMockMode()) {
      const result = toggleMockLike(id, mockUser.id);

      if (!result) {
        return NextResponse.json(
          { error: 'App not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        likeCount: result.likeCount,
        liked: result.liked,
      });
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 检查 App 是否存在
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('id, like_count')
      .eq('id', id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // 检查是否已点赞
    const { data: existingLike } = await adminClient
      .from('likes')
      .select('id')
      .eq('app_id', id)
      .eq('user_id', user.id)
      .single();

    let newLikeCount: number;
    let liked: boolean;

    if (existingLike) {
      // 取消点赞
      await adminClient
        .from('likes')
        .delete()
        .eq('app_id', id)
        .eq('user_id', user.id);

      newLikeCount = Math.max(0, app.like_count - 1);
      liked = false;
    } else {
      // 添加点赞
      await adminClient
        .from('likes')
        .insert({
          app_id: id,
          user_id: user.id,
        });

      newLikeCount = app.like_count + 1;
      liked = true;
    }

    // 更新 app 的点赞数
    await adminClient
      .from('apps')
      .update({ like_count: newLikeCount })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      likeCount: newLikeCount,
      liked,
    });
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
