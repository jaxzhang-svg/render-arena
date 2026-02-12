/**
 * Backfill cover images for all published apps that have prompts and HTML output
 * but no cover image yet.
 *
 * Usage: npx tsx scripts/backfill-cover-images.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_SUPABASE_SERVICE_ROLE_KEY
 *   NOVITA_API_KEY (or NEXT_NOVITA_API_KEY)
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY || process.env.NOVITA_API_KEY!
const NOVITA_API_BASE = 'https://api.novita.ai'
const SEEDREAM_SIZE = '3200x1200'
const COVER_IMAGES_BUCKET = 'cover-images'
const MAX_CONCURRENCY = 3

// ─── Validation ──────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!NOVITA_API_KEY) {
  console.error('Missing NOVITA_API_KEY or NEXT_NOVITA_API_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Core Logic (mirrors lib/cover-image.ts) ─────────────────────────────────

async function generateImagePrompt(appPrompt: string): Promise<string> {
  const response = await fetch(`${NOVITA_API_BASE}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOVITA_API_KEY}`,
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
  if (!parsed.image_prompt || typeof parsed.image_prompt !== 'string') {
    throw new Error('Invalid image_prompt in LLM response')
  }

  return parsed.image_prompt.slice(0, 600)
}

async function callSeedream(imagePrompt: string): Promise<string> {
  const response = await fetch(`${NOVITA_API_BASE}/v3/seedream-4.5`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NOVITA_API_KEY}`,
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

async function persistImageToStorage(tempUrl: string, appId: string): Promise<string> {
  // Download image from temporary pre-signed URL
  const imageResponse = await fetch(tempUrl)
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`)
  }

  const imageBuffer = await imageResponse.arrayBuffer()
  const fileName = `${appId}.png`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(COVER_IMAGES_BUCKET)
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(COVER_IMAGES_BUCKET)
    .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

async function processApp(
  app: { id: string; prompt: string },
  index: number,
  total: number
): Promise<boolean> {
  const tag = `[${index + 1}/${total}]`
  try {
    console.log(`${tag} Processing app ${app.id}...`)

    // Step 1: Generate image prompt
    const imagePrompt = await generateImagePrompt(app.prompt)
    console.log(`${tag}   Image prompt: "${imagePrompt.slice(0, 60)}..."`)

    // Step 2: Generate image
    const tempUrl = await callSeedream(imagePrompt)
    console.log(`${tag}   Image generated`)

    // Step 3: Persist to storage
    const publicUrl = await persistImageToStorage(tempUrl, app.id)
    console.log(`${tag}   Uploaded to storage`)

    // Step 4: Update database
    const { error } = await supabase
      .from('apps')
      .update({ cover_image_url: publicUrl })
      .eq('id', app.id)

    if (error) {
      throw new Error(`DB update failed: ${error.message}`)
    }

    console.log(`${tag}   ✅ Done: ${publicUrl}`)
    return true
  } catch (err) {
    console.error(`${tag}   ❌ Failed for app ${app.id}:`, err instanceof Error ? err.message : err)
    return false
  }
}

// ─── Concurrency Control ─────────────────────────────────────────────────────

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++
      const result = await fn(items[i], i)
      if (result) success++
      else failed++
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)

  return { success, failed }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔍 Fetching apps that need cover images...\n')

  const { data: apps, error } = await supabase
    .from('apps')
    .select('id, prompt')
    .eq('is_public', true)
    .not('prompt', 'is', null)
    .not('html_content_a', 'is', null)
    .not('html_content_b', 'is', null)
    .is('cover_image_url', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch apps:', error)
    process.exit(1)
  }

  if (!apps || apps.length === 0) {
    console.log('✅ No apps need cover images. All done!')
    return
  }

  console.log(`Found ${apps.length} apps to process (concurrency: ${MAX_CONCURRENCY})\n`)

  const { success, failed } = await runWithConcurrency(
    apps,
    MAX_CONCURRENCY,
    (app, index) => processApp(app, index, apps.length)
  )

  console.log(`\n🏁 Backfill complete: ${success} succeeded, ${failed} failed out of ${apps.length} total`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
