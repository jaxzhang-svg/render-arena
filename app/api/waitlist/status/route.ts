import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/waitlist/status
 * Check if the current user has joined the waitlist
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ joined: false })
    }

    const { data: existing, error: existingError } = await supabase
      .from('waitlist_signups')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('Error checking waitlist status:', existingError)
      return NextResponse.json({ joined: false })
    }

    return NextResponse.json({ joined: !!existing })
  } catch (error) {
    console.error('Error in waitlist status API:', error)
    return NextResponse.json({ joined: false })
  }
}
