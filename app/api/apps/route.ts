import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { App, GalleryResponse, GalleryApp } from '@/types';

/**
 * GET /api/apps
 * 获取应用列表（画廊）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'latest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const adminClient = await createAdminClient();
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    // 构建查询
    let query = adminClient
      .from('apps')
      .select('*', { count: 'exact' })
      .eq('is_public', true);

    // 排序
    if (category === 'hot') {
      query = query.order('like_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // 分页
    query = query.range(offset, offset + limit - 1);

    const { data: apps, error, count } = await query;

    if (error) {
      console.error('Error fetching apps:', error);
      return NextResponse.json(
        { error: 'Failed to fetch apps' },
        { status: 500 }
      );
    }

    // 获取每个 app 的实际点赞数（从 likes 表统计）
    const appIds = (apps || []).map(app => app.id);
    let likeCounts: Record<string, number> = {};
    
    if (appIds.length > 0) {
      // 统计每个 app 的点赞数
      const { data: likeStats } = await adminClient
        .from('likes')
        .select('app_id')
        .in('app_id', appIds);
      
      if (likeStats) {
        for (const like of likeStats) {
          likeCounts[like.app_id] = (likeCounts[like.app_id] || 0) + 1;
        }
      }
    }

    // 如果用户已登录，获取用户的点赞状态
    let likedAppIds: Set<string> = new Set();
    if (user && apps && apps.length > 0) {
      const { data: likes } = await adminClient
        .from('likes')
        .select('app_id')
        .eq('user_id', user.id)
        .in('app_id', appIds);
      
      if (likes) {
        likedAppIds = new Set(likes.map(like => like.app_id));
      }
    }

    // 添加 isLiked 字段和实际的 like_count
    const appsWithLikeStatus: GalleryApp[] = (apps || []).map(app => ({
      ...app,
      like_count: likeCounts[app.id] || 0,
      isLiked: likedAppIds.has(app.id),
    }));

    const response: GalleryResponse = {
      apps: appsWithLikeStatus,
      total: count || 0,
      page,
      limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
