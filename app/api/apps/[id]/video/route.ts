import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/apps/:id/video
 * Saves the Cloudflare Stream video UID to the app record
 *
 * Request body: { videoUid: string }
 * Response: { success: true }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appId } = await params

    if (!appId) {
      return NextResponse.json({ success: false, error: 'App ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { videoUid } = body

    if (!videoUid) {
      return NextResponse.json({ success: false, error: 'Video UID is required' }, { status: 400 })
    }

    // Create Supabase client
    const supabase = await createClient()

    // Update the app's preview_video_url with the Cloudflare video UID
    const { error } = await supabase
      .from('apps')
      .update({
        preview_video_url: videoUid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId)

    if (error) {
      console.error('Error updating app video:', error)
      return NextResponse.json({ success: false, error: 'Failed to update app' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving video:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/apps/:id/video
 * Get the video status from Cloudflare Stream
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: appId } = await params
    const CLOUDFLARE_ACCOUNT_ID = process.env.NEXT_CLOUDFLARE_ACCOUNT_ID
    const CLOUDFLARE_API_KEY = process.env.NEXT_CLOUDFLARE_API_KEY

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get the app's video UID from database
    const supabase = await createClient()
    const { data: app, error } = await supabase
      .from('apps')
      .select('preview_video_url')
      .eq('id', appId)
      .single()

    if (error || !app?.preview_video_url) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 })
    }

    const videoUid = app.preview_video_url

    // Check video status from Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoUid}`,
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get video status' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      videoUid,
      status: data.result?.status?.state || 'unknown',
      readyToStream: data.result?.readyToStream || false,
      thumbnail: data.result?.thumbnail,
    })
  } catch (error) {
    console.error('Error getting video status:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
