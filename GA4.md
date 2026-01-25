# GA4 Event Tracking Plan

This document outlines the Google Analytics 4 event tracking implementation for Novita Arena.

## Current Setup

- **GA4 ID:** `G-6E3YJT3N0F`
- **Integration:** `@next/third-parties/google` in `app/layout.tsx:75`

---

## Event Tracking Specification

### 1. Authentication Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `auth_login_initiated` | Click login button | `source`: header / quota_prompt / publish_prompt |
| `auth_login_success` | OAuth callback success | `is_new_user`: boolean |
| `auth_login_failed` | OAuth callback error | `error_code`: auth_failed / sync_failed / session_failed |
| `auth_logout` | Click logout | - |

### 2. Arena Generation Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `model_selected` | Change model dropdown | `model_id`, `model_name`, `slot`: a/b, `location`: homepage/playground |
| `arena_generate_started` | Click "Run Arena" | `model_a`, `model_b`, `prompt_length`, `category`, `is_authenticated` |
| `generation_completed` | Model finishes generating | `model_id`, `slot`: a/b, `duration_ms`, `tokens` |
| `generation_error` | Generation fails | `model_id`, `slot`: a/b, `error_code` |
| `generation_stopped` | User clicks stop | `model_id`, `slot`: a/b |
| `generation_regenerated` | User clicks regenerate | `model_id`, `slot`: a/b |

### 3. Homepage Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `featured_case_clicked` | Click featured case card | `mode`: physics/visual/game, `app_id` |
| `gallery_case_clicked` | Click app card in gallery grid | `app_id`, `category`, `position` |

### 4. Gallery Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `gallery_viewed` | Scroll to gallery section | `category` |
| `gallery_filtered` | Change category filter | `category`, `previous_category` |

### 5. Gallery Detail Page Events (`/gallery/[id]`)

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `gallery_prompt_copied` | Click copy prompt button | `app_id` |
| `gallery_open_in_playground` | Click "Re-generate in Playground" | `app_id`, `model_a`, `model_b` |

### 6. Sharing Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `share_modal_opened` | Click Share button | `app_id` |
| `share_link_copied` | Copy shareable URL | `app_id`, `share_mode`: video/poster |
| `publish_started` | Click Publish button | `app_id`, `category` |

### 7. Video Recording Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `video_recording_started` | Click record button | `app_id` |
| `video_recording_stopped` | Stop recording | `app_id`, `duration_seconds` |
| `video_upload_started` | Begin upload to Cloudflare | `app_id`, `file_size_mb` |
| `video_upload_completed` | Upload success | `app_id`, `upload_duration_seconds` |
| `video_upload_error` | Upload fails | `app_id`, `error_type` |

### 8. Quota & Conversion Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `free_quota_exceeded` | Anonymous user hits 5-generation limit | `usage_count` |
| `login_prompt_shown` | Login prompt displayed | `trigger`: quota/publish/like |

### 9. Hackathon Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `hackathon_modal_opened` | Open hackathon info modal | `source`: join_button/user_menu |

---

## Implementation Code

### Usage Example

```typescript
'use client'
 
import { sendGTMEvent } from '@next/third-parties/google'
 
export function EventButton() {
  return (
    <div>
      <button
        onClick={() => sendGTMEvent({ event: 'buttonClicked', value: 'xyz' })}
      >
        Send Event
      </button>
    </div>
  )
}
```
---

## GA4 Report Setup Guide

### Step 1: Access GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property (Novita Arena)

### Step 2: Configure Custom Dimensions

Navigate to **Admin > Data display > Custom definitions**

Create these custom dimensions for event-scoped data:

| Dimension Name | Event Parameter | Scope |
|----------------|-----------------|-------|
| Model ID | `model_id` | Event |
| Model Slot | `slot` | Event |
| App ID | `app_id` | Event |
| Category | `category` | Event |
| Error Code | `error_code` | Event |
| Is Authenticated | `is_authenticated` | Event |
| Location | `location` | Event |

### Step 3: Create Key Reports

#### Report 1: Generation Funnel

