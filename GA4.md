# GA4 Strategic Tracking & Reporting Plan

This document outlines the Google Analytics 4 (GA4) strategy for **Render Arena**. It serves as a guide for both technical implementation and business analysis, ensuring that data collection is directly tied to key business objectives.

## 1. Business Objectives & Key Metrics

Our primary goals are to understand user engagement, measure model performance, and drive user growth.

| Business Objective         | Key Metrics                                                                 | GA4 Events / Metrics                                                                                               |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Measure Core Funnel**    | Generation Start Rate, Generation Completion Rate, Publish Completion Rate  | `arena_generate_started`, `generation_completed`, `publish_completed`                                              |
| **Evaluate Model Quality** | Model Error Rate, Generation Speed, User Preference (Regeneration/Stopping) | `generation_error` (count), `generation_duration_ms` (avg), `generation_regenerated` (count), `model_selected` (count) |
| **Drive User Growth**      | Viral Coefficient (Shares per User), New User Conversion Rate               | `share_link_copied` (count), `auth_login_success` (where `is_new_user` is true)                                    |
| **Increase User Retention**| % of Logged-in Users, Rate of Return Visits                                 | `user_engagement` (GA4 default), `auth_login_success` (count)                                                      |

## 2. GA4 Configuration

- **GA4 ID:** `G-6E3YJT3N0F`
- **Integration:** `@next/third-parties/google` in `app/layout.tsx`

### Custom Dimensions & User Properties

The following parameters should be registered in GA4 as custom definitions to enable detailed reporting.

| Scope  | Name                  | Description                                            | Example Value     |
| ------ | --------------------- | ------------------------------------------------------ | ----------------- |
| Event  | `model_id`            | The unique identifier for a model.                     | `claude-3-opus`   |
| Event  | `model_name`          | The display name of the model.                         | `Opus`            |
| Event  | `slot`                | The arena slot (A or B) the model occupies.            | `a`               |
| Event  | `category`            | The content category for generation or gallery.        | `game`            |
| Event  | `app_id`              | The unique ID of a generated/published piece of content. | `abc-123`         |
| Event  | `error_code`          | A specific code identifying a generation or auth error.| `quota_exceeded`  |
| Event  | `source`              | The UI element or page that triggered an event.        | `header`          |
| Event  | `share_mode`          | The format chosen for sharing (video or image).        | `video`           |
| User   | `user_role`           | The status of the user (e.g., anonymous, logged in).   | `anonymous_user`  |
| User   | `is_new_user`         | Identifies if a login event is for a new user.         | `true`            |

### Conversion Events

The following events represent key user actions and should be marked as conversions in GA4:

- `publish_completed`
- `auth_login_success`
- `share_link_copied`

---

## 3. Event Tracking Specification

Events are grouped by user journey for clarity.

### Core Funnel: Generation to Publish

| Event Name               | Trigger                                      | Key Properties                                                                  | Business Question Answered                                                                 |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `arena_generate_started` | Click "Run Arena" or "Re-generate"           | `model_a`, `model_b`, `prompt_length`, `category`, `is_authenticated`, `user_id`  | How many generation battles are started? What are the most popular model matchups?         |
| `generation_completed`   | A model successfully finishes generating     | `model_id`, `slot`, `duration_ms`, `tokens`                                     | Which models are fastest? How much does a typical generation cost in tokens?               |
| `generation_error`       | A model fails during generation              | `model_id`, `slot`, `error_code`                                                | Which models have the highest failure rate? What are the common reasons for failure?       |
| `generation_stopped`     | User clicks the "Stop" button                | `model_id`, `slot`                                                              | Which models are most frequently stopped by users, indicating poor output?                 |
| `publish_started`        | User clicks "Publish to Gallery" in Share modal | `app_id`, `category`                                                            | How many users intend to publish their creations?                                          |
| **`publish_completed`**  | **Successfully get a shareable URL back**    | `app_id`, `category`, `final_model_a`, `final_model_b`                          | **(Conversion)** How many creations are successfully published to the gallery? (Our core conversion) |
| **`publish_error`**      | **Publishing fails for any reason**          | `app_id`, `error_code`                                                          | What are the technical blockers preventing users from publishing?                          |

### User Growth & Sharing

| Event Name            | Trigger                        | Key Properties                                   | Business Question Answered                                               |
| --------------------- | ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------ |
| `share_modal_opened`  | Click "Share" button           | `app_id`                                         | How often do users open the share dialog?                                |
| `share_link_copied`   | User copies the shareable URL  | `app_id`, `share_mode`, `utm_source`, `utm_medium` | **(Conversion)** How many shares happen? Which share format is preferred? |
| `gallery_viewed`      | User views a gallery page      | `app_id`, `author_id`                            | How many views do published creations get?                               |
| `gallery_remixed`     | User clicks "Re-generate" on a gallery item | `app_id`, `original_author_id`             | Which gallery items inspire the most new creations (virality)?           |

### User Authentication

| Event Name           | Trigger                | Key Properties                                   | Business Question Answered                                                         |
| -------------------- | ---------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `login_prompt_shown` | A login modal appears  | `trigger`: `quota_exceeded` / `publish_prompt`   | What are the primary drivers for users to consider logging in?                     |
| `auth_login_success` | Successful OAuth login | `is_new_user`                                    | **(Conversion)** How many new users are we acquiring? What is the login success rate? |
| `auth_login_failed`  | OAuth callback error   | `error_code`                                     | Where are the friction points in the login process?                                |
| `auth_logout`        | User clicks "Logout"   | -                                                | How often do users log out?                                                        |

---

## 4. Recommended Reports (GA4 Explore)

These reports should be created in the "Explore" section of GA4 to provide actionable insights.

### 1. **Generation-to-Publish Funnel Report**

- **Type:** Funnel exploration
- **Stages:**
  1. `arena_generate_started`
  2. `generation_completed` (At least one model)
  3. `share_modal_opened`
  4. `publish_started`
  5. `publish_completed`
- **Breakdown Dimension:** `Device category`, `Category`
- **Insights:** Identify the biggest drop-off points in the core user journey. Do users fail to complete generation? Or do they generate but not share? This funnel is critical for understanding product adoption.

### 2. **Model Performance Dashboard**

- **Type:** Free-form report
- **Metrics (Columns):**
  - `Count` of `generation_error`
  - `Average` of `generation_duration_ms`
  - `Count` of `generation_stopped`
  - `Count` of `generation_regenerated`
- **Rows:** `model_name`
- **Filters:** `event_name` is one of (`generation_error`, `generation_completed`, `generation_stopped`)
- **Insights:** Directly compare model performance on speed, reliability, and user satisfaction. This data is crucial for product decisions, vendor negotiations, and marketing content ("Our fastest models are...").

### 3. **User Acquisition & Virality Report**

- **Type:** Path exploration (starting with `session_start`) or Free-form report
- **Dimensions:** `Session source / medium`
- **Metrics:**
  - `New users`
  - `Conversions` (filtered to `publish_completed`)
  - `Count` of `share_link_copied`
- **Insights:** Analyze which traffic sources (e.g., `twitter.com`, `direct`, `google`) bring in the most valuable users—those who not only sign up but also complete the core action of publishing. Track the effectiveness of social sharing campaigns.