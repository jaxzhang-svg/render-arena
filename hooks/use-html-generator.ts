'use client';

import { useState, useCallback, useRef } from 'react';
import { validateAndFixHtml } from '@/lib/html-validator';

export type GenerationStep = 'generating' | 'done';

interface HtmlGenerationState {
  isLoading: boolean;
  htmlContent: string;
  reasoning: string;
  currentStep: GenerationStep;
  error: string | null;
  startTime: number | null;
  endTime: number | null;
}

interface UseHtmlGeneratorOptions {
  apiKey: string;
  baseURL?: string; // 用于 Novita AI 的 base URL
  onError?: (error: string) => void;
  onComplete?: (htmlContent: string) => void;
}

interface UseHtmlGeneratorReturn extends HtmlGenerationState {
  generate: (prompt: string, modelId: string, onChunk?: (chunk: string) => void) => Promise<void>;
  abort: () => void;
  reset: () => void;
}

// const SYSTEM_PROMPT = `Help user generate code in a single HTML file.`;
const SYSTEM_PROMPT = ``;

export function useHtmlGenerator(options: UseHtmlGeneratorOptions): UseHtmlGeneratorReturn {
  const [state, setState] = useState<HtmlGenerationState>({
    isLoading: false,
    htmlContent: '',
    reasoning: '',
    currentStep: 'generating',
    error: null,
    startTime: null,
    endTime: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef('');
  const accumulatedReasoningRef = useRef('');

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      htmlContent: '',
      reasoning: '',
      currentStep: 'generating',
      error: null,
      startTime: null,
      endTime: null,
    });
    accumulatedContentRef.current = '';
    accumulatedReasoningRef.current = '';
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({ ...prev, isLoading: false, endTime: Date.now() }));
  }, []);

  const extractCompleteHtml = useCallback((content: string): string => {
    const doctypeMatch = content.match(/<!DOCTYPE html>/i);
    const closingTagMatch = content.match(/<\/html>/i);

    if (doctypeMatch && closingTagMatch) {
      const startIndex = content.indexOf(doctypeMatch[0]);
      const endIndex = content.lastIndexOf(closingTagMatch[0]);
      return content.substring(startIndex, endIndex + closingTagMatch[0].length);
    }

    return content;
  }, []);

  const generate = useCallback(async (
    prompt: string,
    modelId: string,
    onChunk?: (chunk: string) => void
  ) => {
    const startTime = Date.now();
    setState({
      isLoading: true,
      htmlContent: '',
      reasoning: '',
      currentStep: 'generating',
      error: null,
      startTime,
      endTime: null,
    });
    accumulatedContentRef.current = '';
    accumulatedReasoningRef.current = '';

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${options.baseURL || 'https://api.novita.ai/openai/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          stream: true,
          separate_reasoning: true, // Enable reasoning
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Novita API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              const content = delta?.content || '';
              const reasoning = delta?.reasoning_content || '';
              
              if (reasoning) {
                accumulatedReasoningRef.current += reasoning;
                setState((prev) => ({
                    ...prev,
                    reasoning: accumulatedReasoningRef.current,
                }));
              }

              if (content) {
                accumulatedContentRef.current += content;
                setState((prev) => ({
                  ...prev,
                  htmlContent: accumulatedContentRef.current,
                }));
                onChunk?.(content);
              }
            } catch (e) {
              console.warn('Failed to parse chunk:', e);
            }
          }
        }
      }

      if (!abortControllerRef.current.signal.aborted) {
        const completeHtml = extractCompleteHtml(accumulatedContentRef.current);
        const validatedHtml = await validateAndFixHtml(completeHtml);

        setState((prev) => ({ ...prev, isLoading: false, currentStep: 'done', htmlContent: validatedHtml.fixedHtml || "Error", endTime: Date.now() }));
        options.onComplete?.(validatedHtml.fixedHtml || "Error");
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setState({
        isLoading: false,
        htmlContent: '',
        currentStep: 'generating',
        error: errorMsg,
      });
      options.onError?.(errorMsg);
    }
  }, [options, extractCompleteHtml]);

  return {
    ...state,
    generate,
    abort,
    reset,
  };
}
