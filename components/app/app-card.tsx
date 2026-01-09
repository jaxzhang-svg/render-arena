'use client';

import { Card } from '@/components/ui/card';
import { Heart, GitFork, Copy, Code, Gamepad2, Box, Sparkles, Image as ImageIcon, Video, PenTool, Zap } from 'lucide-react';
import { AppCard as AppCardType } from '@/types';
import { ModelBadge } from './model-badge';
import { useRouter } from 'next/navigation';

interface AppCardProps {
  app: AppCardType;
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

export function AppCard({ app }: AppCardProps) {
  const router = useRouter();

  return (
    <Card 
      onClick={() => router.push('/playground')}
      className="group relative flex flex-col overflow-hidden py-0 border-0 bg-card gap-4 rounded-2xl shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 cursor-pointer ring-1 ring-border/50"
    >
      <div className="relative aspect-[8/3] w-full overflow-hidden bg-muted flex">
        {/* Left Side - Model A */}
        <div className="relative w-1/2 h-full border-r-[1px] border-white/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${app.thumbnailA})` }}
          />
          <div className="absolute top-3 left-3 z-10">
            <ModelBadge model={app.modelA} size="sm" />
          </div>
        </div>

        {/* Right Side - Model B */}
        <div className="relative w-1/2 h-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${app.thumbnailB})` }}
          />
           <div className="absolute top-3 right-3 z-10">
            <ModelBadge model={app.modelB} size="sm" />
          </div>
        </div>

        {/* VS Badge / Run Button Interaction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative flex items-center justify-center">
            {/* VS Circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-md shadow-xl border border-border transition-all duration-300 group-hover:scale-0 group-hover:opacity-0">
              <span className="text-xs font-black italic text-muted-foreground">VS</span>
            </div>
            
            {/* Run Button (appears on hover) */}
            <div className="absolute flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground shadow-2xl transition-all duration-300 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap font-bold">
               Run Battle
            </div>
          </div>
        </div>

        {/* Hover Overlay - Subtle Darkening for Contrast */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {(() => {
              const Icon = categoryIcons[app.category];
              return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
            })()}
            {app.category}
          </div>
          <h3 className="line-clamp-1 text-lg font-black leading-tight tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
            {app.title}
          </h3>
          <p className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1">
            by <span className="cursor-pointer hover:underline hover:text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>@{app.author}</span>
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-1">
          <button 
            className="group/copy flex items-center gap-1.5 text-muted-foreground/70 transition-colors hover:text-foreground cursor-pointer px-2 py-1 rounded-lg hover:bg-foreground/5 -ml-2"
            title="Copy Prompt"
            onClick={(e) => {
              e.stopPropagation();
              // Add copy logic here if needed
            }}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Copy</span>
          </button>

          <button 
            className="group/like flex items-center gap-1.5 text-muted-foreground/70 transition-colors hover:text-rose-500 cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-500/5 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              // Add like logic here if needed
            }}
          >
            <Heart className="h-3.5 w-3.5 group-hover/like:fill-current transition-colors" />
            <span className="text-xs font-semibold tabular-nums">
              {app.likes >= 1000 ? `${(app.likes / 1000).toFixed(1)}k` : app.likes}
            </span>
          </button>
        </div>
      </div>
    </Card>
  );
}
