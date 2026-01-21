import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import type { CreateAppRequest, CreateAppResponse } from '@/types';
import DOMPurify from 'isomorphic-dompurify';

const FREE_QUOTA = 5; // 匿名用户免费次数

/**
 * 获取客户端 IP 地址
 */
function getClientIP(request: NextRequest): string {
  const headersList = request.headers;
  
  // 尝试从各种 header 获取真实 IP
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = headersList.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // 默认返回一个占位符
  return '127.0.0.1';
}

/**
 * POST /api/apps/create
 * 创建 App（生成任务）
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppRequest = await request.json();
    const { prompt, modelA, modelB, category = '' } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PROMPT', message: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!modelA || !modelB) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MODELS', message: 'Both modelA and modelB are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();
    
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (user) {
      // 登录用户 - 获取用户信息
      userId = user.id;
      
      // 从 users 表获取 email
      const { data: userData } = await adminClient
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();
      
      userEmail = userData?.email || null;
    } else {
      // 匿名用户 - 检查 IP 额度
      const clientIP = getClientIP(request);
      
      // 查询 IP 使用记录
      const { data: ipUsage, error: ipError } = await adminClient
        .from('ip_usage')
        .select('*')
        .eq('ip', clientIP)
        .single();

      if (ipError && ipError.code !== 'PGRST116') {
        // PGRST116 = 没有找到记录，这是正常的
        console.error('Error checking IP usage:', ipError);
      }

      if (ipUsage && ipUsage.used_count >= FREE_QUOTA) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'FREE_QUOTA_EXCEEDED', 
            message: '免费额度已用完，请登录后继续使用' 
          },
          { status: 403 }
        );
      }

      // 更新或插入 IP 使用记录
      if (ipUsage) {
        await adminClient
          .from('ip_usage')
          .update({ 
            used_count: ipUsage.used_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('ip', clientIP);
      } else {
        await adminClient
          .from('ip_usage')
          .insert({ 
            ip: clientIP, 
            used_count: 1 
          });
      }
    }

    // 创建 App 记录
    const { data: app, error: appError } = await adminClient
      .from('apps')
      .insert({
        user_id: userId,
        user_email: userEmail,
        prompt: DOMPurify.sanitize(prompt.trim()),
        model_a: modelA,
        model_b: modelB,
        category: DOMPurify.sanitize(category),
      })
      .select('id')
      .single();

    if (appError) {
      console.error('Error creating app:', appError);
      return NextResponse.json(
        { success: false, error: 'CREATE_FAILED', message: 'Failed to create app' },
        { status: 500 }
      );
    }

    const response: CreateAppResponse = {
      success: true,
      appId: app.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/apps/create:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
