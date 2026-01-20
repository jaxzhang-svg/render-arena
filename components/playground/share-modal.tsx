'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Download, Copy, X, Link as LinkIcon, Check, Loader2, CloudUpload, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

// Local Assets
const imgLinkedin = "/images/linkedin-logo.svg";
const imgTwitter = "/images/twitter-logo.png";
const imgFacebook = "/images/facebook-logo.png";

// Cloudflare Stream customer code - you can find this in your Cloudflare dashboard
const CLOUDFLARE_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE || '';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error';

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appId?: string;
  shareUrl?: string;
  previewImage?: string;
  videoBlob?: Blob | null;
  videoFormat?: 'webm' | 'mp4' | null;
  showVideoSection?: boolean;
}

export function ShareModal({
  open = false,
  onOpenChange,
  appId,
  shareUrl = 'https://make.figma.com/s/9f8a7d6',
  previewImage,
  videoBlob,
  videoFormat,
  showVideoSection = false,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [publishToGallery, setPublishToGallery] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(true);

  // Upload state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUid, setVideoUid] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Track if we've already uploaded this blob
  const uploadedBlobRef = useRef<Blob | null>(null);
  
  // Use ref for stable blob URL to avoid revocation issues
  const videoUrlRef = useRef<string | null>(null);
  
  // Create or reuse video URL from blob for preview
  const videoUrl = (() => {
    if (!videoBlob) {
      // Cleanup when no blob
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
      return null;
    }
    // Only create new URL if blob changed
    if (videoBlob !== uploadedBlobRef.current || !videoUrlRef.current) {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
      }
      videoUrlRef.current = URL.createObjectURL(videoBlob);
    }
    return videoUrlRef.current;
  })();
  
  const fileSize = videoBlob ? (videoBlob.size / (1024 * 1024)).toFixed(1) : '0';

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setIsPublished(false);
      // Only reset upload state if it's a new blob
      if (videoBlob && videoBlob !== uploadedBlobRef.current) {
        setUploadStatus('idle');
        setUploadProgress(0);
        setVideoUid(null);
        setUploadError(null);
      }
    }
  }, [open, videoBlob]);

  // Auto-upload when modal opens with a new video blob
  useEffect(() => {
    if (open && videoBlob && appId && uploadStatus === 'idle' && videoBlob !== uploadedBlobRef.current) {
      handleUploadVideo();
    }
  }, [open, videoBlob, appId, uploadStatus]);

  // Upload video to Cloudflare Stream
  const handleUploadVideo = useCallback(async () => {
    if (!videoBlob || !appId) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);
      setUploadError(null);
      uploadedBlobRef.current = videoBlob;

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
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      uploadedBlobRef.current = null; // Allow retry
    }
  }, [videoBlob, appId, videoFormat]);

  const handlePublishToGallery = useCallback(() => {
    if (!appId || isPublished || !publishToGallery) return;

    fetch(`/api/apps/${appId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).then(response => {
      if (response.ok) {
        setIsPublished(true);
      }
    }).catch(error => {
      console.error('Error publishing to gallery:', error);
    });
  }, [appId, isPublished, publishToGallery]);

  const handleCopy = () => {
    if (!agreedToPolicy) return;

    if (appId && !isPublished) {
      handlePublishToGallery();
    }

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    if (!agreedToPolicy) return;

    if (appId && !isPublished) {
      handlePublishToGallery();
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const text = encodeURIComponent('Check out this AI-generated app battle! 🚀');
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
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

  // Render video preview - always use local blob in share modal
  // (Cloudflare Stream iframe is used in gallery after video is fully processed)
  const renderVideoPreview = () => {
    // Always use local video preview for immediate feedback
    if (videoUrl) {
      return (
        <video
          src={videoUrl}
          className="w-full h-full object-cover opacity-90"
          poster={previewImage}
          controls
          autoPlay
          muted
          loop
        />
      );
    }

    if (previewImage) {
      return (
        <img
          src={previewImage}
          alt="Preview"
          className="w-full h-full object-cover opacity-90"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90" />
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(open) => onOpenChange?.(open)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[446px] bg-white rounded-2xl border border-[#f3f4f6] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden outline-none">
          {/* Header */}
          <div className="flex items-center justify-between h-[69px] px-5 pr-3 border-b border-[#f3f4f6]">
            <h2 className="text-[18px] font-semibold text-[#101828] tracking-[-0.4395px] leading-7">
              Share Generation
            </h2>
            <Dialog.Close className="flex cursor-pointer items-center justify-center size-9 rounded-full hover:bg-gray-100 transition-colors">
              <X className="size-5 text-gray-600" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6 px-5 pt-5 pb-0">
            {/* Preview Container - Only show when triggered by recording */}
            {showVideoSection && (
              <div className="relative w-full h-[228.375px] bg-[#101828] rounded-[14px] overflow-hidden shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]">
                {renderVideoPreview()}
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

            {/* Public Link Section */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#9E9C98] uppercase tracking-[0.6px] leading-4">
                Public Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 h-[42px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] flex items-center gap-2 px-[13px] min-w-0">
                  <LinkIcon className="size-4 text-gray-500 shrink-0" />
                  <span className="text-[14px] text-[#4a5565] leading-5 truncate flex-1">
                    {shareUrl}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!agreedToPolicy}
                  className={`h-[42px] w-[90px] rounded-[10px] border text-[14px] font-medium tracking-[-0.1504px] transition-colors flex cursor-pointer items-center justify-center
                  ${!agreedToPolicy
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-[#e5e7eb] bg-white text-[#364153] hover:bg-gray-50'
                    }`}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share to Social Section */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[#9E9C98] uppercase tracking-[0.6px] leading-4">
                Share to Social
              </label>
              <div className="flex gap-3">
                {/* Twitter */}
                <button
                  onClick={() => handleSocialShare('twitter')}
                  disabled={!agreedToPolicy}
                  className={`flex-1 cursor-pointer border rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors
                  ${!agreedToPolicy
                      ? 'border-gray-100 opacity-50 cursor-not-allowed bg-gray-50'
                      : 'border-[#f3f4f6] hover:bg-gray-50'
                    }`}
                >
                  <div className="size-8 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={imgTwitter} alt="Twitter" className="size-full object-cover" />
                  </div>
                  <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                    Twitter
                  </span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  disabled={!agreedToPolicy}
                  className={`flex-1 cursor-pointer border rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors
                  ${!agreedToPolicy
                      ? 'border-gray-100 opacity-50 cursor-not-allowed bg-gray-50'
                      : 'border-[#f3f4f6] hover:bg-gray-50'
                    }`}
                >
                  <div className="size-8 relative">
                    <img alt="LinkedIn" className="block max-w-none size-full" src={imgLinkedin} />
                  </div>
                  <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                    LinkedIn
                  </span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleSocialShare('facebook')}
                  disabled={!agreedToPolicy}
                  className={`flex-1 cursor-pointer border rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] transition-colors
                  ${!agreedToPolicy
                      ? 'border-gray-100 opacity-50 cursor-not-allowed bg-gray-50'
                      : 'border-[#f3f4f6] hover:bg-gray-50'
                    }`}
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

            <div className="flex items-center gap-3 py-2">
              {appId && (
                <>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={publishToGallery}
                    onClick={() => setPublishToGallery(!publishToGallery)}
                    className={`
                      size-5 cursor-pointer rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                      ${publishToGallery
                        ? 'bg-[#23d57c] border-[#23d57c]'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    {publishToGallery && <Check className="size-3 text-white" />}
                  </button>
                  <span className="text-[14px] text-[#364153]">
                    Publish to Gallery
                  </span>
                  
                  {/* Separator */}
                  <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                </>
              )}

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
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#364153]">
                  <a href="#" className="underline hover:text-black">Privacy Policy</a>
                </span>
              </div>
            </div>
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
                className="h-9 bg-[#101828] text-white rounded-[10px] px-4 flex cursor-pointer items-center gap-2 text-[14px] font-medium tracking-[-0.1504px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:bg-[#101828]/90 transition-colors"
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
