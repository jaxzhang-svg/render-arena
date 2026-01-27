import Link from 'next/link'
import { Button } from '@/components/base/button'
import { UserAvatar } from '@/components/app/user-avatar'
import { ArrowLeft } from 'lucide-react'

export default function PlaygroundNotFound() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header Consistent with PlaygroundClient */}
      <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#f3f4f6] bg-white px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/80 size-9 cursor-pointer rounded-full p-2"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <h1 className="font-sans text-[20px] font-semibold tracking-tight text-black">
            Arena Playground
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#23d57c]/20 blur-[60px]" />
          <h1 className="relative font-mono text-[120px] leading-none font-bold tracking-tighter text-[#292827]">
            404
          </h1>
        </div>

        <h2 className="mb-4 font-sans text-2xl font-semibold text-[#292827]">
          Playground Session Not Found
        </h2>

        <p className="mb-8 max-w-[400px] text-lg text-[#4f4e4a]">
          The playground session you are looking for doesn&apos;t exist or has expired. Start a new
          battle to continue.
        </p>

        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-white transition-all hover:scale-105 hover:bg-black hover:shadow-lg active:scale-95"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Start New Battle</span>
        </Link>
      </main>
    </div>
  )
}
