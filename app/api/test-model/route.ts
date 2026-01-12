import { getModelClient, models } from '@/lib/models'
import { generateText, LanguageModel } from 'ai'

export async function GET() {
  const model = models[0]

  console.log('Testing model:', model)

  const modelClient = getModelClient(model, { model: model.id })

  try {
    const result = await generateText({
      model: modelClient as LanguageModel,
      prompt: 'Say hello in exactly 3 words.',
    })

    return Response.json({ success: true, output: result.text })
  } catch (error: unknown) {
    console.error('Error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error && typeof error === 'object' ? error : undefined,
    }, { status: 500 })
  }
}
