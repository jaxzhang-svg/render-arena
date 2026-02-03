import { Suspense } from 'react' // Import Suspense
import NextTopLoader from 'nextjs-toploader'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { TrackingProvider } from '@/components/providers/tracking-provider'
import { FingerprintProvider } from '@/components/providers/fingerprint-provider'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AnalyticsEventTracker } from '@/components/app/analytics-event-tracker'
import Script from 'next/script'

const interphases = localFont({
  src: [
    {
      path: './fonts/TT_Interphases_Pro/TT_Interphases_Pro_Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/TT_Interphases_Pro/TT_Interphases_Pro_Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/TT_Interphases_Pro/TT_Interphases_Pro_Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/TT_Interphases_Pro/TT_Interphases_Pro_DemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
})

const interphasesMono = localFont({
  src: [
    {
      path: './fonts/TT_Interphases_Pro_Mono/TT_Interphases_Pro_Mono_Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://renderarena.novita.ai'
const siteName = 'Novita Render Areana'
const siteTitle = 'Novita Render Areana - Visual AI Battle | Open Source vs Proprietary Models'
const siteDescription =
  'Watch AI models compete in real-time visual generation. Compare open-source (DeepSeek, GLM, Minimax) vs proprietary (GPT, Claude, Gemini) models side-by-side. Create stunning interactive visuals from prompts.'
const ogImage = '/images/visual-cover.png'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'AI model comparison',
    'visual generation',
    'open source vs proprietary',
    'DeepSeek',
    'GLM',
    'Minimax',
    'GPT',
    'Claude',
    'Gemini',
    'AI battle',
    'model arena',
  ],
  authors: [{ name: 'Novita AI', url: 'https://novita.ai' }],
  creator: 'Novita AI',
  publisher: 'Novita AI',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'Novita Render Areana - Visual AI Model Battle Platform',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@novita_labs',
    creator: '@novita_labs',
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },

  // Facebook-specific metadata
  // If you have a Facebook App ID, uncomment and add it here:
  // facebook: {
  //   appId: 'YOUR_FACEBOOK_APP_ID',
  // },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical URL - prevents duplicate content issues
  alternates: {
    canonical: siteUrl,
  },

  // Verification tokens for search engines (add when available)
  // verification: {
  //   google: 'your-google-verification-token',
  //   yandex: 'your-yandex-verification-token',
  //   bing: 'your-bing-verification-token',
  // },

  // Category for app stores/platforms
  category: 'Technology',
}

// Viewport configuration (separate export in App Router)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={` ${interphases.variable} ${interphasesMono.variable} antialiased`}>
        <NextTopLoader
          color="#23d57c"
          showSpinner={false}
          shadow="0 0 10px #23d57c,0 0 5px #23d57c"
        />
        <Suspense fallback={null}>
          <AnalyticsEventTracker />
        </Suspense>
        <FingerprintProvider />
        <TrackingProvider />
        <div className="root">{children}</div>
        <ToastProvider />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-6E3YJT3N0F" />
        <Script id="microsoft-clarity-analytics">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v9cf5z2id0");
          `}
        </Script>
      </body>
    </html>
  )
}
