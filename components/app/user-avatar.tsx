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
        <div className={`
          border-border bg-muted
          hover:ring-primary
          size-10 cursor-pointer overflow-hidden rounded-full border ring-2
          ring-transparent transition-all
          ${className || ''}
        `}>
          <img
            src={avatarUrl}
            alt="User"
            className="size-full object-cover"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end">
        <div className="p-2">
          <button className="
            hover:bg-muted
            flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
            text-left transition-colors
          ">
            <User className="size-4" />
            <span className="text-sm font-medium">账户中心</span>
          </button>
          <button className="
            hover:bg-muted
            flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
            text-left transition-colors
          ">
            <FileText className="size-4" />
            <span className="text-sm font-medium">活动说明</span>
          </button>
          <button className="
            hover:bg-muted
            flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
            text-left transition-colors
          ">
            <Shield className="size-4" />
            <span className="text-sm font-medium">隐私政策</span>
          </button>
          <div className="bg-border mx-2 my-1 h-px" />
          <button className="
            hover:bg-muted
            text-destructive flex w-full cursor-pointer items-center gap-3
            rounded-lg px-3 py-2 text-left transition-colors
          ">
            <LogOut className="size-4" />
            <span className="text-sm font-medium">退出</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
