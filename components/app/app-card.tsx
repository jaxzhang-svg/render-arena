'use client';

import { Heart, Copy, Code, Gamepad2, Box, Sparkles, Image as ImageIcon, Video, PenTool, Zap } from 'lucide-react';
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
    <div
      onClick={() => router.push('/playground')}
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
        ">
          <div
            className="
              absolute inset-0 bg-cover bg-center transition-transform
              duration-700
              group-hover:scale-105
            "
            style={{ backgroundImage: `url(${app.thumbnailA})` }}
          />
          <div className="absolute top-3 left-3 z-10">
            <ModelBadge model={app.modelA} size="sm" />
          </div>
        </div>

        {/* Right Side - Model B */}
        <div className="relative h-full w-1/2 overflow-hidden">
          <div
            className="
              absolute inset-0 bg-cover bg-center transition-transform
              duration-700
              group-hover:scale-105
            "
            style={{ backgroundImage: `url(${app.thumbnailB})` }}
          />
           <div className="absolute top-3 right-3 z-10">
            <ModelBadge model={app.modelB} size="sm" />
          </div>
        </div>

        {/* VS Badge / Run Button Interaction */}
        <div className="absolute top-1/2 left-1/2 z-20 -translate-1/2">
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
            
            {/* Run Button (appears on hover) */}
            <div className="
              bg-primary text-primary-foreground absolute flex scale-0
              items-center justify-center gap-2 rounded-full px-5 py-2.5
              font-bold whitespace-nowrap opacity-0 shadow-2xl transition-all
              duration-300
              group-hover:scale-100 group-hover:opacity-100
            ">
               Run Battle
            </div>
          </div>
        </div>

        {/* Hover Overlay - Subtle Darkening for Contrast */}
        <div className="
          pointer-events-none absolute inset-0 bg-black/5 opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        " />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1">
          <div className="
            text-muted-foreground/80 flex items-center gap-1.5 text-xs
            font-semibold tracking-wider uppercase
          ">
            {(() => {
              const Icon = categoryIcons[app.category];
              return Icon ? <Icon className="size-3.5" /> : null;
            })()}
            {app.category}
          </div>
          <h3 className="
            text-foreground/90
            line-clamp-1 text-lg/tight font-black tracking-tight
            transition-colors
          ">
            {app.title}
          </h3>
          <p className="
            text-muted-foreground/60 flex items-center gap-1 text-xs font-medium
          ">
            by <span className="
              hover:text-foreground
              cursor-pointer transition-colors
              hover:underline
            " onClick={(e) => e.stopPropagation()}>@{app.author}</span>
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
              // Add copy logic here if needed
            }}
          >
            <Copy className="size-3.5" />
            <span className="text-xs font-semibold">Copy</span>
          </button>

          <button 
            className="
              group/like text-muted-foreground/70 -mr-2 flex cursor-pointer
              items-center gap-1.5 rounded-lg px-2 py-1 transition-colors
              hover:bg-rose-500/5 hover:text-rose-500
            "
            onClick={(e) => {
              e.stopPropagation();
              // Add like logic here if needed
            }}
          >
            <Heart className="
              size-3.5 transition-colors
              group-hover/like:fill-current
            " />
            <span className="text-xs font-semibold tabular-nums">
              {app.likes >= 1000 ? `${(app.likes / 1000).toFixed(1)}k` : app.likes}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
