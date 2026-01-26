'use client';

import { loginWithNovita } from '@/hooks/use-auth';
import { LogIn } from 'lucide-react';
import { trackAuthLoginInitiated, trackLoginPromptShown } from '@/lib/analytics';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LoginToastProps {
  message: string;
  trigger?: 'quota' | 'publish' | 'like';
}

export function LoginToast({ message, trigger = 'quota' }: LoginToastProps) {
  const pathname = usePathname();

  // Track login prompt shown when component mounts
  useEffect(() => {
    trackLoginPromptShown(trigger);
  }, [trigger]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          trackAuthLoginInitiated('quota_prompt');
          loginWithNovita(pathname);
        }}
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-[#23D57C] text-white text-xs font-semibold rounded hover:bg-[#1eb86b] transition-colors"
      >
        <LogIn size={14} />
        Login
      </button>
    </div>
  );
}
