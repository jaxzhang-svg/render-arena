import { cookies } from 'next/headers';

export interface NovitaUserInfo {
  uuid: string;
  uid: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  tier?: string;
}

/**
 * 从 Novita API 获取当前登录用户信息
 * 注意：Cookie名称为 'token'（由 Novita 设置）
 */
export async function getNovitaUserInfo(): Promise<NovitaUserInfo | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('token');

  if (!tokenCookie) {
    console.warn('Novita token cookie not found');
    return null;
  }

  try {
    const response = await fetch(`https://api-server.novita.ai/v1/user/info`, {
      headers: {
        Authorization: `Bearer ${tokenCookie.value}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch Novita user info:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch Novita user info:', error);
    return null;
  }
}