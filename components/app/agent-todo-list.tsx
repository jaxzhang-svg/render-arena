'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TodoItem {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AgentTodoListProps {
  todos: TodoItem[];
  title?: string;
}

export function AgentTodoList({ todos, title = 'TODO' }: AgentTodoListProps) {
  if (todos.length === 0) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="
          font-['Inter'] text-[14px] font-semibold tracking-wider text-[#364153]
          uppercase
        ">
          {title}
        </h3>
        <span className="font-['Inter'] text-[12px] text-[#99a1af]">
          {todos.filter(t => t.status === 'completed').length}/{todos.length}
        </span>
      </div>

      {/* Todo Items */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 transition-all',
              todo.status === 'completed' && `
                border-[#e5e7eb] bg-white opacity-60
              `,
              todo.status === 'in-progress' && 'border-[#86efac] bg-[#f0fdf4]',
              todo.status === 'pending' && 'border-[#e5e7eb] bg-white'
            )}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {todo.status === 'completed' && (
                <CheckCircle2 className="size-4 text-[#22c55e]" />
              )}
              {todo.status === 'in-progress' && (
                <Loader2 className="size-4 animate-spin text-[#22c55e]" />
              )}
              {todo.status === 'pending' && (
                <Circle className="size-4 text-[#d1d5dc]" />
              )}
            </div>

            {/* Todo Text */}
            <p
              className={cn(
                'flex-1 font-["Inter"] text-[13px] leading-[20px]',
                todo.status === 'completed' && 'text-[#6b7280] line-through',
                todo.status === 'in-progress' && 'font-medium text-[#374151]',
                todo.status === 'pending' && 'text-[#6b7280]'
              )}
            >
              {todo.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
