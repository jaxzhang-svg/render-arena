import { sendGTMEvent } from '@next/third-parties/google'

// Type-safe event tracking for GA4
type EventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: EventParams) {
  sendGTMEvent({ event: eventName, ...params })
}

// ==================== Authentication Events ====================

export function trackAuthLoginInitiated(source: 'header' | 'quota_prompt' | 'publish_prompt') {
  trackEvent('auth_login_initiated', { source })
}

export function trackAuthLoginSuccess(isNewUser: boolean) {
  trackEvent('auth_login_success', { is_new_user: isNewUser })
}

export function trackAuthLoginFailed(errorCode: 'auth_failed' | 'sync_failed' | 'session_failed') {
  trackEvent('auth_login_failed', { error_code: errorCode })
}

export function trackAuthLogout() {
  trackEvent('auth_logout')
}

// ==================== Arena Generation Events ====================

export function trackModelSelected(params: {
  model_id: string
  model_name: string
  slot: 'a' | 'b'
  location: 'homepage' | 'playground'
}) {
  trackEvent('model_selected', params)
}

export function trackArenaGenerateStarted(params: {
  model_a: string
  model_b: string
  prompt_length: number
  category: string
  is_authenticated: boolean
}) {
  trackEvent('arena_generate_started', params)
}

export function trackGenerationCompleted(params: {
  model_id: string
  slot: 'a' | 'b'
  duration_ms: number
  tokens?: number
}) {
  trackEvent('generation_completed', params)
}

export function trackGenerationError(params: {
  model_id: string
  slot: 'a' | 'b'
  error_code: string
}) {
  trackEvent('generation_error', params)
}

export function trackGenerationStopped(params: { model_id: string; slot: 'a' | 'b' }) {
  trackEvent('generation_stopped', params)
}

export function trackGenerationRegenerated(params: { model_id: string; slot: 'a' | 'b' }) {
  trackEvent('generation_regenerated', params)
}

// ==================== Homepage Events ====================

export function trackFeaturedCaseClicked(params: {
  mode: 'physics' | 'visual' | 'game'
  app_id: string
}) {
  trackEvent('featured_case_clicked', params)
}

export function trackGalleryCaseClicked(params: {
  app_id: string
  category: string
  position: number
}) {
  trackEvent('gallery_case_clicked', params)
}

// ==================== Gallery Events ====================

export function trackGalleryViewed(category: string) {
  trackEvent('gallery_viewed', { category })
}

export function trackGalleryFiltered(params: { category: string; previous_category: string }) {
  trackEvent('gallery_filtered', params)
}

// ==================== Gallery Detail Page Events ====================

export function trackGalleryPromptCopied(appId: string) {
  trackEvent('gallery_prompt_copied', { app_id: appId })
}

export function trackGalleryOpenInPlayground(params: {
  app_id: string
  model_a: string
  model_b: string
}) {
  trackEvent('gallery_open_in_playground', params)
}

// ==================== Sharing Events ====================

export function trackShareModalOpened(appId: string) {
  trackEvent('share_modal_opened', { app_id: appId })
}

export function trackShareLinkCopied(params: { app_id: string; share_mode: 'video' | 'poster' }) {
  trackEvent('share_link_copied', params)
}

export function trackPublishStarted(params: { app_id: string; category: string }) {
  trackEvent('publish_started', params)
}

// ==================== Video Recording Events ====================

export function trackVideoRecordingStarted(appId: string) {
  trackEvent('video_recording_started', { app_id: appId })
}

export function trackVideoRecordingStopped(params: { app_id: string; duration_seconds: number }) {
  trackEvent('video_recording_stopped', params)
}

export function trackVideoUploadStarted(params: { app_id: string; file_size_mb: number }) {
  trackEvent('video_upload_started', params)
}

export function trackVideoUploadCompleted(params: {
  app_id: string
  upload_duration_seconds: number
}) {
  trackEvent('video_upload_completed', params)
}

export function trackVideoUploadError(params: { app_id: string; error_type: string }) {
  trackEvent('video_upload_error', params)
}

// ==================== Quota & Conversion Events ====================

export function trackFreeQuotaExceeded(tier: string, usageCount: number) {
  trackEvent('quota_exceeded', { tier, usage_count: usageCount })
}

export function trackLoginPromptShown(trigger: 'quota' | 'publish' | 'like') {
  trackEvent('login_prompt_shown', { trigger })
}

// ==================== Hackathon Events ====================

export function trackHackathonModalOpened(source: 'join_button' | 'user_menu') {
  trackEvent('hackathon_modal_opened', { source })
}
