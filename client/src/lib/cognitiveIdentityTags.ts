// Utility function to generate cognitive identity tags based on tuning parameters

export interface CognitiveParameters {
  // Core cognitive parameters
  cognitivePace?: number;
  signalFocus?: number;
  impulseControl?: number;
  mentalEnergyFlow?: number;
  // Cognitive style parameters
  analytical?: number;
  intuitive?: number;
  contextualThinking?: number;
  memoryBandwidth?: number;
  thoughtComplexity?: number;
  mentalModelDensity?: number;
  patternDetectionSensitivity?: number;
  decisionMakingIndex?: number;
}

export function generateCognitiveIdentityTags(params: CognitiveParameters): string[] {
  const tags: string[] = [];
  
  // Cognitive Pace tags
  if (params.cognitivePace !== undefined) {
    if (params.cognitivePace < 0.3) {
      tags.push('Contemplative');
    } else if (params.cognitivePace > 0.7) {
      tags.push('Quick-Thinking');
    } else {
      tags.push('Balanced Pace');
    }
  }
  
  // Signal Focus tags
  if (params.signalFocus !== undefined) {
    if (params.signalFocus < 0.3) {
      tags.push('Laser-Focused');
    } else if (params.signalFocus > 0.7) {
      tags.push('Broad Scanner');
    } else {
      tags.push('Adaptive Focus');
    }
  }
  
  // Impulse Control tags
  if (params.impulseControl !== undefined) {
    if (params.impulseControl < 0.3) {
      tags.push('Action-Oriented');
    } else if (params.impulseControl > 0.7) {
      tags.push('Methodical');
    } else {
      tags.push('Balanced Response');
    }
  }
  
  // Mental Energy Flow tags
  if (params.mentalEnergyFlow !== undefined) {
    if (params.mentalEnergyFlow < 0.3) {
      tags.push('Doer');
    } else if (params.mentalEnergyFlow > 0.7) {
      tags.push('Reflective');
    } else {
      tags.push('Action-Reflection Balance');
    }
  }
  
  // Analytical tags
  if (params.analytical !== undefined) {
    if (params.analytical > 0.6) {
      tags.push('Analytical');
    }
  }
  
  // Intuitive tags
  if (params.intuitive !== undefined) {
    if (params.intuitive > 0.6) {
      tags.push('Intuitive');
    }
  }
  
  // Contextual Thinking tags
  if (params.contextualThinking !== undefined) {
    if (params.contextualThinking < 0.3) {
      tags.push('Context-Driven');
    } else if (params.contextualThinking > 0.7) {
      tags.push('Universal Thinker');
    } else {
      tags.push('Flexible Thinking');
    }
  }
  
  // Memory Bandwidth tags
  if (params.memoryBandwidth !== undefined) {
    if (params.memoryBandwidth < 0.3) {
      tags.push('Focused Memory');
    } else if (params.memoryBandwidth > 0.7) {
      tags.push('Deep Retainer');
    } else {
      tags.push('Adaptive Memory');
    }
  }
  
  // Thought Complexity tags
  if (params.thoughtComplexity !== undefined) {
    if (params.thoughtComplexity < 0.3) {
      tags.push('Direct Thinker');
    } else if (params.thoughtComplexity > 0.7) {
      tags.push('Complex Thinker');
    } else {
      tags.push('Balanced Complexity');
    }
  }
  
  // Mental Model Density tags
  if (params.mentalModelDensity !== undefined) {
    if (params.mentalModelDensity < 0.3) {
      tags.push('Free Thinker');
    } else if (params.mentalModelDensity > 0.7) {
      tags.push('Model Architect');
    } else {
      tags.push('Adaptive Models');
    }
  }
  
  // Pattern Detection Sensitivity tags
  if (params.patternDetectionSensitivity !== undefined) {
    if (params.patternDetectionSensitivity < 0.3) {
      tags.push('Local Optimizer');
    } else if (params.patternDetectionSensitivity > 0.7) {
      tags.push('System Scanner');
    } else {
      tags.push('Pattern Explorer');
    }
  }
  
  // Decision Making Index tags
  if (params.decisionMakingIndex !== undefined) {
    if (params.decisionMakingIndex < 0.3) {
      tags.push('Intuitive Decider');
    } else if (params.decisionMakingIndex > 0.7) {
      tags.push('Logical Decider');
    } else {
      tags.push('Balanced Decider');
    }
  }
  
  // Return top 8 tags for display (prioritize most distinctive ones)
  return tags.slice(0, 8);
}

// Helper function to get a shortened version of tags for compact display
export function getCompactCognitiveIdentityTags(params: CognitiveParameters): string[] {
  const tags = generateCognitiveIdentityTags(params);
  
  // Return only top 5 for very compact displays
  return tags.slice(0, 5);
}
