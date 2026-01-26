import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * 创建使用 SERVICE_ROLE_KEY 的 Supabase 管理客户端
 * 用于执行管理操作，如创建用户、创建会话等
 * 注意：此函数只能在服务端调用
 *
 * 此客户端绕过 RLS (Row Level Security)，拥有完全访问权限
 */
export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !key) {
    throw new Error('Missing Supabase URL or Service Role Key')
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
