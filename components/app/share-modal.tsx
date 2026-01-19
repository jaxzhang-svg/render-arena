'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Download, Copy, X, Link as LinkIcon, Play, Globe, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

type VideoStatus = 'generating' | 'uploading' | 'ready';

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
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Create video URL from blob for preview
  const videoUrl = videoBlob ? URL.createObjectURL(videoBlob) : null;
  const fileSize = videoBlob ? (videoBlob.size / (1024 * 1024)).toFixed(1) : '4.2';

  // Cleanup object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Reset published state when modal opens
  useEffect(() => {
    if (open) {
      setIsPublished(false);
    }
  }, [open]);

  const handlePublishToGallery = useCallback(async () => {
    if (!appId || isPublished) return;
    
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/apps/${appId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      if (response.ok) {
        setIsPublished(true);
      } else if (response.status === 401 || response.status === 403) {
        // 用户未登录或无权限，静默处理
        console.log('User not authorized to publish');
      }
    } catch (error) {
      console.error('Error publishing to gallery:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [appId, isPublished]);

  const handleCopy = () => {
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

  const handleSocialShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    // 如果勾选了发布到画廊，先发布
    if (publishToGallery && appId && !isPublished) {
      await handlePublishToGallery();
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
            {videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover opacity-90"
                poster={previewImage}
              />
            ) : previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90" />
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center pl-1">
                <div 
                  className="w-0 h-0 border-l-[10px] border-t-[6px] border-b-[6px] border-transparent border-l-white"
                  style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
                />
              </div>
            </div>
          </div>
          )}

          {/* Public Link Section */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#6a7282] uppercase tracking-[0.6px] leading-4">
              Public Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 h-[42px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[10px] flex items-center gap-2 px-[13px]">
                <LinkIcon className="size-4 text-gray-500" />
                <span className="text-[14px] text-[#4a5565] leading-5 truncate">
                  {shareUrl}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="h-[42px] w-[90px] rounded-[10px] border border-[#e5e7eb] bg-white text-[14px] font-medium text-[#364153] tracking-[-0.1504px] hover:bg-gray-50 transition-colors flex cursor-pointer items-center justify-center"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share to Social Section */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#6a7282] uppercase tracking-[0.6px] leading-4">
              Share to Social
            </label>
            <div className="flex gap-3">
              {/* Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] hover:bg-gray-50 transition-colors"
              >
                <div className="size-8 rounded-full bg-[rgba(29,161,242,0.1)] flex items-center justify-center">
                  <Twitter className="size-4 text-[#1da1f2]" />
                </div>
                <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                  Twitter
                </span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] hover:bg-gray-50 transition-colors"
              >
                <div className="size-8 rounded-full bg-[rgba(10,102,194,0.1)] flex items-center justify-center">
                  <Linkedin className="size-4 text-[#0a66c2]" />
                </div>
                <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                  LinkedIn
                </span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex-1 cursor-pointer border border-[#f3f4f6] rounded-[14px] p-1 flex flex-col items-center justify-center gap-2 h-[82px] hover:bg-gray-50 transition-colors"
              >
                <div className="size-8 rounded-full bg-[rgba(24,119,242,0.1)] flex items-center justify-center">
                  <Facebook className="size-4 text-[#1877f2]" />
                </div>
                <span className="text-[12px] font-medium text-[#4a5565] leading-4">
                  Facebook
                </span>
              </button>
            </div>
          </div>

          {/* Publish to Gallery Checkbox */}
          {appId && (
            <div className="flex items-center gap-3 py-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={publishToGallery}
                onClick={() => setPublishToGallery(!publishToGallery)}
                className={`
                  size-5 cursor-pointer rounded border-2 flex items-center justify-center transition-colors
                  ${publishToGallery
                    ? 'bg-[#23d57c] border-[#23d57c]'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {publishToGallery && <Check className="size-3 text-white" />}
              </button>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-[#6a7282]" />
                <span className="text-[14px] text-[#364153]">
                  Publish to Gallery when sharing
                </span>
                {isPublished && (
                  <span className="text-[12px] text-[#23d57c] font-medium">
                    ✓ Published
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show download section when triggered by recording */}
        {showVideoSection ? (
        <div className="bg-[#f9fafb] border-t border-[#f3f4f6] h-[69px] flex items-center justify-between px-5 mt-6">
          <div className="text-[12px] leading-4">
            <span className="font-medium text-[#101828]">{fileSize}MB</span>
            <span className="font-normal text-[#6a7282]"> • MP4</span>
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
