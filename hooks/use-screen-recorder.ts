import { useState, useRef, useEffect, useCallback, RefObject } from 'react'
import RecordRTC from 'recordrtc'

export type VideoFormat = 'webm'

export interface UseScreenRecorderOptions {
  onRecordingComplete?: (blob: Blob, format: VideoFormat) => void
  onError?: (error: Error) => void
}

export interface UseScreenRecorderReturn {
  isRecording: boolean
  isRecordingSupported: boolean
  recordingTime: number
  recordedBlob: Blob | null
  recordedFormat: VideoFormat | null
  previewContainerRef: RefObject<HTMLDivElement | null>
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: () => void
}

/**
 * Hook for recording screen captures with Region Capture API support
 *
 * @param options - Configuration options
 * @returns Recording state and controls
 */
export function useScreenRecorder(options: UseScreenRecorderOptions = {}): UseScreenRecorderReturn {
  const { onRecordingComplete, onError } = options

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedFormat, setRecordedFormat] = useState<VideoFormat | null>(null)

  // Browser support flags
  const [isRecordingSupported, setIsRecordingSupported] = useState(false)

  const recorderRef = useRef<RecordRTC | MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Use refs to avoid stale closure issues
  const isRecordingRef = useRef(false)
  const onRecordingCompleteRef = useRef(onRecordingComplete)
  const recordedFormatRef = useRef<VideoFormat | null>(null)

  // Keep refs in sync with state
  isRecordingRef.current = isRecording
  onRecordingCompleteRef.current = onRecordingComplete
  recordedFormatRef.current = recordedFormat

  // Check browser support on mount
  useEffect(() => {
    // Check if getDisplayMedia is supported
    const hasDisplayMedia = !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia
    )
    setIsRecordingSupported(hasDisplayMedia)
  }, [])

  // Detect supported video format - prefer WebM for simplicity (widely supported, no transcoding needed)
  const getSupportedFormat = useCallback((): { mimeType: string; format: VideoFormat } => {
    const formats = [
      // WebM formats - native browser support
      { mimeType: 'video/webm; codecs=vp9', format: 'webm' as VideoFormat },
      { mimeType: 'video/webm; codecs=vp8', format: 'webm' as VideoFormat },
      { mimeType: 'video/webm', format: 'webm' as VideoFormat },
    ]

    for (const { mimeType, format } of formats) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
        return { mimeType, format }
      }
    }

    return { mimeType: 'video/webm', format: 'webm' as VideoFormat }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recorderRef.current) {
        const recorder = recorderRef.current as any
        // RecordRTC has destroy(), MediaRecorder doesn't need cleanup
        if (recorder.destroy && typeof recorder.destroy === 'function') {
          recorder.destroy()
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      // Clear previous blob and format
      setRecordedBlob(null)
      setRecordedFormat(null)
      setRecordingTime(0)
      chunksRef.current = []

      // Use preferCurrentTab to automatically select current tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true,
      } as any)

      streamRef.current = stream

      const videoTrack = stream.getVideoTracks()[0]

      // Try to crop to the preview container using Region Capture API
      if (previewContainerRef.current && 'CropTarget' in window) {
        try {
          const cropTarget = await (window as any).CropTarget.fromElement(
            previewContainerRef.current
          )
          // Use cropTo() method as per MDN documentation
          await (videoTrack as any).cropTo(cropTarget)
          console.log('[useScreenRecorder] Successfully cropped to preview area')
        } catch (cropError) {
          console.warn('[useScreenRecorder] Failed to crop to element:', cropError)
          // Continue without cropping (full tab)
        }
      }

      // Get supported format
      const { mimeType, format } = getSupportedFormat()
      console.log('[useScreenRecorder] Requested format:', format, 'with mimeType:', mimeType)

      // Use MediaRecorder directly for better format support
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      // Log the actual mimeType that the recorder is using
      console.log(
        '[useScreenRecorder] Recorder created with actual mimeType:',
        mediaRecorder.mimeType
      )

      // If the actual mimeType differs from what we requested, log it
      if (mediaRecorder.mimeType !== mimeType) {
        console.warn('[useScreenRecorder] Browser changed mimeType to:', mediaRecorder.mimeType)
      }

      // Collect data chunks
      mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      recorderRef.current = mediaRecorder
      setRecordedFormat(format)
      setIsRecording(true)

      // Handle user stopping the share via browser UI
      videoTrack.onended = () => {
        stopRecording()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording')
      console.error('[useScreenRecorder] Error starting recording:', err)
      onError?.(err)
    }
  }, [onError, getSupportedFormat])

  const stopRecording = useCallback(() => {
    console.log(
      '[useScreenRecorder] stopRecording called, recorderRef:',
      !!recorderRef.current,
      'isRecordingRef:',
      isRecordingRef.current
    )

    // Use ref to check recording state instead of state variable (avoids stale closure)
    if (recorderRef.current && isRecordingRef.current) {
      const recorder = recorderRef.current as MediaRecorder

      // Check if recorder is in a valid state
      if (recorder.state === 'inactive') {
        console.warn('[useScreenRecorder] Recorder already inactive')
        setIsRecording(false)
        return
      }

      recorder.onstop = () => {
        // Get the actual mimeType from the recorder
        const actualMimeType = (recorderRef.current as MediaRecorder).mimeType

        // Create blob from collected chunks using the recorder's actual mimeType
        const blob = new Blob(chunksRef.current, {
          type: actualMimeType,
        })

        console.log('[useScreenRecorder] Recording complete:', {
          size: blob.size,
          requestedFormat: recordedFormatRef.current,
          actualMimeType: actualMimeType,
          blobType: blob.type,
        })

        // Always WebM now
        const actualFormat: VideoFormat = 'webm'

        setRecordedBlob(blob)
        onRecordingCompleteRef.current?.(blob, actualFormat)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
          streamRef.current = null
        }

        setIsRecording(false)
        setRecordingTime(0)
      }

      recorder.stop()
    } else {
      console.warn('[useScreenRecorder] Cannot stop: no recorder or not recording')
    }
  }, []) // Remove dependencies to avoid stale closures

  const resetRecording = useCallback(() => {
    setRecordedBlob(null)
    setRecordedFormat(null)
    setRecordingTime(0)
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    isRecordingSupported,
    recordingTime,
    recordedBlob,
    recordedFormat,
    previewContainerRef,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
