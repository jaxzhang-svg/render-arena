export interface StreamChunk {
  content?: string
  reasoning_content?: string
  done?: boolean
}

export interface StreamCallbacks {
  onChunk: (chunk: StreamChunk) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

