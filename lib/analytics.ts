import { sendGAEvent } from '@next/third-parties/google'

type EventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: EventParams) {
  sendGAEvent('event', eventName, params ?? {})
}

export function setUserProperty(name: string, value: string) {
  sendGAEvent('set', 'user_properties', { [name]: value })
}

export function updateUserTier(tier: 'guest' | 'registered' | 'upgraded') {
  setUserProperty('user_tier', tier)
}

export function trackGenerationStarted() {
  trackEvent('generation_started')
}

export function trackLoginStarted(location: 'quota' | 'publish' | 'like' | 'header') {
  trackEvent('login_started', { location })
}

export function trackSignupCompleted() {
  trackEvent('signup_completed')
}

export function trackUpgradePromptDisplayed() {
  trackEvent('upgrade_prompt_displayed')
}

export function trackUpgradeButtonClicked(
  location: 'overwhelming_banner' | 'quota_modal' | string
) {
  trackEvent('upgrade_button_clicked', { location })
}

export function trackResultShared(params: {
  content_id: string
  share_type: 'video' | 'link'
  share_method: 'copy_link' | 'x' | 'linkedin' | 'facebook'
}) {
  trackEvent('result_shared', params)
}

export function trackSharedItemViewed(contentId: string) {
  trackEvent('shared_item_viewed', { content_id: contentId })
}

export function trackRemixStarted(contentId: string) {
  trackEvent('remix_started', { content_id: contentId })
}

export function trackHackathonJoinClicked() {
  trackEvent('hackathon_join_clicked')
}

export function trackCodingPlanWaitlistClicked() {
  trackEvent('coding_plan_waitlist_clicked')
}
