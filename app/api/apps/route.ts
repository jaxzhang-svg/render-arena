import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { GalleryResponse, GalleryApp } from '@/types';

/**
 * GET /api/apps
 * 获取应用列表（画廊）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category') || 'all'; // 分类筛选: all, physics, visual, game
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const adminClient = await createAdminClient();
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    // 构建查询 - 直接查询 apps 表（user_email 已冗余存储）
    let query = adminClient
      .from('apps')
      .select('*', { count: 'exact' })
      .eq('is_public', true);

    // 分类筛选
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    // 默认按点赞数排序，增加创建时间作为二级排序保证稳定性
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });

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

    // apps 表已包含 user_email，直接返回
    const appsWithLikeStatus: GalleryApp[] = (apps || []).map((app: any) => ({
      ...app,
      isLiked: false, // TODO: 需要单独查询用户点赞状态
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
