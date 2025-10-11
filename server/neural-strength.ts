import { db } from "@db";
import { users, thoughts, savedThoughts, sparks, perspectivesMessages } from "@shared/schema";
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
    userSparksCount: number;
    perspectivesCount: number;
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

  const [userSparksResult] = await db
    .select({ count: count() })
    .from(sparks)
    .where(eq(sparks.userId, userId));

  const [perspectivesResult] = await db
    .select({ count: count() })
    .from(perspectivesMessages)
    .where(eq(perspectivesMessages.userId, userId));

  const thoughtsCount = thoughtsResult?.count || 0;
  const savedSparksCount = savedSparksResult?.count || 0;
  const userSparksCount = userSparksResult?.count || 0;
  const perspectivesCount = perspectivesResult?.count || 0;
  const hasActivity = thoughtsCount > 0 || savedSparksCount > 0 || userSparksCount > 0 || perspectivesCount > 0;

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

  // Add incremental growth based on activity (using same formula as collective growth)
  const totalActivity = thoughtsCount + userSparksCount + perspectivesCount;
  strength += (totalActivity / 3) * neuralStrengthConfig.thoughtIncrement;
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
      userSparksCount,
      perspectivesCount,
    },
  };
}
