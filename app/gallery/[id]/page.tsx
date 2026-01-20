import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isMockMode, mockUser } from '@/lib/mock-data'
import { getMockApp, updateMockApp, isAppLikedByUser } from '@/lib/mock-store'
import { notFound } from 'next/navigation'
import GalleryClient from './gallery-client'
import type { App } from '@/types'

interface GalleryPageProps {
  params: Promise<{ id: string }>
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params

  // Mock mode - use in-memory store
  if (isMockMode()) {
    const app = getMockApp(id)

    if (!app) {
      notFound()
    }

    // Check permissions: private apps only visible to owner
    if (!app.is_public && app.user_id !== mockUser.id) {
      notFound()
    }

    // Increment view count
    updateMockApp(id, { view_count: app.view_count + 1 })

    const appWithMeta = {
      ...app,
      view_count: app.view_count + 1,
      isOwner: app.user_id === mockUser.id,
      isLiked: isAppLikedByUser(id, mockUser.id),
    } as App & { isOwner: boolean; isLiked: boolean }

    return <GalleryClient app={appWithMeta} />
  }

  const adminClient = await createAdminClient()
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  // 获取 App
  const { data: app, error } = await adminClient
    .from('apps')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !app) {
    notFound()
  }

  // 检查权限：私有 app 只有作者可以查看
  if (!app.is_public && app.user_id !== user?.id) {
    notFound()
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
