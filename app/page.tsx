'use client';

import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/app/user-avatar';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { ArenaBattleModal } from '@/components/app/arena-battle-modal';
import { GalleryGrid } from '@/components/app/gallery-grid';
import { Plus, TrendingUp, Clock, Box, ArrowRight, Code, Image as ImageIcon, Video, PenTool, Gamepad2, Settings, Sparkles, FileText, ChevronDown } from 'lucide-react';
import { Accordion } from '@base-ui/react/accordion';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { Button } from '@/components/base/button';

const categories = [
  { name: 'Trending', icon: TrendingUp },
  { name: 'Newest', icon: Clock },
];

const modes = [
  { label: 'Website', icon: Code, color: 'bg-teal-400/80' },
  { label: 'Image', icon: ImageIcon, color: 'bg-indigo-400/80' },
  { label: '3D Video', icon: Video, color: 'bg-rose-400/80' },
  { label: 'Logo', icon: PenTool, color: 'bg-amber-400/80' },
  { label: 'Image Editing', icon: Settings, color: 'bg-cyan-400/80' },
  { label: 'Game Dev', icon: Gamepad2, color: 'bg-purple-400/80' },
  { label: '3D Design', icon: Box, color: 'bg-blue-400/80' },
];

const modePrompts: Record<string, string[]> = {
  'Website': [
    "Build me a minimalistic dashboard for tracking my personal expenses...",
    "Create a landing page for a new coffee brand with scroll animations...",
    "Design a portfolio site with dark mode and a contact form..."
  ],
  'Image': [
    "A cyberpunk city street at night with neon lights and rain...",
    "A portrait of a futuristic astronaut in a garden of alien plants...",
    "A wide angle shot of a serene mountain lake at sunrise..."
  ],
  '3D Video': [
    "A time-lapse video of a flower blooming in a forest...",
    "A drone shot flying over a busy futuristic metropolis...",
    "Slow motion waves crashing on a black sand beach..."
  ],
  'Logo': [
    "A minimalist geometric logo for a tech startup called 'Nexus'...",
    "A vintage style badge logo for a coffee shop...",
    "An abstract icon representing connection and speed..."
  ],
  'Image Editing': [
    "Remove the background from this portrait and add a studio backdrop...",
    "Color correct this landscape to look like golden hour...",
    "Add a lens flare effect to the top right corner..."
  ],
  'Game Dev': [
    "Create a basic Flappy Bird element with physics...",
    "Build a 2D platformer character controller with double jump...",
    "A simple memory card game grid with flip animations..."
  ],
  '3D Design': [
    "A 3D rotating globe with data visualization points...",
    "A low poly forest scene with volumetric lighting...",
    "A physics simulation of falling cloth over a sphere..."
  ]
};

