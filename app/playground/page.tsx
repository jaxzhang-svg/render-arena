'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Video, Share, Maximize, ArrowUp, ArrowLeft, Wallet, SplitSquareHorizontal, Download, Eye, EyeOff, Sliders, Square, Clock } from 'lucide-react';
import { StepIndicator } from '@/components/app/step-indicator';
import { ShareModal } from '@/components/app/share-modal';
import { UserAvatar } from '@/components/app/user-avatar';
import { StepConfig } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [modelA, setModelA] = useState('Claude 3.5');
  const [modelB, setModelB] = useState('GPT-4o');
  const [showInputBar, setShowInputBar] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Generation stats
  const [genStatsA, setGenStatsA] = useState({ time: 0, tokens: 0 });
  const [genStatsB, setGenStatsB] = useState({ time: 0, tokens: 0 });

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMode, setShareMode] = useState<'video' | 'poster'>('poster');

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingTime(0);
      setShowInputBar(true);
      setShareMode('video'); // Set share mode to video after recording
      // Show share modal after recording
      setTimeout(() => setShowShareModal(true), 300);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setShowInputBar(false);
    }
  };

  // Simulate independent generation times
  useEffect(() => {
    if (isGeneratingA) {
      const timer = setTimeout(() => {
        setIsGeneratingA(false);
        // Set mock generation stats for Model A
        setGenStatsA({ time: 3.5, tokens: 1247 });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingA]);

  useEffect(() => {
    if (isGeneratingB) {
      const timer = setTimeout(() => {
        setIsGeneratingB(false);
        // Set mock generation stats for Model B
        setGenStatsB({ time: 4.2, tokens: 1589 });
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingB]);

  const handleGenerate = () => {
    setIsGeneratingA(true);
    setIsGeneratingB(true);
    // Reset stats when starting new generation
    setGenStatsA({ time: 0, tokens: 0 });
    setGenStatsB({ time: 0, tokens: 0 });
  };

  const models = [
    { name: 'Claude 3.5', color: 'bg-emerald-500' },
    { name: 'GPT-4o', color: 'bg-blue-500' },
    { name: 'Llama 3', color: 'bg-purple-500' },
    { name: 'Gemini Pro', color: 'bg-orange-500' },
  ];

  const handleDownload = (modelName: string, content: string) => {
    // Create a blob with the code content
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName.replace(/\s+/g, '-').toLowerCase()}-code.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock generated code for download
  const mockCodeA = `// Generated by ${modelA}
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <h1>Coffee Shop App</h1>
      {/* Your ${modelA} generated code */}
    </div>
  );
}`;

  const mockCodeB = `// Generated by ${modelB}
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900">
      <h1 className="text-white">The Dark Roast</h1>
      {/* Your ${modelB} generated code */}
    </div>
  );
}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/50">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0 z-30">
        {/* Left: Back button */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-muted/80 cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Center: Empty or could add logo/title here */}
        <div className="flex items-center gap-3">
        </div>

        {/* Right: Action buttons + User balance + Avatar */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size={isRecording ? "default" : "icon"}
            className={`rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer ${
              isRecording ? 'gap-2 px-3 h-9' : 'size-9'
            }`}
            onClick={handleRecordToggle}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 fill-red-500 text-red-500" />
                <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <Video className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-lg hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            title="Share"
            onClick={() => {
              setShareMode('poster');
              setShowShareModal(true);
            }}
          >
            <Share className="h-5 w-5" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* User Balance */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">$1,250.00</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* User Avatar */}
          <UserAvatar />
        </div>
      </header>

      <main className="flex flex-1 relative overflow-hidden">
        {/* Left Panel - Preview */}
        <div className="flex flex-1 flex-col min-w-[300px] relative group/panel">

          <div className={`flex-1 m-3 rounded-xl overflow-hidden shadow-sm border bg-muted/30 relative ${
            viewMode === 'split' ? 'flex overflow-x-auto' : ''
          }`}>
             {/* Model A Container */}
             {(viewMode === 'split' || viewMode === 'a') && (
                <div
                  className={`relative transition-all duration-300 bg-background shrink-0 ${
                    viewMode === 'split' ? 'min-w-[600px] w-1/2 border-r border-border' : 'w-full h-full'
                  }`}
                  style={{
                    aspectRatio: viewMode === 'split' ? '4/3' : undefined
                  }}
                >
                   <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                         <span className="text-xs font-medium text-muted-foreground">Claude 3.5</span>
                         {!isGeneratingA && genStatsA.time > 0 && (
                           <>
                             <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-full">
                               <Clock className="h-3 w-3" />
                               {genStatsA.time}s
                             </span>
                             <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-full">
                               <span className="font-semibold">T</span>
                               {genStatsA.tokens.toLocaleString()}
                             </span>
                           </>
                         )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                          onClick={() => handleDownload(modelA, mockCodeA)}
                          title="Download code"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                          onClick={() => setViewMode(viewMode === 'a' ? 'split' : 'a')}
                          title={viewMode === 'a' ? 'Split view' : 'Fullscreen'}
                        >
                          {viewMode === 'a' ? <SplitSquareHorizontal className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                        </Button>
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
                <div
                  className={`relative transition-all duration-300 bg-background shrink-0 ${
                    viewMode === 'split' ? 'min-w-[600px] w-1/2' : 'w-full h-full'
                  }`}
                  style={{
                    aspectRatio: viewMode === 'split' ? '4/3' : undefined
                  }}
                >
                   <div className="absolute top-0 left-0 right-0 h-10 bg-background/60 backdrop-blur border-b flex items-center justify-between px-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-blue-500" />
                         <span className="text-xs font-medium text-muted-foreground">GPT-4o</span>
                         {!isGeneratingB && genStatsB.time > 0 && (
                           <>
                             <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-full">
                               <Clock className="h-3 w-3" />
                               {genStatsB.time}s
                             </span>
                             <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-full">
                               <span className="font-semibold">T</span>
                               {genStatsB.tokens.toLocaleString()}
                             </span>
                           </>
                         )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                          onClick={() => handleDownload(modelB, mockCodeB)}
                          title="Download code"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-foreground/10 cursor-pointer"
                          onClick={() => setViewMode(viewMode === 'b' ? 'split' : 'b')}
                          title={viewMode === 'b' ? 'Split view' : 'Fullscreen'}
                        >
                          {viewMode === 'b' ? <SplitSquareHorizontal className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                        </Button>
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
        {showInputBar && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
            <div className="relative rounded-2xl shadow-2xl bg-background/80 backdrop-blur-xl border border-white/20 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
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
                  <div className="flex items-center gap-2">
                    {/* Model A Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span className="size-2 rounded-full bg-emerald-500" />
                          {modelA}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.name}
                            onClick={() => setModelA(model.name)}
                            className="gap-2 cursor-pointer"
                          >
                            <span className={`size-2 rounded-full ${model.color}`} />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* VS Badge */}
                    <span className="text-xs font-bold text-muted-foreground">VS</span>

                    {/* Model B Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-auto px-2 py-1 text-xs font-semibold border-border rounded-lg transition-colors cursor-pointer hover:bg-foreground hover:text-background"
                        >
                          <span className="size-2 rounded-full bg-blue-500" />
                          {modelB}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.name}
                            onClick={() => setModelB(model.name)}
                            className="gap-2 cursor-pointer"
                          >
                            <span className={`size-2 rounded-full ${model.color}`} />
                            {model.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          Settings
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Model Parameters</h4>
                            <p className="text-xs text-muted-foreground">Configure generation settings for both models</p>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Temperature</label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                defaultValue="0.7"
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Precise</span>
                                <span>0.7</span>
                                <span>Creative</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">Max Tokens</label>
                              <select className="w-full px-3 py-1.5 text-sm border rounded-md bg-background">
                                <option>1024</option>
                                <option>2048</option>
                                <option>4096</option>
                                <option>8192</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-medium">System Prompt</label>
                              <textarea
                                className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-none"
                                rows={3}
                                placeholder="Customize the model's behavior..."
                                defaultValue="You are an expert frontend developer specializing in React and modern web technologies."
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-end">
                            <Button size="sm" className="cursor-pointer">
                              Apply Changes
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setShowInputBar(false)}
                      title="Hide input bar"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show Input Bar Button (when hidden and not recording) */}
        {!showInputBar && !isRecording && (
          <Button
            onClick={() => setShowInputBar(true)}
            size="sm"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 gap-2 px-4 py-2 rounded-full shadow-lg cursor-pointer"
            title="Show input bar"
          >
            <Eye className="h-4 w-4" />
            Show Input
          </Button>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        mode={shareMode}
        appName={`${modelA} vs ${modelB} - ${new Date().toLocaleDateString()}`}
        shareUrl={`novita.ai/battle/${modelA.toLowerCase().replace(/\s+/g, '-')}-vs-${modelB.toLowerCase().replace(/\s+/g, '-')}`}
      />
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
                        alt={`Coffee item ${i}`}
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
            alt="Hero background"
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
