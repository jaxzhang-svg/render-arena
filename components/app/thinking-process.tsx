'use client';

import { Brain, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface ThinkingStep {
  id: string;
  message: string;
}

export interface ThinkingProcessProps {
  steps: ThinkingStep[];
  isCompleted?: boolean;
  duration?: string;
}

export function ThinkingProcess({
  steps,
  isCompleted = false,
  duration = '4.2s',
}: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-4 ml-14 w-full">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group mb-2 flex h-10 w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="
            flex size-6 items-center justify-center rounded-lg bg-[#f5f5f5]
          ">
            <Brain className="size-4 text-[#4a5565]" />
          </div>
          <span className="
            font-['Inter'] text-[14px] font-medium text-[#364153]
          ">
            Thinking Process
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="
            font-['Inter'] text-[12px] font-medium text-[#99a1af]
          ">
            {duration}
          </span>
          {isExpanded ? (
            <ChevronUp className="size-4 text-[#99a1af]" />
          ) : (
            <ChevronDown className="size-4 text-[#99a1af]" />
          )}
        </div>
      </button>

      {/* Thinking Steps */}
      {isExpanded && (
        <div className="rounded-2xl border border-[#f3f4f6] bg-[#f9fafb] p-4">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-2">
                <span className="
                  shrink-0 font-['Inter'] text-[13px] text-[#d1d5dc]
                ">-</span>
                <p className="
                  font-['Inter'] text-[13px] leading-[21px] text-[#4a5565]
                ">
                  {step.message}
                </p>
              </div>
            ))}
          </div>

          {/* Status Footer */}
          {isCompleted && (
            <div className="
              mt-3 flex items-center gap-1.5 border-t border-[#e5e7eb]/50 pt-3
            ">
              <div className="size-1.5 rounded-full bg-[#00bc7d] opacity-80" />
              <span className="
                font-['Inter'] text-[12px] font-medium text-[#096]
              ">
                Plan formulated
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
