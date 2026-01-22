import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { App, AppDetailResponse } from '@/types';
import DOMPurify from 'isomorphic-dompurify';
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer';

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
    const allowedFields = [
      'name', 
      'description', 
      'html_content_a', 
      'html_content_b',
      'duration_a',
      'tokens_a',
      'duration_b',
      'tokens_b'
    ];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        // Sanitize string fields
        if (typeof value === 'string') {

          value = DOMPurify.sanitize(value, DOMPURIFY_CONFIG);
        }
        updateData[field] = value;
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
