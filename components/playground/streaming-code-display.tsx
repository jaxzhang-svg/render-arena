'use client'

import { MarkdownRenderer } from './markdown-renderer'
import { useAutoScroll } from '@/hooks/use-auto-scroll'

interface StreamingCodeDisplayProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
}

export function StreamingCodeDisplay({ content, reasoning, onPreview }: StreamingCodeDisplayProps) {
  const { containerRef, handleScroll } = useAutoScroll({ bottomThreshold: 20 })

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="size-full overflow-y-auto p-4"
    >
      <div className="max-w-none">
        <MarkdownRenderer content={content} reasoning={reasoning} onPreview={onPreview} enableTypewriter={false} />
      </div>
    </div>
  )
}
