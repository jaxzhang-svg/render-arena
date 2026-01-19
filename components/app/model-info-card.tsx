import { Coins, Timer } from 'lucide-react';
import { ModelName } from '@/types';
import { cn } from '@/lib/utils';

interface ModelInfoCardProps {
  model: ModelName;
  tokens: string;
  time: string;
}

const modelColors: Record<ModelName, string> = {
  'Claude 3.5': 'bg-purple-500',
  'GPT-4o': 'bg-green-500',
  'Llama 3': 'bg-orange-500',
  'DeepSeek': 'bg-blue-500',
  'GLM-4': 'bg-red-500',
  'Mistral': 'bg-cyan-500',
};

export function ModelInfoCard({ model, tokens, time }: ModelInfoCardProps) {
  return (
    <div className="
      border-border absolute bottom-4 left-4 flex min-w-[200px] flex-col gap-1
      rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur-md
      dark:bg-black/80
    ">
      <div className="mb-1 flex items-center gap-2">
        <div className={cn('size-2 rounded-full', modelColors[model])} />
        <span className="text-xs font-bold tracking-wide uppercase">
          {model}
        </span>
      </div>
      <div className="
        text-muted-foreground flex items-center justify-between font-mono
        text-xs
      ">
        <div className="flex items-center gap-1">
          <Coins className="size-3.5" />
          <span>{tokens}</span>
        </div>
        <div className="flex items-center gap-1">
          <Timer className="size-3.5" />
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
