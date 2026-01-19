'use client'

import React, { useState, useId } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Tooltip } from '@base-ui/react/tooltip'
import { Slider } from '@base-ui/react/slider'
import { Info, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModelSettingsPopoverProps {
  className?: string
  settings: {
    temperature: number
  }
  onSettingsChange: (settings: any) => void
}

export function ModelSettingsPopover({
  className,
  settings,
  onSettingsChange,
}: ModelSettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const popoverTriggerId = useId()
  const tooltipTriggerId = useId()

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={popoverTriggerId}
        className={cn(
          'hover:bg-muted/80 size-8 cursor-pointer rounded-lg',
          'inline-flex items-center justify-center',
          className
        )}
      >
        <SlidersHorizontal className="size-4 text-[#9e9c98]" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="end">
          <Popover.Popup className={cn(
            "z-50 w-[318px] overflow-hidden rounded-[14px] border border-[#e7e6e2] bg-white px-[16px] pt-[16px] pb-2",
            "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
          )}>
              <Popover.Title className="mb-3 font-sans text-[18px] font-semibold text-[#101828]">
                Model Parameters
              </Popover.Title>
                {/* Temperature Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-[14px] font-medium text-[#4f4e4a]">
                        Temperature
                      </span>
                      <Tooltip.Root>
                        <Tooltip.Trigger id={tooltipTriggerId}>
                          <Info className="size-3 text-[#9e9c98]" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Positioner sideOffset={4}>
                            <Tooltip.Popup className={cn(
                              "z-50 max-w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg"
                            )}>
                              <p className="text-sm">
                                Controls the randomness of responses. Lower values are more stable, higher values are more creative.
                              </p>
                            </Tooltip.Popup>
                          </Tooltip.Positioner>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                    <div className="rounded-[4px] border border-[#e7e6e2] bg-[#f5f5f5] px-[8px] py-0">
                      <span className="font-mono text-[12px] text-[#4f4e4a]">
                        {settings.temperature}
                      </span>
                    </div>
                  </div>
                  <div className="relative pt-2 pb-0">
                    <Slider.Root
                      value={[settings.temperature]}
                      onValueChange={(value) =>
                        onSettingsChange({ ...settings, temperature: value })
                      }
                      min={0}
                      max={2}
                      step={0.1}
                    >
                      <Slider.Control className="relative flex w-full touch-none select-none items-center cursor-pointer">
                        <Slider.Track className="relative h-[3px] w-full grow rounded-full bg-[#e7e6e2]">
                          <Slider.Indicator className="absolute h-full bg-[#00bc7d]" />
                          <Slider.Thumb
                            aria-label="Temperature"
                            className="size-4 rounded-full border border-solid border-gray-200 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)]"
                          />
                        </Slider.Track>
                      </Slider.Control>
                    </Slider.Root>
                  </div>
                </div>
              <Popover.Close />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}