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
    description: 'Which model can master the laws of nature?',
    color: 'bg-violet-400/80',
    icon: Box,
    prompts: [
      "Create an interactive simulation of multiple balls colliding elastically inside a bounded area, with realistic motion, clear collision responses, and smooth visual feedback.",
      "Create a physics playground where users can stack blocks of different sizes and knock them down to observe realistic gravity and collisions.",
      "Create a 3D simulation of a formula 1 car performing a continuous drifting donut in the street",
      `3D scientific data visualization animation.  A massive rotating white wireframe sphere centered in the frame.  Inside the sphere, hundreds of multi-colored circular nodes of varying sizes are interconnected by thin, glowing plexus lines, forming a dense and complex network structure.  Solid black background with subtle floating particles for depth. High-tech, futuristic interface style. Clean, precise, non-organic geometry.  Smooth cinematic camera orbit around the sphere. Slow rotation, nodes softly pulsating with light. Ultra-sharp details, high contrast lighting. 4K resolution, seamless looping animation.  No text, no labels, no humans, no organic shapes.`,
      `Flat illustration of a Great White Pelican riding a red bicycle. The pelican is drawn in a cartoonish style with a goofy expression and holds a large yellow sphere in its beak, representing the sun.  The pelican appears to be actively pedaling, with its feet in motion on the bicycle pedals. Motion lines and pink dots emphasize speed and movement. The background is a simplified blue sky with flat white clouds and small flying birds, creating a lively and playful atmosphere.`
    ],
    theme: {
      badge: 'bg-violet-100 text-violet-700',
      dot: 'bg-violet-500'
    },
    featuredAppId: '2f40ffd2-1e27-42e4-91a2-db16f0a9dc2d',
    videoUrl: '141bd195b3f9da2a14184dc0923555db',
    coverImage: '/images/physics-cover.png'
  },
  { 
    id: 'visual',
    label: 'Visual Magic', 
    description: 'Which model can turn math and code into breathtaking visuals?',
    color: 'bg-pink-400/80',
    icon: Sparkles,
    prompts: [
      `create a high-end visual experience in a single HTML file. Build a "Sacred Geometry Morphing" animation using Three.js. Start with a wireframe Platonic solid (like a Dodecahedron) that smoothly morphs into a complex Menger Sponge or a Mandelbulb-inspired fractal. The lines should glow with a gradient of gold and electric blue. Add a "cinematic camera" script that slowly orbits and zooms according to a mathematical sine wave.`,
      `create a flow field. Use 2D Perlin noise to determine the angle of movement for 5,000 particles. Particles should leave a persistent, semi-transparent trail to create a silk-like texture, and the noise offset should evolve over time`,
      `Create A futuristic 3D scientific visualization featuring a massive rotating white wireframe sphere filled with glowing, multicolored nodes connected by fine luminous lines, floating in a pitch-black space, with smooth cinematic motion, pulsing light, crisp geometry, high contrast, and a seamless looping feel—purely abstract, precise, and non-organic.`,
      `Create a spectacular fireworks scene in a pitch-black night sky, with continuous overlapping launches that burst into massive, glowing spheres of particles, realistically rising, exploding, slowing down, drifting under gravity, fading with subtle trails, viewed from a static camera looking slightly upward, and adapting smoothly to any screen size.`
    ],
    theme: {
      badge: 'bg-pink-100 text-pink-700',
      dot: 'bg-pink-500'
    },
    featuredAppId: '40bf7a51-d616-462c-8ab6-5c6d6c7ef7e0',
    videoUrl: '0f20294d577fcb399a49a7c9de707556',
    coverImage: '/images/visual-cover.png'
  },
  { 
    id: 'game',
    label: 'Micro Game Jam', 
    description: 'Which model can create the most fun game in minutes?',
    color: 'bg-cyan-400/80',
    icon: Gamepad2,
    prompts: [
      "Create a Breakout-style game with paddle control and ball physics",
      "Create a playable Snake game with increasing difficulty.",
    ],
    theme: {
      badge: 'bg-cyan-100 text-cyan-700',
      dot: 'bg-cyan-500'
    },
    featuredAppId: '522f487f-3c52-40d3-95fb-b988bec41aff',
    videoUrl: '1ae1febdc7b45c9204b1b2b06e4d6a96',
    coverImage: '/images/game-cover.png'
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
    icon: '/logo/models/zai.svg',
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



