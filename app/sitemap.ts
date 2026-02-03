import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adminClient = await createAdminClient()

  // Get all public gallery items
  const { data: publicApps } = await adminClient
    .from('apps')
    .select('id, updated_at')
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(1000) // Limit to prevent oversized sitemaps

  const galleryUrls = (publicApps || []).map(app => ({
    url: `${siteUrl}/gallery/${app.id}`,
    lastModified: new Date(app.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/#gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/#faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...galleryUrls,
  ]
}
