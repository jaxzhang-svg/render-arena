'use client'

import { useEffect, useRef, useId } from 'react'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { math } from '@streamdown/math'
import { cjk } from '@streamdown/cjk'
import { Accordion } from '@base-ui/react/accordion'
import { ChevronUp } from 'lucide-react'
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
  const accordionTriggerId = useId()

  return (
    <div className="size-full overflow-hidden p-4">
      <div
        ref={containerRef}
        className="size-full max-w-none overflow-y-auto"
      >
        {/* Reasoning 区域 */}
        {reasoning && (
          <Accordion.Root defaultValue={['thinking']} className="mb-4">
            <Accordion.Item value="thinking" className="rounded-lg border-none bg-gray-100 overflow-hidden">
              <Accordion.Trigger id={accordionTriggerId} className="
                flex items-center justify-between w-full px-4 py-3
                text-sm font-medium text-gray-700
                hover:text-gray-900 aria-expanded:text-blue-600
                group transition-colors cursor-pointer
                hover:bg-gray-200
              ">
                <span>Thinking</span>
                <ChevronUp className="size-4 group-aria-expanded:rotate-0 rotate-180 transition-transform" />
              </Accordion.Trigger>
              <Accordion.Panel className="px-4 pb-4">
                <Streamdown plugins={{ code, mermaid, math, cjk }}>
                  {reasoning}
                </Streamdown>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
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
