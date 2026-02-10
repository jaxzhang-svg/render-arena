'use client'

import Image from 'next/image'
import { useJoinWaitlist } from '@/hooks/use-join-waitlist'
import { CODING_PLAN_MODE, codingPlanConfig } from '@/lib/config'

export function CodingPackageBanner() {
  const mode = CODING_PLAN_MODE
  const config = codingPlanConfig[mode]

  // Only use waitlist hook if in waitlist mode
  const waitlistHook = useJoinWaitlist({
    source: 'coding_package_banner',
    plan: 'coding_plan',
  })

  const isWaitlistMode = mode === 'waitlist'
  const isLoading = isWaitlistMode
    ? waitlistHook.authLoading || waitlistHook.isCheckingStatus || waitlistHook.isSubmitting
    : false
  const isDisabled = isWaitlistMode ? isLoading || waitlistHook.hasJoined : false

  const handleButtonClick = () => {
    if (mode === 'live') {
      const liveConfig = codingPlanConfig.live
      window.open(liveConfig.url, '_blank')
    } else {
      waitlistHook.joinWaitlist()
    }
  }

  const getButtonText = () => {
    if (mode === 'live') {
      return codingPlanConfig.live.button.text
    }

    // Waitlist mode
    const waitlistConfig = codingPlanConfig.waitlist
    if (waitlistHook.hasJoined) return waitlistConfig.button.joined
    if (waitlistHook.isCheckingStatus) return waitlistConfig.button.checking
    if (waitlistHook.user) return waitlistConfig.button.default
    return waitlistConfig.button.login
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
            {config.badge}
          </span>
        </div>

        {/* Main Content */}
        <div>
          {/* Heading */}
          <h2 className="mb-[18px] font-sans text-[36px] leading-[34px] font-bold tracking-[-0.72px] whitespace-pre-line text-white">
            {config.title.normal}
            <br />
            <span
              className="bg-gradient-to-r from-[#C4B4FF] via-[#F6CFFF] to-[#A2F4FD] bg-clip-text text-transparent"
              style={{
                WebkitTextFillColor: 'transparent',
              }}
            >
              {config.title.highlight}
            </span>
          </h2>

          {/* Description */}
          <p className="mb-[22px] w-[455px] font-sans text-[14px] leading-6 font-normal text-[#CBC9C4]">
            {config.description}
          </p>

          {/* Feature List */}
          <div className="mb-6 flex gap-3">
            {config.features.map((feature, index) => (
              <div
                key={index}
                className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3"
              >
                <Image width={16} height={16} src={feature.icon} alt={feature.label} />
                <span className="font-sans text-[14px] font-normal text-[#f5f5f5]">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button - Bottom Right */}
        <div className="absolute right-12 bottom-[30px]">
          <button
            onClick={handleButtonClick}
            disabled={isDisabled}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-white px-[26px] py-3 text-base leading-6 font-medium text-black transition-all hover:bg-gray-100 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:shadow-none"
          >
            <span>{getButtonText()}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
