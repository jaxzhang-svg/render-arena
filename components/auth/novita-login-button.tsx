'use client';

import { loginWithNovita } from '@/hooks/use-auth';
import { Button } from '@/components/base/button';

interface NovitaLoginButtonProps {
  next?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Novita 登录按钮组件
 * 
 * 点击后跳转到 Novita 登录页面，登录成功后返回应用
 */
export function NovitaLoginButton({ 
  next, 
  className,
  children = '使用 Novita 登录'
}: NovitaLoginButtonProps) {
  const handleLogin = () => {
    loginWithNovita(next);
  };

  return (
    <Button 
      onClick={handleLogin}
      variant="outline" 
        className="
        border-[#e7e6e2] font-mono text-[14px] leading-[16px] text-[#292827]
        hover:border-[#23d57c] hover:text-[#23d57c]
        "
    >
      {children}
    </Button>
  );
}
