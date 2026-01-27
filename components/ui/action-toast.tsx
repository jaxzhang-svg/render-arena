'use client'

import { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'

export interface ActionToastProps {
  message: string
  buttonText: string
  buttonHref?: string
  buttonOnClick?: () => void
  icon?: ReactNode
}

export function ActionToast({ message, buttonText, buttonHref, buttonOnClick, icon }: ActionToastProps) {
  const handleClick = () => {
    if (buttonOnClick) {
      buttonOnClick()
    } else if (buttonHref) {
      window.open(buttonHref, '_blank')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#23D57C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1eb86b]"
      >
        {icon}
        {buttonText}
        {!buttonOnClick && <ExternalLink size={12} />}
      </button>
    </div>
  )
}
