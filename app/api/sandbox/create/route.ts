import { Sandbox } from 'novita-sandbox'

export const maxDuration = 60

interface CreateSandboxRequest {
  modelId: string
  prompt?: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface CreateSandboxResponse {
  success: boolean
  sandboxId: string
  apiUrl: string
  previewUrl: string
}

export async function POST(req: Request) {
  const { modelId, prompt }: CreateSandboxRequest = await req.json()

  console.log(`Creating coding-agent sandbox for model: ${modelId}`)

  try {
    const sandbox = await Sandbox.create('coding-agent-nextjs-v2', {
      metadata: {
        modelId,
        prompt: prompt || '',
      },
      envs: {
        ANTHROPIC_BASE_URL: 'https://api.novita.ai/anthropic',
        ANTHROPIC_AUTH_TOKEN: "sk_Y52XftPzTCOOrx9-oWJF_cRHUPWiZqirVYvov-qxWkA",
        ANTHROPIC_MODEL: modelId
      },
      timeoutMs: 30 * 60 * 1000, // 10 minutes
    })

    sandbox.commands.run("uv run --directory /home/user/coding-agent uvicorn src.main:app --host 0.0.0.0 --port 8000")

    // Wait for FastAPI server to be healthy with retry logic
    const host = sandbox.getHost(8000)
    let healthCheckPassed = false
    for (let i = 0; i < 30; i++) {
      try {
        const healthResponse = await fetch(`https://${host}/health`, {
          signal: AbortSignal.timeout(2000)
        })
        if (healthResponse.ok) {
          healthCheckPassed = true
          console.log(`FastAPI server is ready after ${(i * 1000)}ms`)
          break
        }
      } catch (e) {
        // Server not ready yet, wait and retry
        console.log(`Health check attempt ${i + 1}/30 failed, retrying...`)
      }
      await sleep(1000)
    }

    if (!healthCheckPassed) {
      throw new Error('FastAPI server failed to start after 30 seconds')
    }

    const previewHost = sandbox.getHost(3000) // Port 3000 for Next.js preview

    const response: CreateSandboxResponse = {
      success: true,
      sandboxId: sandbox.sandboxId,
      apiUrl: `https://${host}`,
      previewUrl: `https://${previewHost}`,
    }

    console.log(`Sandbox created: ${sandbox.sandboxId}`)
    console.log(`API URL: ${response.apiUrl}`)
    console.log(`Preview URL: ${response.previewUrl}`)

    return Response.json(response)
  } catch (error) {
    console.error('Failed to create sandbox:', error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
