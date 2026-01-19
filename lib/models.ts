export type LLMModel = {
  id: string
  name: string
  provider: string
  providerId: string
  color: string
}

export const models: LLMModel[] = [
  {
    id: 'zai-org/glm-4.7',
    name: 'GLM 4.7',
    provider: 'Novita',
    providerId: 'novita',
    color: 'bg-blue-500',
  },
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'Novita',
    providerId: 'novita',
    color: 'bg-purple-500',
  },
  {
    id: 'minimax/minimax-m2.1',
    name: 'Minimax M2.1',
    provider: 'Novita',
    providerId: 'novita',
    color: 'bg-emerald-500',
  },
]

export function getModelById(modelId: string): LLMModel | undefined {
  return models.find((m) => m.id === modelId)
}