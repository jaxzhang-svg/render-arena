import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCoverImage } from '@/lib/cover-image'

/**
 * POST /api/apps/[id]/cover-image
 * Trigger async cover image generation for an app.
 * Protected by CRON_SECRET to prevent external abuse.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Auth check: require CRON_SECRET or internal header
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'App ID is required' }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    // Fetch the app's prompt
    const { data: app, error } = await adminClient
      .from('apps')
      .select('prompt, cover_image_url')
      .eq('id', id)
      .single()

    if (error || !app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    if (!app.prompt) {
      return NextResponse.json({ error: 'App has no prompt' }, { status: 400 })
    }

    // Skip if already has cover image
    if (app.cover_image_url) {
      return NextResponse.json({ success: true, message: 'Cover image already exists', url: app.cover_image_url })
    }

    // Fire and forget — don't await the generation
    generateCoverImage(id, app.prompt).catch(console.error)

    return NextResponse.json({ success: true, message: 'Cover image generation started' })
  } catch (error) {
    console.error('Error in POST /api/apps/[id]/cover-image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
