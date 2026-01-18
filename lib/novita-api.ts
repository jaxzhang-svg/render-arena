import { fetchEventSource } from '@microsoft/fetch-event-source'

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

export async function streamChatCompletion({
  apiKey,
  model,
  messages,
  callbacks,
}: {
  apiKey: string
  model: string
  messages: Array<{ role: string; content: string }>
  callbacks: StreamCallbacks
}) {
  const { onChunk, onComplete, onError } = callbacks

  try {
    await fetchEventSource('https://api.novita.ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        separate_reasoning: true,
      }),
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          return
        }
        const errorText = await response.text()
        throw new Error(`Unexpected response: ${response.status} ${errorText}`)
      },
      onmessage(msg) {
        if (msg.data === '[DONE]') {
          onComplete?.()
          return
        }

        try {
          const data = JSON.parse(msg.data)
          const delta = data.choices?.[0]?.delta

          if (delta) {
            onChunk({
              content: delta.content,
              reasoning_content: delta.reasoning_content,
              done: delta.finish_reason !== undefined,
            })
          }
        } catch (e) {
          console.error('Error parsing SSE message:', e)
        }
      },
      onerror(error) {
        onError?.(error)
        throw error
      },
      onclose() {
        onComplete?.()
      },
    })
  } catch (error) {
    onError?.(error as Error)
  }
}
