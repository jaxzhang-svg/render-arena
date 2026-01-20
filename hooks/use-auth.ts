'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Check mock mode on client side
const isMockMode = process.env.NEXT_PUBLIC_MOCK_DATA === 'true';

// Mock user for dev mode
const mockUserData = {
  id: 'dev-user-001',
  email: 'dev@localhost',
  user_metadata: {
    username: 'DevUser',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface UseAuthReturn extends AuthState {
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 认证状态管理 Hook
 *
 * 提供：
 * - user: 当前登录用户对象
 * - session: 当前会话对象
 * - loading: 加载状态
 * - logout: 登出函数
 * - refresh: 刷新会话函数
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: isMockMode ? mockUserData : null,
    session: null,
    loading: !isMockMode,
  });

  // Don't create Supabase client in mock mode
  const supabase = isMockMode ? null : createClient();

  // 获取当前用户
  const fetchUser = useCallback(async () => {
    // In mock mode, user is already set
    if (isMockMode || !supabase) {
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
        setState({ user: null, session: null, loading: false });
        return;
      }

      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      });
    } catch (error) {
      console.error('Error in fetchUser:', error);
      setState({ user: null, session: null, loading: false });
    }
  }, [supabase]);

  // 刷新会话
  const refresh = useCallback(async () => {
    if (isMockMode) return;
    setState(prev => ({ ...prev, loading: true }));
    await fetchUser();
  }, [fetchUser]);

  // 登出
  const logout = useCallback(async () => {
    if (isMockMode) {
      // In mock mode, just reload the page
      window.location.href = '/';
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // 调用后端 API 清理服务端会话
      await fetch('/api/auth/logout', { method: 'POST' });

      // 清理客户端会话
      if (supabase) {
        await supabase.auth.signOut();
      }

      // 重定向到首页
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    // In mock mode, no need to fetch or subscribe
    if (isMockMode || !supabase) {
      return;
    }

    // 初始化时获取用户
    fetchUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });

        // 处理特定事件
        if (event === 'SIGNED_OUT') {
          // 可以在这里添加额外的清理逻辑
        } else if (event === 'TOKEN_REFRESHED') {
          // Token 刷新成功
        }
      }
    );

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser, supabase]);

  return {
    ...state,
    logout,
    refresh,
  };
}

/**
 * 获取 Novita 登录 URL
 * @param next - 登录后重定向的路径
 */
export function getNovitaLoginUrl(next?: string): string {
  const callbackUrl = new URL('/api/auth/callback', window.location.origin);
  if (next) {
    callbackUrl.searchParams.set('next', next);
  }
  
  const loginUrl = new URL('https://novita.ai/user/login');
  loginUrl.searchParams.set('redirect', callbackUrl.toString());
  
  return loginUrl.toString();
}

/**
 * 触发 Novita 登录
 * @param next - 登录后重定向的路径
 */
export function loginWithNovita(next?: string): void {
  const loginUrl = getNovitaLoginUrl(next);
  
  // Set redirect cookie for novita.ai main site
  // Parse the login URL to get the callback URL
  try {
    const urlObj = new URL(loginUrl);
    const redirectUrl = urlObj.searchParams.get('redirect_url');
    if (redirectUrl) {
      document.cookie = `redirect=${redirectUrl}; domain=.novita.ai; path=/`;
    }
  } catch (e) {
    console.error('Error setting redirect cookie:', e);
  }

  window.location.href = loginUrl;
}
