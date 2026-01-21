'use client';

import { loginWithNovita } from '@/hooks/use-auth';
import { LogIn } from 'lucide-react';

interface LoginToastProps {
  message: string;
}

export function LoginToast({ message }: LoginToastProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={() => loginWithNovita()}
        className="flex items-center justify-center gap-2 w-full px-3 py-1.5 bg-[#23D57C] text-white text-xs font-semibold rounded hover:bg-[#1eb86b] transition-colors"
      >
        <LogIn size={14} />
        Login
      </button>
    </div>
  );
}
