import { modelGroups } from './config'

/**
 * 计算基于输出 token 的费用
 * @param outputTokens 输出 token 数量
 * @param modelId 模型 ID
 * @returns 计算后的费用（美元），如果无法计算则返回 null
 */
export function calculateTokenCost(outputTokens: number, modelId: string): number | null {
  if (outputTokens <= 0) return null

  // 查找当前模型的价格信息
  const model = modelGroups.flatMap(g => g.items).find(m => m.id === modelId)

  // 计算费用（只根据输出 token）
  if (model?.outputPrice !== undefined) {
    const calculatedCost = (outputTokens * model.outputPrice) / 1000000
    // 只有当费用大于 0 且不是 NaN 时才返回
    if (calculatedCost > 0 && !isNaN(calculatedCost)) {
      return calculatedCost
    }
  }

  return null
}

/**
 * 计算并格式化 token 使用情况和费用
 * @param tokens token 数量（输出 token）
 * @param modelId 模型 ID
 * @returns 包含 tokens 和 cost 的对象
 */
export function calculateTokensAndCost(tokens: number | null | undefined, modelId: string) {
  const outputTokens = tokens ?? 0

  return {
    tokens: outputTokens,
    cost: calculateTokenCost(outputTokens, modelId),
  }
}
