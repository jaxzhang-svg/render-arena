'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { trackCodingPlanWaitlistClicked } from '@/lib/analytics'

interface CodingPackageBannerProps {
  onWaitlistClick?: () => void
}

export function CodingPackageBanner({ onWaitlistClick }: CodingPackageBannerProps) {
  const handleWaitlistClick = () => {
    trackCodingPlanWaitlistClicked()
    if (onWaitlistClick) {
      onWaitlistClick()
    }
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[32px] border border-purple-500/20 shadow-2xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B2E] via-[#181626] to-[#0d0b14]" />
      <div
        className="absolute inset-0 top-0 left-0 h-[420px] w-full opacity-30"
        style={{
          background:
            'linear-gradient(90deg, rgba(34, 197, 94, 0.10) 0.08%, rgba(0, 0, 0, 0.00) 0.08%), linear-gradient(180deg, rgba(34, 197, 94, 0.10) 0.26%, rgba(0, 0, 0, 0.00) 0.26%);',
        }}
      >
        <Image
          alt=""
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover opacity-30"
          src="/images/code-bg-container.png"
          width={624}
          height={477}
          priority
        />
      </div>

      {/* Code editor preview image - right side */}
      <Image
        alt=""
        width={275}
        height={265}
        src="/images/code-editor-preview.png"
        className="absolute top-0 right-0 object-cover object-center"
        priority
      />

      {/* Content */}
      <div className="relative flex h-full flex-col p-7">
        {/* Header Badge */}
        <div
          className="relative mb-[14px] inline-flex h-[34px] w-fit items-center gap-[10px] rounded-full px-[17px] py-[7px]"
          style={{
            borderRadius: '17px',
            border: '1px solid rgba(142, 81, 255, 0.30)',
            background: 'rgba(142, 81, 255, 0.10)',
            boxShadow: '0 0 15px 0 rgba(139, 92, 246, 0.15)',
          }}
        >
          <div className="size-2 rounded-full bg-[#8E51FF]" />
          <span className="font-sans text-[12px] font-bold tracking-[0.3px] text-[#C4B4FF] uppercase">
            CODING PLAN . WAITLIST
          </span>
        </div>

        {/* Main Content */}
        <div>
          {/* Heading */}
          <h2 className="mb-[18px] font-sans text-[36px] leading-[34px] font-bold tracking-[-0.72px] text-white">
            Get early access to the
            <br />
            <span
              className="bg-gradient-to-r from-[#C4B4FF] via-[#F6CFFF] to-[#A2F4FD] bg-clip-text text-transparent"
              style={{
                WebkitTextFillColor: 'transparent',
              }}
            >
              newest open-
              <br />
              source models
            </span>
          </h2>

          {/* Description */}
          <p className="mb-[22px] w-[455px] font-sans text-[14px] leading-6 font-normal text-[#CBC9C4]">
            Join the Coding Plan waitlist for priority access and pricing advantages compared to
            Claude Code. We&apos;ll notify you first.
          </p>

          {/* Feature List */}
          <div className="mb-6 flex gap-3">
            <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3">
              <Image width={16} height={16} src="/logo/early-access.svg" alt="Early Access" />
              <span className="font-sans text-[14px] font-normal text-[#f5f5f5]">Early access</span>
            </div>
            <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3">
              <Image
                width={16}
                height={16}
                src="/logo/pricing-advantage.svg"
                alt="Pricing Advantage"
              />
              <span className="font-sans text-[14px] font-normal text-[#f5f5f5]">
                Pricing advantage
              </span>
            </div>
            <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3">
              <Image
                width={16}
                height={16}
                src="/logo/latest-open-source-models.svg"
                alt="Open Source"
              />
              <span className="font-sans text-[14px] font-normal text-[#f5f5f5]">
                Latest open-source models
              </span>
            </div>
          </div>
        </div>

        {/* Join Waitlist Button - Bottom Right */}
        <div className="absolute right-12 bottom-[30px]">
          <button
            onClick={handleWaitlistClick}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-white px-[26px] py-3 text-base leading-6 font-medium text-black transition-all hover:bg-gray-100 hover:shadow-xl active:scale-[0.98]"
          >
            <span>Join waitlist</span>
          </button>
        </div>
      </div>
    </div>
  )
}
