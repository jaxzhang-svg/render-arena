'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/button';
import { Play } from 'lucide-react';
import { FEATURED_CASES } from '@/lib/config';
import type { App, AppDetailResponse } from '@/types';
import { cn } from '@/lib/utils';

interface FeaturedCaseCardProps {
  caseData: typeof FEATURED_CASES[number];
}

function FeaturedCaseCard({ caseData }: FeaturedCaseCardProps) {
  const router = useRouter();
  const [appData, setAppData] = useState<App | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch app data when appId is available
  useEffect(() => {
    if (!caseData.appId) return;

    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/apps/${caseData.appId}`);
        if (res.ok) {
            const data: AppDetailResponse = await res.json();
            setAppData(data.app);
        }
      } catch (error) {
        console.error('Error fetching featured app:', error);
      }
    };

    fetchApp();
  }, [caseData.appId]);

  // Handle video playback on hover
  useEffect(() => {
    if (isHovering && videoRef.current && appData?.preview_video_url) {
      videoRef.current.play().catch(e => console.log('Video play failed:', e));
    } else if (!isHovering && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering, appData?.preview_video_url]);

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = appData?.prompt || caseData.prompt || '';
    
    const params = new URLSearchParams();
    if (promptText) params.set('prompt', promptText);
    if (caseData.category) params.set('category', caseData.category);
    
    router.push(`/playground/new?${params.toString()}`);
  };

  // Safe access to themeColor with fallback
  const themeColor = (caseData as any).themeColor || '#ffffff';

  return (
    <div 
        className="group relative flex h-[180px] w-[240px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#18181b] transition-all hover:border-white/20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
    >
        {/* Background Image Layer - Fills entire box */}
        <div className="absolute inset-0 size-full">
            <Image
                src={caseData.imageUrl}
                alt={caseData.title}
                fill
                className={cn(
                    "object-cover transition-opacity duration-300",
                    isHovering && appData?.preview_video_url ? "opacity-0" : "opacity-100" // Kept simple
                )}
                unoptimized
            />
             {/* Gradient Overlay for text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Video Layer */}
            {appData?.preview_video_url && (
                <video
                    ref={videoRef}
                    src={appData.preview_video_url}
                    className={cn(
                        "absolute inset-0 size-full object-cover transition-opacity duration-300",
                        isHovering ? "opacity-100" : "opacity-0"
                    )}
                    muted
                    loop
                    playsInline
                />
            )}
        </div>

        {/* Content Layer */}
        <div className="relative z-10 flex h-full flex-col justify-between items-start p-4">
            {/* Header */}
            <h3 
              className="font-sans text-lg font-bold items-start text-white"
            >
              {caseData.title}
            </h3>

            {/* Footer / Create Button */}
            <div className="mt-auto w-full">
                <Button 
                    onClick={handleCreate}
                    className="w-full justify-center border transition-all duration-300"
                    style={{
                        backgroundColor: isHovering ? themeColor : 'rgba(39, 39, 42, 0.6)', 
                        borderColor: isHovering ? themeColor : 'rgba(255, 255, 255, 0.2)',
                        color: isHovering ? '#000' : '#FFF',
                        transform: isHovering ? 'scale(1.05)' : 'scale(1)',
                        fontWeight: isHovering ? 600 : 500
                    }}
                >
                    Create
                </Button>
            </div>
        </div>
    </div>
  );
}

export function FeaturedCasesSection() {
  return (
    <div className="w-full overflow-hidden py-8">
        <div className="mx-auto px-6"> 
           {/* Scrollable Container */}
           <div className="flex items-center justify-center w-full gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {FEATURED_CASES.map((item) => (
                  <FeaturedCaseCard key={item.id} caseData={item} />
              ))}
           </div>
        </div>
    </div>
  );
}
