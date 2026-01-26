import { chromium, type Page, type Browser, type BrowserContext } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

interface AppData {
  id: string
  html_content_a: string | null
  html_content_b: string | null
  name: string | null
  prompt: string
}

interface RecordingOptions {
  duration?: number
  width?: number
  height?: number
  fps?: number
  model?: 'a' | 'b' | 'both'
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '❌ Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_SUPABASE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function getAppData(appId: string): Promise<AppData> {
  console.log(`📦 Fetching app data for ID: ${appId}`)

  const { data, error } = await supabase
    .from('apps')
    .select('id, html_content_a, html_content_b, name, prompt')
    .eq('id', appId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch app: ${error.message}`)
  }

  if (!data) {
    throw new Error(`App not found: ${appId}`)
  }

  return data as AppData
}

async function recordSideBySide(
  browser: Browser,
  htmlA: string,
  htmlB: string,
  outputPath: string,
  options: RecordingOptions = {}
): Promise<void> {
  const { duration = 5, fps = 30, width = 1920, height = 1080 } = options

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: require('path').dirname(outputPath),
      size: { width, height },
    },
  })

  const page = await context.newPage()

  const iframeContentA = `
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; overflow: hidden; }
    </style>
    ${htmlA || ''}
  `
  const iframeContentB = `
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; overflow: hidden; }
    </style>
    ${htmlB || ''}
  `

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Preview - Side by Side</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      background: white;
    }
    .container {
      display: flex;
      width: 100%;
      height: 100%;
    }
    .side {
      flex: 1;
      overflow: hidden;
      position: relative;
      height: 100%;
      min-width: 0;
    }
    .side:first-child {
      border-right: 1px solid #e5e5e5;
    }
    .side iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="side">
      <iframe sandbox="allow-scripts" srcdoc="${iframeContentA.replace(/"/g, '&quot;')}"></iframe>
    </div>
    <div class="side">
      <iframe sandbox="allow-scripts" srcdoc="${iframeContentB.replace(/"/g, '&quot;')}"></iframe>
    </div>
  </div>
</body>
</html>
  `

  await page.setContent(fullHtml, { waitUntil: 'networkidle' })

  await new Promise(resolve => setTimeout(resolve, 3000))

  const video = page.video()
  if (!video) {
    throw new Error('Video recording not started')
  }
  const videoPath = await video.path()
  console.log(`📹 Recording side-by-side to: ${videoPath}`)

  await new Promise(resolve => setTimeout(resolve, duration * 1000))

  await context.close()

  const fs = require('fs')
  if (fs.existsSync(videoPath)) {
    const finalPath = outputPath.endsWith('.webm') ? outputPath : `${outputPath}.webm`
    fs.renameSync(videoPath, finalPath)
    console.log(`✅ Video saved to: ${finalPath}`)
  } else {
    throw new Error('Video file was not created')
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.error('❌ Usage: node record-app.ts <appId> [options]')
    console.error('')
    console.error('Options:')
    console.error('  --duration <seconds>   Recording duration (default: 5)')
    console.error('  --width <pixels>       Video width (default: 1920)')
    console.error('  --height <pixels>      Video height (default: 1080)')
    console.error('  --fps <frames>         Frames per second (default: 30)')
    console.error('  --output <path>        Output file path (default: ./videos/<appId>.webm)')
    console.error('')
    console.error('Example:')
    console.error('  node record-app.ts abc123 --duration 10')
    process.exit(1)
  }

  const appId = args[0]
  const options: RecordingOptions = {}
  let outputPath: string | null = null

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--duration':
        if (nextArg) {
          options.duration = parseInt(nextArg, 10)
          i++
        }
        break
      case '--width':
        if (nextArg) {
          options.width = parseInt(nextArg, 10)
          i++
        }
        break
      case '--height':
        if (nextArg) {
          options.height = parseInt(nextArg, 10)
          i++
        }
        break
      case '--fps':
        if (nextArg) {
          options.fps = parseInt(nextArg, 10)
          i++
        }
        break
      case '--output':
        if (nextArg) {
          outputPath = nextArg
          i++
        }
        break
    }
  }

  try {
    const appData = await getAppData(appId)
    console.log(`📝 App: ${appData.name || 'Untitled'}`)
    console.log(`📄 Prompt: ${appData.prompt.substring(0, 100)}...`)

    if (!outputPath) {
      const fs = require('fs')
      const videosDir = './scripts/videos'
      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true })
      }
      outputPath = `${videosDir}/${appId}.webm`
    }

    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
      ],
    })

    const htmlA = appData.html_content_a || ''
    const htmlB = appData.html_content_b || ''

    if (!htmlA && !htmlB) {
      throw new Error('No HTML content found for this app')
    }

    await recordSideBySide(browser, htmlA, htmlB, outputPath, options)

    await browser.close()

    console.log('')
    console.log('🎉 Recording complete!')
    console.log(`📁 Output: ${outputPath}`)
    console.log(`🎬 Format: Side-by-side (left: Model A, right: Model B)`)
  } catch (error) {
    console.error('')
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
