import { Box, Sparkles, Gamepad2 } from 'lucide-react';

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'visual', label: 'Visual Magic' },
  { id: 'game', label: 'Micro Game Jam' },
] as const;

export type GalleryCategoryId = typeof galleryCategories[number]['id'];

export const playgroundModes = [
  { 
    id: 'physics',
    label: 'Physics Playground', 
    description: 'Create interactive physics simulations and dynamic experiences',
    color: 'bg-violet-400/80',
    icon: Box,
    prompts: [
      "A pendulum with realistic swing physics and friction...",
      "Bouncing balls with gravity and elastic collision physics...",
      "A rope bridge swaying and deforming under dynamic forces..."
    ],
    theme: {
      badge: 'bg-violet-100 text-violet-700',
      dot: 'bg-violet-500'
    },
    featuredCase: {
      appId: 'mock-physics-id', // Placeholder
      title: 'Music Video',
      description: 'Create interactive physics simulations and dynamic experiences',
      imageUrl: 'https://cdn.openart.ai/assets/music_video_home.webp',
      prompt: 'A pendulum with realistic swing physics and friction...'
    }
  },
  { 
    id: 'visual',
    label: 'Visual Magic', 
    description: 'Generate stunning visual effects and artistic creations',
    color: 'bg-pink-400/80',
    icon: Sparkles,
    prompts: [
      "Neon particles dancing in mesmerizing spiral patterns...",
      "Liquid wave distortion effect with metallic reflections...",
      "Kaleidoscopic mandala pattern with smooth color transitions..."
    ],
    theme: {
      badge: 'bg-pink-100 text-pink-700',
      dot: 'bg-pink-500'
    },
    featuredCase: {
      appId: 'mock-visual-id', // Placeholder
      title: 'Explainer Video',
      description: 'Generate stunning visual effects and artistic creations',
      imageUrl: 'https://cdn.openart.ai/assets/explainer_video_home_video.webp',
      prompt: 'Liquid wave distortion effect with metallic reflections...'
    }
  },
  { 
    id: 'game',
    label: 'Micro Game Jam', 
    description: 'Build mini games and interactive entertainment',
    color: 'bg-cyan-400/80',
    icon: Gamepad2,
    prompts: [
      "A fast-paced tap-the-tiles rhythm game with increasing difficulty...",
      "A simple puzzle game where you match falling colored blocks...",
      "A dodge-the-obstacles endless runner with power-ups..."
    ],
    theme: {
      badge: 'bg-cyan-100 text-cyan-700',
      dot: 'bg-cyan-500'
    },
    featuredCase: {
      appId: 'mock-game-id', // Placeholder
      title: 'Micro Game Jam',
      description: 'Build mini games and interactive entertainment',
      imageUrl: 'https://cdn.openart.ai/assets/internal/uploads/image_un6XRgGs_1090x810_1757948286886.webp',
      prompt: 'A dodge-the-obstacles endless runner with power-ups...'
    }
  },
] as const;

export type PlaygroundModeId = typeof playgroundModes[number]['id'];

/** Get the category ID from playground mode label */
export function getCategoryFromModeLabel(modeLabel: string): PlaygroundModeId | '' {
  const mode = playgroundModes.find(m => m.label === modeLabel);
  return mode?.id || '';
}

/** Get playground mode by category ID */
export function getModeByCategory(categoryId: string) {
  return playgroundModes.find(m => m.id === categoryId);
}

// Models Configuration

export type LLMModel = {
  id: string
  name: string
  color: string
  icon: string
  group: string
}

interface ModelGroup {
  group: string
  icon: string
  color: string
  items: Array<{
    id: string
    name: string
  }>
}

