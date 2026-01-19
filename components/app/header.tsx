import Link from "next/link"
import { UserAvatar } from "./user-avatar"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e6e2] bg-white">
      <div className="
        mx-auto flex h-16 max-w-7xl items-center justify-between px-6
      ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[6px]">
          <div className="flex items-center">
            <svg width="24" height="15" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9999 0L0 14.8333H23.9998L11.9999 0Z" fill="#23D57C"/>
            </svg>
          </div>
          <span className="
            font-sans text-[16px] leading-[14.286px] font-semibold
            text-[#292827]
          ">
            Novita
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <Link 
            href="/" 
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Home
          </Link>
          <Link 
            href="/hackathon" 
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Hackathon
          </Link>
          <Link 
            href="/gallery" 
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Gallery
          </Link>
          <Link 
            href="/terms" 
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Terms
          </Link>
        </nav>

        {/* User Avatar / Login Button */}
        <UserAvatar />
      </div>
    </header>
  )
}
