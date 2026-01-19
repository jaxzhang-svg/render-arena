'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React, { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Code2, Eye } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '../base/button'
import { useTypewriter } from '@/hooks/use-typewriter'

interface MarkdownRendererProps {
  content: string
  reasoning?: string
  onPreview?: (html: string) => void
  enableTypewriter?: boolean // 是否启用打字机效果，默认 true
}

interface CodeBlockProps {
  language: string
  codeString: string
  onPreview?: (html: string) => void
}

// 使用 memo 包装 CodeBlock，避免不必要的重渲染
const CodeBlock = memo(function CodeBlock({ language, codeString, onPreview }: CodeBlockProps) {
  return (
    <div className="
      my-3 overflow-hidden rounded-lg border border-gray-200 shadow-sm
    ">
      <div className="
        flex items-center justify-between border-b border-gray-200 bg-gray-50/80
        px-3 py-1.5
      ">
        <div className="flex items-center gap-1.5">
          <Code2 className="size-3.5 text-gray-500" />
          <span className="text-xs font-medium text-gray-700 capitalize">
            {language}
          </span>
        </div>
        {language === 'html' && onPreview && (
          <Button
            onClick={() => onPreview(codeString)}
            size="sm"
            className="
              bg-primary
              hover:bg-pr
              flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-white
              transition-colors
            "
          >
            <Eye className="size-3" />
            Preview
          </Button>
        )}
      </div>
      <div>
        <SyntaxHighlighter
          style={oneLight}
          language={language}
          PreTag="div"
          showLineNumbers={false}
          wrapLines={true}
          wrapLongLines={true}
          customStyle={{
            margin: 0,
            padding: '0.75rem',
            fontSize: '13px',
            lineHeight: '1.4',
            background: 'transparent',
            overflow: 'auto',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  )
})

// 缓存 ReactMarkdown 的 components 配置，避免每次渲染都创建新对象
const createMarkdownComponents = (onPreview?: (html: string) => void) => ({
  code(props: any) {
    const { node, inline, className, children, ...rest } = props
    
    // 更精确地检测内联代码
    // 内联代码通常没有className或者inline为true
    const isInlineCode = inline || (!className && !String(children).includes('\n'))

    // 确保内联代码（单个反引号）正确渲染为内联样式
    if (isInlineCode) {
      return (
        <code
          className="
            rounded-md bg-gray-100 px-2 py-1 font-mono text-sm wrap-break-word
            text-gray-800
          "
          {...rest}
        >
          {children}
        </code>
      )
    }

    // 代码块（三个反引号）渲染为完整的代码块
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : 'plaintext'
    const codeString = String(children).replace(/\n$/, '')

    return (
      <CodeBlock 
        language={language} 
        codeString={codeString} 
        onPreview={onPreview} 
      />
    )
  },
  p: ({ children, ...props }: any) => (
    <p className="mb-3 leading-7 text-gray-700" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }: any) => (
    <h1 className="mt-5 mb-3 text-2xl font-bold text-gray-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="mt-4 mb-2 text-xl font-semibold text-gray-900" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="mt-3 mb-2 text-lg font-medium text-gray-900" {...props}>
      {children}
    </h3>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="mb-3 list-inside list-disc space-y-0.5 text-gray-700" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="mb-3 list-inside list-decimal space-y-0.5 text-gray-700" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="
      mb-3 border-l-4 border-blue-300 pl-4 text-gray-700 italic
    " {...props}>
      {children}
    </blockquote>
  ),
})

export const MarkdownRenderer = memo(function MarkdownRenderer({ 
  content, 
  reasoning, 
  onPreview,
  enableTypewriter = true
}: MarkdownRendererProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  
  // 使用打字机效果
  const { displayedText } = useTypewriter({ 
    text: content, 
    enabled: enableTypewriter
  })
  
  // 使用 useMemo 缓存 components 配置，只在 onPreview 变化时重新创建
  const components = React.useMemo(() => createMarkdownComponents(onPreview), [onPreview])

  return (
    <div className="w-full space-y-4">
      {reasoning && (
        <div className="
          overflow-hidden rounded-xl border border-gray-200/60 bg-white
          shadow-sm
        ">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="
              flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left
              text-sm font-medium text-gray-700 transition-colors
              hover:bg-gray-50/50 hover:text-gray-900
            "
          >
            {showReasoning ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            <span>Thinking</span>
          </button>
          {showReasoning && (
            <div className="border-t border-gray-100 bg-gray-50/30 p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
              >
                {reasoning}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  )
})
