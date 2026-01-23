'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { playgroundModes } from '@/lib/config';
import { cn } from '@/lib/utils';

// Cloudflare Stream customer code
const CLOUDFLARE_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || '';

interface FeaturedCaseCardProps {
  mode: typeof playgroundModes[number];
}

function FeaturedCaseCard({ mode }: FeaturedCaseCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);

  const videoId = mode.videoUrl;
  const coverImage = mode.coverImage;

  const hasVideo = !!videoId && !!CLOUDFLARE_CUSTOMER_CODE;

  const cfVideoUrl = hasVideo
    ? `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoId}/iframe?muted=true&loop=true&autoplay=true&controls=false&preload=auto`
    : null;

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation();

    router.push(`/gallery/${mode.featuredAppId}`);
  };

  return (
    <div
        className="group relative h-[146px] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-[14px] bg-[#18181b]"
        onMouseEnter={() => {
            setIsHovering(true);
            setHasHovered(true);
        }}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleCreate}
    >
        {/* Background Image & Video Layer - with zoom effect */}
        <div className="absolute inset-0 size-full transition-transform duration-700 ease-in-out group-hover:scale-110 origin-center">
            <Image
                src={coverImage || ''}
                alt={mode.label}
                fill
                className={cn(
                    "object-cover transition-opacity duration-300",
                )}
            />
             {/* Gradient Overlay - Darker at bottom for text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Cloudflare Video Layer */}
            {hasVideo && hasHovered && (
                <iframe
                    src={cfVideoUrl!}
                    className={cn(
                        "absolute inset-0 size-full border-0 transition-opacity duration-300",
                        isHovering ? "opacity-100" : "opacity-0"
                    )}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    style={{ pointerEvents: 'none' }}
                />
            )}
        </div>

        {/* GENERATED Badge */}
        <div className="absolute left-3 top-3 z-20 rounded-[4px] bg-[#1f1f1f] px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wide text-white shadow-sm">
            GENERATED
        </div>

        {/* Content Layer - Positioned at bottom */}
        <div className="absolute bottom-0 left-0 z-10 w-full p-4 flex flex-col items-start gap-1">
            {/* Title - Mode Label */}
            <h3 className="font-sans text-[18px] font-semibold leading-6 text-white drop-shadow-sm text-left">
              {mode.label}
            </h3>

            {/* Description - Mode Description */}
            <p className="font-sans text-[12px] font-normal leading-4 text-white/90 line-clamp-2 drop-shadow-sm text-left">
               {mode.description}
            </p>
        </div>
    </div>
  );
}

export function FeaturedCasesSection() {
  return (
    <div className="w-full overflow-hidden py-4">
        <div className="flex justify-center">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playgroundModes.filter((mode) => mode.id !== 'general').map((mode) => (
                  <FeaturedCaseCard key={mode.id} mode={mode} />
              ))}
           </div>
        </div>
    </div>
  );
}
