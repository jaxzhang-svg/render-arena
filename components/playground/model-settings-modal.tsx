'use client'

import { useState } from 'react'
import { Popover } from '@base-ui/react/popover'
import { Tooltip } from '@base-ui/react/tooltip'
import { Slider } from '@base-ui/react/slider'
import { Button } from '@/components/base/button'
import { cn } from '@/lib/utils'

interface ModelSettingsPopoverProps {
  children: React.ReactNode
  modelName: string
  settings: {
    temperature: number
  }
  onSettingsChange: (settings: any) => void
}

export function ModelSettingsPopover({
  children,
  modelName,
  settings,
  onSettingsChange,
}: ModelSettingsPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4}>
          <Popover.Popup className={cn(
            "z-50 w-[318px] overflow-hidden rounded-[14px] border border-[#e7e6e2] bg-white p-0",
            "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
          )}>
            <div className="p-4">
              <h3 className="
                mb-6 font-sans text-[18px] font-semibold text-[#101828]
              ">
                Model Parameters
              </h3>

              <div className="space-y-6">
                {/* Temperature Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="
                        font-sans text-[14px] font-medium text-[#4f4e4a]
                      ">
                        Temperature
                      </span>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <div className="group relative cursor-help">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              className="text-[#9e9c98]"
                            >
                              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1"/>
                              <path d="M6 4v4M6 9h0" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Positioner sideOffset={4}>
                            <Tooltip.Popup className={cn(
                              "z-50 max-w-[280px] overflow-hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-lg"
                            )}>
                              <p className="text-sm">
                                Controls randomness in responses. Lower values (0.1-0.3) make output more focused and deterministic. Higher values (0.7-1.0) make output more creative and varied. Default: 0.7
                              </p>
                            </Tooltip.Popup>
                          </Tooltip.Positioner>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                    <div className="
                      rounded-sm border border-[#e7e6e2] bg-[#f5f5f5] px-2
                      py-0.5
                    ">
                      <span className="font-mono text-[12px] text-[#4f4e4a]">
                        {settings.temperature}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <Slider.Root
                      defaultValue={[settings.temperature]}
                      onValueChange={(value) =>
                        onSettingsChange({ ...settings, temperature: value[0] })
                      }
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    >
                      <Slider.Track className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <Slider.Indicator className="absolute h-full bg-[#23d57c]" style={{ width: `${(settings.temperature / 2) * 100}%` }} />
                      </Slider.Track>
                      <Slider.Thumb className="block size-4 -mt-1.5 rounded-full border-2 border-[#23d57c] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23d57c] focus:ring-offset-2" />
                    </Slider.Root>
                  </div>
                </div>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}