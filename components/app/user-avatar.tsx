'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Popover } from '@base-ui/react/popover';
import { Button } from '@/components/base/button';
import { User, LogOut, FileText, Shield } from 'lucide-react';
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
      <Popover.Trigger>
        <div className={`
          flex size-10 cursor-pointer items-center justify-center
          overflow-hidden rounded-full border border-[#e7e6e2]
          bg-[#23d57c] text-white ring-2 ring-transparent
          transition-all hover:ring-[#23d57c]/30
          ${className || ''}
        `}>
          <span className="font-mono text-[16px] font-semibold">
            {getInitial()}
          </span>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className={cn(
            "z-[100] w-56 overflow-hidden rounded-lg border border-gray-200 bg-white p-0 text-gray-900 shadow-lg"
          )}>
            {/* 用户信息 */}
            <div className="border-b border-[#e7e6e2] px-4 py-3">
              <p className="truncate font-mono text-sm font-medium text-[#292827]">
                {user.email || user.user_metadata?.username || 'User'}
              </p>
            </div>

            <div className="p-2">
              <a
                href="https://novita.ai/console"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
                  text-left transition-colors hover:bg-[#f5f5f3]
                "
              >
                <User className="size-4 text-[#666]" />
                <span className="font-mono text-sm text-[#292827]">Account</span>
              </a>
              <button
                onClick={() => setIsHackathonModalOpen(true)}
                className="
                  flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
                  text-left transition-colors hover:bg-[#f5f5f3]
                "
              >
                <FileText className="size-4 text-[#666]" />
                <span className="font-mono text-sm text-[#292827]">Hackathon</span>
              </button>
              <Link
                href="/privacy"
                className="
                  flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
                  text-left transition-colors hover:bg-[#f5f5f3]
                "
              >
                <Shield className="size-4 text-[#666]" />
                <span className="font-mono text-sm text-[#292827]">Privacy</span>
              </Link>

              <div className="mx-2 my-1 h-px bg-[#e7e6e2]" />

              <button
                onClick={handleLogout}
                className="
                  flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2
                  text-left text-red-600 transition-colors hover:bg-red-50
                "
              >
                <LogOut className="size-4" />
                <span className="font-mono text-sm font-medium">Logout</span>
              </button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
      <ArenaBattleModal
        open={isHackathonModalOpen}
        onOpenChange={setIsHackathonModalOpen}
      />
    </Popover.Root>
  );
}
