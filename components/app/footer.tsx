import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="relative border-t border-[#e7e6e2] bg-white">
      <div className="mx-auto w-[1280px] px-[120px]">
        <div className="flex items-start justify-between pt-[66px]">
          {/* Left Column - Logo and Social */}
          <div className="flex h-[366px] flex-col justify-between">
            <div className="flex flex-col gap-3">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-[6px]">
                <div className="flex items-center">
                  <Image src="/logo/logo-icon.svg" alt="Novita" width={24} height={15} />
                </div>
                <span className="font-sans text-[16px] leading-[14.286px] font-semibold text-[#292827]">
                  Novita
                </span>
              </Link>

              {/* Status */}
              <Link
                href="https://status.novita.ai/"
                target="_blank"
                className="flex items-center gap-[12px]"
              >
                <div className="size-[8px] rounded-full bg-[#23d57c]" />
                <span className="font-mono text-[14px] leading-4 text-[#292827]">
                  All Systems Normal
                </span>
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-[16px]">
              <Link
                href="https://x.com/novita_labs"
                target="_blank"
                className="text-[#292827] transition-colors hover:text-[#23d57c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCXiLucAkStZWXOQy3ACiaig"
                target="_blank"
                className="text-[#292827] transition-colors hover:text-[#23d57c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
              <Link
                href="https://www.linkedin.com/company/novita-ai-labs/"
                target="_blank"
                className="text-[#292827] transition-colors hover:text-[#23d57c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
              <Link
                href="https://discord.gg/YyPRAzwp7P"
                target="_blank"
                className="text-[#292827] transition-colors hover:text-[#23d57c]"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Navigation Links */}
          <div className="flex w-[776px] gap-[16px]">
            {/* Contact */}
            <div className="flex w-[160px] gap-[8px]">
              <div className="h-[333px] w-px bg-[#e7e6e2]" />
              <div className="flex w-[159px] flex-col gap-[16px]">
                <div className="font-mono text-[12px] leading-[20px] tracking-[0.24px] text-[#4f4e4a]">
                  CONTACT
                </div>
                <div className="flex flex-col gap-[16px]">
                  <Link
                    href="mailto:support@novita.ai"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="https://meetings-na2.hubspot.com/junyu"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Book a Demo
                  </Link>
                  <Link
                    href="mailto:gpu@novita.ai"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Supply GPUs
                  </Link>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="flex w-[160px] gap-[8px]">
              <div className="h-[333px] w-px bg-[#e7e6e2]" />
              <div className="flex w-[158px] flex-col gap-[16px]">
                <div className="font-mono text-[12px] leading-[20px] tracking-[0.24px] text-[#4f4e4a]">
                  RESOURCES
                </div>
                <div className="flex flex-col gap-[16px]">
                  <Link
                    href="https://novita.ai/docs/guides/introduction"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Docs
                  </Link>
                  <Link
                    href="https://novita.ai/docs/guides/faq"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    FAQ
                  </Link>
                  <Link
                    href="https://blogs.novita.ai/"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Blog
                  </Link>
                  <Link
                    href="https://novita.ai/gpus-console/templates-library"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Templates Library
                  </Link>
                  <Link
                    href="/"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Render Arena
                  </Link>
                </div>
              </div>
            </div>

            {/* Company */}
            <div className="flex w-[160px] gap-[8px]">
              <div className="h-[333px] w-px bg-[#e7e6e2]" />
              <div className="flex w-[159px] flex-col gap-[16px]">
                <div className="font-mono text-[12px] leading-[20px] tracking-[0.24px] text-[#4f4e4a]">
                  COMPANY
                </div>
                <div className="flex flex-col gap-[16px]">
                  <Link
                    href="https://novita.ai/legal/terms-of-service"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="https://novita.ai/legal/privacy-policy"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="https://jobs.ashbyhq.com/novita-ai"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Careers
                  </Link>
                  <Link
                    href="https://trust.novita.ai/"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Trust Center
                  </Link>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="flex w-[160px] gap-[8px]">
              <div className="h-[333px] w-px bg-[#e7e6e2]" />
              <div className="flex flex-col gap-[16px]">
                <div className="font-mono text-[12px] leading-[20px] tracking-[0.24px] text-[#4f4e4a]">
                  PARTNERS
                </div>
                <div className="flex flex-col gap-[16px]">
                  <Link
                    href="https://novita.ai/affiliate-new"
                    target="_blank"
                    className="flex h-[32px] items-center py-[8px] font-mono text-[14px] leading-[16px] text-[#292827] transition-colors hover:text-[#23d57c]"
                  >
                    Affiliate Program
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex h-[48px] items-center justify-center pt-[48px]">
          <p className="font-mono text-[12px] leading-[20px] tracking-[0.24px] text-[#000000]">
            © 2026 NOVITA AI. ALL RIGHTS RESERVED. 156 2ND STREET, SAN FRANCISCO, CA 94105
          </p>
        </div>
      </div>
    </footer>
  )
}
