'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { Popover } from '@base-ui/react/popover';
import { Button } from '@/components/base/button';
import { useAuth, loginWithNovita } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { ArenaBattleModal } from './arena-battle-modal';

interface UserAvatarProps {
  className?: string;
}

/**
 * 用户头像组件
 * 
 * - 未登录：显示 "Login" 按钮
 * - 已登录：显示用户 email 首字母的头像，点击弹出菜单
 */
export function UserAvatar({ className }: UserAvatarProps) {
  const { user, loading, logout } = useAuth();
  const [isHackathonModalOpen, setIsHackathonModalOpen] = useState(false);
  const popoverTriggerId = useId();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  // 加载中状态
  if (loading) {
    return (
      <div className={`
        size-10 animate-pulse rounded-full bg-[#e7e6e2]
        ${className || ''}
      `} />
    );
  }

  // 未登录状态：显示 Login 按钮
  if (!user) {
    return (
      <Button
        onClick={() => loginWithNovita()}
        variant="outline"
        className="
          border-[#e7e6e2] font-mono text-[14px] leading-[16px] text-[#292827]
          hover:border-[#23d57c] hover:text-[#23d57c]
        "
      >
        Login
      </Button>
    );
  }

  // 获取用户首字母
  const getInitial = () => {
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    if (user.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    await logout();
  };

  // 已登录状态：显示头像
  return (
    <Popover.Root>
      <div className="relative" ref={setContainer}>
        <Popover.Trigger id={popoverTriggerId}>
          <div className={`
          flex size-8 cursor-pointer items-center justify-center
          overflow-hidden rounded-full border border-[#e7e6e2]
          bg-black text-white ring-2 ring-transparent
          transition-all hover:ring-[#23d57c]/30
          ${className || ''}
        `}>
            <span className="font-mono text-[14px] font-semibold">
              {getInitial()}
            </span>
          </div>
        </Popover.Trigger>
        <Popover.Portal container={container}>
          <Popover.Positioner sideOffset={8} align="end">
            <Popover.Popup className={cn(
              "z-[100] w-[260px] overflow-hidden rounded-md border border-[#e7e6e2] bg-white p-2 text-[#292827] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
            )}>
              {/* Top: Email + Copy */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="truncate font-sans text-[16px] font-medium leading-[20px]">
                  {user.email || user.user_metadata?.username || 'User'}
                </span>
                <button
                  onClick={() => {
                    if (user.email) {
                      navigator.clipboard.writeText(user.email);
                    }
                  }}
                  className="ml-2 flex size-4 items-center justify-center text-gray-500 hover:text-black cursor-pointer"
                  title="Copy email"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.33333 0.666667H4.66667C3.92933 0.666667 3.33333 1.26267 3.33333 2V3.33333H2C1.26267 3.33333 0.666667 3.92933 0.666667 4.66667V12C0.666667 12.7373 1.26267 13.3333 2 13.3333H9.33333C10.0707 13.3333 10.6667 12.7373 10.6667 12V10.6667H12C12.7373 10.6667 13.3333 10.0707 13.3333 9.33333V2C13.3333 1.26267 12.7373 0.666667 12 0.666667H9.33333ZM9.33333 12H2V4.66667H9.33333V12ZM12 9.33333H10.6667V4.66667C10.6667 3.92933 10.0707 3.33333 9.33333 3.33333H3.33333V2H12V9.33333Z" fill="currentColor" />
                  </svg>
                </button>
              </div>

              <div className="my-[4px] h-px bg-[#e7e6e2]" />

              <a
                href="https://novita.ai"
                target="_blank"
                className="block cursor-pointer rounded px-3 py-2 text-[14px] leading-[20px] text-[#0F172A] hover:bg-[#F4F4F5]"
              >
                Go to Novita.ai
              </a>

              <div className="my-[4px] h-px bg-[#e7e6e2]" />

              <div className="flex flex-col gap-[2px]">
                <a
                  href="https://novita.ai/console"
                  target="_blank"
                  className="cursor-pointer rounded px-3 py-2 text-[14px] leading-[20px] text-[#0F172A] hover:bg-[#F4F4F5]"
                >
                  Account Setting
                </a>
                <button
                  onClick={() => setIsHackathonModalOpen(true)}
                  className="w-full cursor-pointer rounded px-3 py-2 text-left text-[14px] leading-[20px] text-[#0F172A] hover:bg-[#F4F4F5]"
                >
                  Hackathon
                </button>
                <Link
                  href="https://novita.ai/legal/privacy-policy"
                  target="_blank"
                  className="block cursor-pointer rounded px-3 py-2 text-[14px] leading-[20px] text-[#0F172A] hover:bg-[#F4F4F5]"
                >
                  Privacy
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer rounded px-3 py-2 text-left text-[14px] leading-[20px] text-[#0F172A] hover:bg-[#F4F4F5]"
                >
                  Log Out
                </button>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </div>
      <ArenaBattleModal
        open={isHackathonModalOpen}
        onOpenChange={setIsHackathonModalOpen}
      />
    </Popover.Root>
  );
}
