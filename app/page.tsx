'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/app/app-card';
import { UserAvatar } from '@/components/app/user-avatar';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { ArenaBattleModal } from '@/components/app/arena-battle-modal';
import { Plus, TrendingUp, Clock, Box, ArrowRight, Code, Image as ImageIcon, Video, PenTool, Gamepad2, Settings, Sparkles, FileText, ChevronDown } from 'lucide-react';
import { AppCard as AppCardType } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { useState, useEffect } from 'react';

const mockApps: AppCardType[] = [
  {
    id: '1',
    title: 'Gravity Data Sim',
    author: 'phys_wiz',
    modelA: 'Claude 3.5',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    category: 'Website',
    likes: 1200,
  },
  {
    id: '2',
    title: 'Snake 3D Remake',
    author: 'retro_dev',
    modelA: 'GPT-4o',
    modelB: 'Claude 3.5',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    category: 'Game',
    likes: 850,
  },
  {
    id: '3',
    title: 'Particle Controller',
    author: 'threejs_god',
    modelA: 'Claude 3.5',
    modelB: 'Llama 3',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    category: '3D Scene',
    likes: 2100,
  },
  {
    id: '4',
    title: 'Cloth Physics Demo',
    author: 'sim_master',
    modelA: 'Llama 3',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    category: 'Physics',
    likes: 932,
  },
  {
    id: '5',
    title: 'Fluid Rain Sim',
    author: 'weather_ai',
    modelA: 'GPT-4o',
    modelB: 'Claude 3.5',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    category: 'Visual Effect',
    likes: 4500,
  },
  {
    id: '6',
    title: 'Pong: Neon Edition',
    author: 'arcade_lover',
    modelA: 'Claude 3.5',
    modelB: 'GPT-4o',
    thumbnailA: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    thumbnailB: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    category: 'Game',
    likes: 156,
  },
];

const categories = [
  { name: 'Trending', icon: TrendingUp },
  { name: 'Newest', icon: Clock },
];

