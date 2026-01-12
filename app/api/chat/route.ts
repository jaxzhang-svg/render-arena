import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { toPrompt } from '@/lib/prompt'
import { fragmentSchema as schema } from '@/lib/schema'
import templates, { Templates } from '@/lib/templates'
import { streamObject, LanguageModel, ModelMessage } from 'ai'

export const maxDuration = 300

export async function POST(req: Request) {
  const {
    messages,
    model,
  }: {
    messages: ModelMessage[]
    model: LLMModel
  } = await req.json()

  console.log('model', model)

  const config: LLMModelConfig = {
    model: model.id,
  }

  const modelClient = getModelClient(model, config)

  try {
    console.log('Starting streamObject with schema:', JSON.stringify(schema, null, 2))
    console.log('Messages:', JSON.stringify(messages, null, 2))

    const stream = await streamObject({
      model: modelClient as LanguageModel,
      schema,
      system: toPrompt(templates as Templates),
      messages,
      maxRetries: 0,
      providerOptions: {
        openai: {
          strictJsonSchema: false,
        },
      },
    })

    return stream.toTextStreamResponse()
  } catch (error: unknown) {
    console.error('Error in chat API:', error)
    if (error && typeof error === 'object' && 'requestBodyValues' in error) {
      console.error('Request body values:', JSON.stringify(error.requestBodyValues, null, 2))
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
