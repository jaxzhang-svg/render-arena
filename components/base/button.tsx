'use client';

import { ComponentPropsWithoutRef, forwardRef, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'primary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    const variantStyles = {
      default: 'bg-[#292827] text-white hover:bg-[#3a3938] font-mono rounded-xl',
      primary: 'bg-white text-black hover:bg-white/90 font-sans font-bold rounded-full shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)]',
      outline: 'border border-[#e7e6e2] bg-white text-gray-900 hover:bg-gray-50 font-sans rounded-full',
      ghost: 'hover:bg-gray-100 text-gray-900 font-sans',
      destructive: 'bg-red-500 text-white hover:bg-red-600 font-sans',
      secondary: 'bg-[#23D57C] text-black hover:bg-[#16B063] font-sans',
    };
    
    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-[60px] px-8 text-lg',
      icon: 'h-10 w-10',
    };
    
    const computedClassName = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    );
    
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ...props,
        ...(children.props as Record<string, any>),
        className: cn(computedClassName, (children.props as any).className),
      } as any);
    }
    
    return (
      <button
        ref={ref}
        className={computedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
