'use client';

import { useState, useCallback, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Server, Code, Rocket } from 'lucide-react';
import type {
  MainStep,
  AgentTodo,
  AgentLog,
} from '@/components/app/todo-list';

// Coding-Agent SSE event types (matching Claude SDK primitives)
type EventType =
  | 'started'           // Agent execution started
  | 'completed'         // Agent execution completed
  | 'text'              // TextBlock: Claude's text response
  | 'thinking'          // ThinkingBlock: Claude's internal thinking
  | 'tool_use'          // ToolUseBlock: Tool being called
  | 'tool_result'       // ToolResultBlock: Tool execution result
  | 'pre_tool_use'      // PreToolUse hook: Before tool execution
  | 'post_tool_use'     // PostToolUse hook: After tool execution
  | 'result'            // ResultMessage: Final result with cost/usage
  | 'system'            // SystemMessage: System metadata
  | 'error';            // Error occurred

interface AgentEvent {
  type: EventType;
  timestamp: number;
  data: Record<string, unknown>;
}

interface SandboxCreateResponse {
  success: boolean;
  sandboxId: string;
  apiUrl: string;
  previewUrl: string;
  modelId: string;
  anthropicAuthToken: string;
  error?: string;
}

interface UseSandboxAgentOptions {
  onPreviewReady?: (previewUrl: string) => void;
  onError?: (error: string) => void;
}

export interface UseSandboxAgentReturn {
  mainSteps: MainStep[];
  agentTodos: AgentTodo[];
  agentLogs: AgentLog[];
  previewUrl: string | null;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, modelId: string) => Promise<void>;
  abort: () => void;
}

