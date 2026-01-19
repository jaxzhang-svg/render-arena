'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/base/button'
import { Textarea } from '@/components/base/textarea'
import {
  Video,
  Share,
  Maximize,
  ArrowUp,
  ArrowLeft,
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
import { Menu } from '@base-ui/react/menu'
import { cn } from '@/lib/utils'
import { models, LLMModel, getModelById } from '@/lib/models'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import { extractHTMLFromMarkdown } from '@/lib/html-extractor'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { App } from '@/types'

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

interface PlaygroundClientProps {
  initialApp?: App | null
  appId?: string
}

export default function PlaygroundClient({ initialApp, appId }: PlaygroundClientProps) {
  const searchParams = useSearchParams()
  const urlPrompt = searchParams.get('prompt')
  const autoStart = searchParams.get('autoStart') === 'true'
  
  const [currentAppId, setCurrentAppId] = useState<string | undefined>(appId)
  
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [prompt, setPrompt] = useState(initialApp?.prompt || urlPrompt || '')
  const [showInputBar, setShowInputBar] = useState(true)
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // 初始化模型选择
  const getInitialModel = (modelId: string | undefined, fallbackIndex: number): LLMModel => {
    if (modelId) {
      const model = getModelById(modelId)
      if (model) return model
    }
    return models[fallbackIndex]
  }

  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(
    getInitialModel(initialApp?.model_a, 0)
  )
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(
    getInitialModel(initialApp?.model_b, 1)
  )

  const [modelAView, setModelAView] = useState<'code' | 'preview'>(
    initialApp?.html_content_a ? 'preview' : 'code'
  )
  const [modelBView, setModelBView] = useState<'code' | 'preview'>(
    initialApp?.html_content_b ? 'preview' : 'code'
  )

  const [modelAResponse, setModelAResponse] = useState<ModelResponse>({
    ...initialModelResponse,
    html: initialApp?.html_content_a || undefined,
    completed: !!initialApp?.html_content_a,
  })
  const [modelBResponse, setModelBResponse] = useState<ModelResponse>({
    ...initialModelResponse,
    html: initialApp?.html_content_b || undefined,
    completed: !!initialApp?.html_content_b,
  })
  
  // 使用 ref 来追踪最新状态，避免闭包陷阱
  const modelAResponseRef = useRef(modelAResponse)
  const modelBResponseRef = useRef(modelBResponse)
  
  // AbortController 用于中断请求
  const abortControllerARef = useRef<AbortController | null>(null)
  const abortControllerBRef = useRef<AbortController | null>(null)
  
  // 同步更新 ref
  modelAResponseRef.current = modelAResponse
  modelBResponseRef.current = modelBResponse

  // 通过 SSE 生成单个模型的内容
  const generateModel = useCallback(async (
    targetAppId: string,
    model: 'a' | 'b',
    setResponse: React.Dispatch<React.SetStateAction<ModelResponse>>,
    setView: React.Dispatch<React.SetStateAction<'code' | 'preview'>>,
    otherResponseRef: React.RefObject<ModelResponse>,
    setOtherView: React.Dispatch<React.SetStateAction<'code' | 'preview'>>,
    signal?: AbortSignal
  ) => {
    const startTime = Date.now()
    
    setView('code')
    setResponse({ content: '', reasoning: '', loading: true, completed: false, startTime })

    try {
      await fetchEventSource(`/api/apps/${targetAppId}/generate?model=${model}`, {
        method: 'GET',
        openWhenHidden: true,
        signal,
        onopen: async (response) => {
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP error: ${response.status} ${errorText}`)
          }
        },
        onmessage: (msg) => {
          if (msg.data === '[DONE]') {
            return
          }

          try {
            const data = JSON.parse(msg.data)
            const delta = data.choices?.[0]?.delta

            if (delta) {
              setResponse((prev) => ({
                ...prev,
                content: prev.content + (delta.content || ''),
                reasoning: (prev.reasoning || '') + (delta.reasoning_content || ''),
              }))
            }
          } catch {
            // Ignore parsing errors
          }
        },
        onerror: (error) => {
          throw error
        },
        onclose: () => {
          setResponse((prev) => {
            const html = extractHTMLFromMarkdown(prev.content)
            const duration = (Date.now() - startTime) / 1000
            const tokens = Math.floor(prev.content.length / 4)
            
            if (otherResponseRef.current?.completed && otherResponseRef.current?.html && html) {
              setView('preview')
              setOtherView('preview')
            }
            
            // 保存 HTML 到数据库
            if (html) {
              const fieldName = model === 'a' ? 'html_content_a' : 'html_content_b'
              fetch(`/api/apps/${targetAppId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldName]: html }),
              }).catch((err) => {
                console.error(`Failed to save HTML for model ${model}:`, err)
              })
            }
            
            return {
              ...prev,
              loading: false,
              completed: true,
              html: html || undefined,
              duration,
              tokens,
            }
          })
        },
      })
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setResponse((prev) => ({ ...prev, loading: false }))
        return
      }
      console.error(`Model ${model} error:`, error)
      setResponse((prev) => ({
        ...prev,
        content: prev.content + '\n\nError: ' + (error as Error).message,
        loading: false,
        completed: true,
      }))
    }
  }, [])

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

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording()
      setShowInputBar(true)
    } else {
      setShowInputBar(false)
      await startRecording()
    }
  }

  // 创建 App 并获取 appId
  const createApp = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/apps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelA: selectedModelA.id,
          modelB: selectedModelB.id,
        }),
      })

      const data = await response.json()
      
      if (!data.success) {
        if (data.error === 'FREE_QUOTA_EXCEEDED') {
          alert(data.message || '免费额度已用完，请登录后继续使用')
          return null
        }
        throw new Error(data.message || 'Failed to create app')
      }

      return data.appId
    } catch (error) {
      console.error('Error creating app:', error)
      alert('创建失败，请稍后重试')
      return null
    }
  }, [prompt, selectedModelA.id, selectedModelB.id])

  // 停止 Model A 生成
  const stopModelA = useCallback(() => {
    if (abortControllerARef.current) {
      abortControllerARef.current.abort()
      abortControllerARef.current = null
    }
  }, [])

  // 停止 Model B 生成
  const stopModelB = useCallback(() => {
    if (abortControllerBRef.current) {
      abortControllerBRef.current.abort()
      abortControllerBRef.current = null
    }
  }, [])

  // 停止两个模型的生成
  const stopAllGeneration = useCallback(() => {
    stopModelA()
    stopModelB()
  }, [stopModelA, stopModelB])

  // 同时生成两个模型
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return

    // 隐藏输入框
    setShowInputBar(false)

    // 先停止之前的生成
    stopAllGeneration()

    // 创建新的 App
    const newAppId = await createApp()
    if (!newAppId) return

    // 更新内部状态
    setCurrentAppId(newAppId)
    
    // 使用 history.replaceState 更新 URL，不触发 Next.js 路由导航
    window.history.replaceState(null, '', `/playground/${newAppId}`)

    // 创建新的 AbortController
    abortControllerARef.current = new AbortController()
    abortControllerBRef.current = new AbortController()

    // 并行生成两个模型
    await Promise.allSettled([
      generateModel(
        newAppId,
        'a',
        setModelAResponse,
        setModelAView,
        modelBResponseRef,
        setModelBView,
        abortControllerARef.current.signal
      ),
      generateModel(
        newAppId,
        'b',
        setModelBResponse,
        setModelBView,
        modelAResponseRef,
        setModelAView,
        abortControllerBRef.current.signal
      ),
    ])
  }, [prompt, createApp, generateModel, stopAllGeneration])

  // 自动开始生成（从首页跳转时）
  useEffect(() => {
    if (autoStart && urlPrompt && !hasAutoStarted && !initialApp) {
      setHasAutoStarted(true)
      // 使用 setTimeout 确保组件完全挂载
      const timer = setTimeout(() => {
        handleGenerate()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoStart, urlPrompt, hasAutoStarted, initialApp, handleGenerate])

  // 单独重新生成 Model A
  const handleGenerateModelA = useCallback(async () => {
    if (!currentAppId) {
      handleGenerate()
      return
    }

    // 停止之前的 Model A 生成
    stopModelA()
    abortControllerARef.current = new AbortController()

    await generateModel(
      currentAppId,
      'a',
      setModelAResponse,
      setModelAView,
      modelBResponseRef,
      setModelBView,
      abortControllerARef.current.signal
    )
  }, [currentAppId, handleGenerate, generateModel, stopModelA])

  // 单独重新生成 Model B
  const handleGenerateModelB = useCallback(async () => {
    if (!currentAppId) {
      handleGenerate()
      return
    }

    // 停止之前的 Model B 生成
    stopModelB()
    abortControllerBRef.current = new AbortController()

    await generateModel(
      currentAppId,
      'b',
      setModelBResponse,
      setModelBView,
      modelAResponseRef,
      setModelAView,
      abortControllerBRef.current.signal
    )
  }, [currentAppId, handleGenerate, generateModel, stopModelB])

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
                  <Menu.Root>
                    <Menu.Trigger className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors",
                      "h-8 cursor-pointer gap-2 bg-[#f5f5f5] px-3 py-1.5",
                      "hover:bg-[#e7e6e2]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    )}>
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
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner>
                        <Menu.Popup className={cn(
                          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-lg"
                        )}>
                          {models.map((model) => (
                            <Menu.Item
                              key={model.id}
                              onClick={() => setSelectedModelA(model)}
                              className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                                "hover:bg-gray-100 focus:bg-gray-100",
                                "gap-2"
                              )}
                            >
                              <span className={`
                                size-5 rounded-sm
                                ${model.color}
                              `} />
                              {model.name}
                            </Menu.Item>
                          ))}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                
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
                      asChild
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
                  <Menu.Root>
                    <Menu.Trigger className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors",
                      "h-8 cursor-pointer gap-2 bg-[#f5f5f5] px-3 py-1.5",
                      "hover:bg-[#e7e6e2]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    )}>
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
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner>
                        <Menu.Popup className={cn(
                          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-lg"
                        )}>
                          {models.map((model) => (
                            <Menu.Item
                              key={model.id}
                              onClick={() => setSelectedModelB(model)}
                              className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
                                "hover:bg-gray-100 focus:bg-gray-100",
                                "gap-2"
                              )}
                            >
                              <span className={`
                                size-5 rounded-sm
                                ${model.color}
                              `} />
                              {model.name}
                            </Menu.Item>
                          ))}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                
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
                        cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all
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
                        cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all
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
                      asChild
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
