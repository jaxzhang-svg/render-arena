'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import { ChevronDown, ChevronRight, Code2 } from 'lucide-react'

interface MarkdownRendererProps {
  content: string
  reasoning?: string
}

export function MarkdownRenderer({ content, reasoning }: MarkdownRendererProps) {
  const [showReasoning, setShowReasoning] = useState(false)

  return (
    <div className="w-full">
      {reasoning && (
        <div className="mb-4">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-muted/50 rounded-lg w-full text-left"
          >
            {showReasoning ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Thinking Process</span>
          </button>
          {showReasoning && (
            <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {reasoning}
              </div>
            </div>
          )}
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { node, inline, className, children, ...rest } = props as any

            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                  {...rest}
                >
                  {children}
                </code>
              )
            }

            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : 'plaintext'

            return (
              <div className="my-4 rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">
                      {language}
                    </span>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto bg-muted/30">
                  <pre className="!my-0 !p-4">
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  </pre>
                </div>
              </div>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
