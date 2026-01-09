'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/app/app-card';
import { Bolt, Plus, TrendingUp, Clock, Beaker, Box, ArrowRight, Code, Image as ImageIcon, Video, PenTool, Gamepad2, Settings, Sparkles } from 'lucide-react';
import { AppCard as AppCardType, ModelName } from '@/types';
import { Separator } from '@/components/ui/separator';

import { useState, useEffect } from 'react';

const mockApps: AppCardType[] = [
  {
    id: '1',
    title: 'Gravity Data Sim',
    author: 'phys_wiz',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7alA6GSnzYKzv_iaaBMefKcuGt-BkmdeBPvOY92u9GY-TmgSU5wEb_P42t8BvLMnNxVJx-okzDsQsMjXxc09WcJ8ejLlUQOk2yNkF8h4v6fnhSpIssjEf4WtTUFM2MpEhSgXUfpiwH9Fjjqg-jb6K0ssOJ7vwYjJne-U--Sz3Vbd6rKGoz5gEpbsr1-AbjiQ-TsguOACGmJ1s4ZWzTyj4ADWizlpFjLRqpsX6jPszN2reOc53QZUGnC9MzuCQrr3ptjpMn8epE_Q',
    likes: 1200,
  },
  {
    id: '2',
    title: 'Snake 3D Remake',
    author: 'retro_dev',
    model: 'GPT-4o',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRFUClCq6ybiXEKjq22HMXbWLz4q_L7gbZYs4SxYwIfzFWWZzJMvUD2YSPIWrNwmdCPqareipI9KHu79oNhUyKy3C5v6fVVToev9lceJHNFMTfwtkxmF3Jc-HIgBWfkwvdqJe9hz9D43JIAXX7XNdedPoseJ7andHLaf8IqFIJF1f0plJpbg5qwWJgcfToO-hRadiE7RzszYTN3O1-mHoUKPLyPesFlUWWYjT-RQdX9NvJ4FYQIcIdk1IXBd9Bp9Pf4S7Wk0hu_U',
    likes: 850,
  },
  {
    id: '3',
    title: 'Particle Controller',
    author: 'threejs_god',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnVMAVAfPY-z3xydBc4GuaP646hDi3d0JTEOxFh4-ZISxgrX6llG36-AbgsYvMAcVmhbmGPu9Ib2YmWNrnhIjyHaE47I6trYyJ1xk44D_rNQbSMISFwY7PQIixZpaQm3yCOVoTSrMpGz9fNxWFgG4CRvdywfL0CHUqGjSlYhgI4Z5Ptir0riDNgj7NA6ATgdvUqn-PeOsK6K17fbusw3Duq7cNHdEnVM6Ygca472YCz2ilhlw66GskDBlY-KGIDmBZTeZea-tQwdE',
    likes: 2100,
  },
  {
    id: '4',
    title: 'Cloth Physics Demo',
    author: 'sim_master',
    model: 'Llama 3',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6VNqDZan7bxkNmvSno_pJ8p0TnF1grXxABXL15oRk9NOwgMdo8XfzjhW0r_m8DnbE35YCB-BD9NJz6fCInZO_OxnHjuzQOOSy9OlPA_ntO-sybaPiBoN4--WOGOsHdFxLkgqENco3GUHeJ9UzDbZqbggbEXfPGlWCjGgoK8C7ScTWMrLg6s3hv6DWlQm_trv-P87NW5EufWTgfxUq42ZETz2C9OSR_edIX9uS3f6zoF8fTI_w-_X5q7yIQBDYQOAEiTdQBGRV-Y',
    likes: 932,
  },
  {
    id: '5',
    title: 'Fluid Rain Sim',
    author: 'weather_ai',
    model: 'GPT-4o',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDilnTv7FHR-fvz6wlAd_WKWQAS5SD4MRnAQc9LdcYWGZa58a1laOPLNAN1vk2hS5NUhh0I-gaps1OyZa8PtqePVPsrC77fZH6v6IDwy0u5sz3OCOT92TmQEjz02MSJEQkWqshsPKJwaDnB5_f1hkpgz_P4Gi0bEj80qXVKzunBQNVsdbiVq32DZFIuujk9oz7xKjfcPz_YLWbe4TCAKRREy-8XxRaZk9jfNXFpgNycSfbZ6eiArosR6jonNsFkhmyEsZy9us9uPcc',
    likes: 4500,
  },
  {
    id: '6',
    title: 'Pong: Neon Edition',
    author: 'arcade_lover',
    model: 'Claude 3.5',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqGBqc3-YVTMgfmeXXMm0pYx7umPRuT7qhMosgCoIcST2TVDPSMj9utb4wMAKBjGe6VLGpb4Zf_obyAMMBZnz1GMiCxYQa2lF0ROOrde9p249X2LZKU_oxxfK0MVYD8DVGwcH9krPGaCppv4XIfN5lpUVm5Sc33xvUJRO8Ntn8oe0bKwNOG9RJd5OxGhlA5ExhFsJqxNH4gWkEoUkvygtsLr8_WYim4Ffe9FP_d3_ynSDocCxXazq85J43B5as87Z8fULoji_P6aI',
    likes: 156,
  },
];

