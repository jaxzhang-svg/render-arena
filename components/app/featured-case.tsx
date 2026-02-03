'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { playgroundModes } from '@/lib/config'
import { cn } from '@/lib/utils'
import { hasValidStreamVideo, getStreamIframeUrl } from '@/lib/cloudflare-stream'

interface FeaturedCaseCardProps {
  mode: (typeof playgroundModes)[number]
}

function FeaturedCaseCard({ mode }: FeaturedCaseCardProps) {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const [hasHovered, setHasHovered] = useState(false)

  const videoId = mode.videoUrl
  const coverImage = mode.coverImage

  const hasVideo = hasValidStreamVideo(videoId)
  const cfVideoUrl = getStreamIframeUrl(videoId, {
    muted: true,
    loop: true,
    autoplay: true,
    controls: false,
  })

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation()

    router.push(`/gallery/${mode.featuredAppId}`)
  }

  return (
    <div
      className="group relative h-[146px] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-[14px] bg-[#18181b]"
      onMouseEnter={() => {
        setIsHovering(true)
        setHasHovered(true)
      }}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleCreate}
    >
      {/* Background Image & Video Layer - with zoom effect */}
      <div className="absolute inset-0 size-full origin-center transition-transform duration-700 ease-in-out group-hover:scale-110">
        <Image
          src={coverImage || ''}
          alt={mode.label}
          fill
          className={cn('object-cover transition-opacity duration-300')}
        />
        {/* Gradient Overlay - Darker at bottom for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Cloudflare Video Layer */}
        {hasVideo && hasHovered && (
          <iframe
            src={cfVideoUrl!}
            className={cn(
              'absolute inset-0 size-full border-0 transition-opacity duration-300',
              isHovering ? 'opacity-100' : 'opacity-0'
            )}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </div>

      {/* GENERATED Badge */}
      <div className="absolute top-3 left-3 z-20 rounded-[4px] bg-[#1f1f1f] px-2 py-1 text-[10px] leading-none font-bold tracking-wide text-white uppercase shadow-sm">
        GENERATED
      </div>

      {/* Content Layer - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-start gap-1 p-4">
        {/* Title - Mode Label */}
        <h3 className="text-left font-sans text-[18px] leading-6 font-semibold text-white drop-shadow-sm">
          {mode.label}
        </h3>

        {/* Description - Mode Description */}
        <p className="line-clamp-2 text-left font-sans text-[12px] leading-4 font-normal text-white/90 drop-shadow-sm">
          {mode.description}
        </p>
      </div>
    </div>
  )
}

export function FeaturedCasesSection() {
  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playgroundModes
            .filter(mode => mode.id !== 'general')
            .map(mode => (
              <FeaturedCaseCard key={mode.id} mode={mode} />
            ))}
        </div>
      </div>
    </div>
  )
}
