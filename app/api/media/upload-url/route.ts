import { NextResponse } from 'next/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.NEXT_CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_KEY = process.env.NEXT_CLOUDFLARE_API_KEY;

interface CloudflareDirectUploadResponse {
  result: {
    uploadURL: string;
    uid: string;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

/**
 * POST /api/media/upload-url
 * Creates a Cloudflare Stream Direct Creator Upload URL
 * 
 * Request body: { appId?: string, maxDurationSeconds?: number }
 * Response: { success: true, uploadUrl: string, videoUid: string }
 */
export async function POST(request: Request) {
  try {
    // Validate environment variables
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_KEY) {
      console.error('Missing Cloudflare credentials');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const maxDurationSeconds = body.maxDurationSeconds || 60; // Default 60 seconds

    // Create Direct Creator Upload URL via Cloudflare API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          // Optional: set expiry to 1 hour from now
          expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    const data: CloudflareDirectUploadResponse = await response.json();

    if (!data.success || !data.result) {
      console.error('Cloudflare API returned error:', data.errors);
      return NextResponse.json(
        { success: false, error: data.errors?.[0]?.message || 'Unknown error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploadUrl: data.result.uploadURL,
      videoUid: data.result.uid,
    });
  } catch (error) {
    console.error('Error creating upload URL:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
