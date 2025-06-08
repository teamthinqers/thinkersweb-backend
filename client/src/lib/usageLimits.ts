/**
 * Service for managing usage limits for chat interactions
 */

const TRIAL_USER_LIMIT = 10; // Max number of prompts for unregistered users
const REGISTERED_USER_LIMIT = 20; // Max number of prompts for registered users
const ACTIVATED_USER_LIMIT = -1; // Unlimited for users who have activated DotSpark

// Local storage keys
const USAGE_COUNT_KEY = 'dotspark_usage_count';
const DEVICE_ID_KEY = 'dotspark_device_id';
const FIRST_CHAT_KEY = 'dotspark_first_chat_done';

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
 * @param isActivated Whether the user has activated DotSpark
 * @returns Whether the user has exceeded their limit
 */
export function hasExceededLimit(isRegistered: boolean, isActivated: boolean = false): boolean {
  if (isActivated) {
    return false; // Unlimited usage for activated users
  }
  
  const count = getUsageCount();
  const limit = isRegistered ? REGISTERED_USER_LIMIT : TRIAL_USER_LIMIT;
  return count >= limit;
}

/**
 * Get the appropriate limit message based on user registration status
 * @param isRegistered Whether the user is registered or not
 * @param isActivated Whether the user has activated DotSpark
 * @returns The limit message to display
 */
export function getLimitMessage(isRegistered: boolean, isActivated: boolean = false): string {
  if (isActivated) {
    return ""; // No limit message for activated users
  }
  
  if (isRegistered) {
    return "Please contact DotSpark team for continued usage";
  } else {
    return "Please contact DotSpark team for continued usage";
  }
}

/**
 * Check if this is the user's first chat interaction
 * @returns Whether this is the first chat
 */
export function isFirstChat(): boolean {
  return !localStorage.getItem(FIRST_CHAT_KEY);
}

/**
 * Mark that the user has completed their first chat
 */
export function markFirstChatDone(): void {
  localStorage.setItem(FIRST_CHAT_KEY, 'true');
}

/**
 * Get the remaining prompts for the user
 * @param isRegistered Whether the user is registered or not
 * @param isActivated Whether the user has activated DotSpark
 * @returns The number of prompts remaining
 */
export function getRemainingPrompts(isRegistered: boolean, isActivated: boolean = false): number {
  if (isActivated) {
    return -1; // Unlimited
  }
  
  const count = getUsageCount();
  const limit = isRegistered ? REGISTERED_USER_LIMIT : TRIAL_USER_LIMIT;
  return Math.max(0, limit - count);
}