'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/base/button'
import { ArrowLeft, Heart, Copy, ExternalLink, Maximize, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/app/user-avatar'
import { cn } from '@/lib/utils'
import { getModelById, models } from '@/lib/models'
import type { App } from '@/types'
import DOMPurify from 'isomorphic-dompurify'
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer'
import { showToast } from '@/lib/toast'
import { trackGalleryPromptCopied, trackGalleryOpenInPlayground } from '@/lib/analytics'

interface GalleryClientProps {
  app: App & { isOwner: boolean; isLiked: boolean }
}

export default function GalleryClient({ app }: GalleryClientProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [liked, setLiked] = useState(app.isLiked)
  const [likeCount, setLikeCount] = useState(app.like_count)
  const [isLiking, setIsLiking] = useState(false)
  const [copied, setCopied] = useState(false)

  const modelA = getModelById(app.model_a) || models[0]
  const modelB = getModelById(app.model_b) || models[1]

  const handleLike = useCallback(async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const response = await fetch(`/api/apps/${app.id}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setLiked(data.liked)
        setLikeCount(data.likeCount)
      } else if (response.status === 401) {
        showToast.login('Please login to like')
      }
    } catch (error) {
      console.error('Like error:', error)
      showToast.error('Failed to like')
    } finally {
      setIsLiking(false)
    }
  }, [app.id, isLiking])

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(app.prompt)
      trackGalleryPromptCopied(app.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      showToast.error('Failed to copy')
    }
  }, [app.prompt, app.id])

  const handleOpenPlayground = useCallback(() => {
    trackGalleryOpenInPlayground({
      app_id: app.id,
      model_a: app.model_a,
      model_b: app.model_b,
    })
    const params = new URLSearchParams()
    params.set('prompt', app.prompt)
    if (app.category) {
      params.set('category', app.category)
    }
    router.push(`/playground/new?${params.toString()}`)
  }, [app.id, app.prompt, app.category, app.model_a, app.model_b, router])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#f3f4f6] bg-white px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 size-9 cursor-pointer rounded-full p-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="font-sans text-[20px] font-semibold tracking-tight text-black">
            {app.name || 'Untitled App'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 点赞按钮 */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 rounded-lg border-[#e4e4e7] transition-colors',
              liked && 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
            )}
            onClick={handleLike}
            disabled={isLiking}
          >
            {isLiking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={cn('size-4', liked && 'fill-current')} />
            )}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-lg border-[#e4e4e7]"
            onClick={handleOpenPlayground}
          >
            <ExternalLink className="size-4" />
            <span>Open in Playground</span>
          </Button>

          <UserAvatar />
        </div>
      </header>

      {/* Main Content - 左右分屏预览 */}
      <main className="relative flex w-screen flex-1 overflow-hidden">
        <div className="flex w-full flex-1">
          {/* Model A Preview */}
          {viewMode !== 'b' && (
            <div
              className={` ${viewMode === 'split' ? 'w-1/2' : 'flex-1'} relative flex flex-col overflow-hidden border-r border-[#f4f4f5] bg-white`}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] bg-white px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={modelA.icon}
                    alt={modelA.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm"
                  />
                  <span className="text-sm font-medium text-[#4f4e4a]">{modelA.name}</span>
                  {(app.duration_a || app.tokens_a) && (
                    <div className="flex items-center gap-3 text-xs text-[#9e9c98]">
                      {app.tokens_a && <span className="font-medium">{app.tokens_a} tokens</span>}
                      {app.tokens_a && app.duration_a && <span className="text-[#e7e6e2]">•</span>}
                      {app.duration_a && (
                        <span className="font-medium">{app.duration_a.toFixed(1)}s</span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
                  onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_a ? (
                  <iframe
                    srcDoc={DOMPurify.sanitize(app.html_content_a, DOMPURIFY_CONFIG)}
                    className="size-full border-0"
                    title="Model A Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model B Preview */}
          {viewMode !== 'a' && (
            <div
              className={` ${viewMode === 'split' ? 'w-1/2' : 'flex-1'} relative flex flex-col overflow-hidden bg-white`}
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7e6e2] bg-white px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={modelB.icon}
                    alt={modelB.name}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm"
                  />
                  <span className="text-sm font-medium text-[#4f4e4a]">{modelB.name}</span>
                  {(app.duration_b || app.tokens_b) && (
                    <div className="flex items-center gap-3 text-xs text-[#9e9c98]">
                      {app.tokens_b && <span className="font-medium">{app.tokens_b} tokens</span>}
                      {app.tokens_b && app.duration_b && <span className="text-[#e7e6e2]">•</span>}
                      {app.duration_b && (
                        <span className="font-medium">{app.duration_b.toFixed(1)}s</span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
                  onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                >
                  <Maximize className="size-4 text-[#9e9c98]" />
                </Button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {app.html_content_b ? (
                  <iframe
                    srcDoc={DOMPurify.sanitize(app.html_content_b, DOMPURIFY_CONFIG)}
                    className="size-full border-0"
                    title="Model B Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center">
                    No HTML content available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
