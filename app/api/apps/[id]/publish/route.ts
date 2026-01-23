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
    const { name } = body;

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
    let generatedCategory: string | null = null;

    // Generate title and category if name is missing or default
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
              model: 'pa/gemini-3-flash-preview',
              messages: [
                {
                  role: 'system',
                  content: `Analyze the app prompt and determine:
1. Category - choose ONE of these four modes:
   - "physics" for physics simulations, realistic motion, collisions, gravity, etc.
   - "visual" for visual effects, animations, graphics, data visualization, etc.
   - "game" for playable games, interactive entertainment, etc.
   - "general" for general web experiences, apps, or anything that doesn't fit the above

2. A very short, catchy title (max 4-5 words, max 60 characters)

Return JSON: { "category": "xxx", "title": "xxx" }`
                },
                { role: 'user', content: `Analyze this app prompt: "${prompt}"` }
              ],
              temperature: 0.3,
              max_tokens: 100,
              response_format: { type: "json_object" }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
              const metadata = JSON.parse(content);
              const validCategories = ['physics', 'visual', 'game', 'general'];
              generatedCategory = validCategories.includes(metadata.category) ? metadata.category : null;

              if (metadata.title) {
                shortName = metadata.title.slice(0, 60).trim();
              }
            }
          } else {
            console.error('Failed to generate metadata from Novita API:', await response.text());
          }
        }
      } catch (e) {
        console.error('Failed to generate metadata:', e);
        // Fallback
        if (!shortName) shortName = 'Untitled App';
      }
    }

    // 更新 app
    const updateData: any = {
      is_public: true,
      name: shortName,
    };

    // Update category if it was generated
    if (generatedCategory) {
      updateData.category = generatedCategory;
    }

    const { error: updateError } = await adminClient
      .from('apps')
      .update(updateData)
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
      name: shortName,
      category: generatedCategory,
    });
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/publish:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
