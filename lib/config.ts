import { Box, Sparkles, Gamepad2, RefreshCcwDot } from 'lucide-react'

export const ANONYMOUS_QUOTA = 6
export const AUTHENTICATED_QUOTA = 20
export const PAID_QUOTA = 60

// Free tier disable configuration - set to true to disable anonymous and authenticated non-paid users
export const FREE_TIER_DISABLED = false

// Complete disable configuration - set to true to disable ALL users (including paid users)
export const ALL_GENERATION_DISABLED = false

const NOVITA_BALANCE_UNIT = 0.0001
export const PAID_USER_BALANCE_THRESHOLD = 10 / NOVITA_BALANCE_UNIT

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'visual', label: 'Visual Magic' },
  { id: 'game', label: 'Micro Game Jam' },
  { id: 'general', label: 'General' },
] as const

export type GalleryCategoryId = (typeof galleryCategories)[number]['id']

export const playgroundModes = [
  {
    id: 'physics',
    label: 'Physics Playground',
    description: 'Which model can master the laws of nature?',
    color: 'bg-violet-400/80',
    icon: Box,
    prompts: [
      'Create an interactive 2D simulation of three identical balls inside a continuously rotating regular hexagon. The balls are affected by Earth-like gravity, damping, and wall friction, and must collide realistically with the moving/rotating walls and with each other (proper momentum transfer, no overlap, no tunneling, no sticking, stable over long runs). The hexagon rotation must be smooth and adjustable (speed + direction). Provide minimal controls: reset, pause, gravity toggle, restitution slider, rotation speed slider, and a slow-motion slider that scales simulation time smoothly. Add a small HUD showing FPS, total kinetic energy, and impacts per second.',
      'Create a 3D simulation of a formula 1 car performing a continuous drifting donut in the street',
      'Create a simple physics playground with hundreds of particles. Particles float, drift, and gently collide inside the canvas. Include gravity toggle, mouse interaction, and soft boundary constraints. Smooth motion, visually pleasing trails, dark background.',
    ],
    theme: {
      badge: 'bg-violet-100 text-violet-700',
      dot: 'bg-violet-500',
    },
    featuredAppId: '2f40ffd2-1e27-42e4-91a2-db16f0a9dc2d',
    videoUrl: '141bd195b3f9da2a14184dc0923555db',
    coverImage: '/images/physics-cover.png',
  },
  {
    id: 'visual',
    label: 'Visual Magic',
    description: 'Which model can turn math and code into breathtaking visuals?',
    color: 'bg-pink-400/80',
    icon: Sparkles,
    prompts: [
      `Build a "Sacred Geometry Morphing" animation using Three.js. Start with a wireframe Platonic solid (like a Dodecahedron) that smoothly morphs into a complex Menger Sponge or a Mandelbulb-inspired fractal. The lines should glow with a gradient of gold and electric blue. Add a "cinematic camera" script that slowly orbits and zooms according to a mathematical sine wave.`,
      `Create a flow field. Use 2D Perlin noise to determine the angle of movement for 5,000 particles. Particles should leave a persistent, semi-transparent trail to create a silk-like texture, and the noise offset should evolve over time`,
      `Create a flat illustration of a Great White Pelican riding a red bicycle. The pelican is drawn in a cartoonish style with a goofy expression and holds a large yellow sphere in its beak, representing the sun.  The pelican appears to be actively pedaling, with its feet in motion on the bicycle pedals. Motion lines and pink dots emphasize speed and movement. The background is a simplified blue sky with flat white clouds and small flying birds, creating a lively and playful atmosphere.`,
      `Create A futuristic 3D scientific visualization featuring a massive rotating white wireframe sphere filled with glowing, multicolored nodes connected by fine luminous lines, floating in a pitch-black space, with smooth cinematic motion, pulsing light, crisp geometry, high contrast, and a seamless looping feel—purely abstract, precise, and non-organic.`,
      `Create a spectacular fireworks scene in a pitch-black night sky, with continuous overlapping launches that burst into massive, glowing spheres of particles, realistically rising, exploding, slowing down, drifting under gravity, fading with subtle trails, viewed from a static camera looking slightly upward, and adapting smoothly to any screen size.`,
    ],
    theme: {
      badge: 'bg-pink-100 text-pink-700',
      dot: 'bg-pink-500',
    },
    featuredAppId: 'd53d17e0-52ab-4e46-a775-4c2c81f12758',
    videoUrl: '43cf4dc1567e0c73d66fcfde5729ec7a',
    coverImage: '/images/visual-cover.png',
  },
  {
    id: 'game',
    label: 'Micro Game Jam',
    description: 'Which model can create the most fun game in minutes?',
    color: 'bg-cyan-400/80',
    icon: Gamepad2,
    prompts: [
      'Create a playable Snake game with increasing difficulty.',
      'Create a Breakout-style game with paddle control and ball physics.',
    ],
    theme: {
      badge: 'bg-cyan-100 text-cyan-700',
      dot: 'bg-cyan-500',
    },
    featuredAppId: '522f487f-3c52-40d3-95fb-b988bec41aff',
    videoUrl: '1ae1febdc7b45c9204b1b2b06e4d6a96',
    coverImage: '/images/game-cover.png',
  },
  {
    id: 'general',
    label: 'General',
    description: 'Universal category for all types of prompts',
    color: 'bg-gray-400/80',
    icon: RefreshCcwDot,
    prompts: [
      'Design an elegant data visualization dashboard',
      'Create a responsive landing page with modern design',
    ],
    theme: {
      badge: 'bg-gray-100 text-gray-700',
      dot: 'bg-gray-500',
    },
    featuredAppId: null,
    videoUrl: null,
    coverImage: null,
  },
] as const

