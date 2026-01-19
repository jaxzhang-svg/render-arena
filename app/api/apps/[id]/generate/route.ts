import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY!;
const NOVITA_API_URL = 'https://api.novita.ai/openai/v1/chat/completions';

// HTML 生成系统提示词
const SYSTEM_PROMPT = ``;

/**
 * GET /api/apps/[id]/generate
 * 流式生成 HTML（SSE）- 直接透传 Novita API 的原始 SSE 流
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model'); // 'a' or 'b'

  if (!model || !['a', 'b'].includes(model)) {
    return new Response(
      JSON.stringify({ error: 'Invalid model parameter. Must be "a" or "b"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = await createClient();
  const adminClient = await createAdminClient();

  // 获取 App
  const { data: app, error } = await adminClient
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !app) {
    return new Response(
      JSON.stringify({ error: 'App not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 获取当前用户（用于权限检查）
  const { data: { user } } = await supabase.auth.getUser();

  // 只有作者或匿名创建者可以生成
  if (app.user_id && app.user_id !== user?.id) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const modelId = model === 'a' ? app.model_a : app.model_b;

  // 创建 AbortController，用于在前端断开连接时取消 Novita API 请求
  const abortController = new AbortController();

  // 监听前端请求中断
  request.signal.addEventListener('abort', () => {
    abortController.abort();
  });

  // 调用 Novita API
  const response = await fetch(NOVITA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NOVITA_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${app.prompt} using HTML/CSS/JS in a single HTML file.` },
      ],
      stream: true,
      separate_reasoning: true,
    }),
    signal: abortController.signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(
      JSON.stringify({ error: 'Novita API error', message: errorText }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 直接透传原始 SSE 流，当前端断开时会自动中断
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
