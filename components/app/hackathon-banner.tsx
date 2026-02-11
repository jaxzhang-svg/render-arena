'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Clock, Users } from 'lucide-react'
import { trackHackathonJoinClicked } from '@/lib/analytics'

interface HackathonBannerProps {
  onJoinClick?: () => void
}

interface HackathonStats {
  participants: number
  totalApps: number
}

export function HackathonBanner({ onJoinClick }: HackathonBannerProps) {
  const [stats, setStats] = useState<HackathonStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/hackathon/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch hackathon stats:', error)
      }
    }

    fetchStats()
  }, [])

  const handleJoinClick = () => {
    trackHackathonJoinClicked()
    if (onJoinClick) {
      onJoinClick()
    }
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#121212] shadow-2xl">
      {/* Main artistic background image */}
      <div className="absolute top-0 left-0 h-[420px] w-full">
        <Image
          alt=""
          className="absolute size-full max-w-none object-cover opacity-40"
          src="/images/hackathon-bg-main.png"
          width={1248}
          height={420}
          priority
        />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col px-[22px] py-[30px]">
        {/* Prize Pool Badge */}
        <div className="relative mb-[30px] ml-4 inline-flex h-[30px] w-fit items-center rounded-full border border-[#05df72]/30 bg-[#05df72]/10 py-1 pr-6 backdrop-blur-sm">
          <Image
            src="/logo/prize-pool.png"
            alt="Prize Pool"
            width={40}
            height={40}
            className="absolute bottom-2 left-2 max-w-none drop-shadow-md"
            priority
          />
          <div className="flex items-center gap-1 pl-12 font-sans text-sm font-medium">
            <span className="text-[#05df72]">PRIZE POOL: $2,000 Credits</span>
          </div>
        </div>

        <div className="max-w-[620px]">
          {/* Heading */}
          <h2 className="mb-2 font-sans text-[36px] leading-[36px] font-bold tracking-[-0.88px] text-white">
            Novita Arena Battle
          </h2>

          {/* Subheading */}
          <div className="mb-9 font-sans text-[36px] leading-[36px] font-semibold tracking-[-0.52px]">
            <span className="text-[#e5e5e5]">Build it. </span>
            <span className="text-[#f5f5f5]">Compare it. </span>
            <span className="text-[#00FF7F]">Make it glow.</span>
          </div>

          {/* Description */}
          <div className="mb-[53px] border-l-2 border-[#00FF7F]/40 pl-4">
            <p className="max-w-[380px] font-sans text-[14px] leading-6 font-normal text-[#d4d4d4]">
              A 14-day fully remote battle. Arena battle focused on visual comparison, vibes, and
              shareability — not machines but artistic vibes.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4">
            {/* Time Left */}
            <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-[13px] py-px">
              <Clock className="size-4 text-[#00FF7F]" />
              <span className="font-sans text-[12px] font-medium text-[#f5f5f5]">Live</span>
            </div>

            {/* Participants */}
            <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-[13px] py-px">
              <Users className="size-4 text-[#00FF7F]" />
              <span className="font-sans text-[12px] font-medium text-[#f5f5f5]">
                {stats ? stats.participants : 'N/A'} participants
              </span>
            </div>
          </div>
        </div>

        {/* Join Button - Bottom Right */}
        <div className="absolute right-12 bottom-[30px]">
          <button
            onClick={handleJoinClick}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-white/20 px-9 py-3.5 text-base leading-6 font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(90deg, #00FF7F 0%, #5EE9B5 100%)',
              boxShadow: '0 0 24px 0 rgba(0, 255, 127, 0.25)',
            }}
          >
            <span>Join Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
