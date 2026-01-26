import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getNovitaUserInfo } from '@/lib/novita'

/**
 * Novita OAuth 回调处理器
 *
 * 流程：
 * 1. 从 Novita 获取用户信息（通过透传的 Cookie）
 * 2. 在 Supabase Auth 中查找或创建对应用户
 * 3. 使用 generateLink 生成魔法链接并提取 token
 * 4. 用 token 交换 Supabase 会话
 * 5. 迁移匿名用户的 apps（通过 fingerprint 参数）
 * 6. 设置会话 Cookie 并重定向
 */
export async function GET(request: NextRequest) {
  const novitaUser = await getNovitaUserInfo()

  if (!novitaUser) {
    console.error('Failed to get Novita user info - no token cookie or invalid response')
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  // 1. 查找现有用户
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id, email')
    .eq('novita_user_id', novitaUser.uid)
    .single()

  let userId: string
  let userEmail: string

  if (!existingUser) {
    // 2. 新用户：在 Supabase Auth 创建用户
    // 生成一个确定性但安全的临时密码（基于 Novita UUID，用户永远不会使用这个密码）
    const tempPassword = `novita_${novitaUser.uuid}_${Date.now()}`

    // 如果没有 email，使用 novita id 生成一个占位 email
    userEmail = novitaUser.email || `${novitaUser.uid}@novita.user`

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: userEmail,
      password: tempPassword,
      email_confirm: true, // 自动确认邮箱，因为已通过 Novita 验证
      user_metadata: {
        novita_user_id: novitaUser.uid,
        novita_uuid: novitaUser.uuid,
        username: novitaUser.username,
      },
    })

    if (authError || !authUser.user) {
      // 如果是邮箱已存在的错误，尝试通过邮箱查找用户
      if (authError?.message?.includes('already been registered')) {
        const { data: userByEmail } = await adminClient.auth.admin.listUsers()
        const foundUser = userByEmail.users.find(u => u.email === userEmail)
        if (foundUser) {
          userId = foundUser.id
          // 更新 users 表关联 novita_user_id
          await adminClient.from('users').upsert(
            {
              id: foundUser.id,
              novita_user_id: novitaUser.uid,
              novita_uuid: novitaUser.uuid,
              email: userEmail,
              username: novitaUser.username,
              first_name: novitaUser.firstName,
              last_name: novitaUser.lastName,
              tier: novitaUser.tier,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
        } else {
          console.error('Auth sync error:', authError)
          return NextResponse.redirect(new URL('/?error=sync_failed', request.url))
        }
      } else {
        console.error('Auth sync error:', authError)
        return NextResponse.redirect(new URL('/?error=sync_failed', request.url))
      }
    } else {
      userId = authUser.user.id

      // 3. 在 public.users 表创建记录
      const { error: dbError } = await adminClient.from('users').insert({
        id: authUser.user.id,
        novita_user_id: novitaUser.uid,
        novita_uuid: novitaUser.uuid,
        email: userEmail,
        username: novitaUser.username,
        first_name: novitaUser.firstName,
        last_name: novitaUser.lastName,
        tier: novitaUser.tier,
      })

      if (dbError) {
        console.error('DB sync error:', dbError)
        // 不要因为 users 表插入失败而阻止登录，用户仍然在 auth.users 中
      }
    }
  } else {
    userId = existingUser.id
    userEmail = existingUser.email

    // 更新用户信息
    await adminClient
      .from('users')
      .update({
        email: novitaUser.email || existingUser.email,
        username: novitaUser.username,
        first_name: novitaUser.firstName,
        last_name: novitaUser.lastName,
        tier: novitaUser.tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  // 4. 使用 generateLink 生成魔法链接
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: userEmail!,
  })

  if (linkError || !linkData.properties?.hashed_token) {
    console.error('Failed to generate magic link:', linkError)
    return NextResponse.redirect(new URL('/?error=session_failed', request.url))
  }

  // 5. 使用 OTP 验证来创建会话
  const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  })

  if (sessionError || !sessionData.session) {
    console.error('Failed to verify OTP:', sessionError)
    return NextResponse.redirect(new URL('/?error=session_failed', request.url))
  }

  // 6. 迁移匿名用户的 apps（通过 fingerprint 参数）
  const fingerprint = request.nextUrl.searchParams.get('fingerprint')
  if (fingerprint && userId) {
    try {
      const { error: migrateError } = await adminClient
        .from('apps')
        .update({
          user_id: userId,
          user_email: userEmail,
          fingerprint_id: null,
        })
        .eq('fingerprint_id', fingerprint)
        .is('user_id', null)

      if (migrateError) {
        console.error('Failed to migrate anonymous apps:', migrateError)
        // 不要因为迁移失败而阻止登录，用户仍然可以登录
      } else {
        console.log(`Migrated anonymous apps for fingerprint: ${fingerprint}`)
      }
    } catch (error) {
      console.error('Error migrating anonymous apps:', error)
    }
  }

  // 7. 重定向到首页（会话 Cookie 会通过 @supabase/ssr 自动设置）
  const redirectTo = request.nextUrl.searchParams.get('next') || '/'
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
