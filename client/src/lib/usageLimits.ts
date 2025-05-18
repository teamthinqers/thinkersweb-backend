/**
 * Service for managing usage limits for chat interactions
 */

const TRIAL_USER_LIMIT = 10; // Max number of prompts for unregistered users
const REGISTERED_USER_LIMIT = 25; // Max number of prompts for registered users

// Local storage keys
const USAGE_COUNT_KEY = 'dotspark_usage_count';
const DEVICE_ID_KEY = 'dotspark_device_id';

/**
 * Generate a unique device ID if not already present
 */
function ensureDeviceId(): string {
  const existingId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (existingId) {
    return existingId;
  }
  
  // Generate a new device ID (simple UUID-like implementation)
  const newId = 'device_' + Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
  
  localStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
}

/**
 * Get the current usage count for the device
 */
export function getUsageCount(): number {
  ensureDeviceId(); // Make sure we have a device ID
  const countStr = localStorage.getItem(USAGE_COUNT_KEY);
  return countStr ? parseInt(countStr, 10) : 0;
}

/**
 * Increment the usage count and return the new count
 */
export function incrementUsageCount(): number {
  const currentCount = getUsageCount();
  const newCount = currentCount + 1;
  localStorage.setItem(USAGE_COUNT_KEY, newCount.toString());
  return newCount;
}

/**
 * Reset the usage count (typically done when a user registers)
 */
export function resetUsageCount(): void {
  localStorage.setItem(USAGE_COUNT_KEY, '0');
}

/**
 * Check if the user has exceeded their usage limit
 * @param isRegistered Whether the user is registered or not
 * @returns Whether the user has exceeded their limit
 */
export function hasExceededLimit(isRegistered: boolean): boolean {
  const count = getUsageCount();
  const limit = isRegistered ? REGISTERED_USER_LIMIT : TRIAL_USER_LIMIT;
  return count >= limit;
}

/**
 * Get the appropriate limit message based on user registration status
 * @param isRegistered Whether the user is registered or not
 * @returns The limit message to display
 */
export function getLimitMessage(isRegistered: boolean): string {
  if (isRegistered) {
    return "You have exceeded your limit, contact DotSpark team for continued usage.";
  } else {
    return "You have exceeded the usage limit for trial users. Contact DotSpark team or Register to continue using.";
  }
}

/**
 * Get the remaining prompts for the user
 * @param isRegistered Whether the user is registered or not
 * @returns The number of prompts remaining
 */
export function getRemainingPrompts(isRegistered: boolean): number {
  const count = getUsageCount();
  const limit = isRegistered ? REGISTERED_USER_LIMIT : TRIAL_USER_LIMIT;
  return Math.max(0, limit - count);
}