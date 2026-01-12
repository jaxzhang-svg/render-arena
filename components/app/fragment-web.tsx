'use client'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ExecutionResultWeb } from '@/lib/types'
import { RotateCw, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function FragmentWeb({ result }: { result: ExecutionResultWeb }) {
  const [iframeKey, setIframeKey] = useState(0)
  const [copied, setCopied] = useState(false)

  if (!result) return null

  function refreshIframe() {
    setIframeKey((prevKey) => prevKey + 1)
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(result.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col w-full h-full">
      <iframe
        key={iframeKey}
        className="h-full w-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={result.url}
      />
      <div className="p-2 border-t">
        <div className="flex items-center bg-muted/50 rounded-2xl">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-8 w-8"
                  onClick={refreshIframe}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-muted-foreground text-xs flex-1 text-ellipsis overflow-hidden whitespace-nowrap px-2">
            {result.url}
          </span>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-8 w-8"
                  onClick={copyUrl}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copied!' : 'Copy URL'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
