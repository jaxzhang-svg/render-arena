/**
 * Cloudflare Stream utilities
 *
 * Helper functions to construct Cloudflare Stream URLs from video UIDs
 */

const CLOUDFLARE_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || ''

/**
 * Check if Cloudflare Stream is configured
 */
export function isCloudflareStreamConfigured(): boolean {
  return !!CLOUDFLARE_CUSTOMER_CODE
}

/**
 * Get the Cloudflare customer code
 */
export function getCloudflareCustomerCode(): string {
  return CLOUDFLARE_CUSTOMER_CODE
}

/**
 * Construct the base Cloudflare Stream URL for a video UID
 */
function getBaseStreamUrl(videoUid: string): string {
  if (!CLOUDFLARE_CUSTOMER_CODE) {
    throw new Error('CLOUDFLARE_CUSTOMER_CODE is not configured')
  }
  return `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoUid}`
}

/**
 * Get the thumbnail URL for a video
 *
 * @param videoUid - The Cloudflare Stream video UID
 * @param options - Optional thumbnail configuration
 * @returns The thumbnail URL
 */
export function getStreamThumbnailUrl(
  videoUid: string | null | undefined,
  options: {
    time?: string
    height?: number
    width?: number
  } = {}
): string | null {
  if (!videoUid || !CLOUDFLARE_CUSTOMER_CODE) {
    return null
  }

  const params = new URLSearchParams()
  if (options.time) params.set('time', options.time)
  if (options.height) params.set('height', options.height.toString())
  if (options.width) params.set('width', options.width.toString())

  const queryString = params.toString()
  return `${getBaseStreamUrl(videoUid)}/thumbnails/thumbnail.jpg${queryString ? `?${queryString}` : ''}`
}

/**
 * Get the iframe embed URL for a video
 *
 * @param videoUid - The Cloudflare Stream video UID
 * @param options - Optional iframe configuration
 * @returns The iframe URL
 */
export function getStreamIframeUrl(
  videoUid: string | null | undefined,
  options: {
    muted?: boolean
    loop?: boolean
    autoplay?: boolean
    controls?: boolean
    poster?: string
  } = {}
): string | null {
  if (!videoUid || !CLOUDFLARE_CUSTOMER_CODE) {
    return null
  }

  const params = new URLSearchParams()
  if (options.muted !== undefined) params.set('muted', options.muted.toString())
  if (options.loop !== undefined) params.set('loop', options.loop.toString())
  if (options.autoplay !== undefined) params.set('autoplay', options.autoplay.toString())
  if (options.controls !== undefined) params.set('controls', options.controls.toString())
  if (options.poster) params.set('poster', options.poster)

  const queryString = params.toString()
  return `${getBaseStreamUrl(videoUid)}/iframe${queryString ? `?${queryString}` : ''}`
}

/**
 * Get the watch page URL for a video
 *
 * @param videoUid - The Cloudflare Stream video UID
 * @returns The watch page URL
 */
export function getStreamWatchUrl(videoUid: string | null | undefined): string | null {
  if (!videoUid || !CLOUDFLARE_CUSTOMER_CODE) {
    return null
  }

  return `${getBaseStreamUrl(videoUid)}/watch`
}

/**
 * Get the manifest URL for a video
 *
 * @param videoUid - The Cloudflare Stream video UID
 * @returns The manifest URL
 */
export function getStreamManifestUrl(videoUid: string | null | undefined): string | null {
  if (!videoUid || !CLOUDFLARE_CUSTOMER_CODE) {
    return null
  }

  return `${getBaseStreamUrl(videoUid)}/manifest/video.m3u8`
}

/**
 * Check if a video UID is valid and has Cloudflare Stream configured
 *
 * @param videoUid - The video UID to check
 * @returns Whether the video can be used with Cloudflare Stream
 */
export function hasValidStreamVideo(videoUid: string | null | undefined): boolean {
  return !!videoUid && !!CLOUDFLARE_CUSTOMER_CODE
}
