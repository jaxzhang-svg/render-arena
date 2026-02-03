import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/hackathon/stats
 * 获取黑客松统计数据
 */
export async function GET() {
  try {
    const adminClient = await createAdminClient()

    // 统计 apps 表中不同用户数量作为参与人数
    const { count, error } = await adminClient
      .from('apps')
      .select('user_id', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching hackathon stats:', error)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // 获取去重的用户数
    const { data: distinctUsers, error: distinctError } = await adminClient
      .from('apps')
      .select('user_id')
      .not('user_id', 'is', null)

    if (distinctError) {
      console.error('Error fetching distinct users:', distinctError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // 手动去重统计
    const uniqueUserIds = new Set(distinctUsers?.map(app => app.user_id) || [])
    const participantCount = uniqueUserIds.size

    return NextResponse.json({
      participants: participantCount,
      totalApps: count || 0,
    })
  } catch (error) {
    console.error('Error in hackathon stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
