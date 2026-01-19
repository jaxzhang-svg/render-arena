'use client'

import React from 'react'
import { Button } from '@/components/base/button'
import { Menu } from '@base-ui/react/menu'
import { Maximize, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { ModelSettingsPopover } from '@/components/playground/model-settings-modal'
import { StreamingCodeDisplay } from '@/components/playground/streaming-code-display'
import { cn } from '@/lib/utils'
import { models, LLMModel } from '@/lib/models'
import {
  ModelResponse,
  ModelSettings,
  ViewMode,
} from '@/hooks/use-model-generation'

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
}: ModelPanelProps) {
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
          <Menu.Root>
            <Menu.Trigger
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors',
                'h-8 cursor-pointer gap-2 bg-[#f5f5f5] px-3 py-1.5',
                'hover:bg-[#e7e6e2]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
              )}
            >
              <span className={cn('size-5 rounded-sm', selectedModel.color)} />
              <span className="font-sans text-[16px] font-medium text-[#4f4e4a]">
                {selectedModel.name}
              </span>
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
              <Menu.Positioner>
                <Menu.Popup
                  className={cn(
                    'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-lg'
                  )}
                >
                  {models.map((model) => (
                    <Menu.Item
                      key={model.id}
                      onClick={() => onModelChange(model)}
                      className={cn(
                        'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
                        'hover:bg-gray-100 focus:bg-gray-100',
                        'gap-2'
                      )}
                    >
                      <span className={cn('size-5 rounded-sm', model.color)} />
                      {model.name}
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>

          {/* Status Indicator */}
          {response.loading && (
            <div className="flex items-center gap-2 text-sm text-[#9e9c98]">
              <div className="size-4 animate-spin rounded-full border-2 border-[#23d57c] border-t-transparent" />
              <span className="text-xs font-medium">Generating...</span>
            </div>
          )}
          {!response.loading && response.completed && response.tokens && (
            <div className="flex items-center gap-3 text-xs text-[#9e9c98]">
              <span className="font-medium">{response.tokens} tokens</span>
              <span className="text-[#e7e6e2]">•</span>
              <span className="font-medium">{response.duration?.toFixed(1)}s</span>
            </div>
          )}
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
              className={cn(
                'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-all',
                viewMode === 'preview'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#666] hover:text-black'
              )}
            >
              Preview
            </button>
          </div>

          {/* Regenerate Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
            onClick={onRegenerate}
            title="Retry generation"
          >
            <RotateCcw className="size-4 text-[#9e9c98]" />
          </Button>

          {/* Settings Button */}
          <ModelSettingsPopover
            modelName={selectedModel.name}
            settings={settings}
            onSettingsChange={onSettingsChange}
          >
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 size-8 cursor-pointer rounded-lg"
            >
              <SlidersHorizontal className="size-4 text-[#9e9c98]" />
            </Button>
          </ModelSettingsPopover>

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
            onPreview={(html) => {
              onResponseChange((prev) => ({ ...prev, html }))
              onViewModeChange('preview')
            }}
          />
        </div>

        {/* Preview View - 始终渲染，用 CSS 控制显示 */}
        <div className={cn('absolute inset-0', viewMode === 'preview' ? 'block' : 'hidden')}>
          {response.html ? (
            <iframe srcDoc={response.html} className="size-full border-0" title="Preview" />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              {response.loading ? 'Generating HTML...' : 'No HTML available for preview'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
