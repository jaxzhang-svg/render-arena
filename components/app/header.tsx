import Link from "next/link"
import Image from "next/image"
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
            <Image
              src="/logo/logo-icon.svg"
              alt="Novita"
              width={24}
              height={15}
              priority
            />
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
            href="/#home"
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Home
          </Link>
          <Link
            href="/#hackathon"
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Hackathon
          </Link>
          <Link
            href="/#gallery"
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            Gallery
          </Link>
          <Link
            href="/#faq"
            className="
              font-mono text-[14px] leading-[16px] text-[#292827]
              transition-colors
              hover:text-[#23d57c]
            "
          >
            FAQ
          </Link>
        </nav>

        {/* User Avatar / Login Button */}
        <UserAvatar />
      </div>
    </header>
  )
}
