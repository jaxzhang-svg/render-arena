'use client'

import { loginWithNovita } from '@/hooks/use-auth'
import { LogIn } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface LoginToastProps {
  message: string
}

export function LoginToast({ message }: LoginToastProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          loginWithNovita(pathname)
        }}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#23D57C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1eb86b]"
      >
        <LogIn size={14} />
        Login
      </button>
    </div>
  )
}
