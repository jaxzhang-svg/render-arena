'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Download, Copy, X, Link as LinkIcon, Check, Loader2, CloudUpload, CheckCircle, Lock } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import { getModeByCategory } from '@/lib/config';
import {
  trackShareModalOpened,
  trackShareLinkCopied,
  trackPublishStarted,
  trackVideoUploadStarted,
  trackVideoUploadCompleted,
  trackVideoUploadError,
} from '@/lib/analytics';

// Local Assets
const imgLinkedin = "/logo/square-linkedin-brands-solid-full.svg";
const imgTwitter = "/logo/square-x-twitter-brands-solid-full.svg";
const imgFacebook = "/logo/square-facebook-brands-solid-full.svg";

// Cloudflare Stream customer code - you can find this in your Cloudflare dashboard
const CLOUDFLARE_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || '';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appId?: string;
  shareUrl?: string;
  videoBlob?: Blob | null;
  videoFormat?: 'webm' | 'mp4' | null;
  showVideoSection?: boolean;
  prompt?: string;
  isPublished?: boolean;
  onPublishSuccess?: (category?: string | null) => void;
  category?: string | null;
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
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUid, setVideoUid] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Track if we've already uploaded this blob
  const uploadedBlobRef = useRef<Blob | null>(null);

  const fileSize = videoBlob ? (videoBlob.size / (1024 * 1024)).toFixed(1) : '0';

  // Create video URL from blob for preview
  const videoUrl = useMemo(() => {
    if (!videoBlob) return null;
    return URL.createObjectURL(videoBlob);
  }, [videoBlob]);

  // Cleanup URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // Track modal opened
      if (appId) {
        trackShareModalOpened(appId);
      }

      // We rely on parent to reset or maintain isPublished state

      // Only reset upload state if it's a new blob
      if (videoBlob && videoBlob !== uploadedBlobRef.current) {
        setUploadStatus('idle');
        setUploadProgress(0);
        setVideoUid(null);
        setUploadError(null);
      }
    }
  }, [open, videoBlob, appId]);

  // Auto-upload when modal opens with a new video blob - REMOVED for new flow
  // We only upload when user clicks "Publish"
  /*
  useEffect(() => {
    if (open && videoBlob && appId && uploadStatus === 'idle' && videoBlob !== uploadedBlobRef.current) {
      handleUploadVideo();
    }
  }, [open, videoBlob, appId, uploadStatus]);
  */

  // Upload video to Cloudflare Stream
  const handleUploadVideo = useCallback(async () => {
    if (!videoBlob || !appId) return;

    const uploadStartTime = Date.now();
    const fileSizeMb = videoBlob.size / (1024 * 1024);

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setUploadError(null);
      uploadedBlobRef.current = videoBlob;

      // Track upload started
      trackVideoUploadStarted({
        app_id: appId,
        file_size_mb: parseFloat(fileSizeMb.toFixed(2)),
      });

      // Step 1: Get upload URL from our backend
      const uploadUrlResponse = await fetch('/api/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDurationSeconds: 60 }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, videoUid: newVideoUid } = await uploadUrlResponse.json();
      setVideoUid(newVideoUid);

      // Step 2: Upload video blob to Cloudflare Stream
      // Using FormData for direct upload
      const formData = new FormData();
      const fileName = `recording-${Date.now()}.${videoFormat || 'webm'}`;
      formData.append('file', videoBlob, fileName);

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadUrl);
        xhr.send(formData);
      });

      // Step 3: Save video UID to database
      setUploadStatus('processing');

      const saveResponse = await fetch(`/api/apps/${appId}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUid: newVideoUid }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save video');
      }

      // Step 4: Wait a moment for Cloudflare to start processing, then mark as ready
      // In production, you might want to poll for status, but for UX we'll just show ready
      setTimeout(() => {
        setUploadStatus('ready');
        // Track upload completed
        const uploadDuration = (Date.now() - uploadStartTime) / 1000;
        trackVideoUploadCompleted({
          app_id: appId,
          upload_duration_seconds: parseFloat(uploadDuration.toFixed(2)),
        });
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      showToast.error(errorMessage);
      setUploadStatus('error');
      setUploadError(errorMessage);
      uploadedBlobRef.current = null; // Allow retry
      // Track upload error
      trackVideoUploadError({
        app_id: appId,
        error_type: errorMessage,
      });
    }
  }, [videoBlob, appId, videoFormat]);

  /*
   * Handle Publish to Gallery
   * - Uploads video if needed
   * - Calls publish API
   */
  const handlePublishToGallery = useCallback(async () => {
    if (!appId || isPublished) return;

    // Track publish started
    trackPublishStarted({
      app_id: appId,
      category: category || 'general',
    });

    try {
      setPublishLoading(true);

      // If there is a video AND it hasn't been uploaded yet, upload it first
      if (videoBlob && uploadStatus === 'idle') {
        await handleUploadVideo();
        // Note: handleUploadVideo sets uploadStatus to 'processing' -> 'ready'
        // We need to wait for it? handleUploadVideo is async so awaiting it should be fine
        // BUT, handleUploadVideo catches its own errors. We should check logic.
      } else if (uploadStatus === 'error') {
        await handleUploadVideo();
      }

      // Now publish
      const response = await fetch(`/api/apps/${appId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        onPublishSuccess?.(data.category);
      } else {
        console.error('Failed to publish');
        showToast.error('Failed to publish');
        // Handle error (maybe show toast)
      }
    } catch (error) {
      console.error('Error publishing:', error);
      showToast.error('Error publishing');
    } finally {
      setPublishLoading(false);
    }
  }, [appId, isPublished, videoBlob, uploadStatus, handleUploadVideo]);


  const handleDownload = () => {
    if (videoBlob && videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      const extension = videoFormat || 'mp4';
      a.download = `recording-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const videoLink = useMemo(() => {
    return `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoUid}/watch`;
  }, [videoUid])

  const handleCopy = () => {
    navigator.clipboard.writeText(videoBlob ?videoLink : shareUrl);
    if (appId) {
      trackShareLinkCopied({
        app_id: appId,
        share_mode: videoBlob ? 'video' : 'poster',
      });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
      return
    // Truncate prompt to 5 words
    const truncatedPrompt = prompt.split(/\s+/).slice(0, 5).join(' ') + (prompt.split(/\s+/).length > 5 ? ' …' : '');

    // Determine link
    let finalLink = shareUrl;
    if (videoUid && CLOUDFLARE_CUSTOMER_CODE) {
       finalLink = `https://customer-${CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${videoUid}/watch`;
    }

    const shareText = `Novita Render Arena — Side-by-Side\nPrompt: “${truncatedPrompt}”\n👉 Which model wins?\n`;

    const encodedUrl = encodeURIComponent(finalLink);
    const encodedText = encodeURIComponent(shareText);

    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'linkedin':
        // LinkedIn doesn't support pre-filling text as easily as Twitter, mostly just the URL
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        // Facebook primarily shares the URL
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  // Render upload status overlay
  const renderUploadOverlay = () => {
    if (uploadStatus === 'idle' || uploadStatus === 'ready') return null;

    return (
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
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
            <div className="text-white text-sm font-medium">
              Uploading... {uploadProgress}%
            </div>
          </>
        )}

        {uploadStatus === 'processing' && (
          <>
            <Loader2 className="size-10 text-white animate-spin" />
            <div className="text-white text-sm font-medium">
              Processing video...
            </div>
          </>
        )}

        {uploadStatus === 'error' && (
          <>
            <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="size-6 text-red-400" />
            </div>
            <div className="text-white text-sm font-medium">
              {uploadError || 'Upload failed'}
            </div>
            <button
              onClick={handleUploadVideo}
              className="mt-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => onOpenChange?.(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[446px] bg-white rounded-2xl border border-[#f3f4f6] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden outline-none">
          {/* Header */}
          <div className="flex items-center justify-between h-[69px] px-5 pr-3 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.4395px] leading-7">
                {videoBlob ? 'Share Video' : 'Share Generation'}
              </h2>
              {/* Category Badge */}
              {isPublished && category && (() => {
                const mode = getModeByCategory(category);
                if (!mode) return null;
                const Icon = mode.icon;
                return (
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${mode.theme.badge}`}>
                    <div className={`size-2 rounded-full ${mode.theme.dot}`} />
                    <span className="text-xs font-medium">{mode.label}</span>
                  </div>
                );
              })()}
            </div>
            <Dialog.Close className="flex cursor-pointer items-center justify-center size-9 rounded-full hover:bg-gray-100 transition-colors">
              <X className="size-5 text-gray-600" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-5 pt-5 pb-0">
            {/* Preview Container - Only show when triggered by recording */}
            {showVideoSection && (
              <div className="relative w-full h-[228.375px] bg-[#101828] rounded-[14px] overflow-hidden shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
                {
                  videoUrl ? <video
                    key={videoUrl}
                    src={videoUrl}
                    className="w-full h-full object-cover opacity-90"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={(e) => console.error('Video playback error:', e.currentTarget.error)}
                  /> : <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90" />
                }
                {renderUploadOverlay()}

                {/* Upload Complete Badge */}
                {uploadStatus === 'ready' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium">
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
                loading={publishLoading || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                agreedToPolicy={agreedToPolicy}
                setAgreedToPolicy={setAgreedToPolicy}
              />
            )}

            {/* Public Link & Social Share - Only show when published */}
            {isPublished && (
              <>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-[#9E9C98] uppercase tracking-[0.6px] leading-4">
                    {videoBlob ? 'PUBLIC VIDEO LINK' : 'PUBLIC LINK'}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-[42px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] flex items-center gap-2 px-[13px] min-w-0">
                      <LinkIcon className="size-4 text-gray-500 shrink-0" />
                      <span className="text-[14px] text-[#4a5565] leading-5 truncate flex-1">
                        {videoBlob ? videoLink : shareUrl}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="h-[42px] w-[90px] rounded-[10px] border border-[#e5e7eb] bg-white text-[#364153] text-[14px] font-medium tracking-[-0.1504px] transition-colors hover:bg-gray-50 flex gap-2 cursor-pointer items-center justify-center"
                    >
                      {copied ? <Check className="size-4 text-green-500 shrink-0" /> : <Copy className="size-4 text-gray-500 shrink-0" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                 <div className="space-y-2 pointer-events-none opacity-50">
                  <label className="text-[12px] font-medium text-[#9E9C98] uppercase tracking-[0.6px] leading-4">
                    {videoBlob ? 'SHARE VIDEO' : "SHARE TO SOCIAL"}
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSocialShare('twitter')}
                      className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors hover:bg-gray-50"
                    >
                      <div className="size-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={imgTwitter} alt="Twitter" className="size-full object-cover" />
                      </div>
                      <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                        X
                      </span>
                    </button>

                    <button
                      onClick={() => handleSocialShare('linkedin')}
                      className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors hover:bg-gray-50"
                    >
                      <div className="size-8 relative">
                        <img alt="LinkedIn" className="block max-w-none size-full" src={imgLinkedin} />
                      </div>
                      <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                        LinkedIn
                      </span>
                    </button>

                    <button
                      onClick={() => handleSocialShare('facebook')}
                      className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors hover:bg-gray-50"
                    >
                      <div className="size-8 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={imgFacebook} alt="Facebook" className="size-full object-cover" />
                      </div>
                      <span className="text-[12px] font-medium text-[#4a5565] leading-4">
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
            <div className="bg-[#f9fafb] border-t border-[#f3f4f6] h-[69px] flex items-center justify-between px-5 mt-6">
              <div className="text-[12px] leading-4">
                <span className="font-medium text-[#101828]">{fileSize}MB</span>
                <span className="font-normal text-[#6a7282]"> • {(videoFormat || 'webm').toUpperCase()}</span>
              </div>
              <button
                onClick={handleDownload}
                className="h-9 bg-white text-[#101828] rounded-[6px] px-4 flex cursor-pointer items-center gap-2 text-[14px] font-medium tracking-[-0.1504px] border border-[#E7E6E2] hover:bg-[#f5f5f5] transition-colors"
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
  );
}

// ----------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------

interface PublishToGalleryProps {
  onPublish: () => void;
  loading: boolean;
  agreedToPolicy: boolean;
  setAgreedToPolicy: (val: boolean) => void;
}

function PublishToGallery({ onPublish, loading, agreedToPolicy, setAgreedToPolicy }: PublishToGalleryProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border border-[#F3F4F6] rounded-[16px]">
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center">
          <div className="flex items-center justify-center size-6">
            <Lock className='size-6' />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-[20px] font-semibold text-[#101828] leading-[24px] mb-1">
            This content is currently private
          </h3>
          <p className="text-[14px] text-[#4F4E4A] leading-[20px] text-center max-w-[280px]">
            Publish to the gallery to generate a public link and share to social media.
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onPublish}
          disabled={!agreedToPolicy || loading}
          className={`
            w-full h-[44px] rounded-[10px] flex items-center justify-center gap-2
            text-[16px] font-medium transition-colors cursor-pointer
            ${!agreedToPolicy || loading
              ? 'bg-[#F5F5F5] text-[#9E9C98] cursor-not-allowed'
              : 'bg-[#23D57C] text-white hover:bg-[#23D57C]/90'
            }
          `}
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
            className={`
                 size-5 cursor-pointer rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                 ${agreedToPolicy
                ? 'bg-[#23d57c] border-[#23d57c]'
                : 'bg-white border-gray-300 hover:border-gray-400'
              }
               `}
          >
            {agreedToPolicy && <Check className="size-3 text-white" />}
          </button>
          <div className="flex items-center gap-1">
            <span className="text-[14px] text-[#4F4E4A]">
              I agree to the <a href="https://novita.ai/legal/privacy-policy" target="_blank" className="underline hover:text-black">Privacy Policy</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
