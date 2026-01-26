# App Video Recording Scripts

This directory contains scripts for recording video previews of app renderings.

## Quick Start

**For local testing:**

Use the local recording script described below.

---

## Local Recording Script

The `record-app.ts` script uses Playwright to record app videos locally.

### Installation

```bash
npm install --save-dev playwright @playwright/test tsx dotenv
npx playwright install chromium
```

### System Dependencies

**Linux** (if running locally):

```bash
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2
```

macOS and Windows: No additional dependencies required.

### Usage

```bash
# Record with default settings (5 seconds, 1920x1080)
npx tsx scripts/record-app.ts <appId>

# Custom duration
npx tsx scripts/record-app.ts <appId> --duration 10

# Custom resolution
npx tsx scripts/record-app.ts <appId> --width 1280 --height 720

# Custom output path
npx tsx scripts/record-app.ts <appId> --output ./my-video.webm
```

### Options

| Option                 | Description                   | Default                 |
| ---------------------- | ----------------------------- | ----------------------- |
| `--duration <seconds>` | Recording duration in seconds | 5                       |
| `--width <pixels>`     | Video width in pixels         | 1920                    |
| `--height <pixels>`    | Video height in pixels        | 1080                    |
| `--fps <frames>`       | Frames per second             | 30                      |
| `--output <path>`      | Output file path              | `./videos/<appId>.webm` |

### Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_SUPABASE_SERVICE_ROLE_KEY`

### Output

- WebM video file with side-by-side view (Model A left, Model B right)
- Videos are saved in the `scripts/videos/` directory by default

---

## Notes

- All videos use side-by-side layout (Model A left, Model B right)
- HTML content is rendered in isolated iframes with `sandbox="allow-scripts"`
- Script waits 3 seconds after loading before recording to ensure animations start
- Videos are in WebM format for best browser compatibility
