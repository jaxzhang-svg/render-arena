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
