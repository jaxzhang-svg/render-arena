'use client'

import React, { useId, useState, useEffect } from 'react'
import { Button } from '@/components/base/button'
import { Menu } from '@base-ui/react/menu'
import { Maximize, RotateCcw, Zap, DollarSign, Clock } from 'lucide-react'
import Image from 'next/image'
import { ModelSettingsPopover } from '@/components/playground/model-settings-modal'
import { StreamingCodeDisplay } from '@/components/playground/streaming-code-display'
import { cn } from '@/lib/utils'
import { LLMModel, modelGroups } from '@/lib/config'
import { ModelResponse, ModelSettings, ViewMode } from '@/hooks/use-model-generation'
import DOMPurify from 'isomorphic-dompurify'
import { DOMPURIFY_CONFIG } from '@/lib/sanitizer'
import { calculateTokensAndCost } from '@/lib/pricing'

// Re-export types for convenience
export type { ModelResponse, ModelSettings, ViewMode }

interface ModelPanelProps {
  /** 当前选中的模型 */
  selectedModel: LLMModel
  /** 模型选择变更回调 */
  onModelChange: (model: LLMModel) => void
  /** 模型响应状态 */
  response: ModelResponse
  /** 更新响应状态 */
  onResponseChange: (updater: (prev: ModelResponse) => ModelResponse) => void
  /** 当前视图模式 (code/preview) */
  viewMode: ViewMode
  /** 视图模式变更回调 */
  onViewModeChange: (mode: ViewMode) => void
  /** 模型设置 */
  settings: ModelSettings
  /** 设置变更回调 */
  onSettingsChange: (settings: ModelSettings) => void
  /** 重新生成回调 */
  onRegenerate: () => void
  /** 最大化/恢复回调 */
  onToggleMaximize: () => void
  /** 是否显示右边框 */
  showRightBorder?: boolean
  /** 自定义类名 */
  className?: string
  /** 滚动到底部按钮的位置 */
  scrollButtonPosition?: 'left' | 'right'
  /** 对比数据（用于显示相对性能） */
  comparisonData?: {
    tokens?: number
    cost?: number | null
    duration?: number
  }
}