**Explore > Funnel exploration**

Steps:
1. `arena_generate_started`
2. `generation_completed`
3. `publish_started`

Breakdown by: `is_authenticated`

#### Report 2: Model Performance

**Explore > Free form**

- Rows: `model_id` (custom dimension)
- Values:
  - Event count (for `generation_completed`)
  - Average `duration_ms`
  - Average `tokens`

Filter: Event name = `generation_completed`

#### Report 3: Authentication Conversion

**Explore > Funnel exploration**

Steps:
1. `login_prompt_shown`
2. `auth_login_initiated`
3. `auth_login_success`

Breakdown by: `trigger` (quota/publish/like)

#### Report 4: Content Engagement

**Explore > Free form**

- Rows: `category`
- Values:
  - Event count for `featured_case_clicked`
  - Event count for `gallery_case_clicked`
  - Event count for `app_liked`

### Step 4: Create Audiences

Navigate to **Admin > Data display > Audiences**

#### Audience 1: Active Generators
- Condition: `arena_generate_started` count >= 3 in last 7 days

#### Audience 2: Publishers
- Condition: `publish_started` count >= 1

#### Audience 3: Quota Limited Users
- Condition: `free_quota_exceeded` triggered
- AND NOT `auth_login_success`

### Step 5: Set Up Conversions

Navigate to **Admin > Data display > Events**

Mark these as conversions (click the toggle):
- `auth_login_success`
- `publish_started`
- `video_upload_completed`

### Step 6: Create Dashboard

**Reports > Library > Create new report**

Recommended cards:
1. **Daily Active Users** - Users over time
2. **Generation Success Rate** - `generation_completed` / `arena_generate_started`
3. **Top Models** - Event count by `model_id`
4. **Category Distribution** - Events by `category`
5. **Auth Conversion** - `auth_login_success` / `login_prompt_shown`
6. **Publish Rate** - `publish_started` / `generation_completed`

---

## BigQuery Export (Optional)

For advanced analysis, enable BigQuery export:

1. **Admin > Product links > BigQuery links**
2. Link to your GCP project
3. Enable streaming export for real-time data

Query example:
```sql
SELECT
  event_name,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'model_id') as model_id,
  COUNT(*) as event_count
FROM `your_project.analytics_XXXXXX.events_*`
WHERE event_name = 'generation_completed'
  AND _TABLE_SUFFIX BETWEEN '20240101' AND '20241231'
GROUP BY event_name, model_id
ORDER BY event_count DESC
```

---

## Testing Events

### Using GA4 DebugView

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable debug mode
3. Go to **Admin > Data display > DebugView**
4. Trigger events and verify they appear with correct parameters

---

## Attribution Tracking

Captures marketing/referral parameters on first visit and passes to Novita main site for backend attribution.

### Tracked Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `referrer` | HTTP referrer header | (none) |
| `utm_source` | Traffic source | `direct` |
| `utm_campaign` | Campaign name | `none` |
| `utm_medium` | Medium type | `none` |
| `landingpage` | First landing page | (none) |

### Storage Rules

- **localStorage key**: `arena_tracking_params`
- **First capture only**: Parameters captured on first visit, never overwritten
- **No defaults stored**: Only actual values stored
- **Referrer logic**: Updates for external referrers only (non-Novita sites)

### Data Flow

```
User visits Arena
    ↓
Extract params from URL → Store to localStorage (first visit only)
    ↓
User clicks Login
    ↓
Read localStorage + apply defaults → Append to OAuth redirect URL
    ↓
Novita main site receives params → Backend attribution
```

### Example

```
Visit: https://arena.novita.ai/?utm_source=google&utm_campaign=launch
localStorage: {"utm_source":"google","utm_campaign":"launch","landingpage":"/"}
Sent to main site: utm_source=google&utm_campaign=launch&utm_medium=none
```

### Files

- `/lib/tracking.ts` - Core utilities
- `/hooks/use-tracking-params.ts` - React hook
- `/components/providers/tracking-provider.tsx` - Root layout initializer
