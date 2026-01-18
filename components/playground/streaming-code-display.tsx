'use client';

import { useEffect, useRef } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingCodeDisplayProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  view: 'code' | 'preview';
}

export function StreamingCodeDisplay({
  content,
  isLoading,
  error,
  view,
}: StreamingCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && view === 'code') {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, view]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-4">
          <div className="text-red-400 text-sm font-mono">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'code') {
    return (
      <div className="w-full h-full flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 overflow-auto bg-[#1e1e1e] p-4"
        >
          <div className="prose prose-invert prose-sm max-w-none font-mono text-sm text-[#d4d4d4] break-words leading-relaxed">
            {/* If content is empty, maybe show a placeholder or just nothing */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">
        <iframe
          srcDoc={content}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          className="w-full h-full border-0"
          title="Preview"
        />
      </div>
    </div>
  );
}
