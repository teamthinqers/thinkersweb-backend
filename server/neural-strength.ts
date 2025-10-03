import { db } from "@db";
import { users, thoughts, savedThoughts } from "@shared/schema";
import { eq, and, count } from "drizzle-orm";
import { neuralStrengthConfig } from "./neural-strength-config";

export interface NeuralStrengthData {
  percentage: number;
  milestones: {
    cognitiveIdentityCompleted: boolean;
    learningEngineCompleted: boolean;
    hasActivity: boolean;
  };
  stats: {
    thoughtsCount: number;
    savedSparksCount: number;
  };
}

/**
 * Calculate user's neural strength percentage based on configurable thresholds
 */
export async function calculateNeuralStrength(userId: number): Promise<NeuralStrengthData> {
  // Get user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get activity counts
  const [thoughtsResult] = await db
    .select({ count: count() })
    .from(thoughts)
    .where(eq(thoughts.userId, userId));

  const [savedSparksResult] = await db
    .select({ count: count() })
    .from(savedThoughts)
    .where(eq(savedThoughts.userId, userId));

  const thoughtsCount = thoughtsResult?.count || 0;
  const savedSparksCount = savedSparksResult?.count || 0;
  const hasActivity = thoughtsCount > 0 || savedSparksCount > 0;

  // Calculate neural strength using configurable thresholds
  let strength = neuralStrengthConfig.baseStrength;

  // Add milestone bonuses
  if (user.cognitiveIdentityCompleted) {
    strength += neuralStrengthConfig.cognitiveIdentityBonus;
  }

  if (user.learningEngineCompleted) {
    strength += neuralStrengthConfig.learningEngineBonus;
  }

  if (hasActivity) {
    strength += neuralStrengthConfig.firstActivityBonus;
  }

  // Add incremental growth based on activity
  strength += thoughtsCount * neuralStrengthConfig.thoughtIncrement;
  strength += savedSparksCount * neuralStrengthConfig.savedSparkIncrement;

  // Cap at maximum
  strength = Math.min(strength, neuralStrengthConfig.maxStrength);

  return {
    percentage: Math.round(strength),
    milestones: {
      cognitiveIdentityCompleted: user.cognitiveIdentityCompleted || false,
      learningEngineCompleted: user.learningEngineCompleted || false,
      hasActivity,
    },
    stats: {
      thoughtsCount,
      savedSparksCount,
    },
  };
}
