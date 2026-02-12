import { createAdminClient } from '@/lib/supabase/admin'

const NOVITA_API_BASE = 'https://api.novita.ai'
const SEEDREAM_SIZE = '3200x1200' // 8:3 aspect ratio, 3,840,000 pixels (within 3,686,400–16,777,216 range)
const COVER_IMAGES_BUCKET = 'cover-images'

function getApiKey(): string {
  const key = process.env.NEXT_NOVITA_API_KEY || process.env.NOVITA_API_KEY
  if (!key) throw new Error('Missing NOVITA_API_KEY')
  return key
}

/**
 * Step 1: Use LLM to generate an image prompt from the app's text prompt
 */
async function generateImagePrompt(appPrompt: string): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(`${NOVITA_API_BASE}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'pa/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert at writing image generation prompts. Given an app description/prompt, generate a vivid, detailed image prompt for creating a cover image that visually represents what this app does.

Requirements:
- Write in English
- Keep it under 600 characters
- Focus on visual elements, colors, composition, and style
- The image should look like a professional app preview/thumbnail
- Include artistic style descriptors (e.g., "digital art", "modern UI", "3D render")
- DO NOT include any text or words in the image description
- Make it visually striking and appealing for a gallery thumbnail

Return JSON: { "image_prompt": "your prompt here" }`,
        },
        {
          role: 'user',
          content: `Generate an image prompt for this app:\n\n"${appPrompt.slice(0, 2000)}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM API failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty LLM response')

  const parsed = JSON.parse(content)
  const imagePrompt = parsed.image_prompt
  if (!imagePrompt || typeof imagePrompt !== 'string') {
    throw new Error('Invalid image_prompt in LLM response')
  }

  return imagePrompt.slice(0, 600)
}

/**
 * Step 2: Call seedream-4.5 to generate the cover image
 * Returns a temporary pre-signed S3 URL (expires in 48h)
 */
async function callSeedream(imagePrompt: string): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(`${NOVITA_API_BASE}/v3/seedream-4.5`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      size: SEEDREAM_SIZE,
      prompt: imagePrompt,
      watermark: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Seedream API failed: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const imageUrl = data.images?.[0]
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL in seedream response')
  }

  return imageUrl
}

/**
 * Step 3: Download the image and upload to Supabase Storage for persistence
 * Returns the public URL
 */
async function persistImageToStorage(
  tempUrl: string,
  appId: string
): Promise<string> {
  const adminClient = await createAdminClient()

  // Download the image from the temporary URL
  const imageResponse = await fetch(tempUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`)
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const fileName = `${appId}.png`

  // Upload to Supabase Storage
  const { error: uploadError } = await adminClient.storage
    .from(COVER_IMAGES_BUCKET)
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      upsert: true, // Overwrite if exists (re-generation)
    })

  if (uploadError) {
    throw new Error(`Supabase Storage upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: publicUrlData } = adminClient.storage
    .from(COVER_IMAGES_BUCKET)
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

/**
 * Main entry point: Generate a cover image for an app and persist it
 *
 * This function is designed to be called fire-and-forget (not awaited).
 * It handles all errors internally and logs them.
 *
 * @returns The public image URL, or null if generation failed
 */
export async function generateCoverImage(
  appId: string,
  appPrompt: string
): Promise<string | null> {
  try {
    console.log(`[cover-image] Starting generation for app ${appId}`)

    // Step 1: Generate image prompt via LLM
    const imagePrompt = await generateImagePrompt(appPrompt)
    console.log(`[cover-image] Generated image prompt for app ${appId}: "${imagePrompt.slice(0, 80)}..."`)

    // Step 2: Generate image via seedream-4.5
    const tempImageUrl = await callSeedream(imagePrompt)
    console.log(`[cover-image] Seedream image generated for app ${appId}`)

    // Step 3: Persist to Supabase Storage
    const publicUrl = await persistImageToStorage(tempImageUrl, appId)
    console.log(`[cover-image] Image persisted for app ${appId}: ${publicUrl}`)

    // Step 4: Update database
    const adminClient = await createAdminClient()
    const { error: updateError } = await adminClient
      .from('apps')
      .update({ cover_image_url: publicUrl })
      .eq('id', appId)

    if (updateError) {
      console.error(`[cover-image] Failed to update DB for app ${appId}:`, updateError)
      return null
    }

    console.log(`[cover-image] Successfully generated cover image for app ${appId}`)
    return publicUrl
  } catch (error) {
    console.error(`[cover-image] Failed to generate cover image for app ${appId}:`, error)
    return null
  }
}
