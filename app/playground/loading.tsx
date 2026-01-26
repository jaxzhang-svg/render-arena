'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/base/button'
import { UserAvatar } from '@/components/app/user-avatar'

export default function PlaygroundLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Playground Header Skeleton */}
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#f3f4f6] bg-white px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9 rounded-full p-2" disabled>
            <ArrowLeft className="size-5" />
          </Button>
          <Skeleton className="h-[20px] w-48 rounded" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="size-9 rounded-lg" />
          <UserAvatar />
        </div>
      </header>

      {/* Split View Content Skeleton */}
      <main className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1">
          {/* Left Panel */}
          <div className="relative flex w-1/2 flex-col border-r border-[#e7e6e2] bg-white">
            <div className="flex h-12 shrink-0 items-center border-b border-[#e7e6e2] px-4">
              {/* Model Selector */}
              <Skeleton className="h-8 w-40 rounded-lg" />
            </div>
            {/* Viewport content */}
            <div className="bg-muted/10 flex-1 p-4">
              <Skeleton className="size-full rounded-xl" />
            </div>
          </div>

          {/* Right Panel */}
          <div className="relative flex w-1/2 flex-col bg-white">
            <div className="flex h-12 shrink-0 items-center border-b border-[#e7e6e2] px-4">
              {/* Model Selector */}
              <Skeleton className="h-8 w-40 rounded-lg" />
            </div>
            {/* Viewport content */}
            <div className="bg-muted/10 flex-1 p-4">
              <Skeleton className="size-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Input Bar Skeleton */}
        <div className="absolute bottom-8 left-1/2 z-50 w-[90%] max-w-[720px] -translate-x-1/2">
          <div className="relative overflow-hidden rounded-[16px] border border-white/50 bg-white/90 p-4 pb-2 shadow-[0px_20px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur">
            <Skeleton className="mb-3 h-6 w-32 rounded-full" />
            <Skeleton className="mb-2 h-[48px] w-full rounded-md" />
            <div className="flex items-center justify-between border-t border-[#e7e6e2]/80 pt-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="size-8 rounded-[12px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
