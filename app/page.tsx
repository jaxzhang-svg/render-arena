'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/app/header'
import { Footer } from '@/components/app/footer'
import { ArenaBattleModal } from '@/components/app/arena-battle-modal'
import { GalleryGrid } from '@/components/app/gallery-grid'
import { FreeTierBanner } from '@/components/app/overwhelming-banner'
import { Clock, ArrowRight, ChevronUp, Users, Zap } from 'lucide-react'
import { Accordion } from '@base-ui/react/accordion'

import { useState, useEffect, useId, useRef } from 'react'
import { Button } from '@/components/base/button'
import { FeaturedCasesSection } from '@/components/app/featured-case'

import {
  playgroundModes,
  galleryCategories,
  type GalleryCategoryId,
  models,
  type LLMModel,
  defaultModelAId,
  defaultModelBId,
  getModelById,
} from '@/lib/config'
import { ModelSelector } from '@/components/base/model-selector'
import { trackHackathonJoinClicked } from '@/lib/analytics'
import { useJoinWaitlist } from '@/hooks/use-join-waitlist'

export default function HomePage() {
  const router = useRouter()
  const [userPrompt, setUserPrompt] = useState('')
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(50)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategoryId>('all')
  const [participantCount, setParticipantCount] = useState<number>(120) // Default to 120
  const hasUserInteractedRef = useRef(false)
  const gallerySectionRef = useRef<HTMLElement>(null)
  const {
    user,
    authLoading,
    isSubmitting: isWaitlistSubmitting,
    hasJoined: hasJoinedWaitlist,
    joinWaitlist: handleJoinWaitlist,
  } = useJoinWaitlist({ source: 'event_page', plan: 'coding_plan', redirectHash: 'waitlist' })

  // Static placeholder text for typewriter effect
  const STATIC_PLACEHOLDER = 'Enter a prompt to start the Arena battle.'

  // Model selection state
  const [selectedModelA, setSelectedModelA] = useState<LLMModel>(
    getModelById(defaultModelAId) || models[0]
  )
  const [selectedModelB, setSelectedModelB] = useState<LLMModel>(
    getModelById(defaultModelBId) || models[1]
  )

  // Generate stable IDs for accordion triggers
  const accordionId0 = useId()
  const accordionId1 = useId()
  const accordionId2 = useId()
  const accordionId3 = useId()

  // Fetch hackathon stats
  // useEffect(() => {
  //   const fetchHackathonStats = async () => {
  //     try {
  //       const response = await fetch('/api/hackathon/stats')
  //       if (response.ok) {
  //         const data = await response.json()
  //         setParticipantCount(data.participants)
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch hackathon stats:', error)
  //     }
  //   }

  //   fetchHackathonStats()
  // }, [])

  // Typewriter effect for placeholder
  useEffect(() => {
    // Only run typewriter effect if user hasn't interacted and prompt is empty
    if (hasUserInteractedRef.current || userPrompt) {
      setPlaceholderText('')
      return
    }

    const handleTyping = () => {
      setPlaceholderText(
        isDeleting
          ? STATIC_PLACEHOLDER.substring(0, placeholderText.length - 1)
          : STATIC_PLACEHOLDER.substring(0, placeholderText.length + 1)
      )

      setTypingSpeed(isDeleting ? 30 : 50)

      if (!isDeleting && placeholderText === STATIC_PLACEHOLDER) {
        setTimeout(() => setIsDeleting(true), 2000) // Pause before deleting
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [placeholderText, isDeleting, userPrompt, typingSpeed])

  const handleGenerate = () => {
    const promptToUse = userPrompt.trim()

    if (!promptToUse) {
      // TODO: Show error toast
      return
    }

    // Navigate with all params
    const params = new URLSearchParams({
      prompt: promptToUse,
      modelA: selectedModelA.id,
      modelB: selectedModelB.id,
      autoStart: 'true',
    })

    router.push(`/playground/new?${params.toString()}`)
  }

  const handleModeClick = (mode: (typeof playgroundModes)[number]) => {
    // Fill textarea with a random prompt from this mode
    if (mode.prompts && mode.prompts.length > 0) {
      // eslint-disable-next-line react-hooks/purity
      const randomIndex = Math.floor(Math.random() * mode.prompts.length)
      setUserPrompt(mode.prompts[randomIndex])
      hasUserInteractedRef.current = true
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <FreeTierBanner />

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative w-full px-6 py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-3 rounded-full border border-[#b9f8cf] bg-[#f0fdf4] px-3 py-1">
              <div className="size-2 rounded-full bg-[#00c950]" />
              <span className="font-['Inter',sans-serif] text-xs font-medium text-[#00a63e]">
                RenderArena · Live Model Battles
              </span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[820px] font-sans text-[58px] leading-[64px] font-semibold tracking-[-1.6px] text-[#292827]">
              <span>One Prompt</span>
              <br />
              <span>Multiple Models, Side by Side</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-[820px] font-sans text-lg/6 font-normal text-[#4f4e4a]">
              Test how different models render the same idea. Compare, judge, and share the results.
            </p>

            {/* Featured Case */}
            <FeaturedCasesSection />

            {/* Textarea Input Section */}
            <div className="flex w-full max-w-[787px] flex-col items-center gap-8">
              <div className="relative w-full overflow-hidden rounded-[16px] border border-[#e7e6e2] bg-white p-6 shadow-sm">
                {/* Textarea */}
                <div className="relative mb-4 min-h-[120px] w-full">
                  <textarea
                    value={userPrompt}
                    placeholder={placeholderText || 'Enter a prompt to start the Arena battle.'}
                    onChange={e => {
                      setUserPrompt(e.target.value)
                      hasUserInteractedRef.current = true
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate()
                      }
                    }}
                    className="w-full resize-none bg-transparent font-sans text-base font-normal text-[#4f4e4a] outline-none placeholder:text-[#9e9c98]"
                    spellCheck={false}
                  />
                </div>

                {/* Bottom Actions: Model Selectors and Run Arena Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ModelSelector
                      selectedModel={selectedModelA}
                      onModelChange={model => {
                        setSelectedModelA(model)
                      }}
                      variant="minimal"
                      size="small"
                      className="w-[196px]"
                    />
                    <div className="h-[16px] w-px bg-[rgba(0,0,0,0.06)]" />
                    <ModelSelector
                      selectedModel={selectedModelB}
                      onModelChange={model => {
                        setSelectedModelB(model)
                      }}
                      variant="default"
                      size="small"
                      className="w-[196px]"
                    />
                  </div>

                  {/* Run Arena Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!userPrompt.trim()}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-black py-2.5 pr-4 pl-5 font-mono text-base font-normal text-white transition-all hover:scale-[1.02] hover:bg-black/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <span>Run Arena</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Category Buttons */}
              <div className="flex w-full flex-wrap items-center justify-center gap-3">
                {playgroundModes.map(mode => {
                  const Icon = mode.icon
                  return (
                    <button
                      key={mode.label}
                      onClick={() => handleModeClick(mode)}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e7e6e2] bg-white px-4 py-2 text-[#4f4e4a] transition-all duration-200 hover:bg-gray-50"
                    >
                      <Icon className="size-4" />
                      <span className="font-sans text-sm font-medium">{mode.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon Banner */}
        <section id="hackathon" className="px-6 py-4">
          <div className="mx-auto max-w-[1254px]">
            <div className="relative h-[380px] overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-2xl">
              {/* Background container image (grid/line pattern) */}
              <div className="absolute top-0 left-0 h-[368px] w-[1253px] opacity-40">
                <Image
                  alt=""
                  className="pointer-events-none absolute inset-0 size-full max-w-none object-cover opacity-70"
                  src="/images/hackathon-bg-container.png"
                  width={1253}
                  height={368}
                  priority
                />
              </div>

              {/* Main artistic background image */}
              <div className="absolute top-1/2 left-1/2 h-[380px] w-[1248px] -translate-x-1/2 -translate-y-1/2 rounded-md">
                <div className="absolute inset-0 rounded-md bg-black" />
                <Image
                  alt=""
                  className="absolute size-full max-w-none rounded-md object-cover opacity-60"
                  src="/images/hackathon-bg-main.png"
                  width={1248}
                  height={380}
                  priority
                />
                {/* Green Blur Effect */}
                <div className="pointer-events-none absolute inset-0 bg-[rgba(0,188,125,0.05)] blur-[120px]" />
              </div>

              {/* Content */}
              <div className="relative flex h-full flex-col p-12">
                {/* Prize Pool Badge */}
                <div className="relative mb-3 ml-4 inline-flex h-[42px] w-fit items-center rounded-full border border-[#05df72]/30 bg-[#05df72]/10 py-1 pr-6 backdrop-blur-sm">
                  <Image
                    src="/logo/prize-pool.png"
                    alt="Prize Pool"
                    width={40}
                    height={40}
                    className="absolute bottom-2 left-2 max-w-none drop-shadow-md"
                    priority
                  />
                  <div className="flex items-center gap-1 pl-12 font-sans text-sm font-medium">
                    <span className="text-[#05df72]">Prize Pool:</span>
                    <span className="text-white">$2,000 Credits</span>
                  </div>
                </div>

                <div className="max-w-[700px]">
                  {/* Heading */}
                  <h2 className="mb-2 font-sans text-[56px] leading-[56px] font-semibold tracking-[-1.12px] text-white">
                    Novita Render Arena
                  </h2>

                  {/* Subheading */}
                  <div className="mb-4 flex flex-wrap items-center gap-x-2 font-sans text-[32px] leading-[40px] font-semibold tracking-[-0.64px]">
                    <span className="text-[#d1d5dc]">Build it.</span>
                    <span className="text-[#f3f4f6]">Compare it.</span>
                    <span className="text-[#05df72]">Make it glow.</span>
                  </div>

                  {/* Description */}
                  <div className="mb-8 border-l-2 border-[#00c950]/30 pl-4">
                    <p className="max-w-[570px] font-sans text-[18px] leading-6 font-normal text-[#cbc9c4]">
                      Render Arena focused on visual comparison, vibes, and shareability — not
                      machines but artistic vibes.
                    </p>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-4">
                    {/* Time Left */}
                    <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5">
                      <Clock className="text-primary size-4" />
                      <span className="font-sans text-[16px] font-medium text-[#f5f5f5]">
                        Coming soon
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex h-[34px] items-center gap-2 rounded-[10px] border border-white/10 bg-white/5 px-3 py-1.5">
                      <Users className="text-primary size-4" />
                      <span className="font-sans text-[16px] font-medium text-[#f5f5f5]">
                        120 Interested
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join Button - Bottom Right */}
                <div className="absolute right-12 bottom-12">
                  <button
                    onClick={() => {
                      trackHackathonJoinClicked()
                      setIsModalOpen(true)
                    }}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-white/20 px-8 py-3.5 text-base leading-6 font-normal text-black transition-all hover:brightness-110"
                    style={{
                      background: 'linear-gradient(90deg, #05DF72 0%, #5EE9B5 100%)',
                      boxShadow: '0 0 20px 0 rgba(34, 197, 94, 0.15)',
                    }}
                  >
                    <span>Join Now</span>
                    <Zap className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coding Plan Waitlist */}
        <section id="waitlist" className="px-6 py-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center gap-6 rounded-[24px] border border-[#e7e6e2] bg-white px-8 py-10 text-center shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b9f8cf] bg-[#f0fdf4] px-3 py-1">
                <span className="font-['Inter',sans-serif] text-xs font-medium text-[#00a63e]">
                  Coding Plan · Waitlist
                </span>
              </div>

              <h2 className="max-w-[760px] font-sans text-[36px] leading-[44px] font-semibold tracking-[-0.72px] text-[#292827]">
                Get early access to the newest open-source models
              </h2>

              <p className="max-w-[760px] font-sans text-base/6 text-[#4f4e4a]">
                Join the Coding Plan waitlist for priority access and pricing advantages compared
                to Claude Code. We&apos;ll notify you first.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#4f4e4a]">
                <span className="rounded-full border border-[#e7e6e2] bg-[#fafafa] px-3 py-1">
                  Early access
                </span>
                <span className="rounded-full border border-[#e7e6e2] bg-[#fafafa] px-3 py-1">
                  Pricing advantage
                </span>
                <span className="rounded-full border border-[#e7e6e2] bg-[#fafafa] px-3 py-1">
                  Latest open-source models
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={isWaitlistSubmitting || hasJoinedWaitlist || authLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-2.5 font-mono text-base font-normal text-white transition-all hover:scale-[1.02] hover:bg-black/90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {hasJoinedWaitlist
                    ? 'You are on the waitlist'
                    : authLoading
                      ? 'Checking...'
                      : user
                        ? 'Join waitlist'
                        : 'Log in to join'}
                </Button>
                <p className="text-xs text-[#9e9c98]">
                  We&apos;ll use your registered email. One click to confirm.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Gallery Grid */}
        <section id="gallery" ref={gallerySectionRef} className="pt-16 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Gallery Header */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-sans text-[48px] leading-[48px] font-semibold tracking-[-0.96px] text-[#292827]">
                Arena Gallery
              </h2>

              <div className="flex gap-2 rounded-full bg-gray-100/50 p-1">
                {galleryCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setGalleryCategory(cat.id)
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-medium transition-all ${
                      galleryCategory === cat.id
                        ? 'text-foreground bg-white shadow-sm ring-1 ring-black/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-gray-200/50'
                    } `}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <GalleryGrid selectedCategory={galleryCategory} />
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center font-sans text-[48px] leading-[48px] font-semibold tracking-[-0.96px] text-[#101828]">
              Frequently Asked Questions
            </h2>

            <Accordion.Root defaultValue={[]} className="w-full space-y-2">
              <Accordion.Item
                value="item-0"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId0}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>What am I supposed to do here?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>
                    Model Arena lets you submit a single task (prompt) and watch two models attempt
                    to solve it under identical conditions.
                  </p>
                  <p className="mt-2">Instead of chatting, you observe how models:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>reason about the task</li>
                    <li>generate code or logic</li>
                    <li>build and execute a real solution</li>
                  </ul>
                  <p className="mt-2">
                    Think of it as models proving themselves by doing real work.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-1"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId1}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>Is this a real build or just a demo simulation?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>This is a real execution, not a mock or animation.</p>
                  <p className="mt-2">Models:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>generate actual code</li>
                    <li>run inside an isolated sandbox</li>
                    <li>build and launch real previews when applicable</li>
                  </ul>
                  <p className="mt-2">
                    Failures, delays, and unexpected behavior are all part of the evaluation — and
                    often the most informative signals.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-2"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId2}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>How should I decide which model is better?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>Model Arena does not assign scores or rankings.</p>
                  <p className="mt-2">You evaluate models based on:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Task completion — does it actually work?</li>
                    <li>Engineering judgment — are the decisions reasonable?</li>
                    <li>
                      Creativity & robustness — does it handle edge cases or go beyond expectations?
                    </li>
                  </ul>
                  <p className="mt-2">The best model is the one you’d trust in a real project.</p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item
                value="item-3"
                className="overflow-hidden rounded-[10px] border-none bg-[#f9fafb]"
              >
                <Accordion.Trigger
                  id={accordionId3}
                  className="group flex h-[72.75px] w-full cursor-pointer items-center justify-between px-6 py-0 font-sans text-xl leading-6 font-semibold tracking-[-0.4px] text-[#1e2939] transition-colors hover:bg-[#f0f0ed] hover:no-underline aria-expanded:text-[#23d57c]"
                >
                  <span>Can I reuse or share what I see here?</span>
                  <ChevronUp className="size-5 rotate-180 transition-transform group-aria-expanded:rotate-0" />
                </Accordion.Trigger>
                <Accordion.Panel className="border-t border-[#f3f4f6] px-6 py-4 font-sans text-base leading-6 text-[#4f4e4a]">
                  <p>Yes — and you’re encouraged to.</p>
                  <p className="mt-2">You can:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>inspect generated outputs</li>
                    <li>rerun tasks with modified prompts</li>
                    <li>share results via demos, blogs, or social posts</li>
                  </ul>
                  <p className="mt-2">
                    Model Arena is designed for reproducible, shareable model experiments.
                  </p>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </section>
      </main>

      <Footer />

      <ArenaBattleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
