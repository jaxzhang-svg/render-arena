import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/apps/[id]/publish
 * 发布到画廊
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

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
      .select('user_id, is_public')
      .eq('id', id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    // 只有作者可以发布（匿名用户创建的 app 无法发布）
    if (!app.user_id || app.user_id !== user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // 更新 app
    const { error: updateError } = await adminClient
      .from('apps')
      .update({
        is_public: true,
        name: name || null,
        description: description || null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error publishing app:', updateError);
      return NextResponse.json(
        { error: 'Failed to publish app' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: '已发布到画廊' 
    });
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/publish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