const modes = [
  { label: 'Website', icon: Code, color: 'bg-teal-400/80' },
  { label: 'Image', icon: ImageIcon, color: 'bg-indigo-400/80' },
  { label: 'Video', icon: Video, color: 'bg-rose-400/80' },
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
  'Video': [
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
  const [activeMode, setActiveMode] = useState('Website');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              max-w-[819px] font-['TT_Interphases_Pro',sans-serif] text-[80px]
              leading-[74px] font-semibold tracking-[-1.6px] text-[#292827]
            ">
              <span className="text-[#292827]">Generate anything, </span>
              <span className="text-black">Share the magic.</span>
            </h1>

            {/* Subtitle */}
            <p className="
              max-w-[672px] font-['TT_Interphases_Pro',sans-serif] text-lg/6
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
                <div className="flex flex-col gap-2">
                  {/* Mode Badge */}
                  <div className="
                    inline-flex items-center gap-2 self-start rounded-full
                    bg-[#f1f5f9] px-2 py-1.5
                  ">
                    <div className="size-2 rounded-full bg-[#2b7fff]" />
                    <span className="
                      font-['TT_Interphases_Pro',sans-serif] text-sm font-normal
                      text-[#45556c]
                    ">
                      {activeMode}
                    </span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={placeholderText}
                    placeholder="Describe what you want to create..."
                    readOnly
                    className="
                      min-h-[82px] w-full resize-none bg-transparent
                      font-['TT_Interphases_Pro',sans-serif] text-base/6
                      font-normal text-[#4f4e4a] outline-none
                      placeholder:text-[#9e9c98]
                    "
                  />

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-4">
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="size-4 p-0"
                    >
                      <Sparkles className="text-muted-foreground size-4" />
                    </Button>
                    
                    <Link href="/playground">
                      <button className="
                        flex items-center justify-center gap-2 rounded-xl
                        bg-[#292827] px-4 py-2.5
                        font-['TT_Interphases_Pro_Mono',monospace] text-base
                        font-normal text-white transition-colors
                        hover:bg-[#3a3938]
                      ">
                        <span>Generate</span>
                        <ArrowRight className="size-5" />
                      </button>
                    </Link>
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
                        font-['TT_Interphases_Pro',sans-serif] text-sm
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
                <div className="absolute top-[75px] h-[2px] w-full opacity-30" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[133px] h-[2px] w-full opacity-35" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[200px] h-[4px] w-full opacity-45" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[258px] h-[4px] w-full opacity-60" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
                <div className="absolute top-[311px] h-[4px] w-full opacity-50" style={{background: 'linear-gradient(90deg, transparent, #00b8db 50%, transparent)', filter: 'blur(8px)'}} />
              </div>

              {/* Vertical gradient line */}
              <div className="absolute left-[695px] h-full w-px opacity-15" style={{background: 'linear-gradient(180deg, transparent, #2b7fff 50%, transparent)'}} />

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
                    font-['TT_Interphases_Pro',sans-serif] text-[56px]
                    leading-[56px] font-semibold tracking-[-1.12px] text-white
                  ">
                    Novita Arena Battle
                  </h2>
                  <h3 className="
                    bg-clip-text font-['TT_Interphases_Pro',sans-serif]
                    text-[32px]/10 font-semibold tracking-[-0.64px]
                    text-transparent
                  " style={{backgroundImage: 'linear-gradient(90deg, #05df72 0%, #5ee9b5 100%)'}}>
                    Build it. Compare it. Make it glow.
                  </h3>
                  <p className="
                    max-w-[589px] font-['TT_Interphases_Pro',sans-serif]
                    text-lg/6 font-normal text-[#9e9c98]
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
                          font-['TT_Interphases_Pro',sans-serif] text-sm/5
                          font-normal text-[#fdc700]
                        ">
                          PRIZE POOL
                        </span>
                      </div>
                      <p className="
                        font-['TT_Interphases_Pro',sans-serif] text-2xl
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
                          font-['TT_Interphases_Pro',sans-serif] text-sm/5
                          font-normal text-[#00d3f2]
                        ">
                          TIME LEFT
                        </span>
                      </div>
                      <p className="
                        font-['TT_Interphases_Pro',sans-serif] text-2xl
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
                          font-['TT_Interphases_Pro',sans-serif] text-sm/5
                          font-normal text-[#c27aff]
                        ">
                          PARTICIPANTS
                        </span>
                      </div>
                      <p className="
                        font-['TT_Interphases_Pro',sans-serif] text-2xl
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
                      font-bold text-black
                      shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)]
                      transition-all
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
                font-['TT_Interphases_Pro',sans-serif] text-[48px]
                leading-[48px] font-semibold text-[#292827]
              ">
                Arena Gallery
              </h2>
            </div>

            <div className="
              grid grid-cols-1 gap-6
              md:grid-cols-2
            ">
              {mockApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Button variant="outline" size="lg" className="gap-2">
                Load more apps
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="
              mb-12 text-center font-['TT_Interphases_Pro',sans-serif]
              text-[48px] leading-[48px] font-semibold tracking-[-0.96px]
              text-[#101828]
            ">
              Frequently Asked Questions
            </h2>

            <Accordion defaultValue={["item-0"]} className="
              w-full space-y-2
            ">
              <AccordionItem value="item-0" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#23d57c]
                  hover:no-underline
                ">
                  How does the Novita affiliate program work?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  The Novita affiliate program allows you to earn commissions by referring new customers to our platform. Once you sign up, you'll receive a unique tracking link. Share this link on your website, blog, or social media channels. When someone clicks your link and makes a purchase, you earn a percentage of the sale.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-1" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Do I need a website or blog to be part of the Novita affiliate program?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  No, you don't need a website or blog to participate. You can share your affiliate link through social media, email newsletters, or any other platform where you have an audience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  If a customer clicks my link but buys later without the link, do I still get commission?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  Yes, our tracking system uses cookies that typically last 30 days. If a customer clicks your link and makes a purchase within that timeframe, you'll receive credit for the referral.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  When do I receive my rewards?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  Rewards are typically processed monthly. Once you reach the minimum payout threshold, your earnings will be transferred to your designated payment method.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Where can I find Affiliate Terms of Service?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  You can find our Affiliate Terms of Service in your affiliate dashboard or on our website's legal section. Make sure to review them carefully before participating in the program.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="
                rounded-[10px] border-none bg-[#f9fafb] px-6
              ">
                <AccordionTrigger className="
                  py-6 font-['TT_Interphases_Pro',sans-serif] text-xl/6
                  font-semibold tracking-[-0.4px] text-[#1e2939]
                  hover:no-underline
                ">
                  Are there any restrictions on the affiliate program?
                </AccordionTrigger>
                <AccordionContent className="
                  border-t border-[#f3f4f6] pt-0 pb-6
                  font-['TT_Interphases_Pro',sans-serif] text-base/6
                  text-[#4f4e4a]
                ">
                  Yes, there are some restrictions including prohibited promotional methods and content guidelines. Please refer to our Affiliate Terms of Service for complete details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
      
      <ArenaBattleModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