const categories = [
  { name: 'Trending', icon: TrendingUp },
  { name: 'Newest', icon: Clock },
  { name: 'Physics', icon: Beaker },
  { name: '3D Scenes', icon: Box },
];

const models: ModelName[] = ['Claude 3.5', 'GPT-4o'];

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
    setPlaceholderText('');
    setIsDeleting(false);
    setLoopNum(0);
  }, [activeMode]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center text-primary">
              <Bolt className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Novita Arena
            </h2>
          </Link>
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-transparent transition-all hover:ring-primary cursor-pointer">
              {/* Mock Avatar Image */}
              <img 
                src="https://i.pravatar.cc/150?u=novita" 
                alt="User" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full px-6 py-16 md:py-24">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
            <h1 className="font-display max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-[80px]">
              Generate anything,{' '}
              <span className="relative inline-block text-primary">
                Share the magic
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="10"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="transparent"
                    opacity="0.3"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                </svg>
              </span>
              .
            </h1>
            <p className="max-w-xl text-xl font-normal text-muted-foreground">
              Explore thousands of apps generated by the community. Fork, remix,
              and deploy in seconds.
            </p>

            {/* Smart Input Section */}
            <div className="mt-8 w-full max-w-4xl flex flex-col items-center gap-6">
              {/* Input Box */}
              <div className="relative w-full rounded-3xl border bg-background p-4 shadow-sm transition-shadow hover:shadow-md ring-1 ring-border/50">
                <div className="relative flex flex-col">
                  <textarea
                    placeholder={placeholderText}
                    className="min-h-[120px] w-full resize-none bg-transparent text-lg outline-none placeholder:text-muted-foreground/60 transition-all duration-75"
                  />
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="group relative h-9 w-9 rounded-xl text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-all cursor-pointer"
                        onClick={() => {
                          const currentPrompts = modePrompts[activeMode];
                          const randomPrompt = currentPrompts[Math.floor(Math.random() * currentPrompts.length)];
                          // Note: In a real app we'd want to set this to the input value, 
                          // but for now the typewriter effect controls the placeholder.
                          // Let's force a "refresh" of the typewriter to a random one if possible,
                          // or simpler: just visually feedback for now since functionality wasn't strictly requested to work yet.
                        }}
                      >
                        <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95" />
                        <span className="absolute left-full ml-2 pointer-events-none opacity-0 transform translate-x-[-10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md border animate-in fade-in slide-in-from-left-2 z-50">
                          Surprise me
                        </span>
                      </Button>

                       <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted cursor-pointer">
                        <div className={`h-4 w-4 rounded-full ${modes.find(m => m.label === activeMode)?.color || 'bg-gray-400'}`} />
                        {activeMode}
                      </div>
                    </div>
                    
                    <Link href="/playground">
                      <Button size="icon" className="h-10 w-10 rounded-full shrink-0">
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Inspiration Chips */}
              <div className="w-full overflow-x-auto py-4 -my-4 px-1 scrollbar-hide">
                <div className="flex items-center gap-3">
                  {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = activeMode === mode.label;
                    return (
                      <Button
                        key={mode.label}
                        variant={isActive ? "default" : "outline"}
                        onClick={() => setActiveMode(mode.label)}
                        className={`gap-2 rounded-full h-10 px-6 cursor-pointer transition-transform hover:scale-105 ${
                          isActive 
                            ? "bg-slate-800 text-white hover:bg-slate-700" 
                            : "hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {mode.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <Button
                variant="default"
                className="gap-2 shrink-0 shadow-sm"
                size="sm"
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </Button>

              {categories.slice(1).map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.name}
                    variant="outline"
                    className="gap-2 shrink-0 shadow-sm hover:border-primary hover:text-primary"
                    size="sm"
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}

              <Separator orientation="vertical" className="h-6 mx-2" />

              {models.map((model) => (
                <Button
                  key={model}
                  variant="outline"
                  className="gap-2 shrink-0 bg-accent/10 text-accent hover:bg-accent/20"
                  size="sm"
                >
                  {model}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="bg-muted/30 pb-20 pt-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mockApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Button variant="outline" size="lg" className="gap-2">
                Load more apps
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 Battles.ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
