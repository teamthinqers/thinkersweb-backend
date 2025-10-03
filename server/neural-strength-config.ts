// Neural Strength Meter Configuration
// This file contains configurable thresholds for the neural strength calculation
// Can be modified without changing code logic

export interface NeuralStrengthConfig {
  baseStrength: number;
  cognitiveIdentityBonus: number;
  learningEngineBonus: number;
  firstActivityBonus: number;
  thoughtIncrement: number;
  savedSparkIncrement: number;
  reflectionIncrement: number;
  maxStrength: number;
}

// Default configuration - easily modifiable
export const neuralStrengthConfig: NeuralStrengthConfig = {
  baseStrength: 10, // Starting strength for all users
  cognitiveIdentityBonus: 30, // Bonus when cognitive identity is completed (reaches 40%)
  learningEngineBonus: 20, // Bonus when learning engine is set up (reaches 60%)
  firstActivityBonus: 10, // Bonus when user creates first thought or saves first spark (reaches 70%)
  thoughtIncrement: 0.5, // Increment per thought created (gradual growth)
  savedSparkIncrement: 0.3, // Increment per spark saved from social
  reflectionIncrement: 0.2, // Increment per social reflection
  maxStrength: 100, // Maximum neural strength possible
};

// Function to update config dynamically if needed
export function updateNeuralStrengthConfig(updates: Partial<NeuralStrengthConfig>): void {
  Object.assign(neuralStrengthConfig, updates);
}
