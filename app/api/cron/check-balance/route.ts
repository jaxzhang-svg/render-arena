import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getNovitaAccountBalance,
  parseBalanceToInt,
} from '@/lib/novita'
import { invalidateSystemConfigCache } from '@/lib/dynamic-config'
import { PAID_USER_BALANCE_THRESHOLD } from '@/lib/config'

/**
 * Cron job to check Novita account balance and update free_tier_disabled config
 *
 * This endpoint should be called periodically (e.g., every 5 minutes) by Vercel Cron
 * to monitor the account balance and automatically disable free tier when balance is low.
 *
 * Expected behavior:
 * - If balance < threshold (default 9.99 USD), set free_tier_disabled = true
 * - If balance >= threshold, set free_tier_disabled = false
 * - Updates last_balance_check and last_balance_check_time
 *
 * Security: Should be protected by Vercel Cron secret or similar mechanism
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch current balance from Novita
    const balanceInfo = await getNovitaAccountBalance()

    if (!balanceInfo) {
      console.error('Failed to fetch Novita balance')
      return NextResponse.json(
        { error: 'Failed to fetch balance', success: false },
        { status: 500 }
      )
    }

    // Parse balance to integer (Novita unit: 0.0001 USD)
    const availableBalance = parseBalanceToInt(balanceInfo.availableBalance)
    const cashBalance = parseBalanceToInt(balanceInfo.cashBalance)

    console.log(
      `[Balance Check] Available: ${availableBalance} units, Cash: ${cashBalance} units`
    )

    // Get admin client to update config
    const adminClient = await createAdminClient()

    // Get threshold from config (in integer units)
    const { data: thresholdData } = await adminClient
      .from('system_config')
      .select('value')
      .eq('key', 'novita_balance_threshold')
      .single()

    const threshold = parseInt(thresholdData?.value || PAID_USER_BALANCE_THRESHOLD, 10) // Default 99900 units = 9.99 USD

    // Determine if free tier should be disabled (integer comparison)
    const shouldDisable = availableBalance < threshold

    // Get current free_tier_disabled value
    const { data: currentConfig } = await adminClient
      .from('system_config')
      .select('value')
      .eq('key', 'free_tier_disabled')
      .single()

    const currentlyDisabled = currentConfig?.value === 'true'

    // Update config if needed
    if (shouldDisable !== currentlyDisabled) {
      await adminClient.rpc('update_system_config', {
        p_key: 'free_tier_disabled',
        p_value: shouldDisable.toString(),
        p_updated_by: 'cron:check-balance',
      })

      // Invalidate Next.js cache to make changes effective immediately
      await invalidateSystemConfigCache('free-tier')

      console.log(
        `[Balance Check] FREE_TIER_DISABLED changed: ${currentlyDisabled} -> ${shouldDisable}`
      )
    }

    // Update balance check info
    await Promise.all([
      adminClient.rpc('update_system_config', {
        p_key: 'last_balance_check',
        p_value: availableBalance.toString(), // Store as integer units
        p_updated_by: 'cron:check-balance',
      }),
      adminClient.rpc('update_system_config', {
        p_key: 'last_balance_check_time',
        p_value: new Date().toISOString(),
        p_updated_by: 'cron:check-balance',
      }),
    ])

    return NextResponse.json({
      success: true,
      balance: {
        available: availableBalance, // Return integer units
        cash: cashBalance,
        threshold,
      },
      config: {
        freeTierDisabled: shouldDisable,
        changed: shouldDisable !== currentlyDisabled,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Balance Check] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    )
  }
}
