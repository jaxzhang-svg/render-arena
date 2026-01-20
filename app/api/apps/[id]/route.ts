import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMockMode, mockUser } from '@/lib/mock-data';
import { getMockApp, updateMockApp, isAppLikedByUser } from '@/lib/mock-store';
import type { AppDetailResponse } from '@/types';

/**
 * GET /api/apps/[id]
 * 获取 App 详情
 */
export async function GET(
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
      const app = getMockApp(id);
      if (!app) {
        return NextResponse.json(
          { error: 'App not found' },
          { status: 404 }
        );
      }

      // In mock mode, dev user can see all apps they created
      if (!app.is_public && app.user_id !== mockUser.id) {
        return NextResponse.json(
          { error: 'App not found' },
          { status: 404 }
        );
      }

      const response: AppDetailResponse = {
        app: {
          ...app,
          isOwner: app.user_id === mockUser.id,
          isLiked: isAppLikedByUser(id, mockUser.id),
        },
      };
      return NextResponse.json(response);
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    // 获取 App
    const { data: app, error } = await adminClient
      .from('apps')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // 检查权限：私有 app 只有作者可以查看
    if (!app.is_public && app.user_id !== user?.id) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // 检查当前用户是否已点赞
    let isLiked = false;
    if (user) {
      const { data: like } = await adminClient
        .from('likes')
        .select('id')
        .eq('app_id', id)
        .eq('user_id', user.id)
        .single();
      isLiked = !!like;
    }

    const response: AppDetailResponse = {
      app: {
        ...app,
        isOwner: app.user_id === user?.id,
        isLiked,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/apps/[id]
 * 更新 App 信息
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Mock mode - use in-memory store
    if (isMockMode()) {
      const app = getMockApp(id);
      if (!app) {
        return NextResponse.json(
          { error: 'App not found' },
          { status: 404 }
        );
      }

      // In mock mode, dev user owns their apps
      if (app.user_id !== mockUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const allowedFields = ['name', 'description', 'html_content_a', 'html_content_b'];
      const updates: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      updateMockApp(id, updates);
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    // 获取 App 并验证权限
    const { data: app, error: fetchError } = await adminClient
      .from('apps')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // 只有作者可以更新
    if (app.user_id !== user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 允许更新的字段
    const allowedFields = ['name', 'description', 'html_content_a', 'html_content_b'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { error: updateError } = await adminClient
      .from('apps')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating app:', updateError);
      return NextResponse.json(
        { error: 'Failed to update app' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
