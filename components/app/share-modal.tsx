'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, X, Edit, Twitter, Linkedin, Upload, CircleDashed, FileVideo } from 'lucide-react';
import { useState, useEffect } from 'react';
type VideoStatus = 'generating' | 'uploading' | 'ready';

interface ShareModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appName?: string;
  shareUrl?: string;
  previewImage?: string;
  mode?: 'video' | 'poster';
  videoBlob?: Blob | null;
  videoFormat?: 'webm' | 'mp4' | null;
}

export function ShareModal({
  open = false,
  onOpenChange,
  appName = 'Project Alpha v1',
  shareUrl = 'app.ai/share/u/83js-29ks',
  previewImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuEUyhZ3KbhHzwPx4RHXay5LWvoNIQsyjsNB6BH0lL_uQI9U9uI35qhlr-KxVKV-RScG5g4dTON7wx0rZTx88VrOzBkHMbOSg9Z1NPQlN92Ooga-SLJVc1u7aoLp_FzfkAzLdCMkQY-qoVeXSmGyB5ABY5ze5YGZguir7BeHmzYpi9eCUnEcgE_yZlMtkrUVJaHK7uYPfALmreCeBPFJQFc0gvj6x7vlxHsMPKAk3tUPW7xcyXJTdWwiuWpdwmboahOjJSDA-df1E',
  mode = 'poster',
  videoBlob,
  videoFormat,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(videoBlob ? 'ready' : 'generating');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  // Create video URL from blob for preview
  const videoUrl = videoBlob ? URL.createObjectURL(videoBlob) : null;

  // Cleanup object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = () => {
    setVideoStatus('uploading');
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setVideoStatus('ready');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = () => {
    if (videoBlob && videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      const extension = videoFormat || 'webm';
      a.download = `recording-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadAsMp4 = async () => {
    if (!videoBlob || isConverting) return;

    setIsConverting(true);
    try {
      // Download converted MP4
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to convert video:', error);
      alert('Failed to convert video to MP4. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="
        h-auto w-[1100px]! max-w-[1100px]! gap-0 overflow-hidden p-0
      ">
        <div className="
          flex flex-col
          lg:flex-row
        ">
          {/* Left Side - Preview */}
          <div className="
            bg-muted/30 relative flex w-full flex-col items-center
            justify-center p-8
            lg:w-[60%]
          ">
            {mode === 'video' && (
              <div className="
                absolute top-6 left-6 rounded-sm bg-black px-3 py-1.5 text-xs
                font-bold tracking-wider text-white uppercase
              ">
                Preview
              </div>
            )}

            <div
              className="
                bg-background relative w-full overflow-hidden rounded-lg border
                shadow-lg
              "
              style={{ aspectRatio: mode === 'video' ? '8/3' : '4/3', maxHeight: mode === 'video' ? '420px' : '560px' }}
            >
              {mode === 'video' && videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="size-full bg-black object-contain"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${previewImage})` }}
                  />
                  {mode === 'video' && (
                    <div className="
                      group absolute inset-0 flex cursor-pointer items-center
                      justify-center bg-black/10 transition-all
                      hover:bg-black/20
                    ">
                      <Button
                        size="icon"
                        className="
                          size-16 rounded-full bg-[#23D57C] text-black shadow-xl
                          transition-all
                          hover:bg-[#16B063]
                        "
                      >
                        <svg
                          className="ml-1 size-8"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Status Badges - Only show for video */}
              {mode === 'video' && (
                <>
                  {videoStatus === 'generating' && (
                    <div className="
                      absolute bottom-4 left-4 flex items-center gap-2
                      rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium
                      text-white backdrop-blur-sm
                    ">
                      <CircleDashed className="size-3 animate-spin" />
                      Generating video...
                    </div>
                  )}
                  {videoStatus === 'uploading' && (
                    <div className="
                      absolute right-4 bottom-4 left-4 flex items-center gap-2
                      rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium
                      text-white backdrop-blur-sm
                    ">
                      <CircleDashed className="size-3 animate-spin" />
                      Uploading... {uploadProgress}%
                    </div>
                  )}
                  {videoStatus === 'ready' && (
                    <div className="
                      absolute bottom-4 left-4 flex items-center gap-2
                      rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium
                      text-white backdrop-blur-sm
                    ">
                      <div className="size-2 rounded-full bg-green-500" />
                      Ready to share
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 w-full space-y-2">
              {mode === 'poster' ? (
                <div className="flex gap-2">
                  <Button
                    size="default"
                    className="
                      h-12 flex-1 gap-2 bg-[#23D57C] font-mono text-sm
                      text-black
                      hover:bg-[#16B063]
                    "
                  >
                    <Download className="size-5" />
                    Download Poster
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="
                      h-12 flex-1 gap-2 border-black bg-black font-mono text-sm
                      text-white
                      hover:bg-black/90
                    "
                  >
                    <Copy className="size-4" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              ) : (
                <>
                  {videoStatus === 'ready' ? (
                    <div className="space-y-2">
                      {/* Show format info */}
                      {videoFormat && (
                        <div className="
                          text-muted-foreground bg-muted/50 flex items-center
                          justify-center gap-2 rounded-full px-3 py-1.5 text-xs
                        ">
                          <FileVideo className="size-3" />
                          Format: <span className="font-semibold uppercase">{videoFormat}</span>
                        </div>
                      )}

                      {/* Download buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownload}
                          disabled={isConverting}
                          size="default"
                          className="
                            h-12 flex-1 gap-2 bg-[#23D57C] font-mono text-sm
                            text-black
                            hover:bg-[#16B063]
                          "
                        >
                          <Download className="size-5" />
                          Download {videoFormat?.toUpperCase() || 'Video'}
                        </Button>

                        {/* Show MP4 conversion button for WebM videos */}
                        {videoFormat === 'webm' && (
                          <Button
                            onClick={handleDownloadAsMp4}
                            disabled={isConverting}
                            variant="outline"
                            className="
                              border-primary text-primary
                              hover:bg-primary/10
                              h-12 flex-1 gap-2 font-mono text-sm
                            "
                          >
                            <Download className="size-5" />
                            {isConverting ? 'Converting...' : 'Convert to MP4'}
                          </Button>
                        )}

                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          className="
                            h-12 flex-1 gap-2 border-black bg-black font-mono
                            text-sm text-white
                            hover:bg-black/90
                          "
                        >
                          <Copy className="size-4" />
                          {copied ? 'Copied!' : 'Copy Link'}
                        </Button>
                      </div>
                    </div>
                  ) : videoStatus === 'uploading' ? (
                    <div className="space-y-2">
                      <div className="bg-muted h-2 overflow-hidden rounded-full">
                        <div className="
                          h-full bg-[#23D57C] transition-all duration-300
                        " style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="
                        text-muted-foreground text-center text-xs font-medium
                      ">
                        Uploading video... {uploadProgress}%
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleUpload}
                      size="default"
                      className="
                        h-12 w-full gap-2 bg-[#23D57C] font-mono text-sm
                        text-black
                        hover:bg-[#16B063]
                      "
                    >
                      <Upload className="size-5" />
                      Upload Video
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="
            bg-background flex w-full flex-col p-8
            lg:w-[40%]
          ">
            <DialogHeader className="mb-6 space-y-2">
              <DialogTitle className="text-3xl/tight font-bold">
                Share Your Creation
              </DialogTitle>
              <p className="text-muted-foreground text-base font-normal">
                Give your app a name and share it with the world.
              </p>
            </DialogHeader>

            <Separator className="mb-6" />

            <div className="flex flex-1 flex-col gap-6">
              {/* App Name Input */}
              <div className="space-y-2">
                <Label htmlFor="app-name" className="
                  text-sm font-bold tracking-wide uppercase
                ">
                  App Name
                </Label>
                <div className="relative">
                  <Input
                    id="app-name"
                    defaultValue={appName}
                    className="
                      bg-muted/50 border-border border px-4 py-3 pr-10 font-mono
                      text-base
                      focus:border-[#23D57C]
                    "
                  />
                  <Edit className="
                    text-muted-foreground absolute top-1/2 right-4 size-4
                    -translate-y-1/2
                  " />
                </div>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  Share to Social
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="
                      border-border
                      hover:bg-muted
                      h-12 flex-1
                    "
                  >
                    <Twitter className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="
                      border-border
                      hover:bg-muted
                      h-12 flex-1
                    "
                  >
                    <Linkedin className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="
                      border-border
                      hover:bg-muted
                      h-12 flex-1
                    "
                  >
                    <Copy className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onOpenChange?.(false)}
          className="
            bg-background border-border
            hover:bg-muted
            absolute top-4 right-4 z-20 flex size-8 items-center justify-center
            rounded-full border transition-colors
          "
        >
          <X className="size-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
