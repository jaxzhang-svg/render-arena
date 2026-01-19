'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heart, Copy, Code, Gamepad2, Box, Sparkles, Image as ImageIcon, Video, PenTool, Zap, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { GalleryApp } from '@/types';
import { getModelById, models } from '@/lib/models';

interface GalleryGridProps {
  initialApps?: GalleryApp[];
}

const categoryIcons: Record<string, React.ElementType> = {
  'Website': Code,
  'Game': Gamepad2,
  '3D Scene': Box,
  'Physics': Zap,
  'Visual Effect': Sparkles,
  'Image': ImageIcon,
  'Video': Video,
  'Logo': PenTool,
};

function GalleryAppCard({ app }: { app: GalleryApp }) {
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(app.like_count);
  const [isLiked, setIsLiked] = useState(app.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  
  const modelA = getModelById(app.model_a) || models[0];
  const modelB = getModelById(app.model_b) || models[1];

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
        // 用户未登录，可以提示登录
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

  // 从 prompt 中推断类别
  const inferCategory = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('game') || lowerPrompt.includes('play')) return 'Game';
    if (lowerPrompt.includes('3d') || lowerPrompt.includes('three')) return '3D Scene';
    if (lowerPrompt.includes('physics') || lowerPrompt.includes('simulation')) return 'Physics';
    if (lowerPrompt.includes('effect') || lowerPrompt.includes('animation')) return 'Visual Effect';
    if (lowerPrompt.includes('image') || lowerPrompt.includes('photo')) return 'Image';
    if (lowerPrompt.includes('video')) return 'Video';
    if (lowerPrompt.includes('logo') || lowerPrompt.includes('icon')) return 'Logo';
    return 'Website';
  };

  const category = inferCategory(app.prompt);
  const CategoryIcon = categoryIcons[category] || Code;

  return (
    <div
      onClick={() => router.push(`/gallery/${app.id}`)}
      className="
        group bg-card ring-border/50 relative flex cursor-pointer flex-col gap-4
        overflow-hidden rounded-2xl border-0 py-0 shadow-lg ring-1
        shadow-black/5 transition-all duration-300
        hover:shadow-xl hover:shadow-black/10
      "
    >
      <div className="bg-muted relative flex aspect-8/3 w-full overflow-hidden">
        {/* Left Side - Model A */}
        <div className="
          relative h-full w-1/2 overflow-hidden border-r border-white/20
          bg-gradient-to-br from-gray-100 to-gray-200
        ">
          {/* 使用 prompt 的首字母作为占位符 */}
          <div className="flex h-full items-center justify-center">
            <div className={`size-12 rounded-lg ${modelA.color} flex items-center justify-center`}>
              <span className="text-white text-lg font-bold">A</span>
            </div>
          </div>
          <div className="absolute top-3 left-3 z-10">
            <div className={`
              inline-flex items-center gap-1.5 rounded-full px-2 py-1
              text-xs font-medium text-white backdrop-blur-md
              ${modelA.color}
            `}>
              {modelA.name}
            </div>
          </div>
        </div>

        {/* Right Side - Model B */}
        <div className="
          relative h-full w-1/2 overflow-hidden
          bg-gradient-to-br from-gray-200 to-gray-300
        ">
          <div className="flex h-full items-center justify-center">
            <div className={`size-12 rounded-lg ${modelB.color} flex items-center justify-center`}>
              <span className="text-white text-lg font-bold">B</span>
            </div>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <div className={`
              inline-flex items-center gap-1.5 rounded-full px-2 py-1
              text-xs font-medium text-white backdrop-blur-md
              ${modelB.color}
            `}>
              {modelB.name}
            </div>
          </div>
        </div>

        {/* VS Badge / Run Button Interaction */}
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center">
            {/* VS Circle */}
            <div className="
              bg-background/90 border-border flex size-10 items-center
              justify-center rounded-full border shadow-xl backdrop-blur-md
              transition-all duration-300
              group-hover:scale-0 group-hover:opacity-0
            ">
              <span className="text-muted-foreground text-xs font-black italic">VS</span>
            </div>
            
            {/* View Button (appears on hover) */}
            <div className="
              bg-primary text-primary-foreground absolute flex scale-0
              items-center justify-center gap-2 rounded-full px-5 py-2.5
              font-bold whitespace-nowrap opacity-0 shadow-2xl transition-all
              duration-300
              group-hover:scale-100 group-hover:opacity-100
            ">
               View Battle
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1">
          <div className="
            text-muted-foreground/80 flex items-center gap-1.5 text-xs
            font-semibold tracking-wider uppercase
          ">
            <CategoryIcon className="size-3.5" />
            {category}
          </div>
          <h3 className="
            text-foreground/90
            line-clamp-1 text-lg/tight font-black tracking-tight
            transition-colors
          ">
            {app.name || app.prompt.slice(0, 50)}
          </h3>
          <p className="
            text-muted-foreground/60 line-clamp-2 text-xs font-medium
          ">
            {app.prompt}
          </p>
        </div>
        
        <div className="mt-3 flex items-center justify-between pt-1">
          <button 
            className="
              group/copy text-muted-foreground/70
              hover:text-foreground hover:bg-foreground/5
              -ml-2 flex cursor-pointer items-center gap-1.5 rounded-lg px-2
              py-1 transition-colors
            "
            title="Copy Prompt"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/playground/new?prompt=${encodeURIComponent(app.prompt)}`);
            }}
          >
            <Copy className="size-3.5" />
            <span className="text-xs font-semibold">Copy</span>
          </button>
          
          <button
            className={`
              flex items-center gap-1.5 text-xs
              font-semibold transition-colors cursor-pointer
              ${isLiked ? 'text-red-500' : 'text-muted-foreground/60 hover:text-red-500'}
              ${isLiking ? 'opacity-50' : ''}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={isLiking}
          >
            <Heart className={`size-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryGrid({ initialApps = [] }: GalleryGridProps) {
  const [apps, setApps] = useState<GalleryApp[]>(initialApps);
  const [loading, setLoading] = useState(initialApps.length === 0);
  const [category, setCategory] = useState<'latest' | 'hot'>('latest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchApps = useCallback(async (pageNum: number, cat: 'latest' | 'hot', append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/apps?category=${cat}&page=${pageNum}&limit=20`);
      const data = await response.json();
      
      if (append) {
        setApps(prev => [...prev, ...data.apps]);
      } else {
        setApps(data.apps);
      }
      setTotal(data.total);
      setHasMore(data?.apps.length === 20 && pageNum * 20 < data.total);
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps(1, category);
  }, [category, fetchApps]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchApps(nextPage, category, true);
  };

  const handleCategoryChange = (cat: 'latest' | 'hot') => {
    setCategory(cat);
    setPage(1);
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
      {/* Category Filter */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => handleCategoryChange('latest')}
          className={`
            flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors
            ${category === 'latest'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <Clock className="size-4" />
          Latest
        </button>
        <button
          onClick={() => handleCategoryChange('hot')}
          className={`
            flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors
            ${category === 'hot'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <TrendingUp className="size-4" />
          Trending
        </button>
        <span className="text-sm text-muted-foreground">
          {total} apps
        </span>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {apps.map((app) => (
          <GalleryAppCard key={app.id} app={app} />
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
