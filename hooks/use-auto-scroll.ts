import { useEffect, useRef, useCallback, useLayoutEffect } from 'react'

interface UseAutoScrollOptions {
  bottomThreshold?: number // 底部误差值，默认 20px
  recoveryDelay?: number // 用户停止滚动后恢复自动滚动的延迟，0 表示立即恢复（默认 0）
}

/**
 * React Hook 用于处理容器自动滚动到底部的逻辑
 * 支持用户手动滚动时暂停自动滚动，用户滚回底部或指定延迟后恢复
 * @param options 配置选项
 * @returns containerRef 和 handleScroll 方法
 */
export function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { bottomThreshold = 20, recoveryDelay = 3000 } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollHeightRef = useRef<number>(0)
  const isUserScrollingRef = useRef<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 滚动到底部的函数
  const scrollToBottom = useCallback(() => {
    const container = containerRef.current
    if (container && !isUserScrollingRef.current) {
      container.scrollTop = container.scrollHeight
      lastScrollHeightRef.current = container.scrollHeight
    }
  }, [])

  // 检测用户是否手动滚动
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    // 如果用户滚动位置不在底部附近，标记为用户正在手动滚动
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      bottomThreshold

    if (!isAtBottom) {
      isUserScrollingRef.current = true
      // 清除之前的超时
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      // 如果配置了恢复延迟，则在延迟后恢复自动滚动
      if (recoveryDelay > 0) {
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = false
        }, recoveryDelay)
      }
    } else {
      // 用户滚回底部，恢复自动滚动
      isUserScrollingRef.current = false
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
    }
  }, [bottomThreshold, recoveryDelay])

  // 使用 useLayoutEffect 确保在 DOM 更新后立即执行滚动
  useLayoutEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  // 使用 MutationObserver 监听 DOM 变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new MutationObserver(() => {
      // 只有当内容高度增加时才滚动（说明有新内容）
      if (container.scrollHeight > lastScrollHeightRef.current) {
        scrollToBottom()
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [scrollToBottom])

  return { containerRef, handleScroll }
}
