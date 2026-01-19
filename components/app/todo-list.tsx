'use client';

import { Loader2, Server, Code, Rocket, Brain, MessageSquare, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThinkingProcess, ThinkingStep } from './thinking-process';

export type MainStepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

export interface MainStep {
  id: string;
  title: string;
  status: MainStepStatus;
  icon: typeof Server;
}

export interface AgentTodo {
  id: string;
  content: string;
  status: 'pending' | 'in-progress' | 'completed';
  activeForm: string;
}

export type AgentLogType =
  | 'info'              // General information
  | 'thinking'          // Claude's internal thinking
  | 'output'            // Claude's text response
  | 'tool_use'          // Tool being called
  | 'tool_executing'    // Tool is executing
  | 'tool_completed'    // Tool execution completed
  | 'success'           // Success message
  | 'error';            // Error message

export interface AgentLog {
  id: string;
  type: AgentLogType;
  message: string;
  timestamp: number;
}

export interface TodoListProps {
  mainSteps: MainStep[];
  activeStepId?: string;
  agentTodos?: AgentTodo[];
  agentLogs?: AgentLog[];
  thinkingSteps?: ThinkingStep[];
  error?: string;
}

const stepIcons = {
  creating: Server,
  building: Code,
  preview: Rocket,
};

const logIcons = {
  info: Info,
  thinking: Brain,
  output: MessageSquare,
  tool_use: AlertCircle,
  tool_executing: Loader2,
  tool_completed: CheckCircle2,
  success: CheckCircle2,
  error: AlertCircle,
};

const logEmojis = {
  info: 'ℹ️',
  thinking: '🧠',
  output: '💬',
  tool_use: '🔧',
  tool_executing: '⚙️',
  tool_completed: '✅',
  success: '✨',
  error: '❌',
};

