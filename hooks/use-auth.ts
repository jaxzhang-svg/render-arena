'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { showToast } from '@/lib/toast'
import { updateUserTier } from '@/lib/analytics'
import {
  getStoredTrackingParams,
  appendTrackingParamsToUrl,
  applyTrackingDefaults,
} from '@/lib/tracking'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface UseAuthReturn extends AuthState {
  logout: () => Promise<void>
  refresh: () => Promise<void>
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
  })

  const supabase = createClient()

  const fetchAndUpdateUserTier = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      const tierType = data.quota?.type
      const userTier =
        tierType === 'anonymous' ? 'guest' : tierType === 'paid' ? 'upgraded' : 'registered'
      updateUserTier(userTier)
    } catch (err) {
      console.error('Failed to fetch user tier:', err)
    }
  }

  // 获取当前用户
  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error)
        // showToast.error('Failed to fetch session'); // Optional: noisy if happens often on background
        setState({ user: null, session: null, loading: false })
        return
      }

      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      })
    } catch (error) {
      console.error('Error in fetchUser:', error)
      setState({ user: null, session: null, loading: false })
    }
  }, [supabase])

  // 刷新会话
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    await fetchUser()
  }, [fetchUser])

  // 登出
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      // 调用后端 API 清理服务端会话
      await fetch('/api/auth/logout', { method: 'POST' })

      // 清理客户端会话
      await supabase.auth.signOut()

      // 重定向到首页
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
      showToast.error('Failed to logout')
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [supabase])

  /* eslint-disable react-hooks/exhaustive-deps -- state.user is intentionally NOT in deps to prevent re-subscription. Subscribing on every auth state change would create memory leaks and race conditions. The callback correctly captures initial state, and auth updates are handled by the subscription's own state change handler, not by re-running this effect. */
  useEffect(() => {
    // 初始化时获取用户
    fetchUser()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const wasLoggedOut = !state.user
      const isNowLoggedIn = !!session?.user

      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
      })

      // 处理特定事件
      if (event === 'SIGNED_IN' && wasLoggedOut && isNowLoggedIn) {
        fetchAndUpdateUserTier()
      } else if (event === 'SIGNED_OUT') {
        updateUserTier('guest')
      } else if (event === 'TOKEN_REFRESHED') {
        // Token 刷新成功
      }
    })

    // 清理订阅
    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase])

  return {
    ...state,
    logout,
    refresh,
  }
}

/**
 * 获取 Novita 登录 URL
 * @param next - 登录后重定向的路径
 */
export function getNovitaLoginUrl(next?: string): string {
  const callbackUrl = new URL('/api/auth/callback', window.location.origin)
  if (next) {
    callbackUrl.searchParams.set('next', next)
  }

  const loginUrl = new URL('https://novita.ai/user/login')
  loginUrl.searchParams.set('redirect', callbackUrl.toString())

  const trackingParams = getStoredTrackingParams()
  const paramsWithDefaults = applyTrackingDefaults(trackingParams)
  const loginUrlWithTracking = appendTrackingParamsToUrl(loginUrl.toString(), paramsWithDefaults)

  return loginUrlWithTracking
}

/**
 * 触发 Novita 登录
 * @param next - 登录后重定向的路径
 */
export function loginWithNovita(next?: string): void {
  const loginUrl = getNovitaLoginUrl(next)

  window.location.href = loginUrl
}
