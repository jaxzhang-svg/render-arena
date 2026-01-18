'use client';

import { useHtmlGenerator } from '@/hooks/use-html-generator';
import { useState } from 'react';

export function HtmlGeneratorExample() {
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState('deepseek/deepseek-v3.2');

  const htmlGenerator = useHtmlGenerator({
    apiKey: process.env.NEXT_PUBLIC_NOVITA_API_KEY || '',
    baseURL: 'https://api.novita.ai/openai/v1', // 可选，默认就是这个
    onError: (error) => {
      console.error('HTML generation error:', error);
    },
    onComplete: (htmlContent) => {
      console.log('HTML generation completed:', htmlContent);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    htmlGenerator.generate(prompt, modelId, (chunk) => {
      console.log('Received chunk:', chunk);
    });
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">HTML Generator with OpenAI SDK</h2>
      
      <div>
        <label htmlFor="model" className="block text-sm font-medium mb-2">
          Model:
        </label>
        <select
          id="model"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="deepseek/deepseek-v3.2">DeepSeek V3.2</option>
          <option value="gpt-4o">GPT-4O</option>
          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
        </select>
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          Prompt:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请描述你想要生成的 HTML 页面..."
          className="w-full p-3 border rounded-md h-32 resize-vertical"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={htmlGenerator.isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          {htmlGenerator.isLoading ? '生成中...' : '生成 HTML'}
        </button>
        
        <button
          onClick={htmlGenerator.abort}
          disabled={!htmlGenerator.isLoading}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
        >
          取消
        </button>
        
        <button
          onClick={htmlGenerator.reset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          重置
        </button>
      </div>

      {htmlGenerator.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">错误: {htmlGenerator.error}</p>
        </div>
      )}

      {htmlGenerator.isLoading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">状态: {htmlGenerator.currentStep}</p>
        </div>
      )}

      {htmlGenerator.htmlContent && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">生成的 HTML:</h3>
          <div className="border rounded-md">
            <div className="bg-gray-50 p-2 border-b">
              <span className="text-sm text-gray-600">HTML 预览:</span>
            </div>
            <iframe
              srcDoc={htmlGenerator.htmlContent}
              className="w-full h-96 border-none"
              title="HTML Preview"
            />
          </div>
          
          <details className="border rounded-md">
            <summary className="p-2 bg-gray-50 cursor-pointer">查看 HTML 源码</summary>
            <pre className="p-4 bg-gray-900 text-green-400 overflow-auto text-xs">
              {htmlGenerator.htmlContent}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}