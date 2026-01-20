'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/base/button'
import { Textarea } from '@/components/base/textarea'
import {
  Video,
  Share,
  ArrowUp,
  ArrowLeft,
  Eye,
  EyeOff,
  Square,
  RotateCcw,
} from 'lucide-react'
import { ShareModal } from '@/components/playground/share-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { ModelPanel } from '@/components/playground/model-panel'
import { useArenaPlayground } from '@/hooks/use-arena-playground'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import type { App } from '@/types'

interface PlaygroundClientProps {
  initialApp?: App | null
  appId?: string
}

export default function PlaygroundClient({ initialApp, appId }: PlaygroundClientProps) {
  // 使用 Arena Playground Hook 管理核心逻辑
  const {
    currentAppId,
    prompt,
    setPrompt,
    arenaViewMode,
    setArenaViewMode,
    showInputBar,
    setShowInputBar,
    modelA,
    modelB,
    handleGenerate,
    handleGenerateModelA,
    handleGenerateModelB,
    stopAllGeneration,
    isAnyLoading,
    isAllCompleted,
  } = useArenaPlayground({ initialApp, appId })

  // 分享相关状态
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)

  // 自动开始生成逻辑
  const searchParams = useSearchParams()
  const autoStart = searchParams.get('autoStart') === 'true'
  const hasAutoStartedRef = useRef(false)
  const handleGenerateRef = useRef(handleGenerate)
  const modelsReady = modelA.selectedModel.id && modelB.selectedModel.id
  
  // 更新 handleGenerateRef
  useEffect(() => {
    handleGenerateRef.current = handleGenerate
  }, [handleGenerate])

  // 执行自动生成
  useEffect(() => {
    // 只有在从未自动开始过、需要自动开始、且没有初始 App（是新会话）、且模型都准备好时才执行
    if (autoStart && !hasAutoStartedRef.current && !initialApp && !currentAppId && modelsReady) {
      // 使用 setTimeout 确保在渲染完成后执行，并且错开即时更新
      const timer = setTimeout(() => {
        if (!hasAutoStartedRef.current) {
          hasAutoStartedRef.current = true
          handleGenerateRef.current()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoStart, initialApp, currentAppId, modelsReady])

  // 屏幕录制
  const {
    isRecording,
    recordedBlob,
    previewContainerRef,
    startRecording,
    stopRecording,
  } = useScreenRecorder({
    onRecordingComplete: (blob, format) => {
      console.log('Recording complete:', { blob, format })
      setRecordedFormat(format)
      setShareMode('video')
      setTimeout(() => setShowShareModal(true), 300)
    },
    onError: (error) => {
      console.error('Recording error:', error)
    },
  })

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording()
      setShowInputBar(true)
    } else {
      setShowInputBar(false)
      await startRecording()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
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
            Arena Playground
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="
              hover:bg-foreground hover:text-background
              size-9 cursor-pointer rounded-lg border-[#e4e4e7]
              transition-colors
            "
            onClick={handleRecordToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <Square className="size-4 fill-red-500 text-red-500" />
            ) : (
              <Video className="size-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="
              hover:bg-foreground hover:text-background
              size-9 cursor-pointer rounded-lg border-[#e4e4e7]
              transition-colors
            "
            title="Share"
            onClick={() => {
              setShareMode('poster')
              setShowShareModal(true)
            }}
          >
            <Share className="size-4" />
          </Button>

          <UserAvatar />
        </div>
      </header>

      <main ref={previewContainerRef} className="
        relative flex w-screen flex-1 overflow-hidden
      ">
        <div className="flex w-full flex-1">
          {arenaViewMode !== 'b' && (
            <ModelPanel
              className={arenaViewMode === 'split' ? 'w-1/2' : 'flex-1'}
              selectedModel={modelA.selectedModel}
              onModelChange={modelA.setSelectedModel}
              response={modelA.response}
              viewMode={modelA.viewMode}
              onViewModeChange={modelA.setViewMode}
              settings={modelA.settings}
              onSettingsChange={modelA.setSettings}
              onRegenerate={handleGenerateModelA}
              onToggleMaximize={() => setArenaViewMode(arenaViewMode === 'a' ? 'split' : 'a')}
              showRightBorder={arenaViewMode === 'split'}
            />
          )}

          {arenaViewMode !== 'a' && (
            <ModelPanel
              className={arenaViewMode === 'split' ? 'w-1/2' : 'flex-1'}
              selectedModel={modelB.selectedModel}
              onModelChange={modelB.setSelectedModel}
              response={modelB.response}
              viewMode={modelB.viewMode}
              onViewModeChange={modelB.setViewMode}
              settings={modelB.settings}
              onSettingsChange={modelB.setSettings}
              onRegenerate={handleGenerateModelB}
              onToggleMaximize={() => setArenaViewMode(arenaViewMode === 'b' ? 'split' : 'b')}
            />
          )}
        </div>

        {showInputBar && (
          <div className="
            absolute bottom-8 left-1/2 z-50 w-[90%] max-w-[720px]
            -translate-x-1/2
          ">
            <div className="
              relative overflow-hidden rounded-2xl border border-white/50
              bg-white/80 shadow-[0px_20px_40px_-12px_rgba(0,0,0,0.15)]
              backdrop-blur-xl
            ">
              <div className="flex flex-col gap-2 p-4">
                <div className="relative h-[56.75px] w-full">
                  <div className="
                    absolute top-[8px] left-0 flex h-[48.75px] w-[566px]
                    items-start overflow-hidden
                  ">
                    <Textarea
                      placeholder="Describe your app... (Press Enter to send)"
                      className="
                        scrollbar-none size-full resize-none border-0
                        bg-transparent p-0 font-sans text-[16px] leading-[24px]
                        font-normal text-[#4f4e4a]
                        placeholder:text-[#9e9c98]
                        focus-visible:ring-0
                      "
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleGenerate()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (isAnyLoading) {
                        stopAllGeneration()
                      } else {
                        handleGenerate()
                      }
                    }}
                    size="icon"
                    className={`
                      group absolute top-[12.25px] right-0 size-9 shrink-0
                      rounded-xl transition-all
                      active:scale-95
                      ${
                      isAnyLoading
                        ? `
                          bg-red-500 text-white
                          shadow-[0px_4px_6px_-4px_rgba(239,68,68,0.5)]
                          hover:bg-red-600
                        `
                        : isAllCompleted
                        ? `
                          bg-orange-500 text-white
                          shadow-[0px_4px_6px_-4px_rgba(249,115,22,0.5)]
                          hover:bg-orange-600
                        `
                        : `
                          bg-[#23d57c] text-white
                          shadow-[0px_4px_6px_-4px_rgba(35,213,124,0.5)]
                          hover:bg-[#23d57c]/90
                        `
                    }
                    `}
                    disabled={!prompt.trim() && !isAnyLoading}
                  >
                    {isAnyLoading ? (
                      <Square className="size-4 fill-current" />
                    ) : isAllCompleted ? (
                      <RotateCcw className="
                        size-4 transition-transform
                        group-hover:-rotate-12
                      " />
                    ) : (
                      <ArrowUp className="
                        size-4 transition-transform
                        group-hover:-translate-y-0.5
                      " />
                    )}
                  </Button>
                </div>

                <div className="
                  relative flex w-full flex-col items-start overflow-hidden px-0
                  pt-2 pb-0
                ">
                  <div className="
                    relative flex w-full items-center justify-end border-t
                    border-solid border-[#f4f4f5] px-0 pt-2 pb-0
                  ">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="
                        hover:bg-muted/50
                        h-7 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[12px]
                        font-normal text-[#4f4e4a] transition-colors
                      "
                      onClick={() => setShowInputBar(false)}
                      title="Hide controls"
                    >
                      <EyeOff className="size-4" />
                      Hide controls
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showInputBar && !isRecording && (
          <Button
            onClick={() => setShowInputBar(true)}
            size="sm"
            className="
              absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer gap-2
              rounded-full px-4 py-2 shadow-lg
            "
            title="Show prompt"
          >
            <Eye className="size-4" />
            Show Prompt
          </Button>
        )}
      </main>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        appId={currentAppId}
        shareUrl={currentAppId 
          ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gallery/${currentAppId}`
          : undefined
        }
        videoBlob={recordedBlob}
        videoFormat={recordedFormat}
        showVideoSection={shareMode === 'video'}
      />
    </div>
  )
}
