'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Heart, Copy, Box, ChevronDown, Download } from 'lucide-react';
import Image from 'next/image';
import { galleryCategories, getModelById, playgroundModes, type GalleryCategoryId } from '@/lib/config';
import { useRouter } from 'next/navigation';
import type { GalleryApp } from '@/types';
import DOMPurify from 'isomorphic-dompurify';
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer';

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
  const [isLiking, setIsLiking] = useState(false);
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

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/apps/${app.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.status === 401) {
        alert('请先登录后再点赞');
        return;
      }

      if (data.success) {
        setLikeCount(data.likeCount);
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(app.prompt);
      router.push(`/playground/new?prompt=${encodeURIComponent(app.prompt)}&category=${encodeURIComponent(currentCategory)}`);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className="
        group relative flex flex-col gap-4
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
        className="bg-[#ececf0] relative flex w-full aspect-[8/3] overflow-hidden rounded-2xl cursor-pointer"
      >
        {/* Video or Image Preview or Iframe */}
        {hasVideo ? (
          <>
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
                className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                data-note="Video loads on first hover and persists to avoid reload flash"
                style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
                allowFullScreen
              />
            )}
          </>
        ) : (
          <div className='absolute inset-0 w-full h-full flex'>
            <iframe
            srcDoc={DOMPurify.sanitize(app.html_content_a || '', DOMPURIFY_CONFIG)}
            className="absolute inset-0 w-1/2 h-full border-0 bg-white transition-opacity duration-500 opacity-100"
            title={app.name || 'App Preview'}
            sandbox="allow-scripts"
            style={{ 
              pointerEvents: 'none', 
              transform: 'scale(0.25)', 
              transformOrigin: '0px 0px', 
              width: '200%',
              height: '400%' 
            }}
          />
          <iframe
            srcDoc={DOMPurify.sanitize(app.html_content_b || '', DOMPURIFY_CONFIG)}
            className="absolute inset-0 w-1/2 left-1/2 border-0 bg-white transition-opacity duration-500 opacity-100"
            title={app.name || 'App Preview'}
            sandbox="allow-scripts"
            style={{ 
              pointerEvents: 'none', 
              transform: 'scale(0.25)', 
              transformOrigin: '0px 0px', 
              width: '200%',
              height: '400%' 
            }}
          />
            </div>
          
        )}

        {/* Model Badge */}
        {modelA ? <div className="absolute top-[18px] left-3 z-10">
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
        </div> : null}
        {
          modelB ? <div className="absolute top-[18px] right-3 z-10">
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
          </div> : null
        }
      </div>

      <div className="flex flex-1 flex-col justify-between px-0 pt-3 pb-0">
        <div className="space-y-1">
          <h3 className="
            text-[#0a0a0a]
            line-clamp-1 text-2xl font-semibold leading-[38px] font-sans
          ">
            {app.name || 'Untitled App'}
          </h3>
          <p className="
            text-[#9e9c98] line-clamp-1 text-base font-normal leading-6 font-sans
          ">
            by @{app.user_email?.split('@')[0] || 'anonymous'}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
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
              <Copy className="size-5" />
              <span className="font-sans">Remix</span>
            </button>
          </div>

          <button
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm
              font-medium transition-all cursor-pointer shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
              ${isLiked
                ? 'text-[#f23030] border-red-200 bg-red-50'
                : 'text-[#4f4e4a] border-black/10 bg-[#f5f5f5] hover:border-gray-300'
              }
              ${isLiking ? 'opacity-50' : ''}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={isLiking}
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
      const response = await fetch(`/api/apps?category=${cat}&page=${pageNum}&limit=6`);
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

  if (loading && apps.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Box className="size-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground/80">No apps yet</h3>
        <p className="text-sm text-muted-foreground">Be the first to create and share an app!</p>
      </div>
    );
  }

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
      {/* Apps Grid */}
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
    </div>
  );
}
