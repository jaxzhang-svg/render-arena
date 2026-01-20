import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMockMode, mockUser } from '@/lib/mock-data';

/**
 * 获取当前登录用户信息
 *
 * 返回 Supabase Auth 用户和 public.users 表中的额外信息
 */
export async function GET() {
  try {
    // Mock mode - return mock dev user
    if (isMockMode()) {
      const now = new Date().toISOString();
      return NextResponse.json({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
        profile: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          first_name: 'Dev',
          last_name: 'User',
          tier: 'free',
          created_at: now,
          updated_at: now,
        },
      });
    }

    const supabase = await createClient();

    // 从 Supabase Auth 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从 public.users 表获取完整用户资料
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .select('id, email, username, first_name, last_name, tier, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (dbError) {
      // 用户在 auth.users 中存在但在 public.users 中不存在
      // 返回基本信息
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username,
          created_at: user.created_at,
        },
        profile: null,
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...user.user_metadata,
      },
      profile,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
