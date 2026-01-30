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

export const metadata: Metadata = {
  title: 'Novita Areana',
  description: '',
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
