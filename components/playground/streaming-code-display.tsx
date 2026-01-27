'use client'

import { useEffect, useRef, useId, useState } from 'react'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { math } from '@streamdown/math'
import { cjk } from '@streamdown/cjk'
import { Accordion } from '@base-ui/react/accordion'
import { ChevronUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface StreamingCodeDisplayProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
  isStreaming?: boolean
  scrollButtonPosition?: 'left' | 'right'
}

/**
 * 使用 Streamdown 原生效果的流式 Markdown 渲染组件
 */
export function StreamingCodeDisplay({
  content,
  reasoning,
  isStreaming = false,
  scrollButtonPosition = 'right',
}: StreamingCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const accordionTriggerId = useId()
  const [showScrollButton, setShowScrollButton] = useState(false)
  const isAutoScrolling = useRef(true)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
      isAutoScrolling.current = true
      setShowScrollButton(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // scrollToBottom() internally calls setShowScrollButton(false), which is setState.
  // This is intentional: when content updates and auto-scrolling is enabled,
  // scroll to bottom and hide the manual scroll button.
  useEffect(() => {
    if (isAutoScrolling.current) {
      scrollToBottom()
    }
  }, [content, reasoning])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

    if (isAtBottom) {
      isAutoScrolling.current = true
      setShowScrollButton(false)
    } else {
      isAutoScrolling.current = false
      setShowScrollButton(true)
    }
  }

  return (
    <div className="relative size-full overflow-hidden p-4">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="size-full max-w-none overflow-y-auto"
      >
        {/* Reasoning 区域 */}
        {reasoning && (
          <Accordion.Root defaultValue={['thinking']} className="mb-4">
            <Accordion.Item
              value="thinking"
              className="overflow-hidden rounded-lg border-none bg-gray-100"
            >
              <Accordion.Trigger
                id={accordionTriggerId}
                className="group flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 aria-expanded:text-blue-600"
              >
                <span>Thinking</span>
                <ChevronUp className="size-4 rotate-180 transition-transform group-aria-expanded:rotate-0" />
              </Accordion.Trigger>
              <Accordion.Panel className="px-4 pb-4">
                <Streamdown plugins={{ code, mermaid, math, cjk }}>{reasoning}</Streamdown>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        )}

        {/* 主内容区域 - 原生 Streamdown */}
        <Streamdown plugins={{ code, mermaid, math, cjk }} isAnimating={isStreaming}>
          {content}
        </Streamdown>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={cn(
            'absolute bottom-8 z-10 flex size-8 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-all hover:bg-gray-50 dark:bg-zinc-800 dark:ring-white/10',
            scrollButtonPosition === 'left' ? 'left-8' : 'right-8'
          )}
        >
          <ArrowDown className="size-4 text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  )
}
