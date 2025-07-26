/**
 * Usage Tracker for DotSpark Access Control
 * Manages token limits for general users vs unlimited access for activated users
 */

interface UserUsage {
  userId?: number;
  sessionId: string;
  tokensUsed: number;
  lastRequest: Date;
  isActivated: boolean;
  requestCount: number;
}

// In-memory usage tracking (can be moved to database later)
const userUsageMap = new Map<string, UserUsage>();

// Usage limits for non-activated users
const USAGE_LIMITS = {
  MAX_TOKENS_PER_DAY: 1000,      // Max tokens per day for general users
  MAX_REQUESTS_PER_HOUR: 10,     // Max requests per hour
  RESET_HOURS: 24                // Reset usage every 24 hours
};

/**
 * Get usage key for tracking (user ID or session ID)
 */
function getUsageKey(userId?: number, sessionId?: string): string {
  if (userId) return `user_${userId}`;
  return `session_${sessionId || 'anonymous'}`;
}

/**
 * Check if user has DotSpark activated
 */
export function isDotSparkActivated(userId?: number): boolean {
  if (!userId) return false;
  
  // Check localStorage equivalent for server-side (this would be from user profile/settings)
  // For now, we'll check against a simple activation list
  const activationKey = getUsageKey(userId);
  const usage = userUsageMap.get(activationKey);
  return usage?.isActivated || false;
}

/**
 * Activate DotSpark for a user
 */
export function activateDotSpark(userId: number, sessionId?: string): void {
  const usageKey = getUsageKey(userId, sessionId);
  const existing = userUsageMap.get(usageKey) || {
    userId,
    sessionId: sessionId || '',
    tokensUsed: 0,
    lastRequest: new Date(),
    isActivated: false,
    requestCount: 0
  };
  
  existing.isActivated = true;
  existing.userId = userId;
  userUsageMap.set(usageKey, existing);
  
  console.log(`DotSpark activated for user ${userId}`);
}

/**
 * Check if user can make a request based on usage limits
 */
export function canMakeRequest(
  userId?: number, 
  sessionId?: string, 
  estimatedTokens: number = 100
): {
  allowed: boolean;
  reason?: string;
  tokensRemaining?: number;
  requestsRemaining?: number;
} {
  const usageKey = getUsageKey(userId, sessionId);
  
  // Get or create usage record
  let usage = userUsageMap.get(usageKey);
  if (!usage) {
    usage = {
      userId,
      sessionId: sessionId || '',
      tokensUsed: 0,
      lastRequest: new Date(),
      isActivated: false,
      requestCount: 0
    };
    userUsageMap.set(usageKey, usage);
  }
  
  // Check if user has DotSpark activated
  if (usage.isActivated) {
    return { allowed: true }; // Unlimited access for activated users
  }
  
  // Reset usage if 24 hours have passed
  const hoursSinceLastRequest = (Date.now() - usage.lastRequest.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastRequest >= USAGE_LIMITS.RESET_HOURS) {
    usage.tokensUsed = 0;
    usage.requestCount = 0;
    usage.lastRequest = new Date();
  }
  
  // Check hourly request limit
  const currentHour = new Date().getHours();
  const lastRequestHour = usage.lastRequest.getHours();
  if (currentHour !== lastRequestHour) {
    usage.requestCount = 0; // Reset hourly count
  }
  
  // Check limits for non-activated users
  if (usage.requestCount >= USAGE_LIMITS.MAX_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      reason: 'Hourly request limit reached. Activate DotSpark for unlimited access.',
      requestsRemaining: 0
    };
  }
  
  if (usage.tokensUsed + estimatedTokens > USAGE_LIMITS.MAX_TOKENS_PER_DAY) {
    return {
      allowed: false,
      reason: 'Daily token limit reached. Activate DotSpark for unlimited access.',
      tokensRemaining: Math.max(0, USAGE_LIMITS.MAX_TOKENS_PER_DAY - usage.tokensUsed)
    };
  }
  
  return {
    allowed: true,
    tokensRemaining: USAGE_LIMITS.MAX_TOKENS_PER_DAY - usage.tokensUsed,
    requestsRemaining: USAGE_LIMITS.MAX_REQUESTS_PER_HOUR - usage.requestCount
  };
}

/**
 * Record token usage after a successful request
 */
export function recordUsage(
  userId?: number, 
  sessionId?: string, 
  tokensUsed: number = 100
): void {
  const usageKey = getUsageKey(userId, sessionId);
  const usage = userUsageMap.get(usageKey);
  
  if (usage) {
    usage.tokensUsed += tokensUsed;
    usage.requestCount += 1;
    usage.lastRequest = new Date();
    userUsageMap.set(usageKey, usage);
  }
}

/**
 * Get usage statistics for a user
 */
export function getUsageStats(userId?: number, sessionId?: string): {
  tokensUsed: number;
  tokensRemaining: number;
  requestsToday: number;
  isActivated: boolean;
  canUpgrade: boolean;
} {
  const usageKey = getUsageKey(userId, sessionId);
  const usage = userUsageMap.get(usageKey);
  
  if (!usage) {
    return {
      tokensUsed: 0,
      tokensRemaining: USAGE_LIMITS.MAX_TOKENS_PER_DAY,
      requestsToday: 0,
      isActivated: false,
      canUpgrade: !!userId // Can upgrade if logged in
    };
  }
  
  return {
    tokensUsed: usage.tokensUsed,
    tokensRemaining: usage.isActivated ? -1 : Math.max(0, USAGE_LIMITS.MAX_TOKENS_PER_DAY - usage.tokensUsed),
    requestsToday: usage.requestCount,
    isActivated: usage.isActivated,
    canUpgrade: !!userId && !usage.isActivated
  };
}

/**
 * Generate activation code for a user
 */
export function generateActivationCode(userId: number): string {
  // Simple activation code generation
  const timestamp = Date.now().toString(36);
  const userHash = userId.toString(36);
  return `DS-${timestamp}-${userHash}`.toUpperCase();
}

/**
 * Validate and redeem activation code
 */
export function redeemActivationCode(code: string, userId: number): boolean {
  // For now, accept any properly formatted code for demo purposes
  // In production, this would validate against a database of valid codes
  const codePattern = /^DS-[A-Z0-9]+-[A-Z0-9]+$/;
  
  if (codePattern.test(code)) {
    activateDotSpark(userId);
    return true;
  }
  
  return false;
}