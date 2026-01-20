import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/mock-data';

/**
 * 登出 API
 *
 * 清除 Supabase 会话并返回成功状态
 */
export async function POST() {
  try {
    // Mock mode - no-op, just return success
    if (isMockMode()) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();

    // 清除 Supabase 会话
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
