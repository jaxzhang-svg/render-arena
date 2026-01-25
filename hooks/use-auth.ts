'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { showToast } from '@/lib/toast';
import { trackAuthLoginSuccess, trackAuthLoginFailed } from '@/lib/analytics';
import { getStoredTrackingParams, appendTrackingParamsToUrl, applyTrackingDefaults } from '@/lib/tracking';

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
    user: null,
    session: null,
    loading: true,
  });
  const hasTrackedLoginRef = useRef(false);

  const supabase = createClient();

  // 获取当前用户
  const fetchUser = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error fetching session:', error);
        // showToast.error('Failed to fetch session'); // Optional: noisy if happens often on background
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
    setState(prev => ({ ...prev, loading: true }));
    await fetchUser();
  }, [fetchUser]);

  // 登出
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // 调用后端 API 清理服务端会话
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // 清理客户端会话
      await supabase.auth.signOut();
      
      // 重定向到首页
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      showToast.error('Failed to logout');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    // 初始化时获取用户
    fetchUser();

    // Check for auth error in URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authError = urlParams.get('error');
      if (authError && !hasTrackedLoginRef.current) {
        hasTrackedLoginRef.current = true;
        trackAuthLoginFailed(authError as 'auth_failed' | 'sync_failed' | 'session_failed');
        // Clean up URL param
        urlParams.delete('error');
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const wasLoggedOut = !state.user;
        const isNowLoggedIn = !!session?.user;

        setState({
          user: session?.user ?? null,
          session: session ?? null,
          loading: false,
        });

        // 处理特定事件
        if (event === 'SIGNED_IN' && wasLoggedOut && isNowLoggedIn && !hasTrackedLoginRef.current) {
          // Track login success - check if this is a new user by looking at created_at
          const isNewUser = session?.user?.created_at
            ? (Date.now() - new Date(session.user.created_at).getTime()) < 60000 // Created within last minute
            : false;
          hasTrackedLoginRef.current = true;
          trackAuthLoginSuccess(isNewUser);
        } else if (event === 'SIGNED_OUT') {
          hasTrackedLoginRef.current = false;
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

  // Append tracking params to callback URL with defaults
  const trackingParams = getStoredTrackingParams();
  const paramsWithDefaults = applyTrackingDefaults(trackingParams);
  const callbackUrlWithTracking = appendTrackingParamsToUrl(callbackUrl.toString(), paramsWithDefaults);

  const loginUrl = new URL('https://novita.ai/user/login');
  loginUrl.searchParams.set('redirect', callbackUrlWithTracking);

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
