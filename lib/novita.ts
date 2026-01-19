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

/**
 * 校验 Novita API Key 是否有效
 * 使用正确的验证 URL: https://api.novita.ai/openai/v1/chat/completions
 */
export async function validateNovitaApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.novita.ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to validate Novita API key:', error);
    return false;
  }
}