export function ModelPanel({
  selectedModel,
  onModelChange,
  response,
  onResponseChange,
  viewMode,
  onViewModeChange,
  settings,
  onSettingsChange,
  onRegenerate,
  onToggleMaximize,
  showRightBorder = false,
  className,
  scrollButtonPosition = 'right',
  comparisonData,
}: ModelPanelProps) {
  const menuTriggerId = useId()
  const [currentTime, setCurrentTime] = useState(0)
  
  // Update current time during generation
  useEffect(() => {
    if (!response.loading || !response.startTime) return
    
    const updateTime = () => {
      setCurrentTime((Date.now() - response.startTime!) / 1000)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 100)
    
    return () => clearInterval(interval)
  }, [response.loading, response.startTime])
  
  // Use duration when not loading
  const displayTime = response.loading ? currentTime : response.duration || 0
  
  // Calculate tokens - estimate from content if no token data available
  const actualTokens = response.outputTokens ?? response.tokens
  const estimatedTokens = actualTokens 
    ? actualTokens 
    : response.content 
      ? Math.ceil(response.content.length / 3) // Rough estimation: ~3.5 chars per token
      : null
  
  const { tokens, cost } = calculateTokensAndCost(
    estimatedTokens,
    selectedModel.id
  )

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden bg-white',
        showRightBorder && 'border-r border-[#f4f4f5]',
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#e7e6e2] bg-white px-4">
        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div suppressHydrationWarning>
            <Menu.Root>
              <Menu.Trigger
                id={menuTriggerId}
                openOnHover
                className={cn(
                  'inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  'h-8 cursor-pointer gap-2 bg-white px-3 py-1.5',
                  'hover:bg-[#F5F5F5]',
                  'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                )}
              >
                <Image
                  src={selectedModel.icon}
                  alt={selectedModel.name}
                  width={20}
                  height={20}
                  className="size-5 rounded-sm"
                />
                <span className="font-sans text-[16px] font-medium text-[#4f4e4a]">
                  {selectedModel.name}
                </span>
                {selectedModel.outputPrice !== undefined && (
                  <span className="rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    ${selectedModel.outputPrice}/Mt
                  </span>
                )}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="#9e9c98"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner sideOffset={8} align="start">
                  <Menu.Popup
                    className={cn(
                      'z-50 min-w-[8rem] overflow-hidden rounded-[14px] border border-[#e7e6e2] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'
                    )}
                  >
                    <div className="scrollbar-hide flex max-h-[400px] flex-col gap-[4px] overflow-y-auto p-[7px] pt-0 pt-[12px]">
                      {modelGroups.map(group => {
                        if (group.items.length === 0) return null

                        return (
                          <div key={group.group} className="mb-2 flex flex-col">
                            <p className="px-[8px] py-1 text-[12px] font-medium tracking-tight text-[#9e9c98] uppercase">
                              {group.group}
                            </p>
                            {group.items.map(model => (
                              <Menu.Item
                                key={model.id}
                                onClick={() =>
                                  onModelChange({
                                    ...model,
                                    group: group.group,
                                    color: model.color,
                                    icon: model.icon,
                                  })
                                }
                                className={cn(
                                  'relative flex cursor-pointer items-center rounded-[10px] px-[8px] transition-colors outline-none select-none',
                                  'h-[36px] w-full',
                                  selectedModel.id === model.id
                                    ? 'bg-[#f5f5f5]'
                                    : 'hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]',
                                  'gap-[8px]'
                                )}
                              >
                                <Image
                                  src={model.icon}
                                  alt={model.name}
                                  width={20}
                                  height={20}
                                  className="size-[20px] shrink-0 rounded-sm"
                                />
                                <span className="truncate text-[15px] leading-tight font-normal text-[#292827]">
                                  {model.name}
                                </span>
                              </Menu.Item>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>

          {/* Status Indicator - Real-time metrics with comparison */}
          {(response.loading || (response.completed && response.tokens)) && (() => {
            // Calculate comparison ratios
            const costRatio = comparisonData?.cost && cost && comparisonData.cost > 0 && cost > 0
              ? comparisonData.cost / cost
              : null
            const durationRatio = comparisonData?.duration && displayTime && comparisonData.duration > 0 && displayTime > 0
              ? comparisonData.duration / displayTime
              : null
            
            const isCostWinner = costRatio && costRatio > 1.1 // At least 10% cheaper
            const isDurationWinner = durationRatio && durationRatio >= 1.5 // At least 50% faster

            return (
              <div className="flex items-center gap-2">
                {response.loading && (
                  <div className="size-4 animate-spin rounded-full border-2 border-[#23d57c] border-t-transparent" />
                )}
                
                {/* Cost Badge */}
                {cost !== null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700 ring-1 ring-inset ring-green-700/10">
                    <DollarSign className="size-3.5" />
                    <span>{cost.toFixed(4)}</span>
                    {isCostWinner && costRatio && costRatio > 1.5 && (
                      <span className="ml-0.5 text-xs text-green-600">
                        {costRatio.toFixed(1)}x cheaper
                      </span>
                    )}
                  </span>
                )}
                
                {/* Duration Badge */}
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  <Clock className="size-3.5" />
                  <span>{displayTime.toFixed(1)}s</span>
                  {isDurationWinner && durationRatio && durationRatio > 1.5 && (
                    <span className="ml-0.5 text-xs text-blue-600">
                      {durationRatio.toFixed(1)}x faster
                    </span>
                  )}
                </span>
                
                {/* Token Badge - De-emphasized */}
                {tokens !== null && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-600 ring-1 ring-inset ring-gray-600/10">
                    <Zap className="size-3.5" />
                    <span>{tokens.toLocaleString()} tokens</span>
                  </span>
                )}
              </div>
            )
          })()}
        </div>

        {/* Actions */}
        <div className="flex items-center">
          {/* View Mode Toggle */}
          <div className="mr-2 flex rounded-lg border border-[#e7e6e2] bg-[#f5f5f5] p-0.5">
            <button
              onClick={() => onViewModeChange('code')}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all',
                viewMode === 'code'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666] hover:text-black'
              )}
            >
              Code
            </button>
            <button
              onClick={() => onViewModeChange('preview')}
              disabled={response.loading}
              className={cn(
                'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all',
                viewMode === 'preview'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666] hover:text-black',
                response.loading && 'cursor-not-allowed opacity-50'
              )}
            >
              Preview
            </button>
          </div>

          {/* Regenerate Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 rounded-lg',
              response.completed ? 'hover:bg-muted/80 cursor-pointer' : 'cursor-not-allowed'
            )}
            onClick={onRegenerate}
            disabled={!response.completed}
            title="Retry generation"
          >
            <RotateCcw
              className={cn('size-4', response.completed ? 'text-[#9e9c98]' : 'text-gray-300')}
            />
          </Button>

          <ModelSettingsPopover settings={settings} onSettingsChange={onSettingsChange} />

          {/* Maximize Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
            onClick={onToggleMaximize}
          >
            <Maximize className="size-4 text-[#9e9c98]" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Code View - 始终渲染，用 CSS 控制显示 */}
        <div className={cn('absolute inset-0', viewMode === 'code' ? 'block' : 'hidden')}>
          <StreamingCodeDisplay
            content={response.content}
            reasoning={response.reasoning}
            isStreaming={response.loading}
            scrollButtonPosition={scrollButtonPosition}
            onPreview={html => {
              onResponseChange(prev => ({ ...prev, html }))
              onViewModeChange('preview')
            }}
          />
        </div>

        {/* Preview View - 始终渲染，用 CSS 控制显示 */}
        <div className={cn('absolute inset-0', viewMode === 'preview' ? 'block' : 'hidden')}>
          {response.html ? (
            <iframe
              srcDoc={DOMPurify.sanitize(response.html, DOMPURIFY_CONFIG)}
              className="size-full border-0"
              title="Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {response.loading ? 'Generating HTML...' : 'No HTML available for preview.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
