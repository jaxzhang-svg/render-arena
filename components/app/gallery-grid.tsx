'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Heart, Copy, Box, ChevronDown, Download, Combine } from 'lucide-react';
import Image from 'next/image';
import { galleryCategories, getModelById, playgroundModes, type GalleryCategoryId } from '@/lib/config';
import { useRouter } from 'next/navigation';
import type { GalleryApp } from '@/types';
import DOMPurify from 'isomorphic-dompurify';
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer';
import { showToast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';

// Cloudflare Stream customer code
const CLOUDFLARE_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || '';

interface GalleryGridProps {
  initialApps?: GalleryApp[];
  selectedCategory: GalleryCategoryId;
}

interface GalleryAppCardProps {
  app: GalleryApp;
  currentCategory: GalleryCategoryId;
}

function GalleryAppCard({ app, currentCategory }: GalleryAppCardProps) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(app.like_count);
  const [isLiked, setIsLiked] = useState(app.isLiked || false);

  // Refs to track state for synchronization without causing re-renders or staleness
  const isLikedRef = useRef(app.isLiked || false);
  const serverLikedRef = useRef(app.isLiked || false);
  const isSyncingRef = useRef(false);

  // Sync state with props when they change (e.g., list refresh)
  useEffect(() => {
    setLikeCount(app.like_count);
    setIsLiked(app.isLiked || false);
    isLikedRef.current = app.isLiked || false;
    serverLikedRef.current = app.isLiked || false;
    serverLikedRef.current = app.isLiked || false;
  }, [app.like_count, app.isLiked]);

  const [isHovered, setIsHovered] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const modelA = getModelById(app.model_a);
  const modelB = getModelById(app.model_b);

  // Check if this app has a video preview
  const hasVideo = !!app.preview_video_url && !!CLOUDFLARE_CUSTOMER_CODE;
  const videoUrl = hasVideo
    ? `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${app.preview_video_url}/iframe?muted=true&loop=true&autoplay=true&controls=false&poster=https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${app.preview_video_url}/thumbnails/thumbnail.jpg`
    : null;
  const thumbnailUrl = hasVideo
    ? `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${app.preview_video_url}/thumbnails/thumbnail.jpg?time=1s`
    : '/images/default-poster.png';

  const handleLike = useCallback(async () => {
    // 1. Optimistic Update
    const nextIsLiked = !isLikedRef.current;
    isLikedRef.current = nextIsLiked;
    setIsLiked(nextIsLiked);
    setLikeCount((prev) => (nextIsLiked ? prev + 1 : prev - 1));

    // 2. Synchronization Logic
    const sync = async () => {
      if (isSyncingRef.current) return;

      // If server state matches user intent, no need to sync
      if (serverLikedRef.current === isLikedRef.current) return;

      isSyncingRef.current = true;

      try {
        // Loop until server state catches up with user intent
        while (serverLikedRef.current !== isLikedRef.current) {
          // Send the target state we WANT to achieve
          const targetState = isLikedRef.current;

          const response = await fetch(`/api/apps/${app.id}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ liked: targetState }),
          });

          if (response.status === 401) {
            showToast.login('Please login to like');
            // Revert code
            isLikedRef.current = serverLikedRef.current;
            setIsLiked(serverLikedRef.current);
            setLikeCount(app.like_count); // Reset to original count as best guess
            return;
          }

          const data = await response.json();

          if (data.success) {
            serverLikedRef.current = data.liked;
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
            console.error('Like failed:', data);
            isLikedRef.current = serverLikedRef.current;
            setIsLiked(serverLikedRef.current);
            // Revert count? Roughly:
            setLikeCount((prev) => (serverLikedRef.current ? prev + 1 : prev - 1));
            return;
          }
        }
      } catch (error) {
        console.error('Failed to like:', error);
        // Network error, revert
        isLikedRef.current = serverLikedRef.current;
        setIsLiked(serverLikedRef.current);
        setLikeCount((prev) => (serverLikedRef.current ? prev + 1 : prev - 1));
      } finally {
        isSyncingRef.current = false;
        // Double check in case of race condition at the very end
        if (serverLikedRef.current !== isLikedRef.current) {
          sync();
        }
      }
    };

    sync();
  }, [app.id, app.like_count]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(app.prompt);
      router.push(`/playground/new?prompt=${encodeURIComponent(app.prompt)}&category=${encodeURIComponent(currentCategory)}`);
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast.error('Failed to copy');
    }
  };

  return (
    <div
      className="
        group relative flex flex-col
        overflow-hidden
      "
    >
      <div
        onClick={() => router.push(`/gallery/${app.id}`)}
        onMouseEnter={() => {
          setIsHovered(true);
          setHasHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-[#ececf0] group/card relative flex w-full aspect-[8/3] overflow-hidden rounded-2xl cursor-pointer"
      >
        {/* Video or Image Preview or Iframe */}
        {hasVideo ? (
          <div className="absolute inset-0 size-full transition-transform duration-700 ease-in-out group-hover/card:scale-110 origin-center">
            <Image
              src={thumbnailUrl}
              alt={app.name || 'App Preview'}
              fill
              className="w-full h-full object-contain"
              unoptimized
            />
            {hasHovered && (
              <iframe
                ref={iframeRef}
                src={videoUrl!}
                className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                data-note="Video loads on first hover and persists to avoid reload flash"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className='absolute inset-0 w-full h-full flex'>
            <div className='relative w-1/2 h-full overflow-hidden group/pane'>
              <div className='w-full h-full transition-transform duration-700 ease-in-out group-hover/pane:scale-110 origin-center'>
                <iframe
                  srcDoc={`<style>html,body{margin:0;padding:0;overflow:hidden;}</style>${DOMPurify.sanitize(app.html_content_a || '', DOMPURIFY_CONFIG)}`}
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  title={app.name || 'App Preview'}
                  sandbox="allow-scripts"
                  style={{
                    pointerEvents: 'none',
                    transform: 'scale(0.25)',
                    transformOrigin: '0px 0px',
                    width: '400%',
                    height: '400%'
                  }}
                />
              </div>
            </div>
            <div className='relative w-1/2 h-full overflow-hidden group/pane'>
              <div className='w-full h-full transition-transform duration-700 ease-in-out group-hover/pane:scale-110 origin-center'>
                <iframe
                  srcDoc={`<style>html,body{margin:0;padding:0;overflow:hidden;}</style>${DOMPurify.sanitize(app.html_content_b || '', DOMPURIFY_CONFIG)}`}
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  title={app.name || 'App Preview'}
                  sandbox="allow-scripts"
                  style={{
                    pointerEvents: 'none',
                    transform: 'scale(0.25)',
                    transformOrigin: '0px 0px',
                    width: '400%',
                    height: '400%'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Model Badge */}
        {modelA ? <div className="absolute top-[18px] left-3 z-10 flex flex-col gap-1 items-start">
          <div className="
              inline-flex items-center gap-1.5 px-[10px]
              text-sm font-medium font-sans text-white backdrop-blur-md h-[30px]
              bg-black/70 border border-white/10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
            " style={{ borderRadius: '15px' }}>
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
            <div className="
              inline-flex items-center gap-1 px-2
              text-[10px] font-medium font-sans text-white/80 backdrop-blur-md h-[20px]
              bg-black/50 border border-white/5 rounded-full
            ">
              {app.duration_a && <span>{app.duration_a.toFixed(1)}s</span>}
              {app.duration_a && app.tokens_a && <span className="text-white/40">|</span>}
              {app.tokens_a && <span>{app.tokens_a}t</span>}
            </div>
          )}
        </div> : null}
        {
          modelB ? <div className="absolute top-[18px] right-3 z-10 flex flex-col gap-1 items-end">
            <div className="
              inline-flex items-center gap-1.5 px-[10px]
              text-sm font-medium text-white backdrop-blur-md h-[30px]
              bg-black/70 border border-white/10 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
            " style={{ borderRadius: '15px' }}>
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
              <div className="
                inline-flex items-center gap-1 px-2
                text-[10px] font-medium font-sans text-white/80 backdrop-blur-md h-[20px]
                bg-black/50 border border-white/5 rounded-full
              ">
                {app.duration_b && <span>{app.duration_b.toFixed(1)}s</span>}
                {app.duration_b && app.tokens_b && <span className="text-white/40">|</span>}
                {app.tokens_b && <span>{app.tokens_b}t</span>}
              </div>
            )}
          </div> : null
        }
      </div>

      <div className="flex flex-1 flex-col justify-between px-0 pt-3 pb-0">
        <div className="space-y-1">
          <h3 className="
            text-[#0a0a0a]
            line-clamp-1 text-2xl font-semibold leading-[28px] font-sans
          ">
            {app.name || 'Untitled App'}
          </h3>
          <p className="
            text-[#9e9c98] line-clamp-1 text-base font-normal leading-6 font-sans
          ">
            by @{app.user_email?.split('@')[0] || 'anonymous'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between pb-1">
          <div className="flex items-center gap-4">
            <button
              className="
                text-[#4f4e4a]
                hover:text-foreground
                flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors
              "
              title="Copy Prompt"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
            >
              <Combine className="size-5" />
              <span className="font-sans">Remix</span>
            </button>
          </div>

          <button
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm
              font-medium transition-all cursor-pointer shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
              ${isLiked
                ? 'text-[#f23030] border-red-200 bg-red-50'
                : 'text-[#4f4e4a] border-black/10 hover:bg-[#f5f5f5] hover:border-gray-300'
              }
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
          >
            <Heart className={`size-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-sans">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({ initialApps = [], selectedCategory }: GalleryGridProps) {
  const [apps, setApps] = useState<GalleryApp[]>(initialApps);
  const [loading, setLoading] = useState(initialApps.length === 0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [, setTotal] = useState(0);

  const currentCategory = playgroundModes.find(m => m.id === selectedCategory);

  const fetchApps = useCallback(async (pageNum: number, cat: GalleryCategoryId, append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/apps?category=${cat}&page=${pageNum}&limit=6`, {
        cache: 'no-store'
      });
      const data = await response.json();

      if (append) {
        setApps(prev => [...prev, ...data.apps]);
      } else {
        setApps(data.apps);
      }
      setTotal(data.total);
      setHasMore(data?.apps?.length === 6 && pageNum * 6 < data.total);
    } catch (error) {
      console.error('Error fetching apps:', error);
      showToast.error('Failed to fetch apps');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1); // Reset page when category changes
    fetchApps(1, selectedCategory);
  }, [selectedCategory, fetchApps]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchApps(nextPage, selectedCategory, true);
  };

  return (
    <div>
      {(selectedCategory !== 'all' && currentCategory) ? <div className="mb-8">
        <h2 className="text-2xl font-semibold leading-[38px] text-[#292827] capitalize">
          {currentCategory.label}
        </h2>
        <h2 className='text-[#4F4E4A] text-base font-normal leading-6 font-sans'>
          {currentCategory.description}
        </h2>
      </div> : null}

      {/* Loading State - Render Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* Card Image Skeleton */}
              <Skeleton className="w-full aspect-[8/3] rounded-2xl" />

              {/* Card Footer Skeleton */}
              <div className="flex flex-col justify-between px-0 pt-3 pb-0 space-y-3">
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
      ) : apps.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box className="size-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground/80">No apps yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to create and share an app!</p>
        </div>
      ) : (
        /* Apps Grid */
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {apps.map((app) => (
              <GalleryAppCard key={app.id} app={app} currentCategory={selectedCategory} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex cursor-pointer items-center gap-2 h-10 px-8 rounded-lg border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
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
  );
}
