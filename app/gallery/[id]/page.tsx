import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ForbiddenError } from '@/lib/errors'
import GalleryClient from './gallery-client'
import type { App } from '@/types'

interface GalleryPageProps {
  params: Promise<{ id: string }>
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params

  const adminClient = await createAdminClient()
  const supabase = await createClient()

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取 App
  const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

  if (error || !app) {
    notFound()
  }

  // 检查权限：私有 app 只有作者可以查看
  if (!app.is_public && app.user_id !== user?.id) {
    throw new ForbiddenError("You don't have permission to view this private creation")
  }

  // 检查当前用户是否已点赞
  let isLiked = false
  if (user) {
    const { data: like } = await adminClient
      .from('likes')
      .select('id')
      .eq('app_id', id)
      .eq('user_id', user.id)
      .single()
    isLiked = !!like
  }

  // 增加浏览次数
  await adminClient
    .from('apps')
    .update({ view_count: app.view_count + 1 })
    .eq('id', id)

  const appWithMeta = {
    ...app,
    isOwner: app.user_id === user?.id,
    isLiked,
  } as App & { isOwner: boolean; isLiked: boolean }

  return <GalleryClient app={appWithMeta} />
}
