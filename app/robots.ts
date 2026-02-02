import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/playground/', // Don't index playground/edit pages
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI's bot
        disallow: '/', // Prevent AI training on your content if desired
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
