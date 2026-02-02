'use client'

import { useState, useRef, useEffect, useCallback, RefObject } from 'react'

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
  const [isRecordingSupported, setIsRecordingSupported] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recorderRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Check recording support on client-side only
  useEffect(() => {
    setIsRecordingSupported(
      !!(
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getDisplayMedia
      )
    )
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recorderRef.current) {
        try {
          recorderRef.current.destroy()
        } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current!.getBlob()
        setRecordedBlob(blob)
        onRecordingComplete?.(blob, 'webm')
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        setIsRecording(false)
        setRecordingTime(0)
      })
    }
  }, [isRecording, onRecordingComplete])

  const startRecording = useCallback(async () => {
    try {
      setRecordedBlob(null)
      setRecordedFormat(null)
      setRecordingTime(0)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        // @ts-expect-error preferCurrentTab is not yet in TypeScript defs
        preferCurrentTab: true,
      })
      streamRef.current = stream
      const videoTrack = stream.getVideoTracks()[0]
      if (previewContainerRef.current && 'CropTarget' in window) {
        try {
          const cropTarget = await window.CropTarget.fromElement(previewContainerRef.current)
          // @ts-expect-error cropTo() is not yet in TypeScript defs
          await videoTrack.cropTo(cropTarget)
        } catch {}
      }
      // Dynamically import RecordRTC only on the client
      const RecordRTC = (await import('recordrtc')).default
      const recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
      })
      recorderRef.current = recorder
      setRecordedFormat('webm')
      setIsRecording(true)
      recorder.startRecording()
      videoTrack.onended = stopRecording
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to start recording'))
    }
  }, [onError, stopRecording])

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