export function TodoList({
  mainSteps,
  activeStepId,
  agentTodos = [],
  agentLogs = [],
  thinkingSteps = [],
  error,
}: TodoListProps) {
  return (
    <div className="relative space-y-4">
      {mainSteps.map((step, index) => {
        const isLast = index === mainSteps.length - 1;
        const isActive = step.status === 'in-progress';
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';

        return (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              {/* Connector line container */}
              <div className="flex shrink-0 flex-col items-center">
                {/* Icon Container */}
                <div
                  className={cn(
                    `
                      z-10 flex size-10 items-center justify-center rounded-2xl
                      border shadow-sm
                    `,
                    isCompleted && 'border-[#e5e7eb] bg-[#f9fafb]',
                    isActive && `
                      border-[#caf6e0] bg-[#caf6e0]
                      shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
                    `,
                    step.status === 'pending' && 'border-[#f3f4f6] bg-white',
                    isError && 'border-red-200 bg-red-50'
                  )}
                >
                  {isActive ? (
                    <Loader2 className="size-5 animate-spin text-[#23d57c]" />
                  ) : (
                    <step.icon
                      className={cn(
                        'size-5',
                        isCompleted && 'text-[#9ca3af]',
                        isActive && 'text-[#23d57c]',
                        step.status === 'pending' && 'text-[#d1d5dc]',
                        isError && 'text-red-500'
                      )}
                    />
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="mt-2 w-px flex-1 bg-[#f3f4f6]" style={{ minHeight: isActive && step.id === 'building' ? '400px' : '30px' }} />
                )}
              </div>

              {/* Content Container */}
              <div className="flex-1 pb-4">
                <div
                  className={cn(
                    `
                      flex h-[46px] items-center gap-3 rounded-2xl border
                      bg-white px-4 shadow-sm
                    `,
                    isActive && `
                      border-[#e5e7eb]
                      shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]
                    `,
                    step.status !== 'in-progress' && 'border-[#e5e7eb]',
                    isError && 'border-red-500/50 bg-red-500/5'
                  )}
                >
                  <span
                    className={cn(
                      `
                        flex-1 font-[\'TT_Interphases_Pro\'] text-[16px]
                        font-medium
                      `,
                      isActive && 'text-[#4f4e4a]',
                      step.status !== 'in-progress' && 'text-[#9e9c98]',
                      isError && 'text-red-600'
                    )}
                  >
                    {step.title}
                  </span>
                  
                  {/* Loading indicator for active step */}
                  {isActive && (
                    <Loader2 className="size-4 animate-spin text-[#23d57c]" />
                  )}
                </div>

                {/* Thinking Process - Shows under active Building step */}
                {isActive && step.id === 'building' && thinkingSteps.length > 0 && (
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <ThinkingProcess
                        steps={thinkingSteps}
                        isCompleted={false}
                        duration="4.2s"
                      />
                    </div>
                  </div>
                )}

                {/* Agent todos and logs inside active Building step */}
                {isActive && step.id === 'building' && (agentTodos.length > 0 || agentLogs.length > 0) && (
                <div className="mt-4 space-y-3">
                  {/* Agent Todos */}
                  {agentTodos.length > 0 && (
                    <div className="space-y-2">
                      <div className="
                        text-xs font-semibold tracking-wider text-[#cbc9c4]
                        uppercase
                      ">
                        Tasks
                      </div>
                      <div className="space-y-1.5">
                        {agentTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={cn(
                              `
                                flex items-start gap-2 rounded-md px-2 py-1.5
                                text-xs transition-colors
                              `,
                              todo.status === 'in-progress' && `
                                border border-[#23d57c]/20 bg-[#23d57c]/5
                              `,
                              todo.status === 'completed' && 'text-[#9e9c98]',
                              todo.status === 'pending' && 'text-[#9e9c98]/60'
                            )}
                          >
                            {todo.status === 'in-progress' ? (
                              <Loader2 className="
                                mt-0.5 size-3 shrink-0 animate-spin
                                text-[#23d57c]
                              " />
                            ) : todo.status === 'completed' ? (
                              <div className="
                                mt-0.5 size-3 shrink-0 rounded-full
                                bg-[#23d57c]/50
                              " />
                            ) : (
                              <div className="
                                mt-0.5 size-3 shrink-0 rounded-full border
                                border-[#9e9c98]/30
                              " />
                            )}
                            <span className="flex-1">{todo.activeForm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Logs */}
                  {agentLogs.length > 0 && (
                    <div className="space-y-2">
                      <div className="
                        text-xs font-semibold tracking-wider text-[#cbc9c4]
                        uppercase
                      ">
                        Activity
                      </div>
                      <div className="
                        scrollbar-thin scrollbar-thumb-[#9e9c98]/20
                        scrollbar-track-transparent max-h-48 space-y-1.5
                        overflow-y-auto pr-1
                      ">
                        {agentLogs.map((log) => {
                          return (
                            <div
                              key={log.id}
                              className={cn(
                                `
                                  flex items-start gap-2 rounded-sm px-2 py-1.5
                                  font-mono text-xs transition-colors
                                `,
                                log.type === 'info' && `
                                  bg-gray-500/5 text-gray-600
                                `,
                                log.type === 'thinking' && `
                                  bg-purple-500/5 text-purple-600
                                `,
                                log.type === 'output' && `
                                  bg-blue-500/5 text-blue-600
                                `,
                                log.type === 'tool_use' && `
                                  bg-orange-500/5 text-orange-600
                                `,
                                log.type === 'tool_executing' && `
                                  bg-yellow-500/5 text-yellow-600
                                `,
                                log.type === 'tool_completed' && `
                                  bg-green-500/5 text-green-600
                                `,
                                log.type === 'success' && `
                                  bg-emerald-500/5 text-emerald-600
                                `,
                                log.type === 'error' && `
                                  bg-red-500/10 text-red-600
                                `
                              )}
                            >
                              <span className="shrink-0">
                                {logEmojis[log.type]}
                              </span>
                              <span className="line-clamp-2 flex-1">{log.message}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {isError && error && (
                <div className="mt-2 text-xs text-red-600">
                  {error}
                </div>
              )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
