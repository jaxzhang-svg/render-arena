import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  text: string
  enabled?: boolean // 是否启用打字机效果，默认 true
}

/**
 * React Hook 用于实现打字机效果
 * 固定16ms间隔，动态计算每次输出的字符数，确保在1秒内输出完所有剩余字符
 * @param options 配置选项
 * @returns 当前显示的文本和是否完成
 */
export function useTypewriter(options: UseTypewriterOptions) {
  const { text, enabled = true } = options
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const previousTextRef = useRef('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 如果禁用打字机效果，直接显示全部文本
    if (!enabled) {
      setDisplayedText(text)
      setIsComplete(true)
      return
    }

    // 如果文本变短了或者文本为空（重置），重置索引
    if (text.length < previousTextRef.current.length || text === '') {
      indexRef.current = 0
      setDisplayedText('')
      setIsComplete(false)
      previousTextRef.current = text
      
      // 如果文本为空，直接返回
      if (text === '') {
        return
      }
    }

    previousTextRef.current = text

    // 如果已经显示完所有内容，不需要继续
    if (indexRef.current >= text.length) {
      setIsComplete(true)
      return
    }

    setIsComplete(false)

    const INTERVAL = 16 // 固定间隔 16ms
    const MAX_DURATION = 1000 // 最多1秒内输出完所有剩余字符

    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setDisplayedText(prevText => {
        // 在状态更新函数中获取最新的 text 值
        const remaining = text.length - indexRef.current
        if (indexRef.current < text.length && remaining > 0) {
          const charsPerStep = Math.max(1, Math.ceil(remaining / (MAX_DURATION / INTERVAL)))
          indexRef.current = Math.min(indexRef.current + charsPerStep, text.length)
          return text.slice(0, indexRef.current)
        } else if (indexRef.current >= text.length) {
          setIsComplete(true)
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
        }
        return prevText
      })
    }, INTERVAL)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, enabled])

  return { displayedText, isComplete }
}
