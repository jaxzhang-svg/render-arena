import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ForbiddenError } from '@/lib/errors'
import { checkAppOwnerPermission } from '@/lib/permissions'
import GalleryClient from './gallery-client'
import type { App } from '@/types'
import type { Metadata } from 'next'
import { cache } from 'react'
import { creativeWorkSchema, breadcrumbSchema } from '@/lib/structured-data'
import Script from 'next/script'
import {
  hasValidStreamVideo,
  getStreamThumbnailUrl,
  getStreamIframeUrl,
  getStreamWatchUrl,
} from '@/lib/cloudflare-stream'

interface GalleryPageProps {
  params: Promise<{ id: string }>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'
const siteName = 'Novita Render Areana'
const defaultOgImage = '/images/visual-cover.png'

const getApp = cache(async (id: string) => {
  const adminClient = await createAdminClient()
  const { data: app, error } = await adminClient.from('apps').select('*').eq('id', id).single()

  if (error || !app) {
    return null
  }

  return app
})

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  const { id } = await params
  const app = await getApp(id)

  if (!app) {
    return {
      title: 'Gallery Not Found',
      description: 'The gallery item you are looking for could not be found.',
    }
  }

  const title = app.name || 'Gallery'
  const description =
    app.description || app.prompt || 'AI-generated visual creation comparing different models'

  // Check if video is available
  const hasVideo = hasValidStreamVideo(app.preview_video_url)

  // Construct video URLs using utility functions
  const ogImage =
    getStreamThumbnailUrl(app.preview_video_url, { time: '1s', height: 630 }) || defaultOgImage
  const url = `${siteUrl}/gallery/${id}`
  const twitterPlayerUrl = getStreamIframeUrl(app.preview_video_url)
  const videoStreamUrl = getStreamWatchUrl(app.preview_video_url)

  return {
    title,
    description,

    openGraph: {
      type: 'article',
      url,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: app.created_at,
      modifiedTime: app.updated_at,
      authors: [app.user_email || 'Anonymous'],
      ...(hasVideo &&
        videoStreamUrl && {
          videos: [
            {
              url: videoStreamUrl,
              width: 1920,
              height: 1080,
            },
          ],
        }),
    },

    twitter: {
      card: hasVideo ? 'player' : 'summary_large_image',
      site: '@novita_labs',
      creator: '@novita_labs',
      title: `${title} | ${siteName}`,
      description,
      images: [ogImage],
      ...(hasVideo &&
        twitterPlayerUrl &&
        videoStreamUrl && {
          players: {
            playerUrl: twitterPlayerUrl,
            streamUrl: videoStreamUrl,
            width: 1920,
            height: 1080,
          },
        }),
    },
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { id } = await params

  const adminClient = await createAdminClient()
  const supabase = await createClient()

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const app = await getApp(id)
  if (!app) {
    notFound()
  }
  // 检查权限：
  // - 公开 app：任何人都可以查看
  // - 私有 app：只有 owner 可以查看
  if (!app.is_public) {
    const { canAccess } = await checkAppOwnerPermission(user, app)
    if (!canAccess) {
      throw new ForbiddenError("You don't have permission to view this private creation")
    }
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

  // 计算是否为 owner（用于显示编辑按钮等）
  const { isOwner } = await checkAppOwnerPermission(user, app)

  const appWithMeta = {
    ...app,
    isOwner,
    isLiked,
  } as App & { isOwner: boolean; isLiked: boolean }

  // Generate structured data for SEO
  const structuredData = creativeWorkSchema(app)
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Gallery', url: `${siteUrl}/#gallery` },
    { name: app.name || 'Visual Creation', url: `${siteUrl}/gallery/${id}` },
  ])

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="structured-data-creative"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <GalleryClient app={appWithMeta} />
    </>
  )
}
