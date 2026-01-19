import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/apps/[id]/view
 * 增加浏览次数
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

    const adminClient = await createAdminClient();

    // 获取当前浏览次数并增加
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .select('view_count')
      .eq('id', id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      );
    }

    const newViewCount = app.view_count + 1;

    await adminClient
      .from('apps')
      .update({ view_count: newViewCount })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      viewCount: newViewCount,
    });
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