export default function HomePage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('Website');
  const [userPrompt, setUserPrompt] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerate = () => {
    const promptToUse = userPrompt.trim() || placeholderText.trim();
    if (promptToUse) {
      router.push(`/playground/new?prompt=${encodeURIComponent(promptToUse)}&autoStart=true`);
    } else {
      router.push('/playground/new');
    }
  };

  useEffect(() => {
    const activePrompts = modePrompts[activeMode] || modePrompts['Website'];
    const i = loopNum % activePrompts.length;
    const fullText = activePrompts[i];

    const handleTyping = () => {
      setPlaceholderText(isDeleting 
        ? fullText.substring(0, placeholderText.length - 1) 
        : fullText.substring(0, placeholderText.length + 1)
      );

      setTypingSpeed(isDeleting ? 20 : 50);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
      } else if (isDeleting && placeholderText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, activeMode, typingSpeed]);

  // Reset typewriter when mode changes
  useEffect(() => {
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setPlaceholderText('');
      setIsDeleting(false);
      setLoopNum(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeMode]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full px-6 py-16">
          <div className="
            mx-auto flex max-w-4xl flex-col items-center gap-8 text-center
          ">
            {/* Live Badge */}
            <div className="
              inline-flex items-center gap-3 rounded-full border
              border-[#b9f8cf] bg-[#f0fdf4] px-3 py-1
            ">
              <div className="size-2 rounded-full bg-[#00c950]" />
              <span className="
                font-['Inter',sans-serif] text-xs font-medium text-[#00a63e]
              ">
                Novita AI Engine v2.0 is live
              </span>
            </div>

            {/* Heading */}
            <h1 className="
              max-w-[819px] font-sans text-[80px]
              leading-[74px] font-semibold tracking-[-1.6px] text-[#292827]
            ">
              <span className="text-[#292827]">Generate anything, </span>
              <span className="text-black">Share the magic.</span>
            </h1>

            {/* Subtitle */}
            <p className="
              max-w-[672px] font-sans text-lg/6
              font-normal text-[#4f4e4a]
            ">
              Explore thousands of apps generated by the community. Fork, remix, and display in seconds. The future of creation is here.
            </p>

            {/* Textarea Input Section */}
            <div className="
              flex w-full max-w-[787px] flex-col items-center gap-5
            ">
              {/* Textarea Box */}
              <div className="
                w-full rounded-2xl border border-[#e7e6e2] bg-white p-6
                shadow-sm
              ">
                <div className="flex flex-col gap-4">
                  {/* Mode Badge */}
                  <div className="
                    inline-flex items-center gap-2 self-start rounded-full
                    bg-[#f1f5f9] px-2 py-1.5
                  ">
                    <div className="size-2 rounded-full bg-[#2b7fff]" />
                    <span className="
                      font-sans text-sm font-normal
                      text-[#45556c]
                    ">
                      {activeMode}
                    </span>
                  </div>

                  {/* Textarea with scrollbar */}
                  <div className="relative">
                    <textarea
                      value={userPrompt || placeholderText}
                      placeholder="Describe what you want to create..."
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      className="
                        h-[118px] w-full resize-none bg-transparent
                        font-sans text-base/6
                        font-normal text-[#4f4e4a] outline-none
                        placeholder:text-[#9e9c98] pr-2
                        overflow-y-auto
                      "
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d9d9d9 transparent'
                      }}
                    />
                    {/* Custom scrollbar indicator */}
                    <div className="absolute right-1.5 top-2 bottom-2 w-1 rounded-full bg-[#d9d9d9]" />
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-4">
                    <Button 
                      variant="ghost"
                      className="size-8 p-1 inline-flex items-center justify-center"
                    >
                      <Sparkles className="text-gray-400 size-4" />
                    </Button>
                    
                    <Button 
                      onClick={handleGenerate}
                      className="
                        flex items-center justify-center gap-2 rounded-xl
                        bg-[#292827] px-4 py-2.5
                        font-mono text-base
                        font-normal text-white transition-colors
                        hover:bg-[#3a3938]
                      "
                    >
                      <span>Generate</span>
                      <ArrowRight className="size-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Category Buttons */}
              <div className="
                flex w-full flex-wrap items-center justify-center gap-3
              ">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.label;
                  return (
                    <button
                      key={mode.label}
                      onClick={() => setActiveMode(mode.label)}
                      className={`
                        flex items-center gap-1.5 rounded-full border px-4
                        py-2.5 transition-colors
                        ${
                        isActive 
                          ? "border-black bg-black text-white" 
                          : `
                            border-[#e7e6e2] bg-white text-[#4f4e4a]
                            hover:bg-gray-50
                          `
                      }
                      `}
                    >
                      <Icon className="size-3.5" />
                      <span className="
                        font-sans text-sm
                        font-medium
                      ">
                        {mode.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Hackathon Banner */}
        <section className="px-6 py-4">
          <div className="mx-auto max-w-[1254px]">
            <div className="
              relative h-[380px] overflow-hidden rounded-3xl border
              border-white/10 bg-black shadow-2xl
            ">
              {/* Background gradient lines */}
              <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0 opacity-70" style={{background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))'}} />
              </div>

              {/* Horizontal gradient lines */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-[75px] h-[2px] w-full opacity-31" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[133px] h-[2.5px] w-full opacity-33" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[200px] h-[3.7px] w-full opacity-46" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[258px] h-[4px] w-full opacity-60" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[311px] h-[3.8px] w-full opacity-49" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
              </div>

              {/* Vertical gradient line */}
              <div className="absolute left-[695px] h-full w-px opacity-14" style={{background: 'linear-gradient(180deg, transparent, #2b7fff 50%, transparent)'}} />

              {/* Glow effect */}
              <div className="
                absolute top-[-80px] left-[740px] size-[384px] rounded-full
                blur-[100px]
              " style={{background: 'radial-gradient(circle, rgba(43,127,255,0.3), transparent)'}} />

              {/* Content */}
              <div className="
                absolute inset-0 flex flex-col justify-between p-12
              ">
                <div className="max-w-[672px] space-y-4">
                  <h2 className="
                    font-sans text-[56px]
                    leading-[56px] font-semibold tracking-[-1.12px] text-white
                  ">
                    Novita Arena Battle
                  </h2>
                  <h3 className="
                    bg-clip-text font-sans
                    text-[32px] leading-[40px] font-semibold tracking-[-0.64px]
                    text-transparent
                  " style={{backgroundImage: 'linear-gradient(90deg, #05df72 0%, #5ee9b5 100%)'}}>
                    Build it. Compare it. Make it glow.
                  </h3>
                  <p className="
                    max-w-[589px] font-sans
                    text-lg leading-6 font-normal text-[#9e9c98]
                  ">
                    A 14-day fully remote battle. Arena battle focused on visual comparison, vibes, and shareability — not machines but artistic vibes.
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <div className="flex items-start gap-8">
                    {/* Prize Pool */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-[#fdc700]" />
                        <span className="
                          font-sans text-sm
                          leading-5 font-normal text-[#fdc700]
                        ">
                          PRIZE POOL
                        </span>
                      </div>
                      <p className="
                        font-sans text-2xl
                        leading-[38px] font-semibold text-white/90
                      ">
                        5,000 Credits
                      </p>
                    </div>

                    <div className="h-12 w-px bg-white/10" />

                    {/* Time Left */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-[#00d3f2]" />
                        <span className="
                          font-sans text-sm
                          leading-5 font-normal text-[#00d3f2]
                        ">
                          TIME LEFT
                        </span>
                      </div>
                      <p className="
                        font-sans text-2xl
                        leading-[38px] font-semibold text-white/90
                      ">
                        10 days left
                      </p>
                    </div>

                    <div className="h-12 w-px bg-white/10" />

                    {/* Participants */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Box className="size-4 text-[#c27aff]" />
                        <span className="
                          font-sans text-sm
                          leading-5 font-normal text-[#c27aff]
                        ">
                          PARTICIPANTS
                        </span>
                      </div>
                      <p className="
                        font-sans text-2xl
                        leading-[38px] font-semibold text-white/90
                      ">
                        1,234
                      </p>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="
                      flex items-center justify-center gap-2 rounded-full
                      bg-white px-8 py-4 font-['Inter',sans-serif] text-lg
                      leading-7 font-bold text-black
                      shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)]
                      transition-all tracking-[-0.44px]
                      hover:bg-white/90
                    "
                  >
                    <span>Join Now</span>
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="bg-muted/30 pt-16 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Gallery Header */}
            <div className="mb-12">
              <h2 className="
                font-sans text-[48px]
                leading-[48px] font-semibold tracking-[-0.96px] text-[#292827]
              ">
                Arena Gallery
              </h2>
            </div>

            <GalleryGrid />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="
              mb-12 text-center font-sans
              text-[48px] leading-[48px] font-semibold tracking-[-0.96px]
              text-[#101828]
            ">
              Frequently Asked Questions
            </h2>

            <Accordion.Root defaultValue={["item-0"]} className="w-full space-y-2">
              <Accordion.Item value="item-0" className="rounded-[10px] border-none bg-[#f9fafb] px-6">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#23d57c]
                  hover:no-underline
                ">
                  How does the Novita affiliate program work?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  The Novita affiliate program allows you to earn commissions by referring new customers to our platform. Once you sign up, you'll receive a unique tracking link. Share this link on your website, blog, or social media channels. When someone clicks your link and makes a purchase, you earn a percentage of the sale.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-1" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Do I need a website or blog to be part of the Novita affiliate program?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  No, you don't need a website or blog to participate. You can share your affiliate link through social media, email newsletters, or any other platform where you have an audience.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-2" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  If a customer clicks my link but buys later without the link, do I still get commission?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  Yes, our tracking system uses cookies that typically last 30 days. If a customer clicks your link and makes a purchase within that timeframe, you'll receive credit for the referral.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-3" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  When do I receive my rewards?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  Rewards are typically processed monthly. Once you reach the minimum payout threshold, your earnings will be transferred to your designated payment method.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-4" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Where can I find Affiliate Terms of Service?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  You can find our Affiliate Terms of Service in your affiliate dashboard or on our website's legal section. Make sure to review them carefully before participating in the program.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-5" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <Accordion.Trigger className="
                  py-6 font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Are there any restrictions on the affiliate program?
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] pt-4 pb-6
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  Yes, there are some restrictions including prohibited promotional methods and content guidelines. Please refer to our Affiliate Terms of Service for complete details.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion.Root>
          </div>
        </section>
      </main>

      <Footer />
      
      <ArenaBattleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
