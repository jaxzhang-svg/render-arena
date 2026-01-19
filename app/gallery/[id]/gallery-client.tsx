'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/base/button'
import {
  ArrowLeft,
  Heart,
  Copy,
  ExternalLink,
  Eye,
  Maximize,
  Check,
} from 'lucide-react'
import { UserAvatar } from '@/components/app/user-avatar'
import { cn } from '@/lib/utils'
import { getModelById, models } from '@/lib/models'
import type { App } from '@/types'

interface GalleryClientProps {
  app: App & { isOwner: boolean; isLiked: boolean }
}

export default function GalleryClient({ app }: GalleryClientProps) {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [liked, setLiked] = useState(app.isLiked)
  const [likeCount, setLikeCount] = useState(app.like_count)
  const [copied, setCopied] = useState(false)

  const modelA = getModelById(app.model_a) || models[0]
  const modelB = getModelById(app.model_b) || models[1]

  const handleLike = useCallback(async () => {
    try {
      const response = await fetch(`/api/apps/${app.id}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      } else if (response.status === 401) {
        alert('请先登录后再点赞')
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }, [app.id])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(app.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
    }
  }, [app.prompt])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="
        z-30 flex h-16 shrink-0 items-center justify-between border-b
        border-[#f3f4f6] bg-white px-4
      ">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="
                hover:bg-muted/80
                size-9 cursor-pointer rounded-full p-2
              "
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="
            font-sans text-[20px] font-semibold tracking-tight text-black
          ">
            {app.name || 'Untitled App'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 点赞按钮 */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-lg border-[#e4e4e7] transition-colors",
              liked && "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("size-4", liked && "fill-current")} />
            <span>{likeCount}</span>
          </Button>

          {/* 复制 Prompt */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg border-[#e4e4e7]"
            onClick={handleCopyPrompt}
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copy Prompt</span>
              </>
            )}
          </Button>

          {/* 在 Playground 中打开 */}
          <Link href={`/playground/${app.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg border-[#e4e4e7]"
            >
              <ExternalLink className="size-4" />
              <span>Open in Playground</span>
            </Button>
          </Link>

          <UserAvatar />
        </div>
      </header>

      {/* Prompt 显示 */}
      <div className="border-b border-[#f3f4f6] bg-[#fafafa] px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#666]">Prompt:</span>
          <span className="text-sm text-[#333]">{app.prompt}</span>
        </div>
      </div>

      {/* Main Content - 左右分屏预览 */}
      <main className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1">
          {/* Model A Preview */}
          {viewMode !== 'b' && (
            <div className={`
              ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}
              relative flex flex-col overflow-hidden border-r border-[#f4f4f5]
              bg-white
            `}>
              <div className="
                flex h-12 shrink-0 items-center justify-between border-b
                border-[#e7e6e2] bg-white px-4
              ">
                <div className="flex items-center gap-2">
                  <span className={`size-4 rounded-sm ${modelA.color}`} />
                  <span className="text-sm font-medium text-[#4f4e4a]">
                    {modelA.name}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer rounded-lg hover:bg-muted/80"
                  onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_a ? (
                  <iframe
                    srcDoc={app.html_content_a}
                    className="size-full border-0"
                    title="Model A Preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model B Preview */}
          {viewMode !== 'a' && (
            <div className={`
              ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}
              relative flex flex-col overflow-hidden bg-white
            `}>
              <div className="
                flex h-12 shrink-0 items-center justify-between border-b
                border-[#e7e6e2] bg-white px-4
              ">
                <div className="flex items-center gap-2">
                  <span className={`size-4 rounded-sm ${modelB.color}`} />
                  <span className="text-sm font-medium text-[#4f4e4a]">
                    {modelB.name}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer rounded-lg hover:bg-muted/80"
                  onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_b ? (
                  <iframe
                    srcDoc={app.html_content_b}
                    className="size-full border-0"
                    title="Model B Preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer with stats */}
      <footer className="
        flex h-10 shrink-0 items-center justify-between border-t
        border-[#f3f4f6] bg-white px-4 text-xs text-[#9e9c98]
      ">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {app.view_count} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="size-3" />
            {likeCount} likes
          </span>
        </div>
        <div>
          Created {new Date(app.created_at).toLocaleDateString()}
        </div>
      </footer>
    </div>
  )
}