export type PlaygroundModeId = (typeof playgroundModes)[number]['id']

/** Get the category ID from playground mode label */
export function getCategoryFromModeLabel(modeLabel: string): PlaygroundModeId | '' {
  const mode = playgroundModes.find(m => m.label === modeLabel)
  return mode?.id || ''
}

/** Get playground mode by category ID */
export function getModeByCategory(categoryId: string) {
  return playgroundModes.find(m => m.id === categoryId)
}

// Models Configuration

export type LLMModel = {
  id: string
  name: string
  color: string
  icon: string
  group: string
}

interface LegacyModelGroup {
  group: string
  icon: string
  color: string
  items: Array<{
    id: string
    name: string
  }>
}

interface ModelGroup {
  group: string
  items: Array<{
    id: string
    name: string
    icon: string
    color: string
  }>
}

// Legacy model groups - kept for existing apps that reference these models
export const legacyModelGroups: LegacyModelGroup[] = [
  {
    group: 'DeepSeek',
    icon: '/logo/models/deepseek-color.svg',
    color: '#4D6BFE',
    items: [
      { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2' },
      { id: 'deepseek/deepseek-v3.1', name: 'DeepSeek V3.1' },
    ],
  },
  {
    group: 'GLM',
    icon: '/logo/models/zai.svg',
    color: '#000',
    items: [
      { id: 'zai-org/glm-4.7', name: 'GLM 4.7' },
      { id: 'zai-org/glm-4.6', name: 'GLM 4.6' },
    ],
  },
  {
    group: 'Minimax',
    icon: '/logo/models/minimax-color.svg',
    color: '#F23F5D',
    items: [
      { id: 'minimax/minimax-m2.1', name: 'Minimax M2.1' },
      { id: 'minimax/minimax-m2', name: 'Minimax M2' },
    ],
  },
  {
    group: 'Kimi',
    icon: '/logo/models/kimi-color.svg',
    color: '#000',
    items: [
      { id: 'moonshotai/kimi-k2.5', name: 'Kimi K2.5 Thinking' },
      { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking' },
    ],
  },
  {
    group: 'GPT',
    icon: '/logo/models/openai.svg',
    color: '#000',
    items: [
      { id: 'pa/gpt-5.2', name: 'GPT 5.2' },
      { id: 'pa/gpt-5.1-codex', name: 'GPT 5.1 Codex' },
      { id: 'pa/gt-4.1', name: 'GPT 4.1' },
    ],
  },
  {
    group: 'Claude',
    icon: '/logo/models/claude-color.svg',
    color: '#D97757',
    items: [
      { id: 'pa/claude-opus-4-5-20251101', name: 'Claude Opus 4.5' },
      { id: 'pa/claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
      { id: 'pa/claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ],
  },
  {
    group: 'Gemini',
    icon: '/logo/models/gemini-color.svg',
    color: '#FFF',
    items: [
      { id: 'pa/gemini-3-pro-preview', name: 'Gemini 3 Pro' },
      { id: 'pa/gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    ],
  },
  {
    group: 'Grok',
    icon: '/logo/models/grok.svg',
    color: '#000',
    items: [
      { id: 'pa/grok-4-1-fast-reasoning', name: 'Grok 4.1 Fast Reasoning' },
      { id: 'pa/grok-code-fast-1', name: 'Grok Code Fast 1' },
    ],
  },
  {
    group: 'Doubao',
    icon: '/logo/models/doubao-color.svg',
    color: '#FFF',
    items: [
      { id: 'pa/doubao-1-5-pro-32k-250115', name: 'Doubao 1.5 Pro' },
      { id: 'pa/doubao-seed-1.6', name: 'Doubao Seed 1.6' },
    ],
  },
]

// New simplified model groups for the UI selector
export const modelGroups: ModelGroup[] = [
  {
    group: 'Open Source',
    items: [
      {
        id: 'deepseek/deepseek-v3.2',
        name: 'DeepSeek V3.2',
        icon: '/logo/models/deepseek-color.svg',
        color: '#4D6BFE',
      },
      { id: 'zai-org/glm-4.7', name: 'GLM 4.7', icon: '/logo/models/zai.svg', color: '#000' },
      {
        id: 'minimax/minimax-m2.1',
        name: 'Minimax M2.1',
        icon: '/logo/models/minimax-color.svg',
        color: '#F23F5D',
      },
      {
        id: 'moonshotai/kimi-k2.5',
        name: 'Kimi K2.5 Thinking',
        icon: '/logo/models/kimi-color.svg',
        color: '#000',
      },
    ],
  },
  {
    group: 'Proprietary',
    items: [
      { id: 'pa/gpt-5.2', name: 'GPT 5.2', icon: '/logo/models/openai.svg', color: '#000' },
      {
        id: 'pa/claude-sonnet-4-5-20250929',
        name: 'Claude Sonnet 4.5',
        icon: '/logo/models/claude-color.svg',
        color: '#D97757',
      },
      {
        id: 'pa/gemini-3-pro-preview',
        name: 'Gemini 3 Pro',
        icon: '/logo/models/gemini-color.svg',
        color: '#FFF',
      },
      {
        id: 'pa/grok-4-1-fast-reasoning',
        name: 'Grok 4.1 Fast Reasoning',
        icon: '/logo/models/grok.svg',
        color: '#000',
      },
    ],
  },
]

// Combine both for backward compatibility
const allModelsFromGroups = legacyModelGroups.flatMap(group =>
  group.items.map(item => ({
    id: item.id,
    name: item.name,
    group: group.group,
    color: group.color ?? group.color ?? '#000',
    icon: group.icon ?? group.icon ?? '',
  }))
)

const legacyModels = legacyModelGroups.flatMap(group =>
  group.items.map(item => ({
    id: item.id,
    name: item.name,
    group: group.group,
    color: group.color ?? '#000',
    icon: group.icon ?? '',
  }))
)

// Unique models by ID
export const models: LLMModel[] = Array.from(
  new Map([...allModelsFromGroups, ...legacyModels].map(m => [m.id, m])).values()
)

export const defaultModelAId = 'pa/claude-sonnet-4-5-20250929'
export const defaultModelBId = 'moonshotai/kimi-k2.5'

export function getModelById(modelId: string): LLMModel | undefined {
  return models.find(m => m.id === modelId)
}

// Hackathon Configuration
export const HACKATHON_END_TIME = '2026-02-14T23:59:59Z' // Hardcoded date for now
export const HACKATHON_PARTICIPANTS = 1234

// External Links
export const NOVITA_BILLING_URL = 'https://novita.ai/billing'
export const DISCORD_INVITE_URL = 'https://discord.gg/x9YbHHCptj'


// External API
export const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions'
export const KIMI_EXTERNAL_ID = 'kimi-k2.5'
export const ZAI_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
export const ZAI_EXTERNAL_ID = 'glm-4.7'
export const MINIMAX_API_URL='https://api.minimax.io/v1/chat/completions'
export const MINIMAX_EXTERNAL_ID='MiniMax-M2.1'

// External API Configuration
// Set to true to use vendor's direct API instead of Novita for specific models
export const USE_DIRECT_KIMI_API = false
export const USE_DIRECT_ZAI_API = false
export const USE_DIRECT_MINIMAX_API = false

// API Configuration Type
export type APIConfig = {
  url: string
  apiKey: string
  modelId: string
}

/**
 * Get API configuration based on model ID
 * Returns the appropriate API endpoint, key, and model identifier
 */
export function getAPIConfig(modelId: string): APIConfig {
  const NOVITA_API_KEY = process.env.NEXT_NOVITA_API_KEY || ''
  const NOVITA_API_URL = 'https://api.novita.ai/openai/v1/chat/completions'

  // Check if model should use direct vendor API
  if (modelId.startsWith('moonshotai/') && USE_DIRECT_KIMI_API) {
    return {
      url: KIMI_API_URL,
      apiKey: process.env.KIMI_API_KEY || '',
      modelId: KIMI_EXTERNAL_ID,
    }
  }

  if (modelId.startsWith('zai-org/') && USE_DIRECT_ZAI_API) {
    return {
      url: ZAI_API_URL,
      apiKey: process.env.ZAI_API_KEY || '',
      modelId: ZAI_EXTERNAL_ID,
    }
  }

  if (modelId.startsWith('minimax/') && USE_DIRECT_MINIMAX_API) {
    return {
      url: MINIMAX_API_URL,
      apiKey: process.env.MINIMAX_API_KEY || '',
      modelId: MINIMAX_EXTERNAL_ID,
    }
  }

  // Default: use Novita API
  return {
    url: NOVITA_API_URL,
    apiKey: NOVITA_API_KEY,
    modelId: modelId,
  }
}