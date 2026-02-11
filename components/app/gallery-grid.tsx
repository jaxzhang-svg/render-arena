'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Heart, Box, ChevronDown, Combine } from 'lucide-react'
import Image from 'next/image'
import { getModelById, playgroundModes, type GalleryCategoryId } from '@/lib/config'
import { useRouter } from 'next/navigation'
import type { GalleryApp } from '@/types'

import { showToast } from '@/lib/toast'
import { Skeleton } from '@/components/ui/skeleton'
import { trackRemixStarted } from '@/lib/analytics'
import {
  hasValidStreamVideo,
  getStreamIframeUrl,
  getStreamThumbnailUrl,
} from '@/lib/cloudflare-stream'

interface GalleryGridProps {
  initialApps?: GalleryApp[]
  selectedCategory: GalleryCategoryId
}

interface GalleryAppCardProps {
  app: GalleryApp
  currentCategory: GalleryCategoryId
  position: number
}

function GalleryAppCard({ app, currentCategory }: GalleryAppCardProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(app.like_count)
  const [isLiked, setIsLiked] = useState(app.isLiked || false)

  // Refs to track state for synchronization without causing re-renders or staleness
  const isLikedRef = useRef(app.isLiked || false)
  const serverLikedRef = useRef(app.isLiked || false)
  const isSyncingRef = useRef(false)

  // Sync state with props when they change (e.g., list refresh)
  useEffect(() => {
    setLikeCount(app.like_count)
    setIsLiked(app.isLiked || false)
    isLikedRef.current = app.isLiked || false
    serverLikedRef.current = app.isLiked || false
    serverLikedRef.current = app.isLiked || false
  }, [app.like_count, app.isLiked])

  const [isHovered, setIsHovered] = useState(false)
  const [hasHovered, setHasHovered] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const modelA = getModelById(app.model_a)
  const modelB = getModelById(app.model_b)

  // Check if this app has a video preview
  const hasVideo = hasValidStreamVideo(app.preview_video_url)

  // Construct video URLs using utility functions
  const thumbnailUrl = getStreamThumbnailUrl(app.preview_video_url, { time: '1s' })
  const videoUrl = getStreamIframeUrl(app.preview_video_url, {
    muted: true,
    loop: true,
    autoplay: true,
    controls: false,
    poster: thumbnailUrl || undefined,
  })

  const handleLike = useCallback(async () => {
    // 1. Optimistic Update
    const nextIsLiked = !isLikedRef.current
    isLikedRef.current = nextIsLiked
    setIsLiked(nextIsLiked)
    setLikeCount(prev => (nextIsLiked ? prev + 1 : prev - 1))

    // 2. Synchronization Logic
    const sync = async () => {
      if (isSyncingRef.current) return

      // If server state matches user intent, no need to sync
      if (serverLikedRef.current === isLikedRef.current) return

      isSyncingRef.current = true

      try {
        // Loop until server state catches up with user intent
        while (serverLikedRef.current !== isLikedRef.current) {
          // Send the target state we WANT to achieve
          const targetState = isLikedRef.current

          const response = await fetch(`/api/apps/${app.id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ liked: targetState }),
          })

          if (response.status === 401) {
            showToast.login('Log in to like this post', 'like')
            // Revert code
            isLikedRef.current = serverLikedRef.current
            setIsLiked(serverLikedRef.current)
            setLikeCount(app.like_count) // Reset to original count as best guess
            return
          }

          const data = await response.json()

          if (data.success) {
            serverLikedRef.current = data.liked
            // Optionally update count from server to be precise,
            // but we must be careful not to override optimistic updates if user clicked again.
            // Since we are in a loop, and 'data.liked' corresponds to the result of THIS call,
            // we can trust 'data.likeCount' for THAT state.
            // However, if intended state changed again, we'll loop again.
            // Using server count is safer for eventual consistency.
            //  if (serverLikedRef.current === isLikedRef.current) {
            //     setLikeCount(data.likeCount);
            //  }
          } else {
            // Server error, revert
            console.error('Like failed:', data)
            isLikedRef.current = serverLikedRef.current
            setIsLiked(serverLikedRef.current)
            // Revert count? Roughly:
            setLikeCount(prev => (serverLikedRef.current ? prev + 1 : prev - 1))
            return
          }
        }
      } catch (error) {
        console.error('Failed to like:', error)
        // Network error, revert
        isLikedRef.current = serverLikedRef.current
        setIsLiked(serverLikedRef.current)
        setLikeCount(prev => (serverLikedRef.current ? prev + 1 : prev - 1))
      } finally {
        isSyncingRef.current = false
        // Double check in case of race condition at the very end
        if (serverLikedRef.current !== isLikedRef.current) {
          sync()
        }
      }
    }

    sync()
  }, [app.id, app.like_count])

  const handleCopy = async () => {
    try {
      trackRemixStarted(app.id)
      await navigator.clipboard.writeText(app.prompt)
      router.push(
        `/playground/new?prompt=${encodeURIComponent(app.prompt)}&category=${encodeURIComponent(currentCategory)}`
      )
    } catch (error) {
      console.error('Failed to copy:', error)
      showToast.error('Failed to copy')
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden">
      <div
        onClick={() => {
          router.push(`/gallery/${app.id}`)
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          setHasHovered(true)
        }}
        onMouseLeave={() => setIsHovered(false)}
        className="group/card relative flex aspect-[8/3] w-full cursor-pointer overflow-hidden rounded-2xl bg-[#ececf0]"
      >
        {/* Video or Image Preview or Iframe */}
        {hasVideo ? (
          <div className="absolute inset-0 size-full origin-center transition-transform duration-700 ease-in-out group-hover/card:scale-110">
            <Image
              src={thumbnailUrl || '/images/default-poster.png'}
              alt={app.name || 'App Preview'}
              fill
              className="h-full w-full object-contain"
              unoptimized
            />
            {hasHovered && (
              <iframe
                ref={iframeRef}
                src={videoUrl!}
                className={`pointer-events-none absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                sandbox="allow-scripts allow-forms"
                allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
                data-note="Video loads on first hover and persists to avoid reload flash"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 size-full origin-center transition-transform duration-700 ease-in-out group-hover/card:scale-110">
            <div className="absolute inset-0 flex h-full w-full">
              <div className="relative h-full w-1/2 overflow-hidden">
                <iframe
                  srcDoc={`<style>html,body{margin:0;padding:0;overflow:hidden;}</style>${app.html_content_a || ''}`}
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                  title={app.name || 'App Preview'}
                  sandbox="allow-scripts allow-forms"
                  allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
                  style={{
                    pointerEvents: 'none',
                    transform: 'scale(0.25)',
                    transformOrigin: '0px 0px',
                    width: '400%',
                    height: '400%',
                  }}
                />
              </div>
              <div className="relative h-full w-1/2 overflow-hidden">
                <iframe
                  srcDoc={`<style>html,body{margin:0;padding:0;overflow:hidden;}</style>${app.html_content_b || ''}`}
                  className="absolute inset-0 h-full w-full border-0 bg-white"
                  title={app.name || 'App Preview'}
                  sandbox="allow-scripts allow-forms"
                  allow="accelerometer; autoplay; fullscreen; clipboard-write; web-share; encrypted-media; gyroscope;"
                  style={{
                    pointerEvents: 'none',
                    transform: 'scale(0.25)',
                    transformOrigin: '0px 0px',
                    width: '400%',
                    height: '400%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Model Badge */}
        {modelA ? (
          <div className="absolute top-[18px] left-3 z-10 flex flex-col items-start gap-1">
            <div
              className="inline-flex h-[30px] items-center gap-1.5 border border-white/10 bg-black/70 px-[10px] font-sans text-sm font-medium text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md"
              style={{ borderRadius: '15px' }}
            >
              <Image
                src={modelA.icon}
                alt={modelA.name}
                width={20}
                height={20}
                className={`size-5 rounded-sm ${modelA.color === '#000' ? 'invert' : ''}`}
              />
              {modelA?.name}
            </div>
            {(app.duration_a || app.tokens_a) && (
              <div className="inline-flex h-[20px] items-center gap-1 rounded-full border border-white/5 bg-black/50 px-2 font-sans text-[10px] font-medium text-white/80 backdrop-blur-md">
                {app.duration_a && <span>{app.duration_a.toFixed(1)}s</span>}
                {app.duration_a && app.tokens_a && <span className="text-white/40">|</span>}
                {app.tokens_a && <span>{app.tokens_a}t</span>}
              </div>
            )}
          </div>
        ) : null}
        {modelB ? (
          <div className="absolute top-[18px] right-3 z-10 flex flex-col items-end gap-1">
            <div
              className="inline-flex h-[30px] items-center gap-1.5 border border-white/10 bg-black/70 px-[10px] text-sm font-medium text-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md"
              style={{ borderRadius: '15px' }}
            >
              <Image
                src={modelB.icon}
                alt={modelB.name}
                width={20}
                height={20}
                className={`size-5 rounded-sm ${modelB.color === '#000' ? 'invert' : ''}`}
              />
              {modelB.name}
            </div>
            {(app.duration_b || app.tokens_b) && (
              <div className="inline-flex h-[20px] items-center gap-1 rounded-full border border-white/5 bg-black/50 px-2 font-sans text-[10px] font-medium text-white/80 backdrop-blur-md">
                {app.duration_b && <span>{app.duration_b.toFixed(1)}s</span>}
                {app.duration_b && app.tokens_b && <span className="text-white/40">|</span>}
                {app.tokens_b && <span>{app.tokens_b}t</span>}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between px-0 pt-3 pb-0">
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-sans text-2xl leading-[28px] font-semibold text-[#0a0a0a]">
            {app.name || 'Untitled App'}
          </h3>
          <p className="line-clamp-1 font-sans text-base leading-6 font-normal text-[#9e9c98]">
            by @{app.user_email?.split('@')[0] || 'anonymous'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between pb-1">
          <div className="flex items-center gap-4">
            <button
              className="hover:text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium text-[#4f4e4a] transition-colors"
              title="Copy Prompt"
              onClick={e => {
                e.stopPropagation()
                handleCopy()
              }}
            >
              <Combine className="size-5" />
              <span className="font-sans">Remix</span>
            </button>
          </div>

          <button
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all ${
              isLiked
                ? 'border-red-200 bg-red-50 text-[#f23030]'
                : 'border-black/10 text-[#4f4e4a] hover:border-gray-300 hover:bg-[#f5f5f5]'
            } `}
            onClick={e => {
              e.stopPropagation()
              handleLike()
            }}
          >
            <Heart className={`size-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-sans">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function GalleryGrid({ initialApps = [], selectedCategory }: GalleryGridProps) {
  const [apps, setApps] = useState<GalleryApp[]>(initialApps)
  const [loading, setLoading] = useState(initialApps.length === 0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [, setTotal] = useState(0)

  const currentCategory = playgroundModes.find(m => m.id === selectedCategory)

  const fetchApps = useCallback(async (pageNum: number, cat: GalleryCategoryId, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const response = await fetch(`/api/apps?category=${cat}&page=${pageNum}&limit=6`, {
        cache: 'no-store',
      })
      const data = await response.json()

      if (append) {
        setApps(prev => [...prev, ...data.apps])
      } else {
        setApps(data.apps)
      }
      setTotal(data.total)
      setHasMore(data?.apps?.length === 6 && pageNum * 6 < data.total)
    } catch (error) {
      console.error('Error fetching apps:', error)
      showToast.error('Failed to fetch apps')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setPage(1) // Reset page when category changes
    fetchApps(1, selectedCategory)
  }, [selectedCategory, fetchApps])

  const handleLoadMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.blur()
    const nextPage = page + 1
    setPage(nextPage)
    fetchApps(nextPage, selectedCategory, true)
  }

  return (
    <div>
      {selectedCategory !== 'all' && currentCategory ? (
        <div className="mb-8">
          <h2 className="text-2xl leading-[38px] font-semibold text-[#292827] capitalize">
            {currentCategory.label}
          </h2>
          <h2 className="font-sans text-base leading-6 font-normal text-[#4F4E4A]">
            {currentCategory.description}
          </h2>
        </div>
      ) : null}

      {/* Loading State - Render Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* Card Image Skeleton */}
              <Skeleton className="aspect-[8/3] w-full rounded-2xl" />

              {/* Card Footer Skeleton */}
              <div className="flex flex-col justify-between space-y-3 px-0 pt-3 pb-0">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4 rounded-md" />
                  <Skeleton className="h-5 w-1/3 rounded-md" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : apps?.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box className="text-muted-foreground/40 mb-4 size-16" />
          <h3 className="text-foreground/80 text-lg font-semibold">No apps yet</h3>
          <p className="text-muted-foreground text-sm">Be the first to create and share an app!</p>
        </div>
      ) : (
        /* Apps Grid */
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {apps?.map((app, index) => (
              <GalleryAppCard
                key={app.id}
                app={app}
                currentCategory={selectedCategory}
                position={index}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-8 font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load more apps
                    <ChevronDown className="size-5" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
