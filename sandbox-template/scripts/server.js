import express from 'express'
import { spawn } from 'child_process'
import { config } from 'dotenv'
import path from 'path'

config({ path: '/app/.env' })

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Recording service is running' })
})

// Recording endpoint
app.post('/record', async (req, res) => {
  const { appId, duration = 5, width = 1920, height = 1080, fps = 30 } = req.body

  if (!appId) {
    return res.status(400).json({ error: 'appId is required' })
  }

  console.log(`📹 Recording request for app: ${appId}`)

  try {
    const args = ['tsx', './scripts/record-app.ts', appId]

    if (duration) args.push('--duration', duration.toString())
    if (width) args.push('--width', width.toString())
    if (height) args.push('--height', height.toString())
    if (fps) args.push('--fps', fps.toString())

    const recordProcess = spawn('npx', args, {
      cwd: '/app',
      stdio: 'inherit',
    })

    recordProcess.on('close', code => {
      if (code === 0) {
        const videoPath = `/app/scripts/videos/${appId}.webm`
        res.json({
          success: true,
          videoPath,
          message: `Recording completed for app ${appId}`,
        })
      } else {
        res.status(500).json({
          error: 'Recording failed',
          code,
        })
      }
    })

    recordProcess.on('error', error => {
      console.error('Failed to start recording process:', error)
      res.status(500).json({ error: 'Failed to start recording process' })
    })
  } catch (error) {
    console.error('Recording error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Upload endpoint (placeholder for Cloudflare upload)
app.post('/upload', async (req, res) => {
  const { appId, videoPath } = req.body

  if (!appId || !videoPath) {
    return res.status(400).json({ error: 'appId and videoPath are required' })
  }

  console.log(`📤 Upload request for app: ${appId}, video: ${videoPath}`)

  // TODO: Implement Cloudflare upload
  // This is a placeholder - implement the actual upload logic here

  res.json({
    success: true,
    message: 'Upload functionality not yet implemented',
    appId,
    videoPath,
  })
})

// Combined record and upload endpoint
app.post('/record-and-upload', async (req, res) => {
  const { appId, duration = 5, width = 1920, height = 1080, fps = 30 } = req.body

  if (!appId) {
    return res.status(400).json({ error: 'appId is required' })
  }

  console.log(`🎬 Record and upload request for app: ${appId}`)

  try {
    const args = ['tsx', './scripts/record-app.ts', appId]

    if (duration) args.push('--duration', duration.toString())
    if (width) args.push('--width', width.toString())
    if (height) args.push('--height', height.toString())
    if (fps) args.push('--fps', fps.toString())

    const recordProcess = spawn('npx', args, {
      cwd: '/app',
      stdio: 'inherit',
    })

    recordProcess.on('close', code => {
      if (code === 0) {
        const videoPath = `/app/scripts/videos/${appId}.webm`
        console.log(`✅ Recording complete: ${videoPath}`)

        // TODO: Upload to Cloudflare and update database
        // For now, just return the video path

        res.json({
          success: true,
          videoPath,
          message: `Recording completed for app ${appId}`,
          uploadStatus: 'pending',
          note: 'Upload functionality not yet implemented',
        })
      } else {
        res.status(500).json({
          error: 'Recording failed',
          code,
        })
      }
    })

    recordProcess.on('error', error => {
      console.error('Failed to start recording process:', error)
      res.status(500).json({ error: 'Failed to start recording process' })
    })
  } catch (error) {
    console.error('Recording error:', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Get recorded videos list
app.get('/videos', (req, res) => {
  const fs = require('fs')
  const path = require('path')
  const videosDir = '/app/scripts/videos'

  try {
    if (!fs.existsSync(videosDir)) {
      return res.json({ videos: [] })
    }

    const files = fs.readdirSync(videosDir)
    const videos = files
      .filter(file => file.endsWith('.webm'))
      .map(file => ({
        filename: file,
        path: path.join(videosDir, file),
        size: fs.statSync(path.join(videosDir, file)).size,
      }))

    res.json({ videos })
  } catch (error) {
    console.error('Error listing videos:', error)
    res.status(500).json({ error: 'Failed to list videos' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Recording service running on port ${PORT}`)
  console.log(`📹 Health check: http://localhost:${PORT}/health`)
  console.log(`🎬 Record endpoint: http://localhost:${PORT}/record`)
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/upload`)
  console.log(`🎬 Record & Upload: http://localhost:${PORT}/record-and-upload`)
})
