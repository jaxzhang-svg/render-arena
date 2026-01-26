import Link from 'next/link'
import Image from 'next/image'
import { UserAvatar } from './user-avatar'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e6e2] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[6px]">
          <div className="flex items-center">
            <Image src="/logo/logo-icon.svg" alt="Novita" width={24} height={15} priority />
          </div>
          <span className="font-sans text-[16px] leading-[14.286px] font-semibold text-[#292827]">
            Novita
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {[
            { name: 'Home', href: '/#home', id: 'home' },
            { name: 'Hackathon', href: '/#hackathon', id: 'hackathon' },
            { name: 'Gallery', href: '/#gallery', id: 'gallery' },
            { name: 'FAQ', href: '/#faq', id: 'faq' },
          ].map(item => (
            <Link
              key={item.id}
              href={item.href}
              onClick={e => {
                // If we're on the home page, handle scroll manually
                if (window.location.pathname === '/') {
                  const element = document.getElementById(item.id)
                  if (element) {
                    e.preventDefault()
                    const headerHeight = 64
                    const buffer = 16
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition =
                      elementPosition + window.pageYOffset - (headerHeight + buffer)

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    })

                    // Update URL hash without jumping
                    window.history.pushState(null, '', item.href)
                  }
                }
              }}
              className="font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Avatar / Login Button */}
        <UserAvatar />
      </div>
    </header>
  )
}
