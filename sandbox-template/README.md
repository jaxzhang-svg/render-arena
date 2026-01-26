# App Recording Service - Novita Sandbox Template

This template provides a sandbox environment for recording app videos using Playwright, with the ability to upload to Cloudflare and update the database.

## Features

- ✅ Playwright-based video recording
- ✅ HTTP API for recording requests
- ✅ Side-by-side video capture (Model A | Model B)
- ✅ Supabase integration for fetching app data
- 🚧 Cloudflare upload (placeholder - to be implemented)
- 🚧 Database update (placeholder - to be implemented)

## Quick Start

### 1. Initialize the template

```bash
novita-sandbox-cli template init
```

### 2. Configure environment variables

Create a `.env` file in the sandbox template directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### 3. Build the template

```bash
novita-sandbox-cli template build -c "node ./scripts/server.js"
```

This will:

- Install Node.js and Playwright
- Set up the recording service
- Start an HTTP server on port 3000

### 4. Use the template with SDK

```typescript
import { Sandbox } from 'novita-sandbox/code-interpreter'

const templateID = 'your-template-id'

// Create sandbox with environment variables
const sandbox = await Sandbox.create(templateID, {
  envs: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  },
})

const host = sandbox.getHost(3000)
const baseUrl = `https://${host}`

// Record an app
const response = await fetch(`${baseUrl}/record`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appId: 'your-app-id',
    duration: 10,
    width: 1920,
    height: 1080,
    fps: 30,
  }),
})

const result = await response.json()
console.log(result)

await sandbox.kill()
```

## API Endpoints

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "message": "Recording service is running"
}
```

### POST /record

Record a video for an app.

**Request:**

```json
{
  "appId": "app-id",
  "duration": 5,
  "width": 1920,
  "height": 1080,
  "fps": 30
}
```

**Response:**

```json
{
  "success": true,
  "videoPath": "/app/scripts/videos/app-id.webm",
  "message": "Recording completed for app app-id"
}
```

### POST /record-and-upload

Record a video and upload to Cloudflare (placeholder).

**Request:**

```json
{
  "appId": "app-id",
  "duration": 5,
  "width": 1920,
  "height": 1080,
  "fps": 30
}
```

**Response:**

```json
{
  "success": true,
  "videoPath": "/app/scripts/videos/app-id.webm",
  "message": "Recording completed for app app-id",
  "uploadStatus": "pending",
  "note": "Upload functionality not yet implemented"
}
```

### POST /upload

Upload a video to Cloudflare (placeholder).

**Request:**

```json
{
  "appId": "app-id",
  "videoPath": "/app/scripts/videos/app-id.webm"
}
```

### GET /videos

List all recorded videos.

**Response:**

```json
{
  "videos": [
    {
      "filename": "app-id.webm",
      "path": "/app/scripts/videos/app-id.webm",
      "size": 1234567
    }
  ]
}
```

## Security Note

⚠️ **Important**: While this template bundles environment variables in the Docker image for convenience, consider the security implications:

- Secrets are baked into the image
- Anyone with access to the template can extract them
- For production, pass secrets at runtime instead

Better approach:

```typescript
const sandbox = await Sandbox.create(templateID, {
  envs: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
  },
})
```

## TODO

- [ ] Implement Cloudflare R2/Workers upload
- [ ] Implement database update after upload
- [ ] Add authentication to API endpoints
- [ ] Add retry logic for failed uploads
- [ ] Add video compression options
- [ ] Add error logging and monitoring
- [ ] Support multiple recording formats (mp4, webm, gif)
