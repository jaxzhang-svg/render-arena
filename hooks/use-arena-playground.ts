import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useModelGeneration } from './use-model-generation'
import type { App } from '@/types'

export type ArenaViewMode = 'a' | 'b' | 'split'

interface UseArenaPlaygroundOptions {
  /** 初始应用数据 */
  initialApp?: App | null
  /** 应用 ID */
  appId?: string
}

interface UseArenaPlaygroundReturn {
  // App 状态
  /** 当前应用 ID */
  currentAppId: string | undefined
  /** 提示词 */
  prompt: string
  /** 设置提示词 */
  setPrompt: (prompt: string) => void

  // 视图状态
  /** Arena 视图模式 (a/b/split) */
  arenaViewMode: ArenaViewMode
  /** 设置 Arena 视图模式 */
  setArenaViewMode: (mode: ArenaViewMode) => void
  /** 是否显示输入栏 */
  showInputBar: boolean
  /** 设置是否显示输入栏 */
  setShowInputBar: (show: boolean) => void

  // Model A
  modelA: ReturnType<typeof useModelGeneration>

  // Model B
  modelB: ReturnType<typeof useModelGeneration>

  // 生成操作
  /** 同时生成两个模型 */
  handleGenerate: () => Promise<void>
  /** 重新生成 Model A */
  handleGenerateModelA: () => Promise<void>
  /** 重新生成 Model B */
  handleGenerateModelB: () => Promise<void>
  /** 停止所有生成 */
  stopAllGeneration: () => void
  /** 是否有任一模型正在生成 */
  isAnyLoading: boolean
  /** 是否所有模型都已完成 */
  isAllCompleted: boolean
}

/**
 * Arena Playground 的核心 Hook
 * 
 * 管理两个模型的对比、生成和状态
 */
export function useArenaPlayground({
  initialApp,
  appId,
}: UseArenaPlaygroundOptions): UseArenaPlaygroundReturn {
  const searchParams = useSearchParams()
  const urlPrompt = searchParams.get('prompt')
  const urlCategory = searchParams.get('category') || ''
  const autoStart = searchParams.get('autoStart') === 'true'

  // App 状态
  const [currentAppId, setCurrentAppId] = useState<string | undefined>(appId)
  const [prompt, setPrompt] = useState(initialApp?.prompt || urlPrompt || '')
  const [category] = useState(initialApp?.category || urlCategory || '')
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // 视图状态
  const [arenaViewMode, setArenaViewMode] = useState<ArenaViewMode>('split')
  const [showInputBar, setShowInputBar] = useState(true)

  // Model A
  const modelA = useModelGeneration({
    slot: 'a',
    initialModelId: initialApp?.model_a,
    fallbackModelIndex: 0,
    initialHtml: initialApp?.html_content_a || undefined,
  })

  // Model B
  const modelB = useModelGeneration({
    slot: 'b',
    initialModelId: initialApp?.model_b,
    fallbackModelIndex: 1,
    initialHtml: initialApp?.html_content_b || undefined,
  })

  // 停止所有生成
  const stopAllGeneration = useCallback(() => {
    modelA.stop()
    modelB.stop()
  }, [modelA, modelB])

  // 创建 App
  const createApp = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/apps/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          modelA: modelA.selectedModel.id,
          modelB: modelB.selectedModel.id,
          category: category,
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
  }, [prompt, category, modelA.selectedModel.id, modelB.selectedModel.id])

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

    // 更新状态
    setCurrentAppId(newAppId)

    // 使用 history.replaceState 更新 URL，不触发 Next.js 路由导航
    window.history.replaceState(null, '', `/playground/${newAppId}`)

    // 并行生成两个模型
    await Promise.allSettled([
      modelA.generate(newAppId),
      modelB.generate(newAppId),
    ])
  }, [prompt, createApp, stopAllGeneration, modelA, modelB])

  // 单独重新生成 Model A
  const handleGenerateModelA = useCallback(async () => {
    if (!currentAppId) {
      return
    }

    await modelA.generate(currentAppId)
  }, [currentAppId, handleGenerate, modelA])

  // 单独重新生成 Model B
  const handleGenerateModelB = useCallback(async () => {
    if (!currentAppId) {
      return
    }

    await modelB.generate(currentAppId)
  }, [currentAppId, handleGenerate, modelB])

  // 自动开始生成（从首页跳转时）
  useEffect(() => {
    const shouldAutoStart = autoStart && urlPrompt && !initialApp && !currentAppId && modelA.selectedModel.id && modelB.selectedModel.id
    console.log('autoStart check:', { autoStart, urlPrompt, hasAutoStarted, initialApp, currentAppId, hasModelA: !!modelA.selectedModel.id, hasModelB: !!modelB.selectedModel.id, shouldAutoStart })

    if (shouldAutoStart && !hasAutoStarted) {
      setHasAutoStarted(true)
      const timer = setTimeout(() => {
        handleGenerate()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [autoStart, urlPrompt, hasAutoStarted, initialApp, currentAppId, handleGenerate, modelA.selectedModel.id, modelB.selectedModel.id])

  return {
    // App 状态
    currentAppId,
    prompt,
    setPrompt,

    // 视图状态
    arenaViewMode,
    setArenaViewMode,
    showInputBar,
    setShowInputBar,

    // Models
    modelA,
    modelB,

    // 生成操作
    handleGenerate,
    handleGenerateModelA,
    handleGenerateModelB,
    stopAllGeneration,
    isAnyLoading: modelA.isLoading || modelB.isLoading,
    isAllCompleted: modelA.response.completed && modelB.response.completed,
  }
}
