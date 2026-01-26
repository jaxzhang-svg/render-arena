import 'dotenv/config'
import { Sandbox } from 'novita-sandbox/code-interpreter'

const TEMPLATE_ID = process.env.NOVITA_TEMPLATE_ID

if (!TEMPLATE_ID) {
  console.error('❌ NOVITA_TEMPLATE_ID environment variable is required')
  console.error('Please set it to your template ID after building the template')
  process.exit(1)
}

interface RecordingOptions {
  appId: string
  duration?: number
  width?: number
  height?: number
  fps?: number
}

async function recordApp(options: RecordingOptions) {
  console.log(`🎬 Creating sandbox for recording app: ${options.appId}`)

  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    envs: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '',
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
    },
  })

  const host = sandbox.getHost(3000)
  const baseUrl = `https://${host}`

  console.log(`🌐 Sandbox URL: ${baseUrl}`)

  try {
    // Health check
    console.log('🔍 Checking sandbox health...')
    const healthResponse = await fetch(`${baseUrl}/health`)
    const health = await healthResponse.json()
    console.log('✅ Health check:', health)

    // Record the app
    console.log('📹 Starting recording...')
    const recordResponse = await fetch(`${baseUrl}/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: options.appId,
        duration: options.duration || 10,
        width: options.width || 1920,
        height: options.height || 1080,
        fps: options.fps || 30,
      }),
    })

    const result = await recordResponse.json()

    if (!recordResponse.ok) {
      throw new Error(result.error || 'Recording failed')
    }

    console.log('✅ Recording completed!')
    console.log(`📁 Video path: ${result.videoPath}`)

    // List videos
    console.log('📋 Listing all videos...')
    const videosResponse = await fetch(`${baseUrl}/videos`)
    const videos = await videosResponse.json()
    console.log('📹 Videos:', videos)

    return result
  } finally {
    await sandbox.kill()
    console.log('🗑️  Sandbox closed')
  }
}

async function recordAndUpload(options: RecordingOptions) {
  console.log(`🎬 Recording and uploading app: ${options.appId}`)

  const sandbox = await Sandbox.create(TEMPLATE_ID, {
    envs: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || '',
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
    },
  })

  const host = sandbox.getHost(3000)
  const baseUrl = `https://${host}`

  try {
    const response = await fetch(`${baseUrl}/record-and-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Recording/upload failed')
    }

    console.log('✅ Recording completed!')
    console.log(result)

    return result
  } finally {
    await sandbox.kill()
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage: node use-sandbox.ts <appId> [options]')
    console.log('')
    console.log('Options:')
    console.log('  --duration <seconds>   Recording duration (default: 10)')
    console.log('  --width <pixels>       Video width (default: 1920)')
    console.log('  --height <pixels>      Video height (default: 1080)')
    console.log('  --fps <frames>         Frames per second (default: 30)')
    console.log('  --upload               Upload to Cloudflare after recording')
    console.log('')
    console.log('Environment variables:')
    console.log('  NOVITA_TEMPLATE_ID                 Your template ID')
    console.log('  NEXT_PUBLIC_SUPABASE_URL          Supabase URL')
    console.log('  NEXT_SUPABASE_SERVICE_ROLE_KEY   Supabase service role key')
    console.log('  CLOUDFLARE_ACCOUNT_ID             Cloudflare account ID')
    console.log('  CLOUDFLARE_API_TOKEN              Cloudflare API token')
    console.log('')
    console.log('Example:')
    console.log('  node use-sandbox.ts abc123 --duration 10 --upload')
    process.exit(1)
  }

  const appId = args[0]
  const options: RecordingOptions = { appId }
  let upload = false

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
      case '--upload':
        upload = true
        break
    }
  }

  try {
    if (upload) {
      await recordAndUpload(options)
    } else {
      await recordApp(options)
    }

    console.log('')
    console.log('🎉 All done!')
  } catch (error) {
    console.error('')
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
