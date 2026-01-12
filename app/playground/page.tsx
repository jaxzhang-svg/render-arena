'use client'

import { useState, useEffect, useCallback } from 'react'
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
  SplitSquareHorizontal,
  Download,
  Eye,
  EyeOff,
  Square,
} from 'lucide-react'
import { StepIndicator } from '@/components/app/step-indicator'
import { ShareModal } from '@/components/app/share-modal'
import { UserAvatar } from '@/components/app/user-avatar'
import { FragmentWeb } from '@/components/app/fragment-web'
import { StepConfig } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { fragmentSchema, FragmentSchema } from '@/lib/schema'
import { models, LLMModel } from '@/lib/models'
import { ExecutionResultWeb } from '@/lib/types'
import { DeepPartial } from 'ai'

function getStepsFromFragment(
  fragment: DeepPartial<FragmentSchema> | undefined,
  isLoading: boolean,
  isPreviewLoading: boolean,
  hasResult: boolean
): StepConfig[] {
  if (!isLoading && !isPreviewLoading && !fragment) {
    return [
      { title: 'Waiting for input', status: 'pending', icon: 'hourglass' },
    ]
  }

  const steps: StepConfig[] = []

  if (fragment?.commentary) {
    steps.push({
      title: 'Analyzing Requirements',
      status: 'completed',
      icon: 'check',
    })
  } else if (isLoading) {
    steps.push({
      title: 'Analyzing Requirements',
      status: 'in-progress',
      icon: 'search',
    })
  }

  if (fragment?.code) {
    steps.push({
      title: 'Generating Code',
      status: 'completed',
      icon: 'check',
      codePreview: fragment.code.slice(0, 200) + '...',
    })
  } else if (isLoading && fragment?.commentary) {
    steps.push({
      title: 'Generating Code',
      status: 'in-progress',
      icon: 'code',
    })
  }

  if (hasResult) {
    steps.push({
      title: 'Preview Ready',
      status: 'completed',
      icon: 'check',
    })
  } else if (isPreviewLoading) {
    steps.push({
      title: 'Creating Sandbox',
      status: 'in-progress',
      icon: 'play-circle',
    })
  } else if (fragment?.code && !isLoading) {
    steps.push({
      title: 'Creating Sandbox',
      status: 'pending',
      icon: 'play-circle',
    })
  }

  return steps.length > 0
    ? steps
    : [{ title: 'Waiting for input', status: 'pending', icon: 'hourglass' }]
}

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split')
  const [prompt, setPrompt] = useState(
    'Make a mobile ordering app for a coffee shop with a modern minimal white design.'
  )
  const [showInputBar, setShowInputBar] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(models[0])
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(models[1])

  const [resultA, setResultA] = useState<ExecutionResultWeb | undefined>()
  const [resultB, setResultB] = useState<ExecutionResultWeb | undefined>()
  const [isPreviewLoadingA, setIsPreviewLoadingA] = useState(false)
  const [isPreviewLoadingB, setIsPreviewLoadingB] = useState(false)
  const [errorA, setErrorA] = useState<string | undefined>()
  const [errorB, setErrorB] = useState<string | undefined>()

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster')

  const handleSandboxA = useCallback(async (fragment: FragmentSchema) => {
    setIsPreviewLoadingA(true)
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        body: JSON.stringify({ fragment }),
      })
      const result = await response.json()
      setResultA(result)
    } catch (err) {
      console.error('Sandbox error A:', err)
      setErrorA('Failed to create sandbox')
    } finally {
      setIsPreviewLoadingA(false)
    }
  }, [])

  const handleSandboxB = useCallback(async (fragment: FragmentSchema) => {
    setIsPreviewLoadingB(true)
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        body: JSON.stringify({ fragment }),
      })
      const result = await response.json()
      setResultB(result)
    } catch (err) {
      console.error('Sandbox error B:', err)
      setErrorB('Failed to create sandbox')
    } finally {
      setIsPreviewLoadingB(false)
    }
  }, [])

  const {
    object: objectA,
    submit: submitA,
    isLoading: isLoadingA,
    stop: stopA,
  } = useObject({
    api: '/api/chat',
    schema: fragmentSchema,
    onError: (error: Error) => {
      console.error('Error generating A:', error)
      setErrorA(error.message)
    },
    onFinish: async ({ object: fragment, error }: { object: FragmentSchema | undefined; error: Error | undefined }) => {
      if (!error && fragment) {
        handleSandboxA(fragment)
      }
    },
  })

  const {
    object: objectB,
    submit: submitB,
    isLoading: isLoadingB,
    stop: stopB,
  } = useObject({
    api: '/api/chat',
    schema: fragmentSchema,
    onError: (error: Error) => {
      console.error('Error generating B:', error)
      setErrorB(error.message)
    },
    onFinish: async ({ object: fragment, error }: { object: FragmentSchema | undefined; error: Error | undefined }) => {
      if (!error && fragment) {
        handleSandboxB(fragment)
      }
    },
  })

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false)
      setRecordingTime(0)
      setShowInputBar(true)
      setShareMode('video')
      setTimeout(() => setShowShareModal(true), 300)
    } else {
      setIsRecording(true)
      setRecordingTime(0)
      setShowInputBar(false)
    }
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setResultA(undefined)
    setResultB(undefined)
    setErrorA(undefined)
    setErrorB(undefined)

    const messages = [{ role: 'user' as const, content: prompt }]

    submitA({ messages, model: selectedModelA })
    submitB({ messages, model: selectedModelB })
  }

  const handleStop = () => {
    stopA()
    stopB()
  }

  const handleDownload = (modelName: string, code: string | undefined) => {
    if (!code) return
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${modelName.replace(/\s+/g, '-').toLowerCase()}-code.tsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const stepsA = getStepsFromFragment(objectA, isLoadingA, isPreviewLoadingA, !!resultA)
  const stepsB = getStepsFromFragment(objectB, isLoadingB, isPreviewLoadingB, !!resultB)

  const isAnyLoading = isLoadingA || isLoadingB

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/50">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-30">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-lg hover:bg-muted/80 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3"></div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size={isRecording ? 'default' : 'icon'}
            className={`rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer ${
              isRecording ? 'gap-2 px-3 h-9' : 'size-9'
            }`}
            onClick={handleRecordToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 fill-red-500 text-red-500" />
                <span className="text-sm font-mono">
                  {formatTime(recordingTime)}
                </span>
              </>
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            title="Share"
            onClick={() => {
              setShareMode('poster')
              setShowShareModal(true)
            }}
          >
            <Share className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              $1,250.00
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <UserAvatar />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        <div className="flex flex-1 flex-col min-w-[300px] relative group/panel">
          <div
            className={`flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-muted/30 relative ${
              viewMode === 'split' ? 'flex overflow-x-auto' : ''
            }`}
          >
            {(viewMode === 'split' || viewMode === 'a') && (
              <div
                className={`relative transition-all duration-300 bg-background shrink-0 ${
                  viewMode === 'split'
                    ? 'min-w-[600px] w-1/2 border-r border-border'
                    : 'w-full h-full'
                }`}
                style={{
                  aspectRatio: viewMode === 'split' ? '4/3' : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${selectedModelA.color}`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedModelA.name}
                    </span>
                    {objectA?.title && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                        {objectA.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => handleDownload(selectedModelA.name, objectA?.code)}
                      disabled={!objectA?.code}
                      title="Download code"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                      title={viewMode === 'a' ? 'Split view' : 'Fullscreen'}
                    >
                      {viewMode === 'a' ? (
                        <SplitSquareHorizontal className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {resultA ? (
                  <div className="w-full h-full pt-10">
                    <FragmentWeb result={resultA} />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                    <div className="w-full max-w-sm">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          {isLoadingA || isPreviewLoadingA ? 'Processing' : 'Ready'}
                        </span>
                        {(isLoadingA || isPreviewLoadingA) && (
                          <span className="flex size-2 relative">
                            <span
                              className={`absolute inline-flex h-full w-full rounded-full ${selectedModelA.color} opacity-75 animate-ping`}
                            />
                            <span
                              className={`relative inline-flex rounded-full size-2 ${selectedModelA.color}`}
                            />
                          </span>
                        )}
                      </div>
                      <StepIndicator steps={stepsA} />
                      {errorA && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                          {errorA}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(viewMode === 'split' || viewMode === 'b') && (
              <div
                className={`relative transition-all duration-300 bg-background shrink-0 ${
                  viewMode === 'split' ? 'min-w-[600px] w-1/2' : 'w-full h-full'
                }`}
                style={{
                  aspectRatio: viewMode === 'split' ? '4/3' : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${selectedModelB.color}`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedModelB.name}
                    </span>
                    {objectB?.title && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                        {objectB.title}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => handleDownload(selectedModelB.name, objectB?.code)}
                      disabled={!objectB?.code}
                      title="Download code"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                      onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                      title={viewMode === 'b' ? 'Split view' : 'Fullscreen'}
                    >
                      {viewMode === 'b' ? (
                        <SplitSquareHorizontal className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {resultB ? (
                  <div className="w-full h-full pt-10">
                    <FragmentWeb result={resultB} />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                    <div className="w-full max-w-sm">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                          {isLoadingB || isPreviewLoadingB ? 'Processing' : 'Ready'}
                        </span>
                        {(isLoadingB || isPreviewLoadingB) && (
                          <span className="flex size-2 relative">
                            <span
                              className={`absolute inline-flex h-full w-full rounded-full ${selectedModelB.color} opacity-75 animate-ping`}
                            />
                            <span
                              className={`relative inline-flex rounded-full size-2 ${selectedModelB.color}`}
                            />
                          </span>
                        )}
                      </div>
                      <StepIndicator steps={stepsB} />
                      {errorB && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                          {errorB}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showInputBar && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
            <div className="relative rounded-2xl shadow-2xl bg-background/80 backdrop-blur-xl border border-white/20 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
              <div className="flex flex-col p-1">
                <div className="flex items-end gap-2 p-2">
                  <div className="flex-1 min-h-[56px] relative">
                    <Textarea
                      placeholder="Describe the app you want to build..."
                      className="w-full h-14 min-h-[56px] max-h-40 bg-transparent border-0 resize-none focus-visible:ring-0 p-2 text-base leading-relaxed placeholder:text-muted-foreground/50 font-medium"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isAnyLoading}
                    />
                  </div>
                  <Button
                    onClick={isAnyLoading ? handleStop : handleGenerate}
                    size="icon"
                    className="mb-1 size-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 group shrink-0"
                    disabled={!prompt.trim() && !isAnyLoading}
                  >
                    {isAnyLoading ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between px-3 pb-2 pt-1">
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span
                            className={`size-2 rounded-full ${selectedModelA.color}`}
                          />
                          {selectedModelA.name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModelA(model)}
                            className="gap-2 cursor-pointer"
                          >
                            <span
                              className={`size-2 rounded-full ${model.color}`}
                            />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-xs font-bold text-muted-foreground">
                      VS
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span
                            className={`size-2 rounded-full ${selectedModelB.color}`}
                          />
                          {selectedModelB.name}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModelB(model)}
                            className="gap-2 cursor-pointer"
                          >
                            <span
                              className={`size-2 rounded-full ${model.color}`}
                            />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setShowInputBar(false)}
                      title="Hide input bar"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
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
            className="absolute bottom-8 left-1/2 -translate-x-1/2 gap-2 px-4 py-2 rounded-full shadow-lg cursor-pointer"
            title="Show input bar"
          >
            <Eye className="h-4 w-4" />
            Show Input
          </Button>
        )}
      </main>

      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        mode={shareMode}
        appName={`${selectedModelA.name} vs ${selectedModelB.name} - ${new Date().toLocaleDateString()}`}
        shareUrl={`novita.ai/battle/${selectedModelA.id}-vs-${selectedModelB.id}`}
      />
    </div>
  )
}
