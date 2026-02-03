import { cookies } from 'next/headers'

export interface NovitaUserInfo {
  uuid: string
  uid: string
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  tier?: string
  balance?: number
}

export async function getNovitaUserInfo(): Promise<NovitaUserInfo | null> {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('token')

  if (!tokenCookie) {
    console.warn('Novita token cookie not found')
    return null
  }

  try {
    const response = await fetch(`https://api-server.novita.ai/v1/user/info`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Novita token expired or invalid - user needs to relogin')
        return null
      }
      console.error('Failed to fetch Novita user info:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch Novita user info:', error)
    return null
  }
}

export async function getNovitaBalance(): Promise<number | null> {
  const userInfo = await getNovitaUserInfo()
  return userInfo?.balance ?? null
}

/**
 * Get Novita account balance using API Key
 * This is used for checking the pool balance for system configuration
 * API Doc: https://novita.ai/docs/user-balance
 */
export interface NovitaBalanceInfo {
  availableBalance: string // unit is 0.0001 USD
  cashBalance: string // unit is 0.0001 USD
  creditLimit: string // unit is 0.0001 USD
  pendingCharges: string // unit is 0.0001 USD
  outstandingInvoices: string // unit is 0.0001 USD
}
export async function getNovitaAccountBalance(apiKey?: string): Promise<NovitaBalanceInfo | null> {
  const key = apiKey || process.env.NEXT_NOVITA_API_KEY

  if (!key) {
    console.error('Novita API key not provided')
    return null
  }

  try {
    const response = await fetch('https://api.novita.ai/openapi/v1/billing/balance/detail', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch Novita balance:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    return data as NovitaBalanceInfo
  } catch (error) {
    console.error('Failed to fetch Novita account balance:', error)
    return null
  }
}

/**
 * Parse Novita balance string to integer
 * Novita API returns balance as string in units of 0.0001 USD
 * We keep it as integer to avoid floating point precision issues
 */
export function parseBalanceToInt(balance: string): number {
  return parseInt(balance, 10)
}
