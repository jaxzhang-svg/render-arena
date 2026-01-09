'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Box, Video, Share, RefreshCw, Maximize, ArrowUp, History, Image as ImageIcon, Settings, Circle, Bolt } from 'lucide-react';
import { StepIndicator } from '@/components/app/step-indicator';
import { StepConfig } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

const steps: StepConfig[] = [
  {
    title: 'Analyze Requirements',
    status: 'completed',
    icon: 'check',
  },
  {
    title: 'Generate Component Structure',
    status: 'in-progress',
    icon: 'account-tree',
    codePreview: `<span class="text-purple-600">import</span> <span class="text-gray-800">React</span> <span class="text-purple-600">from</span> <span class="text-green-600">'react'</span>;\n<span class="text-blue-600">const</span> <span class="text-yellow-600">DarkLuxuryApp</span> <span class="text-gray-500">=</span> <span class="text-gray-500">()</span> <span class="text-blue-600">=></span> <span class="text-gray-500">{</span>\n  <span class="text-blue-600">return</span> <span class="text-gray-500">(</span>\n    <span class="text-gray-500 pl-8">&lt;div className="bg-neutral-900..."&gt;</span><span class="w-2 h-3 bg-primary inline-block animate-pulse"></span>`,
  },
  {
    title: 'Apply Tailwind Styles',
    status: 'pending',
    icon: 'brush',
  },
  {
    title: 'Render Preview',
    status: 'pending',
    icon: 'play-circle',
  },
];

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<'a' | 'b' | 'split'>('split');
  const [isGeneratingA, setIsGeneratingA] = useState(true);
  const [isGeneratingB, setIsGeneratingB] = useState(true);

  // Simulate independent generation times
  useEffect(() => {
    if (isGeneratingA) {
      const timer = setTimeout(() => setIsGeneratingA(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingA]);

  useEffect(() => {
    if (isGeneratingB) {
      const timer = setTimeout(() => setIsGeneratingB(false), 4200);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingB]);

  const handleGenerate = () => {
    setIsGeneratingA(true);
    setIsGeneratingB(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-30">
        <div className="flex items-center gap-3 w-64">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bolt className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Novita Arena</h1>
          </Link>
        </div>

        <div className="flex items-center gap-3 w-64 justify-end">
          <Link href="/recording">
            <Button variant="default" size="sm" className="gap-2 h-9">
              <Circle className="h-4 w-4 fill-red-500 text-red-500" />
              Start Recording
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative size-9 rounded-lg bg-muted hover:bg-muted/80">
            <Video className="h-5 w-5" />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-red-500 animate-pulse" />
          </Button>
          <Button variant="ghost" size="icon" className="size-9 rounded-lg bg-muted hover:bg-muted/80">
            <Share className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <div className="size-9 rounded-full bg-gradient-to-br from-primary to-accent ring-2 ring-background shadow-sm cursor-pointer" />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex flex-1 flex-col min-w-[300px] relative group/panel">
          {/* View Controls Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center p-1 rounded-lg bg-background/80 backdrop-blur border shadow-sm transition-opacity duration-200 opacity-0 group-hover/panel:opacity-100">
             <div className="flex items-center gap-1">
                <Button 
                  onClick={() => setViewMode('a')}
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium ${viewMode === 'a' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Model A
                </Button>
                <div className="w-px h-4 bg-border/50" />
                 <Button 
                  onClick={() => setViewMode('split')}
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium ${viewMode === 'split' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Split
                </Button>
                <div className="w-px h-4 bg-border/50" />
                 <Button 
                  onClick={() => setViewMode('b')}
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium ${viewMode === 'b' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Model B
                </Button>
             </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/panel:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="icon" className="bg-background/90 backdrop-blur shadow-sm border hover:text-primary h-8 w-8" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-background/90 backdrop-blur shadow-sm border hover:text-primary h-8 w-8" title="Fullscreen">
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-muted/30 relative flex">
             {/* Model A Container */}
             {(viewMode === 'split' || viewMode === 'a') && (
                <div className={`relative h-full transition-all duration-300 ${viewMode === 'split' ? 'w-1/2 border-r' : 'w-full'}`}>
                   <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                         <span className="text-xs font-medium text-muted-foreground">Claude 3.5</span>
                      </div>
                   </div>
                   
                   {isGeneratingA ? (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                       <div className="w-full max-w-sm">
                         <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Processing</span>
                            <span className="flex size-2 relative">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                            </span>
                         </div>
                         <StepIndicator steps={steps} />
                       </div>
                     </div>
                   ) : (
                     <div className="w-full h-full overflow-y-auto bg-muted/10 p-4">
                        <MockDesignA />
                     </div>
                   )}
                </div>
             )}
             
             {/* Model B Container */}
              {(viewMode === 'split' || viewMode === 'b') && (
                <div className={`relative h-full transition-all duration-300 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                   <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-blue-500" />
                         <span className="text-xs font-medium text-muted-foreground">GPT-4o</span>
                      </div>
                   </div>
                   
                   {isGeneratingB ? (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-background/50 p-8">
                       <div className="w-full max-w-sm">
                         <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Processing</span>
                            <span className="flex size-2 relative">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full size-2 bg-blue-500" />
                            </span>
                         </div>
                         <StepIndicator steps={steps} />
                       </div>
                     </div>
                   ) : (
                     <div className="w-full h-full overflow-y-auto bg-muted/10 p-4">
                        <MockDesignB />
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
          <div className="relative rounded-2xl shadow-2xl bg-background/80 backdrop-blur-xl border border-white/20 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden group/input transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
             <div className="flex flex-col p-1">
              <div className="flex items-end gap-2 p-2">
                <div className="flex-1 min-h-[56px] relative">
                  <Textarea
                    placeholder="Describe the app you want to build..."
                    className="w-full h-14 min-h-[56px] max-h-40 bg-transparent border-0 resize-none focus-visible:ring-0 p-2 text-base leading-relaxed placeholder:text-muted-foreground/50 font-medium"
                    defaultValue="Make a mobile ordering app for a coffee shop. Left one should be modern minimal white, right one should be dark mode luxury."
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  size="icon"
                  className="mb-1 size-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 group shrink-0"
                >
                  <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>

              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 px-3 py-1.5 h-auto text-xs font-semibold bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all rounded-lg"
                      >
                        <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        GPT-4o
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>Claude 3.5</DropdownMenuItem>
                      <DropdownMenuItem>Llama 3</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Separator orientation="vertical" className="h-4 mx-2 bg-border/50" />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    History
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Reference
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock Design A: Minimal List (White Theme)
function MockDesignA() {
  return (
    <div className="max-w-xs mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border mt-8 min-h-[500px]">
       <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <span className="font-bold text-lg tracking-tight text-neutral-900">BREW.</span>
             <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-neutral-900" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-6 text-neutral-900">Good Morning,<br/>Alex</h2>
          
          <div className="space-y-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer group">
                   <div className="w-16 h-16 rounded-xl bg-neutral-200 overflow-hidden relative">
                      <img 
                        src={`https://images.unsplash.com/photo-${i === 1 ? '1541167760496-1628856ab772' : i === 2 ? '1495474472287-4d71bcdd2085' : '1509042239860-f550ce710b93'}?q=80&w=200&auto=format&fit=crop`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                   </div>
                   <div className="flex-1">
                      <h3 className="font-bold text-neutral-900">Cappuccino</h3>
                      <p className="text-xs text-neutral-500">With oat milk</p>
                   </div>
                   <span className="font-semibold text-neutral-900">$4.50</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

// Mock Design B: Immersive Grid (Dark Theme)
function MockDesignB() {
  return (
    <div className="max-w-xs mx-auto bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-neutral-800 mt-8 min-h-[500px] relative">
       {/* Hero Background */}
       <div className="absolute top-0 left-0 right-0 h-2/3">
          <img 
            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/50 to-neutral-900" />
       </div>

       <div className="relative z-10 p-6 flex flex-col h-full justify-end">
          <div className="mb-auto pt-4 flex justify-between text-white/80">
             <span className="font-mono text-xs">MENU</span>
             <span className="font-mono text-xs">CART (0)</span>
          </div>

          <h2 className="text-4xl font-black text-white mb-2 leading-none">THE<br/>DARK<br/>ROAST</h2>
          <p className="text-white/60 text-sm mb-6 max-w-[80%]">Premium beans sourced from the highlands of Ethiopia.</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
             <div className="aspect-square rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex flex-col justify-center items-center p-2 hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-2xl mb-1">☕</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Order</span>
             </div>
             <div className="aspect-square rounded-2xl bg-[#D4AF37] text-neutral-900 flex flex-col justify-center items-center p-2 hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#D4AF37]/20">
                <span className="text-2xl mb-1">★</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Rewards</span>
             </div>
          </div>
       </div>
    </div>
  );
}