export const modelGroups: ModelGroup[] = [

  {
    group: 'DeepSeek',
    icon: '/logo/models/deepseek-color.svg',
    color: '#4D6BFE',
    items: [
      { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2' },
      { id: 'deepseek/deepseek-v3.1', name: 'DeepSeek V3.1' },
    ]
  },
  {
    group: 'GLM',
    icon: '/logo/models/zhipu-color.svg',
    color: '#000',
    items: [
      { id: 'zai-org/glm-4.7', name: 'GLM 4.7' },
      { id: 'zai-org/glm-4.6', name: 'GLM 4.6' },
    ]
  },
  {
    group: 'Minimax',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    items: [
      { id: 'minimax/minimax-m2.1', name: 'Minimax M2.1' },
      { id: 'minimax/minimax-m2', name: 'Minimax M2' },
    ]
  },
  {
    group: 'Kimi',
    icon: '/logo/models/kimi-color.svg',
    color: '#000',
    items: [
      { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking' },
      { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2 0905' },
    ]
  },
  {
    group: 'GPT',
    icon: '/logo/models/openai.svg',
    color: '#000',
    items: [
      { id: 'pa/gpt-5.2', name: 'GPT 5.2' },
      { id: 'pa/gpt-5.1-codex', name: 'GPT 5.1 Codex' },
      { id: 'pa/gt-4.1', name: 'GPT 4.1' },
    ]
  },
  {
    group: 'Claude',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    items: [
      { id: 'pa/claude-opus-4-5-20251101', name: 'Claude Opus 4.5' },
      { id: 'pa/claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
      { id: 'pa/claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ]
  },
  {
    group: 'Gemini',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    items: [
      { id: 'pa/gemini-3-pro-preview', name: 'Gemini 3 Pro' },
      { id: 'pa/gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    ]
  },
  {
    group: 'Grok',
    icon: '/logo/models/grok.svg',
    color: '#000',
    items: [
      { id: 'pa/grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning' },
      { id: 'pa/grok-code-fast-1', name: 'Grok Code Fast 1' },
    ]
  },
  {
    group: 'Doubao',
    icon: '/logo/models/doubao-color.svg',
    color: '#FFF',
    items: [
      { id: 'pa/doubao-1-5-pro-32k-250115', name: 'Doubao 1.5 Pro' },
      { id: 'pa/doubao-seed-1.6', name: 'Doubao Seed 1.6' },
    ]
  }
]

export const models: LLMModel[] = modelGroups.flatMap((group) =>
  group.items.map((item) => ({
    id: item.id,
    name: item.name,
    group: group.group,
    color: group.color,
    icon: group.icon,
  }))
)

export const defaultModelAId = 'pa/grok-code-fast-1'
export const defaultModelBId = 'pa/gemini-3-flash-preview'

export function getModelById(modelId: string): LLMModel | undefined {
  return models.find((m) => m.id === modelId)
}

// Hackathon Configuration
export const HACKATHON_END_TIME = '2026-02-14T23:59:59Z'; // Hardcoded date for now
export const HACKATHON_PARTICIPANTS = 1234;

export const FEATURED_CASES = [
  {
    id: 'music-video',
    title: 'Physical',
    appId: 'mock-music-video-id',
    imageUrl: 'https://cdn.openart.ai/assets/music_video_home.webp',
    category: 'physics',
    prompt: 'A pendulum with realistic swing physics and friction...',
    themeColor: '#8b5cf6' // violet-500
  },
  {
    id: 'explainer-video',
    title: 'Visual',
    appId: 'mock-explainer-video-id',
    imageUrl: 'https://cdn.openart.ai/assets/explainer_video_home_video.webp',
    category: 'visual',
    prompt: 'Liquid wave distortion effect with metallic reflections...',
    themeColor: '#ec4899' // pink-500
  },
  {
    id: 'character-vlog',
    title: 'Game',
    appId: 'mock-character-vlog-id',
    imageUrl: 'https://cdn.openart.ai/assets/internal/uploads/image_un6XRgGs_1090x810_1757948286886.webp',
    category: 'game',
    prompt: 'A dodge-the-obstacles endless runner with power-ups...',
    themeColor: '#06b6d4' // cyan-500
  },
  // {
  //   id: 'asmr-video',
  //   title: 'ASMR Video',
  //   appId: 'mock-asmr-id',
  //   imageUrl: 'https://cdn.openart.ai/assets/internal/uploads/image_un6XRgGs_1090x810_1757948286886.webp',
  //   category: 'visual',
  //   prompt: 'ASMR visual triggers with soft lighting and gentle movements...',
  //   themeColor: '#10b981' // emerald-500
  // }
];

