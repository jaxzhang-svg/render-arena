'use client'

import { useEffect, useRef } from 'react'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { math } from '@streamdown/math'
import { cjk } from '@streamdown/cjk'
import 'katex/dist/katex.min.css'

interface StreamingCodeDisplayProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
  isStreaming?: boolean
}

/**
 * 使用 Streamdown 原生效果的流式 Markdown 渲染组件
 */
export function StreamingCodeDisplay({
  content,
  reasoning,
  onPreview,
  isStreaming = false,
}: StreamingCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="size-full overflow-hidden p-4">
      <div
        ref={containerRef}
        className="size-full max-w-none overflow-y-auto"
      >
        {/* Reasoning 区域 */}
        {reasoning && (
          <div className="mb-4 rounded-lg bg-gray-100 p-4">
            <div className="mb-2 text-sm font-medium text-gray-500">Thinking</div>
            <Streamdown plugins={{ code, mermaid, math, cjk }}>
              {reasoning}
            </Streamdown>
          </div>
        )}

        {/* 主内容区域 - 原生 Streamdown */}
        <Streamdown
          plugins={{ code, mermaid, math, cjk }}
          isAnimating={isStreaming}
        >
          {content}
        </Streamdown>
      </div>
    </div>
  )
}
