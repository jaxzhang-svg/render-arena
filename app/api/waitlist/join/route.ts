import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/waitlist/join
 * Join the Coding Plan waitlist (requires auth)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const source = typeof body?.source === 'string' ? body.source : 'event_page'
    const plan = typeof body?.plan === 'string' ? body.plan : 'coding_plan'

    const email = user.email ?? user.user_metadata?.email
    if (!email) {
      return NextResponse.json({ error: 'Email not available' }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    const { data: existing, error: existingError } = await adminClient
      .from('waitlist_signups')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking waitlist signup:', existingError)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ status: 'already_joined' })
    }

    const { error: insertError } = await adminClient.from('waitlist_signups').insert({
      user_id: user.id,
      email,
      plan,
      source,
    })

    if (insertError) {
      console.error('Error inserting waitlist signup:', insertError)
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
    }

    return NextResponse.json({ status: 'joined' })
  } catch (error) {
    console.error('Error in waitlist join API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
