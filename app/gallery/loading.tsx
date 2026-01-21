"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/base/button";
import { UserAvatar } from "@/components/app/user-avatar";

export default function GalleryLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Gallery Header Skeleton */}
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#f3f4f6] bg-white px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 rounded-full p-2" disabled>
            <ArrowLeft className="size-5" />
          </Button>
          {/* App Title Skeleton */}
          <Skeleton className="h-[24px] w-64 rounded" />
        </div>

        <div className="flex items-center gap-3">
          {/* Like Button */}
          <Skeleton className="h-9 w-16 rounded-lg" />
          {/* Copy Prompt Button */}
          <Skeleton className="h-9 w-32 rounded-lg" />
          {/* Open in Playground Button */}
          <Skeleton className="h-9 w-40 rounded-lg" />
          
          <UserAvatar />
        </div>
      </header>

      {/* Split View Content Skeleton */}
      <main className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1">
          {/* Left Panel */}
          <div className="relative flex w-1/2 flex-col border-r border-[#e7e6e2] bg-white">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] px-4">
               {/* Model Info */}
               <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-32 rounded" />
               </div>
               {/* Maximize Button */}
               <Skeleton className="size-8 rounded-lg" />
            </div>
            {/* Viewport content */}
            <div className="flex-1 bg-muted/10 p-4">
               <Skeleton className="size-full rounded-xl" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="relative flex w-1/2 flex-col bg-white">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] px-4">
               {/* Model Info */}
               <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-4 w-32 rounded" />
               </div>
               {/* Maximize Button */}
               <Skeleton className="size-8 rounded-lg" />
            </div>
             {/* Viewport content */}
            <div className="flex-1 bg-muted/10 p-4">
               <Skeleton className="size-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
