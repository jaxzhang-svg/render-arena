'use client';

import { Loader2, Server, Code, Rocket, Brain, MessageSquare, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  error,
}: TodoListProps) {
  const buildingStep = mainSteps.find((s) => s.id === 'building');

  return (
    <div className="space-y-4 relative">
      {mainSteps.map((step, index) => {
        const isLast = index === mainSteps.length - 1;
        const isActive = step.status === 'in-progress';
        const isCompleted = step.status === 'completed';
        const isError = step.status === 'error';

        return (
          <div key={step.id} className="relative pl-12">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'step-connector absolute left-6 top-10 bottom-[-24px] w-0.5 -translate-x-1/2 z-0',
                  isCompleted && 'bg-primary',
                  isActive && 'bg-gradient-to-b from-primary to-muted',
                  step.status === 'pending' && 'bg-muted'
                )}
              />
            )}

            {/* Icon */}
            <div
              className={cn(
                'absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg border z-10 transition-all',
                isCompleted && 'bg-background border-border',
                isActive && 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(35,213,124,0.1)]',
                step.status === 'pending' && 'bg-background border-border opacity-40',
                isError && 'bg-red-500/10 border-red-500'
              )}
            >
              {isActive ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <step.icon
                  className={cn(
                    'h-5 w-5',
                    isCompleted && 'text-primary',
                    isActive && 'text-primary',
                    step.status === 'pending' && 'text-muted-foreground',
                    isError && 'text-red-500'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                'rounded-lg border bg-background p-3 transition-all',
                isActive && 'border-primary p-4 shadow-lg',
                step.status !== 'in-progress' && 'border-border',
                isError && 'border-red-500/50 bg-red-500/5'
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-medium',
                    isActive && 'text-sm font-bold',
                    step.status !== 'in-progress' && 'text-sm'
                  )}
                >
                  {step.title}
                </span>
                {isActive && (
                  <span className="flex size-2 relative">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full size-2 bg-primary" />
                  </span>
                )}
              </div>

              {/* Agent todos inside Building step */}
              {isActive && step.id === 'building' && (agentTodos.length > 0 || agentLogs.length > 0) && (
                <div className="mt-4 space-y-3">
                  {/* Agent Todos */}
                  {agentTodos.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tasks
                      </div>
                      <div className="space-y-1.5">
                        {agentTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={cn(
                              'flex items-start gap-2 text-xs rounded-md px-2 py-1.5 transition-colors',
                              todo.status === 'in-progress' && 'bg-primary/5 border border-primary/20',
                              todo.status === 'completed' && 'text-muted-foreground',
                              todo.status === 'pending' && 'text-muted-foreground/60'
                            )}
                          >
                            {todo.status === 'in-progress' ? (
                              <Loader2 className="h-3 w-3 shrink-0 mt-0.5 animate-spin text-primary" />
                            ) : todo.status === 'completed' ? (
                              <div className="h-3 w-3 shrink-0 mt-0.5 rounded-full bg-primary/50" />
                            ) : (
                              <div className="h-3 w-3 shrink-0 mt-0.5 rounded-full border border-muted-foreground/30" />
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
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Activity
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        {agentLogs.map((log) => {
                          const LogIcon = logIcons[log.type];
                          return (
                            <div
                              key={log.id}
                              className={cn(
                                'flex items-start gap-2 text-xs font-mono rounded px-2 py-1.5 transition-colors',
                                log.type === 'info' && 'bg-gray-500/5 text-gray-600 dark:text-gray-400',
                                log.type === 'thinking' && 'bg-purple-500/5 text-purple-600 dark:text-purple-400',
                                log.type === 'output' && 'bg-blue-500/5 text-blue-600 dark:text-blue-400',
                                log.type === 'tool_use' && 'bg-orange-500/5 text-orange-600 dark:text-orange-400',
                                log.type === 'tool_executing' && 'bg-yellow-500/5 text-yellow-600 dark:text-yellow-400',
                                log.type === 'tool_completed' && 'bg-green-500/5 text-green-600 dark:text-green-400',
                                log.type === 'success' && 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
                                log.type === 'error' && 'bg-red-500/10 text-red-600 dark:text-red-400'
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
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
