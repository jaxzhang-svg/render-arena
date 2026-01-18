'use client'

import { MarkdownRenderer } from './markdown-renderer'

interface StreamingCodeDisplayProps {
  content: string
  reasoning?: string
}

export function StreamingCodeDisplay({ content, reasoning }: StreamingCodeDisplayProps) {
  return (
    <div className="w-full h-full overflow-y-auto">
      <MarkdownRenderer content={content} reasoning={reasoning} />
    </div>
  )
}
