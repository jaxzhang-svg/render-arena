import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMockMode, mockUser } from '@/lib/mock-data';
import { getMockApp, updateMockApp } from '@/lib/mock-store';

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
    const { name } = body;

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

      // In mock mode, dev user can publish their apps
      if (app.user_id !== mockUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      let shortName = name || app.name || `Dev App ${id.slice(-6)}`;

      updateMockApp(id, {
        is_public: true,
        name: shortName,
      });

      return NextResponse.json({
        success: true,
        message: 'Published to mock gallery',
        name: shortName,
      });
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();

    // 获取 App 并验证权限
    const { data: app, error: fetchError } = await adminClient
      .from('apps')
      .select('user_id, is_public, prompt, name')
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

    let shortName = name || app.name;

    // Generate title if name is missing or default
    if (!shortName || shortName === 'Untitled App') {
      try {
        const apiKey = process.env.NEXT_NOVITA_API_KEY || process.env.NOVITA_API_KEY;
        
        if (apiKey) {
          const prompt = app.prompt || 'An awesome AI app';
          const response = await fetch('https://api.novita.ai/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'deepseek/deepseek-v3.2',
              messages: [
                { role: 'user', content: `Generate a very short, catchy title (max 4-5 words) for an app that does this: "${prompt}". Return ONLY the title, no quotes.` },
              ],
              max_tokens: 50,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              shortName = text.trim().replace(/^"|"$/g, '');
            }
          } else {
            console.error('Failed to generate title from Novita API:', await response.text());
          }
        }
      } catch (e) {
        console.error('Failed to generate title:', e);
        // Fallback
        if (!shortName) shortName = 'Untitled App';
      }
    }

    // 更新 app
    const { error: updateError } = await adminClient
      .from('apps')
      .update({
        is_public: true,
        name: shortName,
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
      message: '已发布到画廊',
      name: shortName
    });
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/publish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
