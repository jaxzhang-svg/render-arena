'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, LogOut, FileText, Shield } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({ avatarUrl = 'https://i.pravatar.cc/150?u=novita', className }: UserAvatarProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={`h-10 w-10 overflow-hidden rounded-full border border-border bg-muted ring-2 ring-transparent transition-all hover:ring-primary cursor-pointer ${className || ''}`}>
          <img
            src={avatarUrl}
            alt="User"
            className="h-full w-full object-cover"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">账户中心</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">活动说明</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">隐私政策</span>
          </button>
          <div className="h-px bg-border my-1 mx-2" />
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left text-destructive">
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">退出</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
