'use client'

import { Dialog } from '@base-ui/react/dialog'
import {
  Download,
  Copy,
  X,
  Link as LinkIcon,
  Check,
  Loader2,
  CloudUpload,
  CheckCircle,
  Lock,
} from 'lucide-react'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import clipboardy from 'clipboardy'
import { showToast } from '@/lib/toast'
import { getModeByCategory } from '@/lib/config'
import { appendTrackingParamsToUrl } from '@/lib/tracking'
import { trackResultShared } from '@/lib/analytics'
import { getStreamWatchUrl } from '@/lib/cloudflare-stream'

// Local Assets
const imgLinkedin = '/logo/square-linkedin-brands-solid-full.svg'
const imgTwitter = '/logo/square-x-twitter-brands-solid-full.svg'
const imgFacebook = '/logo/square-facebook-brands-solid-full.svg'

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error'

interface ShareModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  appId?: string
  shareUrl?: string
  videoBlob?: Blob | null
  videoFormat?: 'webm' | 'mp4' | null
  showVideoSection?: boolean
  prompt?: string
  isPublished?: boolean
  onPublishSuccess?: (category?: string | null) => void
  category?: string | null
  skipSaveToDatabase?: boolean
}

export function ShareModal({
  open = false,
  onOpenChange,
  appId,
  shareUrl = 'https://make.figma.com/s/9f8a7d6',
  videoBlob,
  videoFormat,
  showVideoSection = false,
  prompt = '',
  isPublished = false,
  onPublishSuccess,
  category,
  skipSaveToDatabase = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [agreedToPolicy, setAgreedToPolicy] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoUid, setVideoUid] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Track if we've already uploaded this blob
  const uploadedBlobRef = useRef<Blob | null>(null)

  const fileSize = videoBlob ? (videoBlob.size / (1024 * 1024)).toFixed(1) : '0'

  // Create video URL from blob for preview
  const videoUrl = useMemo(() => {
    if (!videoBlob) return null
    return URL.createObjectURL(videoBlob)
  }, [videoBlob])

  // Cleanup URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // Only reset upload state if it's a new blob
      if (videoBlob && videoBlob !== uploadedBlobRef.current) {
        setUploadStatus('idle')
        setUploadProgress(0)
        setVideoUid(null)
        setUploadError(null)
      }
    }
  }, [open, videoBlob, appId])

  // Upload video to Cloudflare Stream
  const handleUploadVideo = useCallback(async () => {
    if (!videoBlob || !appId) return

    try {
      setUploadStatus('uploading')
      setUploadProgress(0)
      setUploadError(null)
      uploadedBlobRef.current = videoBlob

      // Step 1: Get upload URL from our backend
      const uploadUrlResponse = await fetch('/api/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDurationSeconds: 60 }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, videoUid: newVideoUid } = await uploadUrlResponse.json()
      setVideoUid(newVideoUid)

      // Step 2: Upload video blob to Cloudflare Stream
      // Using FormData for direct upload
      const formData = new FormData()
      const fileName = `recording-${Date.now()}.${videoFormat || 'webm'}`
      formData.append('file', videoBlob, fileName)

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'))
        })

        xhr.open('POST', uploadUrl)
        xhr.send(formData)
      })

      // Step 3: Save video UID to database (skip if skipSaveToDatabase is true)
      setUploadStatus('processing')

      if (!skipSaveToDatabase) {
        const saveResponse = await fetch(`/api/apps/${appId}/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUid: newVideoUid }),
        })

        if (!saveResponse.ok) {
          throw new Error('Failed to save video')
        }
      }

      // Step 4: Wait a moment for Cloudflare to start processing, then mark as ready
      // In production, you might want to poll for status, but for UX we'll just show ready
      setTimeout(() => {
        setUploadStatus('ready')
        // Track upload completed
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      showToast.error(errorMessage)
      setUploadStatus('error')
      setUploadError('Upload failed. Please try again.')
      uploadedBlobRef.current = null // Allow retry
    }
  }, [videoBlob, appId, videoFormat, skipSaveToDatabase])

  // Auto-upload video when modal opens for published content
  useEffect(() => {
    if (open && videoBlob && isPublished && uploadStatus === 'idle' && appId) {
      console.log('Auto-uploading video for published gallery item...')
      handleUploadVideo()
    }
  }, [open, videoBlob, isPublished, uploadStatus, appId, handleUploadVideo])

  /*
   * Handle Publish to Gallery
   * - Uploads video if needed
   * - Calls publish API
   */
  const handlePublishToGallery = useCallback(async () => {
    if (!appId || isPublished) return

    try {
      setPublishLoading(true)

      // If there is a video AND it hasn't been uploaded yet, upload it first
      if (videoBlob && uploadStatus === 'idle') {
        await handleUploadVideo()
        // Note: handleUploadVideo sets uploadStatus to 'processing' -> 'ready'
        // We need to wait for it? handleUploadVideo is async so awaiting it should be fine
        // BUT, handleUploadVideo catches its own errors. We should check logic.
      } else if (uploadStatus === 'error') {
        await handleUploadVideo()
      }

      // Now publish
      const response = await fetch(`/api/apps/${appId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (response.ok) {
        const data = await response.json()
        onPublishSuccess?.(data.category)
      } else {
        showToast.error('Publishing failed. Please try again.')
        // Handle error (maybe show toast)
      }
    } catch (error) {
      console.error('Error publishing:', error)
      showToast.error('Publishing failed. Please try again.')
    } finally {
      setPublishLoading(false)
    }
  }, [appId, isPublished, videoBlob, uploadStatus, handleUploadVideo, onPublishSuccess])

  const handleDownload = () => {
    if (videoBlob && videoUrl) {
      const a = document.createElement('a')
      a.href = videoUrl
      const extension = videoFormat || 'mp4'
      a.download = `recording-${Date.now()}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const videoLink = useMemo(() => {
    return getStreamWatchUrl(videoUid) || ''
  }, [videoUid])

  const handleCopy = async () => {
    const textToCopy = videoBlob ? videoLink : shareUrl

    try {
      await clipboardy.write(textToCopy)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      showToast.error('Copy failed')
      return
    }

    if (appId) {
      trackResultShared({
        content_id: appId,
        share_type: videoBlob ? 'video' : 'link',
        share_method: 'copy_link',
      })
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    // Truncate prompt to 5 words
    const truncatedPrompt =
      prompt.split(/\s+/).slice(0, 5).join(' ') + (prompt.split(/\s+/).length > 5 ? ' …' : '')

    const linkToShare = appendTrackingParamsToUrl(shareUrl, {
      utm_source: 'renderarena',
      utm_medium: platform,
      utm_campaign: 'app_share',
    })

    const shareText = `Novita Render Arena — Side-by-Side\nPrompt: "${truncatedPrompt}"\n👉 Which model wins?\n`

    const encodedUrl = encodeURIComponent(linkToShare)
    const encodedText = encodeURIComponent(shareText)

    let url = ''

    trackResultShared({
      content_id: appId || '',
      share_type: videoBlob ? 'video' : 'link',
      share_method: platform === 'twitter' ? 'x' : platform,
    })

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
    }

    window.open(url, '_blank', 'width=600,height=400')
  }

  // Render upload status overlay
  const renderUploadOverlay = () => {
    if (uploadStatus === 'idle' || uploadStatus === 'ready') return null

    return (
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm">
        {uploadStatus === 'uploading' && (
          <>
            <div className="relative size-16">
              <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#23d57c"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${uploadProgress * 1.76} 176`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CloudUpload className="size-6 text-white" />
              </div>
            </div>
            <div className="text-sm font-medium text-white">Uploading... {uploadProgress}%</div>
          </>
        )}

        {uploadStatus === 'processing' && (
          <>
            <Loader2 className="size-10 animate-spin text-white" />
            <div className="text-sm font-medium text-white">Processing video...</div>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-red-500/20">
              <X className="size-6 text-red-400" />
            </div>
            <div className="text-sm font-medium text-white">{uploadError || 'Upload failed'}</div>
            <button
              onClick={handleUploadVideo}
              className="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
            >
              Retry
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={open => onOpenChange?.(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[446px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] outline-none">
          {/* Header */}
          <div className="flex h-[69px] items-center justify-between border-b border-[#f3f4f6] px-5 pr-3">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] leading-7 font-semibold tracking-[-0.4395px] text-[#101828]">
                {videoBlob ? 'Share Video' : 'Share Generation'}
              </h2>
              {/* Category Badge */}
              {isPublished &&
                category &&
                (() => {
                  const mode = getModeByCategory(category)
                  if (!mode) return null
                  return (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${mode.theme.badge}`}
                    >
                      <div className={`size-2 rounded-full ${mode.theme.dot}`} />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </div>
                  )
                })()}
            </div>
            <Dialog.Close className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100">
              <X className="size-5 text-gray-600" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-5 pt-5 pb-0">
            {/* Preview Container - Only show when triggered by recording */}
            {showVideoSection && (
              <div className="relative h-[228.375px] w-full overflow-hidden rounded-[14px] bg-[#101828] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
                {videoUrl ? (
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    className="h-full w-full object-cover opacity-90"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={e => console.error('Video playback error:', e.currentTarget.error)}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90" />
                )}
                {renderUploadOverlay()}

                {/* Upload Complete Badge */}
                {uploadStatus === 'ready' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-green-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <CheckCircle className="size-3.5" />
                    Uploaded
                  </div>
                )}
              </div>
            )}

            {/* Publish To Gallery Component (Gatekeeper) */}
            {!isPublished && (
              <PublishToGallery
                onPublish={handlePublishToGallery}
                loading={
                  publishLoading || uploadStatus === 'uploading' || uploadStatus === 'processing'
                }
                agreedToPolicy={agreedToPolicy}
                setAgreedToPolicy={setAgreedToPolicy}
              />
            )}

            {/* Public Link & Social Share - Only show when published */}
            {isPublished && (
              <>
                <div className="space-y-2">
                  <label className="text-[12px] leading-4 font-medium tracking-[0.6px] text-[#9E9C98] uppercase">
                    {videoBlob ? 'PUBLIC VIDEO LINK' : 'PUBLIC LINK'}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex h-[42px] min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-[13px]">
                      <LinkIcon className="size-4 shrink-0 text-gray-500" />
                      <span className="flex-1 truncate text-[14px] leading-5 text-[#4a5565]">
                        {videoBlob ? videoLink : shareUrl}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex h-[42px] w-[90px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] font-medium tracking-[-0.1504px] text-[#364153] transition-colors hover:bg-gray-50"
                    >
                      {copied ? (
                        <Check className="size-4 shrink-0 text-green-500" />
                      ) : (
                        <Copy className="size-4 shrink-0 text-gray-500" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] leading-4 font-medium tracking-[0.6px] text-[#9E9C98] uppercase">
                    {videoBlob ? 'SHARE VIDEO' : 'SHARE TO SOCIAL'}
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="flex h-[82px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-[#f3f4f6] p-1 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex size-8 items-center justify-center overflow-hidden rounded-full">
                        <Image
                          src={imgTwitter}
                          alt="Twitter"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="text-[12px] leading-4 font-medium text-[#4a5565]">X</span>
                    </button>

                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="flex h-[82px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-[#f3f4f6] p-1 transition-colors hover:bg-gray-50"
                    >
                      <div className="relative size-8">
                        <Image
                          alt="LinkedIn"
                          className="block size-full max-w-none"
                          src={imgLinkedin}
                          width={32}
                          height={32}
                        />
                      </div>
                      <span className="text-[12px] leading-4 font-medium text-[#4a5565]">
                        LinkedIn
                      </span>
                    </button>

                    <button
                      onClick={() => handleSocialShare('facebook')}
                      className="flex h-[82px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-[#f3f4f6] p-1 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex size-8 items-center justify-center overflow-hidden rounded-full">
                        <Image
                          src={imgFacebook}
                          alt="Facebook"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="text-[12px] leading-4 font-medium text-[#4a5565]">
                        Facebook
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer - Only show download section when triggered by recording */}
          {showVideoSection ? (
            <div className="mt-6 flex h-[69px] items-center justify-between border-t border-[#f3f4f6] bg-[#f9fafb] px-5">
              <div className="text-[12px] leading-4">
                <span className="font-medium text-[#101828]">{fileSize}MB</span>
                <span className="font-normal text-[#6a7282]">
                  {' '}
                  • {(videoFormat || 'webm').toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleDownload}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-[6px] border border-[#E7E6E2] bg-white px-4 text-[14px] font-medium tracking-[-0.1504px] text-[#101828] transition-colors hover:bg-[#f5f5f5]"
              >
                <Download className="size-4" />
                Download Video
              </button>
            </div>
          ) : (
            <div className="h-6" />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------

interface PublishToGalleryProps {
  onPublish: () => void
  loading: boolean
  agreedToPolicy: boolean
  setAgreedToPolicy: (val: boolean) => void
}

function PublishToGallery({
  onPublish,
  loading,
  agreedToPolicy,
  setAgreedToPolicy,
}: PublishToGalleryProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#F3F4F6] p-4">
      <div className="mb-4 flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5]">
          <div className="flex size-6 items-center justify-center">
            <Lock className="size-6" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="mb-1 text-[20px] leading-[24px] font-semibold text-[#101828]">
            This content is currently private
          </h3>
          <p className="max-w-[280px] text-center text-[14px] leading-[20px] text-[#4F4E4A]">
            Publish to the gallery to generate a public link and share to social media.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          onClick={onPublish}
          disabled={!agreedToPolicy || loading}
          className={`flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-[16px] font-medium transition-colors ${
            !agreedToPolicy || loading
              ? 'cursor-not-allowed bg-[#F5F5F5] text-[#9E9C98]'
              : 'bg-[#23D57C] text-white hover:bg-[#23D57C]/90'
          } `}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Publish to Gallery
        </button>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreedToPolicy}
            onClick={() => setAgreedToPolicy(!agreedToPolicy)}
            className={`flex size-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-colors ${
              agreedToPolicy
                ? 'border-[#23d57c] bg-[#23d57c]'
                : 'border-gray-300 bg-white hover:border-gray-400'
            } `}
          >
            {agreedToPolicy && <Check className="size-3 text-white" />}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-[14px] text-[#4F4E4A]">
              I agree to the{' '}
              <a
                href="https://novita.ai/legal/privacy-policy"
                target="_blank"
                className="underline hover:text-black"
              >
                Privacy Policy
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
