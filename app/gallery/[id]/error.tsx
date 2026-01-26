'use client'

import { useEffect } from 'react'
import { ForbiddenPage } from '@/components/app/forbidden-page'

export default function GalleryError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const isForbidden = error.digest === 'FORBIDDEN'

  useEffect(() => {
    if (!isForbidden) {
      console.error('Gallery error:', error)
    }
  }, [error, isForbidden])

  if (isForbidden) {
    return (
      <ForbiddenPage
        title="Gallery"
        message="This is a private creation that only its owner can view. Create your own amazing works in the Arena!"
        primaryButton={{ href: '/', label: 'Start Creating' }}
        secondaryButton={{ href: '/#gallery', label: 'Browse Gallery' }}
      />
    )
  }

  // Fallback for other errors - show minimal error UI
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-4 font-sans text-2xl font-semibold text-[#292827]">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-[400px] text-lg text-[#4f4e4a]">
        An unexpected error occurred. Please try again later.
      </p>
      <a
        href="/#gallery"
        className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-white transition-all hover:scale-105 hover:bg-black hover:shadow-lg active:scale-95"
      >
        <span className="font-medium">Back to Gallery</span>
      </a>
    </div>
  )
}
