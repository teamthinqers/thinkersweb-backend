/**
 * GPT-5 Model Configuration
 * 
 * OpenAI released GPT-5 with three variants in August 2025:
 * - gpt-5: Full reasoning model ($1.25/1M input, $10/1M output)
 * - gpt-5-mini: Faster, cost-efficient ($0.25/1M input, $2/1M output)  
 * - gpt-5-nano: Ultra-compact for high-volume ($0.05/1M input, $0.40/1M output)
 */

export interface ModelConfig {
  name: string;
  displayName: string;
  description: string;
  pricing: {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
  };
  contextWindow: number;
  capabilities: string[];
  recommended: string;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'gpt-5': {
    name: 'gpt-5',
    displayName: 'GPT-5',
    description: 'Latest GPT-5 with advanced reasoning and 272K context window',
    pricing: { input: 1.25, output: 10 },
    contextWindow: 272000,
    capabilities: ['Advanced reasoning', 'Complex problem solving', 'Code generation', 'Creative writing'],
    recommended: 'Best for complex tasks requiring deep reasoning'
  },
  'gpt-5-mini': {
    name: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    description: 'Faster, cost-efficient GPT-5 variant for defined tasks',
    pricing: { input: 0.25, output: 2 },
    contextWindow: 272000,
    capabilities: ['Fast responses', 'Cost-effective', 'Good reasoning', 'Structured output'],
    recommended: 'Best balance of performance and cost'
  },
  'gpt-5-nano': {
    name: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    description: 'Ultra-compact GPT-5 for high-volume, low-latency applications',
    pricing: { input: 0.05, output: 0.40 },
    contextWindow: 272000,
    capabilities: ['Ultra-fast', 'Very cost-effective', 'High volume', 'Basic reasoning'],
    recommended: 'Best for high-volume chat applications'
  },
  'gpt-4o': {
    name: 'gpt-4o',
    displayName: 'GPT-4o (Legacy)',
    description: 'Previous generation model, still capable',
    pricing: { input: 2.5, output: 10 },
    contextWindow: 128000,
    capabilities: ['Reliable', 'Proven performance', 'Good reasoning'],
    recommended: 'Fallback option'
  }
};

export const DEFAULT_MODEL = 'gpt-5-mini'; // Best balance for chat applications
export const PREMIUM_MODEL = 'gpt-5'; // For advanced reasoning tasks
export const ECONOMY_MODEL = 'gpt-5-nano'; // For high-volume usage

/**
 * Get recommended model based on task type
 */
export function getRecommendedModel(taskType: 'chat' | 'reasoning' | 'volume' | 'creative'): string {
  switch (taskType) {
    case 'chat':
      return 'gpt-5-mini';
    case 'reasoning':
      return 'gpt-5';
    case 'volume':
      return 'gpt-5-nano';
    case 'creative':
      return 'gpt-5';
    default:
      return DEFAULT_MODEL;
  }
}

/**
 * Validate if model is available
 */
export function isValidModel(modelName: string): boolean {
  return modelName in AVAILABLE_MODELS;
}

/**
 * Get model configuration
 */
export function getModelConfig(modelName: string): ModelConfig | null {
  return AVAILABLE_MODELS[modelName] || null;
}