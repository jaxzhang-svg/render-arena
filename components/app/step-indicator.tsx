'use client';

import { Server, Code, Eye, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepConfig } from '@/types';

const iconMap = {
  check: Check,
  server: Server,
  code: Code,
  eye: Eye,
};

export function StepIndicator({ steps }: { steps: StepConfig[] }) {
  return (
    <div className="relative space-y-4">
      {steps.map((step, index) => {
        const Icon = iconMap[step.icon as keyof typeof iconMap] || Check;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex items-center gap-4">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'absolute top-12 left-6 z-0 h-16 w-px -translate-x-1/2',
                  step.status === 'completed' && 'bg-[#f4f4f5]',
                  step.status === 'in-progress' && 'bg-[#f4f4f5]',
                  step.status === 'pending' && 'bg-[#f4f4f5]'
                )}
              />
            )}
            
            {/* Icon Container */}
            <div
              className={cn(
                `
                  z-10 flex size-12 shrink-0 items-center justify-center
                  rounded-2xl border shadow-sm
                `,
                step.status === 'completed' && 'border-[#e4e4e7] bg-white',
                step.status === 'in-progress' && `
                  border-[#e4e4e7] bg-white
                  shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
                `,
                step.status === 'pending' && 'border-[#e4e4e7] bg-white'
              )}
            >
              <Icon
                className={cn(
                  'size-5',
                  step.status === 'completed' && 'text-[#cbc9c4]',
                  step.status === 'in-progress' && 'text-[#23d57c]',
                  step.status === 'pending' && 'text-[#cbc9c4]'
                )}
              />
            </div>
            
            {/* Content Container */}
            <div
              className={cn(
                'flex-1 rounded-2xl border bg-white p-4 shadow-sm',
                step.status === 'in-progress' && `
                  shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
                `,
                step.status !== 'in-progress' && 'border-[#e4e4e7]'
              )}
            >
              <span
                className={cn(
                  'font-[\'TT_Interphases_Pro\'] text-[16px] font-medium',
                  step.status === 'in-progress' && 'text-[#4f4e4a]',
                  step.status !== 'in-progress' && 'text-[#9e9c98]'
                )}
              >
                {step.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
