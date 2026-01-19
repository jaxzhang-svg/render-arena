import { Box, Sparkles, Gamepad2 } from 'lucide-react';

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'physics', label: 'Physics' },
  { id: 'visual-magic', label: 'Visual Magic' },
  { id: 'bio-runner', label: 'Bio-Runner' },
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
    ]
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
    ]
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
    ]
  },
] as const;
