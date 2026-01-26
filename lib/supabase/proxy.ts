import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 检查 Supabase 环境变量是否已配置
 */
function hasSupabaseEnvVars(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
}

/**
 * Next.js Proxy - 处理 Supabase 会话刷新和路由保护
 *
 * 重要：此 proxy 会在每个请求上运行，负责：
 * 1. 刷新过期的 Supabase 会话
 * 2. 将更新的 Cookie 同步到请求和响应
 * 3. 保护需要认证的路由
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 如果环境变量未配置，跳过检查
  if (!hasSupabaseEnvVars()) {
    return supabaseResponse
  }

  // 创建 Supabase 客户端（每个请求都需要创建新的实例）
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 重要：使用 getUser() 而不是 getSession() 来验证服务端认证
  // getSession() 不会验证 JWT，可能被恶意修改
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 定义需要保护的路由和认证相关路由
  const protectedRoutes = ['/dashboard', '/settings', '/profile']
  const authRoutes = ['/login', '/signup', '/auth']

  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // 如果用户未登录且访问受保护路由，重定向到登录页
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 如果用户已登录且访问认证页面（但不是 callback），重定向到首页
  if (isAuthRoute && user && !request.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
