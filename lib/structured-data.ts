/**
 * JSON-LD Structured Data Helpers
 *
 * Used to generate structured data for better SEO and rich snippets
 * @see https://schema.org/
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Novita AI',
  url: 'https://novita.ai',
  logo: `${siteUrl}/logo/novita-logo.png`,
  sameAs: ['https://twitter.com/novita_labs', 'https://github.com/novitalabs'],
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Novita Render Areana',
  url: siteUrl,
  description:
    'Watch AI models compete in real-time visual generation. Compare open-source vs proprietary models side-by-side.',
  publisher: {
    '@type': 'Organization',
    name: 'Novita AI',
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo/novita-logo.png`,
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

export const creativeWorkSchema = (app: {
  id: string
  name: string | null
  description: string | null
  prompt: string
  created_at: string
  user_email: string | null
  preview_video_url: string | null
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: app.name || 'Visual Creation',
  description: app.description || app.prompt,
  creator: {
    '@type': 'Person',
    name: app.user_email || 'Anonymous',
  },
  dateCreated: app.created_at,
  url: `${siteUrl}/gallery/${app.id}`,
  thumbnailUrl: app.preview_video_url
    ? `${app.preview_video_url}/thumbnails/thumbnail.jpg?time=1s&height=630`
    : `${siteUrl}/images/visual-cover.png`,
})

export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
})
