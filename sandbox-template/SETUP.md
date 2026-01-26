# Sandbox Template Summary

## Overview

The sandbox template has been created in the `sandbox-template/` directory. This template provides a service-based environment for recording app videos using Playwright, with HTTP API endpoints for recording and future Cloudflare uploads.

## Files Created

### Core Template Files

1. **`novita.Dockerfile`** - Docker image definition
   - Base: `novitalabs/code-interpreter:latest`
   - Installs Node.js 20.x
   - Installs Playwright and system dependencies
   - Bundles recording script and HTTP server
   - Sets up environment variables

2. **`novita.toml`** - Template configuration
   - Template name: `app-recording-service`
   - Start command: `node ./scripts/server.js`
   - Resources: 2 vCPUs, 2GB RAM

3. **`package.json`** - Node.js dependencies
   - Express (HTTP server)
   - Playwright (video recording)
   - Supabase client
   - tsx (TypeScript execution)

### Application Files

4. **`scripts/record-app.ts`** - Recording script (copied from `scripts/`)
   - Fetches app data from Supabase
   - Uses Playwright to record side-by-side videos
   - Saves to `scripts/videos/` directory

5. **`scripts/server.js`** - HTTP API server
   - `GET /health` - Health check
   - `POST /record` - Record a video
   - `POST /record-and-upload` - Record and upload (placeholder)
   - `POST /upload` - Upload to Cloudflare (placeholder)
   - `GET /videos` - List recorded videos

### Utility Files

6. **`build.sh`** - Build script
   - Installs CLI if needed
   - Builds the sandbox template
   - Displays usage instructions

7. **`use-sandbox.ts`** - SDK usage example
   - Shows how to create sandbox
   - Example of recording an app
   - Example of recording with upload

8. **`.env.example`** - Environment variables template
9. **`.gitignore`** - Git ignore rules

### Documentation

10. **`README.md`** - Detailed documentation
11. **`QUICKSTART.md`** - Step-by-step guide

## How It Works

```
Your App → SDK → Novita Sandbox → HTTP Server → Recording Script → Supabase
                                            ↓
                                         Video File
                                            ↓
                                   Cloudflare (TODO)
                                            ↓
                                    Database Update (TODO)
```

## Build Instructions

### Prerequisites

- Novita API key
- Docker installed
- Node.js 20+

### Build Steps

1. Set Novita API key:

   ```bash
   export NOVITA_API_KEY=your-key
   ```

2. Configure service secrets:

   ```bash
   cd sandbox-template
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Build template:

   ```bash
   ./build.sh
   ```

4. Save the template ID from output

## Usage Example

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

// Record an app
const response = await fetch(`https://${host}/record`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appId: 'your-app-id', duration: 10 }),
})

const result = await response.json()

await sandbox.kill()
```

## API Endpoints

| Endpoint             | Method | Description                   |
| -------------------- | ------ | ----------------------------- |
| `/health`            | GET    | Health check                  |
| `/record`            | POST   | Record video                  |
| `/record-and-upload` | POST   | Record & upload (placeholder) |
| `/upload`            | POST   | Upload video (placeholder)    |
| `/videos`            | GET    | List videos                   |

## TODO Items

- [ ] Implement Cloudflare R2/Workers upload
- [ ] Implement database update after successful upload
- [ ] Add error handling and retry logic
- [ ] Add authentication to API endpoints
- [ ] Add monitoring and logging
- [ ] Support multiple video formats

## Security Considerations

⚠️ **Important Security Notes:**

1. **Bundled Secrets**: Environment variables are baked into the Docker image. This means anyone with access to the template can extract them.

2. **Better Practice**: Pass secrets at runtime instead:

   ```typescript
   const sandbox = await Sandbox.create('template-id', {
     envs: {
       NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
       NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY,
     },
   })
   ```

3. **Service Role Key**: The template uses Supabase service role key which bypasses RLS. Ensure:
   - API endpoints are authenticated
   - Sandbox is not publicly accessible
   - Key is rotated regularly

4. **Network Access**: Sandbox has public URL. Consider:
   - Adding authentication tokens
   - Using IP allowlisting
   - Rate limiting

## Next Steps

1. Build the template using `./build.sh`
2. Save the template ID
3. Integrate with your application using the SDK
4. Implement Cloudflare upload in `scripts/server.js`
5. Test the recording functionality

## Support

- Novita Sandbox Docs: https://novita.ai/docs
- Sandbox Console: https://novita.ai/sandbox-console/template