export function useSandboxAgent(options?: UseSandboxAgentOptions): UseSandboxAgentReturn {
  const [mainSteps, setMainSteps] = useState<MainStep[]>([
    { id: 'creating', title: 'Creating Sandbox', status: 'pending', icon: Server },
    { id: 'building', title: 'Building your app', status: 'pending', icon: Code },
    { id: 'preview', title: 'Preparing preview', status: 'pending', icon: Rocket },
  ]);
  const [agentTodos, setAgentTodos] = useState<AgentTodo[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const updateStepStatus = useCallback((stepId: string, status: MainStep['status']) => {
    setMainSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  }, []);

  const addLog = useCallback((log: Omit<AgentLog, 'id'>) => {
    setAgentLogs((prev) => [
      ...prev,
      { ...log, id: `${log.timestamp}-${Math.random()}` },
    ]);
  }, []);

  const addOrUpdateTodo = useCallback((content: string, status: AgentTodo['status']) => {
    setAgentTodos((prev) => {
      const existingIndex = prev.findIndex((t) => t.content === content);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          activeForm: status === 'in-progress' ? `${content.charAt(0).toLowerCase() + content.slice(1)}...` : content,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          content,
          status,
          activeForm: status === 'in-progress' ? `${content.charAt(0).toLowerCase() + content.slice(1)}...` : content,
        },
      ];
    });
  }, []);

  const completeAllTodos = useCallback(() => {
    setAgentTodos((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'completed' as const,
        activeForm: t.content,
      }))
    );
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const generate = useCallback(async (prompt: string, modelId: string) => {
    // Reset state
    setMainSteps([
      { id: 'creating', title: 'Creating Sandbox', status: 'pending', icon: Server },
      { id: 'building', title: 'Building your app', status: 'pending', icon: Code },
      { id: 'preview', title: 'Preparing preview', status: 'pending', icon: Rocket },
    ]);
    setAgentTodos([]);
    setAgentLogs([]);
    setPreviewUrl(null);
    setError(null);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Create sandbox
      updateStepStatus('creating', 'in-progress');

      const createResponse = await fetch('/api/sandbox/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, prompt }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create sandbox: ${createResponse.statusText}`);
      }

      const createData: SandboxCreateResponse = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create sandbox');
      }

      updateStepStatus('creating', 'completed');
      updateStepStatus('building', 'in-progress');
      setPreviewUrl(createData.previewUrl);

      // Step 2: Connect to coding-agent SSE stream
      const currentTodoRef = { current: null as string | null };

      await fetchEventSource(`${createData.apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          workdir: '/home/user/app',
          anthropic_auth_token: createData.anthropicAuthToken,
          anthropic_model: createData.modelId,
        }),
        signal: abortControllerRef.current.signal,

        onopen: async (res) => {
          if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
            return;
          }
          throw new Error(`Unexpected response: ${res.status}`);
        },

        onmessage: (msg) => {
          if (msg.data === '[DONE]') {
            return;
          }

          try {
            const event: AgentEvent = JSON.parse(msg.data);
            const { type, data } = event;

            switch (type) {
              case 'started':
                addLog({
                  type: 'info',
                  message: 'Agent started',
                  timestamp: event.timestamp,
                });
                break;

              case 'thinking': {
                const thinking = (data.thinking as string) || '';
                // Update todo to show agent is thinking
                addOrUpdateTodo('Thinking', 'in-progress');
                addLog({
                  type: 'thinking',
                  message: thinking.slice(0, 100),
                  timestamp: event.timestamp,
                });
                break;
              }

              case 'text': {
                const text = (data.text as string) || '';
                if (text) {
                  addLog({
                    type: 'output',
                    message: text.slice(0, 100),
                    timestamp: event.timestamp,
                  });
                }
                break;
              }

              case 'tool_use': {
                const toolName = (data.name as string) || 'unknown';
                const toolInput = data.input as Record<string, unknown>;

                let message = `Calling: ${toolName}`;

                // Special handling for specific tools
                if (toolName === 'Write' && toolInput?.file_path) {
                  const path = toolInput.file_path as string;
                  message = `Creating: ${path}`;
                  addOrUpdateTodo(`Create ${path}`, 'in-progress');
                } else if (toolName === 'Read' && toolInput?.file_path) {
                  const path = toolInput.file_path as string;
                  message = `Reading: ${path}`;
                } else if (toolName === 'Bash' && toolInput?.command) {
                  const cmd = toolInput.command as string;
                  message = `Running: ${cmd.split(' ')[0]}`;

                  // Detect build command
                  if (cmd.includes('npm run build')) {
                    updateStepStatus('building', 'completed');
                    updateStepStatus('preview', 'in-progress');
                    addOrUpdateTodo('Building app', 'in-progress');
                  }

                  // Detect dev server start
                  if (cmd.includes('npm run dev') || cmd.includes('next dev')) {
                    addOrUpdateTodo('Starting dev server', 'in-progress');
                  }
                }

                addLog({
                  type: 'tool_use',
                  message,
                  timestamp: event.timestamp,
                });
                break;
              }

              case 'tool_result': {
                const content = data.content as string | { [key: string]: unknown } | null;
                const isError = data.is_error as boolean | null;

                if (isError) {
                  addLog({
                    type: 'error',
                    message: 'Tool execution failed',
                    timestamp: event.timestamp,
                  });
                }
                break;
              }

              case 'pre_tool_use': {
                const toolName = (data.tool_name as string) || 'unknown';
                const toolInput = data.tool_input as Record<string, unknown>;

                let message = `Executing: ${toolName}`;

                if (toolName === 'Bash' && toolInput?.command) {
                  const cmd = toolInput.command as string;
                  message = `Executing: ${cmd.split(' ')[0]}`;
                }

                addLog({
                  type: 'tool_executing',
                  message,
                  timestamp: event.timestamp,
                });
                break;
              }

              case 'post_tool_use': {
                const toolName = (data.tool_name as string) || 'unknown';
                const duration = data.duration_ms as number | null;

                // Complete the running task
                const runningTodo = agentTodos.find(t => t.status === 'in-progress');
                if (runningTodo) {
                  addOrUpdateTodo(runningTodo.content, 'completed');
                }

                addLog({
                  type: 'tool_completed',
                  message: `Completed ${toolName}${duration ? ` (${Math.round(duration)}ms)` : ''}`,
                  timestamp: event.timestamp,
                });
                break;
              }

              case 'result': {
                const subtype = (data.subtype as string) || '';
                const isSuccessful = !data.is_error;

                if (isSuccessful) {
                  addLog({
                    type: 'success',
                    message: 'Task completed successfully',
                    timestamp: event.timestamp,
                  });
                }
                break;
              }

              case 'system': {
                const subtype = (data.subtype as string) || '';
                addLog({
                  type: 'info',
                  message: `System: ${subtype}`,
                  timestamp: event.timestamp,
                });
                break;
              }

              case 'error': {
                const message = (data.message as string) || 'Unknown error';
                const errorType = (data.type as string) || 'Error';
                const errorMsg = `${errorType}: ${message}`.slice(0, 200);

                addLog({
                  type: 'error',
                  message: errorMsg,
                  timestamp: event.timestamp,
                });
                setError(errorMsg);
                updateStepStatus('building', 'error');
                break;
              }

              case 'completed':
                completeAllTodos();
                updateStepStatus('building', 'completed');
                updateStepStatus('preview', 'completed');
                setIsLoading(false);
                options?.onPreviewReady?.(createData.previewUrl);
                break;
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e, msg.data);
          }
        },

        onerror: (err) => {
          console.error('SSE error:', err);
          const errorMsg = err instanceof Error ? err.message : 'Connection error';
          setError(errorMsg);
          updateStepStatus('building', 'error');
          options?.onError?.(errorMsg);
          setIsLoading(false);
          throw err;
        },

        onclose: () => {
          setIsLoading(false);
        },
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      updateStepStatus('creating', 'error');
      setIsLoading(false);
      options?.onError?.(errorMsg);
    }
  }, [updateStepStatus, addLog, addOrUpdateTodo, completeAllTodos, agentTodos, options]);

  return {
    mainSteps,
    agentTodos,
    agentLogs,
    previewUrl,
    isLoading,
    error,
    generate,
    abort,
  };
}
