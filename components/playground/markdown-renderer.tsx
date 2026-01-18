'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import React, { useState, memo } from 'react'
import { ChevronDown, ChevronRight, Code2, Eye } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '../ui/button'
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
    <div className="my-3 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/80 border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <Code2 className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-xs text-gray-700 font-medium capitalize">
            {language}
          </span>
        </div>
        {language === 'html' && onPreview && (
          <Button
            onClick={() => onPreview(codeString)}
            size="sm"
            className="flex items-center gap-1 px-2 py-0.5 text-xs bg-primary text-white rounded-md hover:bg-pr transition-colors"
          >
            <Eye className="h-3 w-3" />
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
          className="px-2 py-1 bg-gray-100 rounded-md text-sm font-mono text-gray-800 break-words"
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
    <p className="text-gray-700 leading-7 mb-3" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }: any) => (
    <h1 className="text-2xl font-bold text-gray-900 mb-3 mt-5" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-xl font-semibold text-gray-900 mb-2 mt-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-lg font-medium text-gray-900 mb-2 mt-3" {...props}>
      {children}
    </h3>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside text-gray-700 space-y-0.5 mb-3" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside text-gray-700 space-y-0.5 mb-3" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-3" {...props}>
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
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/50 transition-colors cursor-pointer w-full text-left"
          >
            {showReasoning ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Thinking</span>
          </button>
          {showReasoning && (
            <div className="border-t border-gray-100 p-4 bg-gray-50/30">
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
