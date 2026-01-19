'use client'

import React, { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Video,
  Share,
  Maximize,
  ArrowUp,
  ArrowLeft,
  Wallet,
  Eye,
  EyeOff,
  Square,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import { ShareModal } from '@/components/app/share-modal'
import { ModelSettingsPopover } from '@/components/app/model-settings-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { StreamingCodeDisplay } from '@/components/playground/streaming-code-display'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { models, LLMModel } from '@/lib/models'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import { streamChatCompletion } from '@/lib/novita-api'
import { extractHTMLFromMarkdown } from '@/lib/html-extractor'

const NOVITA_API_KEY = 'sk_Y52XftPzTCOOrx9-oWJF_cRHUPWiZqirVYvov-qxWkA'

interface ModelResponse {
  content: string
  reasoning?: string
  loading: boolean
  completed: boolean
  html?: string
  tokens?: number
  duration?: number
  startTime?: number
}

const initialModelResponse: ModelResponse = {
  content: '',
  reasoning: '',
  loading: false,
  completed: false,
}

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [prompt, setPrompt] = useState(
    'create a iron man 3d model.'
  )
  const [showInputBar, setShowInputBar] = useState(true)

  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(models[0])
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(models[1])

  const [modelAView, setModelAView] = useState<'code' | 'preview'>('code')
  const [modelBView, setModelBView] = useState<'code' | 'preview'>('code')

  const [modelAResponse, setModelAResponse] = useState<ModelResponse>(initialModelResponse)
  const [modelBResponse, setModelBResponse] = useState<ModelResponse>(initialModelResponse)
  
  // 使用 ref 来追踪最新状态，避免闭包陷阱
  const modelAResponseRef = useRef(modelAResponse)
  const modelBResponseRef = useRef(modelBResponse)
  
  // 同步更新 ref
  modelAResponseRef.current = modelAResponse
  modelBResponseRef.current = modelBResponse

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')
  const [recordedFormat, setRecordedFormat] = useState<'webm' | 'mp4' | null>(null)
  
  // Model settings
  const [modelASettings, setModelASettings] = useState({
    temperature: 0.7,
  })
  
  const [modelBSettings, setModelBSettings] = useState({
    temperature: 0.7,
  })

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording()
      setShowInputBar(true)
    } else {
      setShowInputBar(false)
      await startRecording()
    }
  }

  // 使用 AbortController 来支持取消生成
  const abortControllerRef = useRef<AbortController | null>(null)

  const stopGeneration = useCallback(() => {
    // 中止请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    // Stop both models generation
    setModelAResponse(prev => ({ ...prev, loading: false }))
    setModelBResponse(prev => ({ ...prev, loading: false }))
  }, [])

  // 单独生成 Model A
  const handleGenerateModelA = useCallback(async () => {
    if (!prompt.trim()) return

    // 创建新的AbortController
    const controller = new AbortController()

    const startTime = Date.now()
    
    React.startTransition(() => {
      setModelAView('code')
      setModelAResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })
    })

    const messages = [
      {
        role: 'user',
        content: `${prompt} using HTML/CSS/JS in a single HTML file.`,
      },
    ]

    await streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelA.id,
      messages,
      signal: controller.signal,
      callbacks: {
        onChunk: (chunk) => {
          setModelAResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelAResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0
            const tokens = Math.floor(prev.content.length / 4)
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
              duration,
              tokens,
            }
          })
          // 如果Model B也完成了，切换到预览
          if (modelBResponseRef.current.completed && modelBResponseRef.current.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model A error:', error)
          setModelAResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })
  }, [prompt, selectedModelA.id])

  // 单独生成 Model B
  const handleGenerateModelB = useCallback(async () => {
    if (!prompt.trim()) return

    // 创建新的AbortController
    const controller = new AbortController()

    const startTime = Date.now()
    
    React.startTransition(() => {
      setModelBView('code')
      setModelBResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })
    })

    const messages = [
      {
        role: 'user',
        content: `${prompt} using HTML/CSS/JS in a single HTML file.`,
      },
    ]

    await streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelB.id,
      messages,
      signal: controller.signal,
      callbacks: {
        onChunk: (chunk) => {
          setModelBResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelBResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0
            const tokens = Math.floor(prev.content.length / 4)
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
              duration,
              tokens,
            }
          })
          // 如果Model A也完成了，切换到预览
          if (modelAResponseRef.current.completed && modelAResponseRef.current.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model B error:', error)
          setModelBResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })
  }, [prompt, selectedModelB.id])

  // 同时生成两个模型
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    // 如果正在生成，先停止
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const startTime = Date.now()
    
    React.startTransition(() => {
      setModelAView('code')
      setModelBView('code')
      setModelAResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })
      setModelBResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })
    })

    const messages = [
      {
        role: 'user',
        content: `${prompt} using HTML/CSS/JS in a single HTML file.`,
      },
    ]

    const modelAPromise = streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelA.id,
      messages,
      signal: abortControllerRef.current.signal,
      callbacks: {
        onChunk: (chunk) => {
          setModelAResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelAResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0
            const tokens = Math.floor(prev.content.length / 4) // 估算token数
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
              duration,
              tokens,
            }
          })
          // 使用 ref 获取最新状态
          if (modelBResponseRef.current.completed && modelBResponseRef.current.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model A error:', error)
          setModelAResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })

    const modelBPromise = streamChatCompletion({
      apiKey: NOVITA_API_KEY,
      model: selectedModelB.id,
      messages,
      signal: abortControllerRef.current.signal,
      callbacks: {
        onChunk: (chunk) => {
          setModelBResponse((prev) => ({
            ...prev,
            content: prev.content + (chunk.content || ''),
            reasoning: prev.reasoning + (chunk.reasoning_content || ''),
          }))
        },
        onComplete: () => {
          setModelBResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            const duration = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0
            const tokens = Math.floor(prev.content.length / 4) // 估算token数
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
              duration,
              tokens,
            }
          })
          // 使用 ref 获取最新状态
          if (modelAResponseRef.current.completed && modelAResponseRef.current.html) {
            setModelAView('preview')
            setModelBView('preview')
          }
        },
        onError: (error) => {
          console.error('Model B error:', error)
          setModelBResponse((prev) => ({
            ...prev,
            loading: false,
            completed: true,
            content: prev.content + '\n\nError: ' + error.message,
          }))
        },
      },
    })

    await Promise.allSettled([modelAPromise, modelBPromise])
  }, [prompt, selectedModelA.id, selectedModelB.id])

  // 使用ref跟踪上一次的模型ID
  const prevModelAIdRef = useRef(selectedModelA.id)
  const prevModelBIdRef = useRef(selectedModelB.id)
  const isInitialRef = useRef(true)

  // 监听Model A切换，自动重新生成Model A
  React.useEffect(() => {
    // 第一次渲染时跳过
    if (isInitialRef.current) {
      isInitialRef.current = false
      return
    }

    const modelAChanged = prevModelAIdRef.current !== selectedModelA.id
    
    // 只有在已经有生成内容且模型确实发生变化的情况下才自动重新生成
    if (modelAChanged && modelAResponse.content) {
      handleGenerateModelA()
    }
    
    // 更新ref
    prevModelAIdRef.current = selectedModelA.id
  }, [selectedModelA.id])

  // 监听Model B切换，自动重新生成Model B
  React.useEffect(() => {
    // 第一次渲染时跳过
    if (isInitialRef.current) {
      return
    }

    const modelBChanged = prevModelBIdRef.current !== selectedModelB.id
    
    // 只有在已经有生成内容且模型确实发生变化的情况下才自动重新生成
    if (modelBChanged && modelBResponse.content) {
      handleGenerateModelB()
    }
    
    // 更新ref
    prevModelBIdRef.current = selectedModelB.id
  }, [selectedModelB.id])

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

          <div className="
            flex items-center gap-2 rounded-lg border border-[#e7e6e2]
            bg-[#f5f5f5] px-3 py-2
          ">
            <Wallet className="size-4 text-[#3f3f46]" />
            <span className="
              text-sm font-semibold tracking-tight text-[#3f3f46]
            ">
              $1,250.00
            </span>
          </div>

          <UserAvatar />
        </div>
      </header>

      <main ref={previewContainerRef} className="
        relative flex w-screen flex-1 overflow-hidden
      ">
        <div className="flex w-full flex-1">
          {viewMode !== 'b' && (
            <div className={`
              ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}
              relative flex flex-col overflow-hidden border-r border-[#f4f4f5]
              bg-white
            `}>
              <div className="
                flex h-16 shrink-0 items-center justify-between border-b
                border-[#e7e6e2] bg-white px-4
              ">
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        className="
                          h-8 cursor-pointer gap-2 rounded-lg bg-[#f5f5f5] px-3
                          py-1.5 transition-colors
                          hover:bg-[#e7e6e2]
                        "
                      >
                        <span className={`
                          size-5 rounded-sm
                          ${selectedModelA.color}
                        `} />
                        <span className="
                          font-sans text-[16px] font-medium text-[#4f4e4a]
                        ">
                          {selectedModelA.name}
                        </span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="#9e9c98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModelA(model)}
                        className="cursor-pointer gap-2"
                      >
                        <span className={`
                          size-5 rounded-sm
                          ${model.color}
                        `} />
                        {model.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {modelAResponse.loading && (
                  <div className="
                    flex items-center gap-2 text-sm text-[#9e9c98]
                  ">
                    <div className="
                      size-4 animate-spin rounded-full border-2 border-[#23d57c]
                      border-t-transparent
                    " />
                    <span className="text-xs font-medium">Generating...</span>
                  </div>
                )}
                {!modelAResponse.loading && modelAResponse.completed && modelAResponse.tokens && (
                  <div className="
                    flex items-center gap-3 text-xs text-[#9e9c98]
                  ">
                    <span className="font-medium">{modelAResponse.tokens} tokens</span>
                    <span className="text-[#e7e6e2]">•</span>
                    <span className="font-medium">{modelAResponse.duration?.toFixed(1)}s</span>
                  </div>
                )}
                </div>

                <div className="flex items-center">
                  <div className="
                    mr-2 flex rounded-lg border border-[#e7e6e2] bg-[#f5f5f5]
                    p-0.5
                  ">
                    <button
                      onClick={() => setModelAView('code')}
                      className={`
                        cursor-pointer rounded-md px-3 py-1 text-xs font-medium
                        transition-all
                        ${
                        modelAView === 'code'
                          ? 'bg-white text-black shadow-sm'
                          : `
                            text-[#666]
                            hover:text-black
                          `
                      }
                      `}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setModelAView('preview')}
                      className={`
                        cursor-pointer rounded-md px-3 py-1 text-xs font-medium
                        transition-all
                        ${
                        modelAView === 'preview'
                          ? 'bg-white text-black shadow-sm'
                          : `
                            text-[#666]
                            hover:text-black
                          `
                      }
                      `}
                    >
                      Preview
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      hover:bg-muted/80
                      size-8 cursor-pointer rounded-lg
                    "
                    onClick={handleGenerateModelA}
                    title="Retry generation"
                  >
                    <RotateCcw className="size-4 text-[#9e9c98]" />
                  </Button>
                  <ModelSettingsPopover
                    modelName={selectedModelA.name}
                    settings={modelASettings}
                    onSettingsChange={setModelASettings}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        hover:bg-muted/80
                        size-8 cursor-pointer rounded-lg
                      "
                    >
                      <SlidersHorizontal className="size-4 text-[#9e9c98]" />
                    </Button>
                  </ModelSettingsPopover>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      hover:bg-muted/80
                      size-8 cursor-pointer rounded-lg
                    "
                    onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                  >
                    <Maximize className="size-4 text-[#9e9c98]" />
                  </Button>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {/* Code View - 始终渲染，用 CSS 控制显示 */}
                <div className={`
                  absolute inset-0
                  ${modelAView === 'code' ? `block` : `hidden`}
                `}>
                  <StreamingCodeDisplay
                    content={modelAResponse.content}
                    reasoning={modelAResponse.reasoning}
                    onPreview={(html) => {
                      setModelAResponse(prev => ({ ...prev, html }))
                      setModelAView('preview')
                    }}
                  />
                </div>
                
                {/* Preview View - 始终渲染，用 CSS 控制显示 */}
                <div className={`
                  absolute inset-0
                  ${modelAView === 'preview' ? `block` : `hidden`}
                `}>
                  {modelAResponse.html ? (
                    <iframe
                      srcDoc={modelAResponse.html}
                      className="size-full border-0"
                      title="Preview"
                    />
                  ) : (
                    <div className="
                      text-muted-foreground flex h-full items-center
                      justify-center
                    ">
                      {modelAResponse.loading
                        ? 'Generating HTML...'
                        : 'No HTML available for preview'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode !== 'a' && (
            <div className={`
              ${viewMode === 'split' ? 'w-1/2' : 'flex-1'}
              relative flex flex-col overflow-hidden bg-white
            `}>
              <div className="
                flex h-16 shrink-0 items-center justify-between border-b
                border-[#e7e6e2] bg-white px-4
              ">
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        variant="ghost"
                        className="
                          h-8 cursor-pointer gap-2 rounded-lg px-3 py-1.5
                          transition-colors
                          hover:bg-[#f5f5f5]
                        "
                      >
                        <span className={`
                          size-5 rounded-sm
                          ${selectedModelB.color}
                        `} />
                        <span className="
                          font-sans text-[16px] font-medium text-[#4f4e4a]
                        ">
                          {selectedModelB.name}
                        </span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="#9e9c98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => setSelectedModelB(model)}
                        className="cursor-pointer gap-2"
                      >
                        <span className={`
                          size-5 rounded-sm
                          ${model.color}
                        `} />
                        {model.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {modelBResponse.loading && (
                  <div className="
                    flex items-center gap-2 text-sm text-[#9e9c98]
                  ">
                    <div className="
                      size-4 animate-spin rounded-full border-2 border-[#23d57c]
                      border-t-transparent
                    " />
                    <span className="text-xs font-medium">Generating...</span>
                  </div>
                )}
                {!modelBResponse.loading && modelBResponse.completed && modelBResponse.tokens && (
                  <div className="
                    flex items-center gap-3 text-xs text-[#9e9c98]
                  ">
                    <span className="font-medium">{modelBResponse.tokens} tokens</span>
                    <span className="text-[#e7e6e2]">•</span>
                    <span className="font-medium">{modelBResponse.duration?.toFixed(1)}s</span>
                  </div>
                )}
                </div>

                <div className="flex items-center">
                  <div className="
                    mr-2 flex rounded-lg border border-[#e7e6e2] bg-[#f5f5f5]
                    p-0.5
                  ">
                    <button
                      onClick={() => setModelBView('code')}
                      className={`
                        rounded-md px-3 py-1 text-xs font-medium transition-all
                        ${
                        modelBView === 'code'
                          ? 'bg-white text-black shadow-sm'
                          : `
                            text-[#666]
                            hover:text-black
                          `
                      }
                      `}
                    >
                      Code
                    </button>
                    <button
                      onClick={() => setModelBView('preview')}
                      className={`
                        rounded-md px-3 py-1 text-xs font-medium transition-all
                        ${
                        modelBView === 'preview'
                          ? 'bg-white text-black shadow-sm'
                          : `
                            text-[#666]
                            hover:text-black
                          `
                      }
                      `}
                    >
                      Preview
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      hover:bg-muted/80
                      size-8 cursor-pointer rounded-lg
                    "
                    onClick={handleGenerateModelB}
                    title="Retry generation"
                  >
                    <RotateCcw className="size-4 text-[#9e9c98]" />
                  </Button>
                  <ModelSettingsPopover
                    modelName={selectedModelB.name}
                    settings={modelBSettings}
                    onSettingsChange={setModelBSettings}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        hover:bg-muted/80
                        size-8 cursor-pointer rounded-lg
                      "
                    >
                      <SlidersHorizontal className="size-4 text-[#9e9c98]" />
                    </Button>
                  </ModelSettingsPopover>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="
                      hover:bg-muted/80
                      size-8 cursor-pointer rounded-lg
                    "
                    onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                  >
                    <Maximize className="size-4 text-[#9e9c98]" />
                  </Button>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {/* Code View - 始终渲染，用 CSS 控制显示 */}
                <div className={`
                  absolute inset-0
                  ${modelBView === 'code' ? `block` : `hidden`}
                `}>
                  <StreamingCodeDisplay
                    content={modelBResponse.content}
                    reasoning={modelBResponse.reasoning}
                    onPreview={(html) => {
                      setModelBResponse(prev => ({ ...prev, html }))
                      setModelBView('preview')
                    }}
                  />
                </div>
                
                {/* Preview View - 始终渲染，用 CSS 控制显示 */}
                <div className={`
                  absolute inset-0
                  ${modelBView === 'preview' ? `block` : `hidden`}
                `}>
                  {modelBResponse.html ? (
                    <iframe
                      srcDoc={modelBResponse.html}
                      className="size-full border-0"
                      title="Preview"
                    />
                  ) : (
                    <div className="
                      text-muted-foreground flex h-full items-center
                      justify-center
                    ">
                      {modelBResponse.loading
                        ? 'Generating HTML...'
                        : 'No HTML available for preview'}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                      if (modelAResponse.loading || modelBResponse.loading) {
                        stopGeneration()
                      } else if (modelAResponse.completed && modelBResponse.completed) {
                        handleGenerate()
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
                      modelAResponse.loading || modelBResponse.loading
                        ? `
                          bg-red-500 text-white
                          shadow-[0px_4px_6px_-4px_rgba(239,68,68,0.5)]
                          hover:bg-red-600
                        `
                        : modelAResponse.completed && modelBResponse.completed
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
                    disabled={!prompt.trim() && !(modelAResponse.loading || modelBResponse.loading)}
                  >
                    {modelAResponse.loading || modelBResponse.loading ? (
                      <Square className="size-4 fill-current" />
                    ) : modelAResponse.completed && modelBResponse.completed ? (
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
        mode={shareMode}
        appName={`${selectedModelA.name} vs ${selectedModelB.name} - ${new Date().toLocaleDateString()}`}
        shareUrl={`novita.ai/battle/${selectedModelA.id}-vs-${selectedModelB.id}`}
        videoBlob={recordedBlob}
        videoFormat={recordedFormat}
      />
    </div>
  )
}
