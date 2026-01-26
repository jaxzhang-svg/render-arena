# Quick Start Guide - App Recording Sandbox Template

This guide will help you get started with the Novita sandbox template for app recording.

## Prerequisites

1. **Novita Account** - Sign up at https://novita.ai
2. **Novita API Key** - Get it from https://novita.ai/settings/key-management
3. **Docker** - Install Docker locally (required for building)
4. **Node.js 20+** - Required for the SDK

## Step 1: Install CLI

```bash
npm install -g @novitaai/sandbox-cli
```

## Step 2: Configure Environment Variables

Set your Novita API key:

```bash
export NOVITA_ACCESS_TOKEN=your-api-key-here
```

## Step 3: Configure Service Secrets

Copy the example environment file:

```bash
cd sandbox-template
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
PORT=3000
```

## Step 4: Build the Template

Run the build script:

```bash
./build.sh
```

Or manually:

```bash
novita-sandbox-cli template build -c "node ./scripts/server.js"
```

This process will:

1. Build a Docker image with all dependencies
2. Install Playwright and Chromium
3. Create a sandbox snapshot
4. Return a **template ID** (save this!)

The build may take several minutes.

## Step 5: Use the Template

### Option A: Use the SDK Script

Create a `.env` file in your project root:

```bash
NOVITA_TEMPLATE_ID=your-template-id-from-step-4
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

Install the SDK:

```bash
npm install novita-sandbox dotenv tsx
```

Run the example script:

```bash
# Record an app (10 seconds)
npx tsx sandbox-template/use-sandbox.ts your-app-id --duration 10

# Record and upload
npx tsx sandbox-template/use-sandbox.ts your-app-id --upload

# Custom resolution
npx tsx sandbox-template/use-sandbox.ts your-app-id --width 1280 --height 720
```

### Option B: Use the SDK Directly

```typescript
import 'dotenv/config'
import { Sandbox } from 'novita-sandbox/code-interpreter'

const sandbox = await Sandbox.create('your-template-id', {
  envs: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
  },
})

const host = sandbox.getHost(3000)
const baseUrl = `https://${host}`

// Record an app
await fetch(`${baseUrl}/record`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appId: 'your-app-id',
    duration: 10,
  }),
})

await sandbox.kill()
```

## Step 6: Integrate with Your App

### In Your Next.js API Route

```typescript
import { Sandbox } from 'novita-sandbox/code-interpreter'

export async function POST(req: Request) {
  const { appId } = await req.json()

  const sandbox = await Sandbox.create(process.env.NOVITA_TEMPLATE_ID, {
    envs: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  const host = sandbox.getHost(3000)
  const response = await fetch(`https://${host}/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, duration: 10 }),
  })

  const result = await response.json()

  await sandbox.kill()

  return Response.json(result)
}
```

## API Reference

### POST /record

Record a video for an app.

```json
{
  "appId": "app-id",
  "duration": 5,
  "width": 1920,
  "height": 1080,
  "fps": 30
}
```

### POST /record-and-upload

Record and upload (when implemented).

### GET /videos

List all recorded videos.

### GET /health

Health check.

## Troubleshooting

### Build fails with Docker error

Make sure Docker is running:

```bash
docker ps
```

### "novita-sandbox-cli not found"

Install the CLI:

```bash
npm install -g @novitaai/sandbox-cli
```

### Authentication error

Check your API key:

```bash
echo $NOVITA_API_KEY
```

### Sandbox fails to start

Check the sandbox logs:

```bash
novita-sandbox-cli sandbox logs <sandbox-id>
```

### Recording fails

Check if Playwright is installed:

```bash
npx playwright install chromium
```

## Next Steps

- Implement Cloudflare upload in `scripts/server.js`
- Add database update after upload
- Add error handling and retry logic
- Add authentication to API endpoints
- Add monitoring and logging

## Support

For issues with the Novita sandbox service, visit: https://novita.ai/docs
