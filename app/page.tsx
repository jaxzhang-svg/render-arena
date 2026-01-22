'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/app/header';
import { Footer } from '@/components/app/footer';
import { ArenaBattleModal } from '@/components/app/arena-battle-modal';
import { GalleryGrid } from '@/components/app/gallery-grid';
import { Clock, Box, ArrowRight, ChevronUp, Sparkles, Trophy, Users, Zap, ZapIcon } from 'lucide-react';
import { Accordion } from '@base-ui/react/accordion';

import { useState, useEffect, useId } from 'react';
import { Button } from '@/components/base/button';
import { FeaturedCasesSection } from '@/components/app/featured-case';

import { playgroundModes, getCategoryFromModeLabel, galleryCategories, type GalleryCategoryId, HACKATHON_END_TIME, HACKATHON_PARTICIPANTS } from '@/lib/config';

export default function HomePage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState('Physics Playground');
  const [userPrompt, setUserPrompt] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategoryId>('all');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(HACKATHON_END_TIME).getTime() - new Date().getTime();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        if (days > 0) {
            setTimeLeft(`${days} days left`);
        } else {
             const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
             setTimeLeft(`${hours} hours left`);
        }
      } else {
        setTimeLeft('Ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); 
    return () => clearInterval(timer);
  }, []);
  
  // Generate stable IDs for accordion triggers
  const accordionId0 = useId();
  const accordionId1 = useId();
  const accordionId2 = useId();
  const accordionId3 = useId();


  const handleGenerate = () => {
    const promptToUse = userPrompt.trim() || placeholderText.trim();
    const category = getCategoryFromModeLabel(activeMode);
    if (promptToUse) {
      router.push(`/playground/new?prompt=${encodeURIComponent(promptToUse)}&category=${encodeURIComponent(category)}&autoStart=true`);
    } else {
      router.push(`/playground/new?category=${encodeURIComponent(category)}`);
    }
  };

  const handleSurpriseMe = () => {
    const currentMode = playgroundModes.find(m => m.label === activeMode);
    const activePrompts = currentMode?.prompts || [];
    if (activePrompts.length > 0) {
      const availablePrompts = activePrompts.filter(p => p !== userPrompt);
      const candidates = availablePrompts.length > 0 ? availablePrompts : activePrompts;
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const randomPrompt = candidates[randomIndex];
      setUserPrompt(randomPrompt);
    }
  };

  useEffect(() => {
    const currentMode = playgroundModes.find(m => m.label === activeMode);
    const activePrompts = currentMode?.prompts || [];
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
        <section id="home" className="relative w-full px-6 py-16">
          <div className="
            mx-auto flex max-w-4xl flex-col items-center gap-4 text-center
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
                RenderArena · Live Model Battles
              </span>
            </div>

            {/* Heading */}
            <h1 className="
              max-w-[820px] font-sans text-[58px]
              leading-[64px] font-semibold tracking-[-1.6px] text-[#292827]
            ">
              <span>One Prompt</span>
              <br />
              <span>Multiple Models, Side by Side</span>
            </h1>

            {/* Subtitle */}
            <p className="
              max-w-[820px] font-sans text-lg/6
              font-normal text-[#4f4e4a]
            ">
              Test how different models render the same idea. Compare, judge, and share the results.
            </p>

            {/* Featured Case */}
            <FeaturedCasesSection />

            {/* Textarea Input Section */}
            <div className="
              flex w-full max-w-[787px] flex-col items-center gap-8
            ">
              <div 
                className={`
                  relative w-full
                  border border-[#e7e6e2] bg-white shadow-sm overflow-hidden
                  ${(userPrompt.length > 38 || userPrompt.includes('\n')) 
                    ? 'rounded-[32px] p-6 flex flex-col items-start' // Multi-line state
                    : 'rounded-full px-2 pl-4 py-2 flex items-center gap-3' // One-line state
                  }
                `}
              >
                {/* Mode Badge - Position depends on state */}
                <div className={`
                  inline-flex items-center gap-2 rounded-full px-3 py-1.5 shrink-0 transition-colors bg-gray-100 text-gray-700
                  ${(userPrompt.length > 38 || userPrompt.includes('\n')) ? 'mb-4' : ''}
                `}>
                  <div className={`size-2 rounded-full ${(() => {
                    const mode = playgroundModes.find(m => m.label === activeMode);
                    return mode?.theme?.dot || 'bg-gray-500';
                  })()}`} />
                  <span className="font-sans text-sm font-medium">
                    {playgroundModes.find(m => m.label === activeMode)?.label || activeMode}
                  </span>
                </div>

                {/* Input Area */}
                <div className={`relative flex-1 ${(userPrompt.length > 38 || userPrompt.includes('\n')) ? 'w-full min-h-[120px]' : 'h-full flex items-center'}`}>
                  <textarea
                    value={userPrompt}
                    placeholder={"Enter a prompt to start the Arena battle."}
                    onChange={(e) => {
                      setUserPrompt(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    className={`
                      w-full bg-transparent font-sans text-base
                      font-normal text-[#4f4e4a] outline-none
                      placeholder:text-[#9e9c98] resize-none
                      ${(userPrompt.length > 38 || userPrompt.includes('\n')) 
                        ? 'h-full' 
                        : 'h-[28px] overflow-hidden leading-[28px]'
                      }
                    `}
                    spellCheck={false}
                  />
                </div>

                {/* Actions - Position depends on state */}
                <div className={`
                  flex items-center gap-3
                  ${(userPrompt.length > 38 || userPrompt.includes('\n')) 
                    ? 'absolute bottom-6 right-6' 
                    : 'shrink-0'
                  }
                `}>
                  <button 
                    onClick={handleSurpriseMe}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[#4f4e4a] bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Surprise me"
                  >
                    <Sparkles className="size-5 text-yellow-500" />
                    <span className="text-sm font-medium">Surprise me</span>
                  </button>
                  
                  <Button 
                    onClick={handleGenerate}
                    disabled={!userPrompt.trim()}
                    className={`
                      flex items-center justify-center gap-2 rounded-full
                      pl-5 pr-4 py-2.5
                      font-mono text-base font-normal transition-all
                      bg-[#1a1a1a] text-white hover:bg-black
                      hover:shadow-lg hover:scale-[1.02]
                      active:scale-[0.98]
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                    `}
                  >
                    <span>Run Arena</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Category Buttons */}
              <div className="
                flex w-full flex-wrap items-center justify-center gap-3
              ">
                {playgroundModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.label;
                  return (
                    <button
                      key={mode.label}
                      onClick={() => setActiveMode(mode.label)}
                      className={`
                        flex cursor-pointer items-center gap-2 rounded-full border px-4
                        py-2 transition-all duration-200 text-[#4f4e4a]
                        ${
                        isActive
                          ? "border-[#23D57C] bg-[#CAF6E0]"
                          : `border-[#e7e6e2] bg-white hover:bg-gray-50`
                        }
                      `}
                    >
                      <Icon className="size-4" />
                      <span className="
                        font-sans text-sm font-medium
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
        <section id="hackathon" className="px-6 py-4">
          <div className="mx-auto max-w-[1254px]">
            <div className="
              relative h-[380px] overflow-hidden rounded-[32px] border
              border-white/10 bg-black shadow-2xl
            ">
              {/* Background container image (grid/line pattern) */}
              <div className="absolute left-0 top-0 h-[368px] w-[1253px] opacity-40">
                <img 
                  alt="" 
                  className="absolute inset-0 max-w-none object-cover opacity-70 pointer-events-none size-full" 
                  src="/images/hackathon-bg-container.png" 
                />
              </div>

              {/* Main artistic background image */}
              <div className="absolute left-1/2 top-1/2 h-[380px] w-[1248px] -translate-x-1/2 -translate-y-1/2 rounded-md">
                <div className="absolute inset-0 bg-black rounded-md" />
                <img 
                  alt="" 
                  className="absolute max-w-none object-cover opacity-60 rounded-md size-full" 
                  src="/images/hackathon-bg-main.png" 
                />
                {/* Green Blur Effect */}
                <div className="absolute inset-0 bg-[rgba(0,188,125,0.05)] blur-[120px] pointer-events-none" />
              </div>

              {/* Content */}
              <div className="relative h-full p-12 flex flex-col">
                {/* Prize Pool Badge */}
                <div className="
                  relative inline-flex items-center rounded-full border border-[#05df72]/30
                  bg-[#05df72]/10 pr-6 py-2 w-fit mb-6 backdrop-blur-sm
                  h-[42px] ml-4
                ">
                  <img 
                     src="/logo/prize-pool.png" 
                     alt="Prize Pool"
                     className="absolute bottom-2 left-2 w-10 max-w-none drop-shadow-md"
                   />
                  <div className="font-sans text-sm font-medium flex items-center gap-1 pl-12">
                    <span className="text-[#05df72]">Prize Pool:</span>
                    <span className="text-white">$1,650 Credits</span>
                  </div>
                </div>

                <div className="max-w-[700px]">
                  {/* Heading */}
                  <h2 className="
                    font-sans text-[56px]
                    leading-[56px] font-semibold tracking-[-1.12px] text-white
                    mb-2
                  ">
                    Novita Arena Battle
                  </h2>

                  {/* Subheading */}
                  <div className="
                    flex flex-wrap items-center font-sans
                    text-[32px] leading-[40px] font-semibold tracking-[-0.64px]
                    mb-6 gap-x-2
                  ">
                    <span className="text-[#d1d5dc]">Build it.</span>
                    <span className="text-[#f3f4f6]">Compare it.</span>
                    <span className="
                      text-[#05df72]
                    ">
                      Make it glow.
                    </span>
                  </div>

                  {/* Description */}
                  <div className="border-l-2 border-[#00c950]/30 pl-4 mb-8">
                    <p className="
                      max-w-[570px] font-sans
                      text-[18px] leading-6 font-normal text-[#cbc9c4]
                    ">
                      A 14-day fully remote battle. Arena battle focused on visual comparison, vibes, and shareability — not machines but artistic vibes.
                    </p>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-4">
                    {/* Time Left */}
                    <div className="
                      flex items-center gap-2 rounded-[10px] border border-white/10
                      bg-white/5 px-3 py-1.5 h-[34px]
                    ">
                      <Clock className="size-4 text-primary" />
                      <span className="font-sans text-[16px] font-medium text-[#f5f5f5]">
                        Coming soon
                        {/* {timeLeft || '...'} */}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="
                      flex items-center gap-2 rounded-[10px] border border-white/10
                      bg-white/5 px-3 py-1.5 h-[34px]
                    ">
                      <Users className="size-4 text-primary" />
                      <span className="font-sans text-[16px] font-medium text-[#f5f5f5]">
                         120 Interested
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join Button - Bottom Right */}
                <div className="absolute bottom-12 right-12">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="
                      flex cursor-pointer items-center justify-center gap-2 rounded-[14px]
                      px-8 py-3.5 text-base
                      leading-6 font-normal text-black
                      border border-white/20
                      transition-all hover:brightness-110
                    "
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

        {/* Gallery Grid */}
        <section id="gallery" className="pt-16 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Gallery Header */}
            <div className="mb-8 flex items-center justify-between">
              <h2 className="
                font-sans text-[48px]
                leading-[48px] font-semibold tracking-[-0.96px] text-[#292827]
              ">
                Arena Gallery
              </h2>

              <div className="flex gap-2 bg-gray-100/50 p-1 rounded-full">
                {galleryCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setGalleryCategory(cat.id)}
                    className={`
                      flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium font-sans transition-all
                      ${galleryCategory === cat.id
                        ? 'bg-white text-foreground shadow-sm ring-1 ring-black/5'
                        : 'text-muted-foreground hover:bg-gray-200/50 hover:text-foreground'
                      }
                    `}
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
            <h2 className="
              mb-12 text-center font-sans
              text-[48px] leading-[48px] font-semibold tracking-[-0.96px]
              text-[#101828]
            ">
              Frequently Asked Questions
            </h2>

            <Accordion.Root defaultValue={[]} className="w-full space-y-2">
              <Accordion.Item value="item-0" className="rounded-[10px] border-none bg-[#f9fafb] overflow-hidden">
                <Accordion.Trigger id={accordionId0} className="
                  flex items-center justify-between w-full h-[72.75px] px-6 py-0
                  font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px]
                  hover:no-underline aria-expanded:text-[#23d57c] text-[#1e2939]
                  group transition-colors cursor-pointer
                  hover:bg-[#f0f0ed]
                ">
                  <span>What am I supposed to do here?</span>
                  <ChevronUp className="size-5 group-aria-expanded:rotate-0 rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] px-6 py-4
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  <p>Model Arena lets you submit a single task (prompt) and watch two models attempt to solve it under identical conditions.</p>
                  <p className="mt-2">Instead of chatting, you observe how models:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>reason about the task</li>
                    <li>generate code or logic</li>
                    <li>build and execute a real solution</li>
                  </ul>
                  <p className="mt-2">Think of it as models proving themselves by doing real work.</p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-1" className="
                rounded-[10px] border-none bg-[#f9fafb] overflow-hidden
              ">
                <Accordion.Trigger id={accordionId1} className="
                  flex items-center justify-between w-full h-[72.75px] px-6 py-0
                  font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px]
                  hover:no-underline aria-expanded:text-[#23d57c] text-[#1e2939]
                  group transition-colors cursor-pointer
                  hover:bg-[#f0f0ed]
                ">
                  <span>Is this a real build or just a demo simulation?</span>
                  <ChevronUp className="size-5 group-aria-expanded:rotate-0 rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] px-6 py-4
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  <p>This is a real execution, not a mock or animation.</p>
                  <p className="mt-2">Models:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>generate actual code</li>
                    <li>run inside an isolated sandbox</li>
                    <li>build and launch real previews when applicable</li>
                  </ul>
                  <p className="mt-2">Failures, delays, and unexpected behavior are all part of the evaluation — and often the most informative signals.</p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-2" className="
                rounded-[10px] border-none bg-[#f9fafb] overflow-hidden
              ">
                <Accordion.Trigger id={accordionId2} className="
                  flex items-center justify-between w-full h-[72.75px] px-6 py-0
                  font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px]
                  hover:no-underline aria-expanded:text-[#23d57c] text-[#1e2939]
                  group transition-colors cursor-pointer
                  hover:bg-[#f0f0ed]
                ">
                  <span>How should I decide which model is better?</span>
                  <ChevronUp className="size-5 group-aria-expanded:rotate-0 rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] px-6 py-4
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  <p>Model Arena does not assign scores or rankings.</p>
                  <p className="mt-2">You evaluate models based on:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Task completion — does it actually work?</li>
                    <li>Engineering judgment — are the decisions reasonable?</li>
                    <li>Creativity & robustness — does it handle edge cases or go beyond expectations?</li>
                  </ul>
                  <p className="mt-2">The best model is the one you’d trust in a real project.</p>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="item-3" className="
                rounded-[10px] border-none bg-[#f9fafb] overflow-hidden
              ">
                <Accordion.Trigger id={accordionId3} className="
                  flex items-center justify-between w-full h-[72.75px] px-6 py-0
                  font-sans text-xl
                  leading-6 font-semibold tracking-[-0.4px]
                  hover:no-underline aria-expanded:text-[#23d57c] text-[#1e2939]
                  group transition-colors cursor-pointer
                  hover:bg-[#f0f0ed]
                ">
                  <span>Can I reuse or share what I see here?</span>
                  <ChevronUp className="size-5 group-aria-expanded:rotate-0 rotate-180 transition-transform" />
                </Accordion.Trigger>
                <Accordion.Panel className="
                  border-t border-[#f3f4f6] px-6 py-4
                  font-sans text-base
                  leading-6 text-[#4f4e4a]
                ">
                  <p>Yes — and you’re encouraged to.</p>
                  <p className="mt-2">You can:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>inspect generated outputs</li>
                    <li>rerun tasks with modified prompts</li>
                    <li>share results via demos, blogs, or social posts</li>
                  </ul>
                  <p className="mt-2">Model Arena is designed for reproducible, shareable model experiments.</p>
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
