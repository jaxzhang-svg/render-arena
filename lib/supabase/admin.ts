import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 创建使用 SERVICE_ROLE_KEY 的 Supabase 管理客户端
 * 用于执行管理操作，如创建用户、创建会话等
 * 注意：此函数只能在服务端调用
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 在 Server Component 中可能无法设置 Cookie，这是正常的
          }
        },
      },
    }
  );
}
