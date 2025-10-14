/**
 * WhatsApp Token Utilities
 * Used to encode user information in WhatsApp messages for auto-linking
 */

/**
 * Generate a token for WhatsApp message that encodes user ID
 * Format: Simple base64 encoding of user ID
 */
export function generateWhatsAppToken(userId: number): string {
  const tokenData = `${userId}:${Date.now()}`;
  const encoded = btoa(tokenData); // Base64 encode
  return encoded;
}

/**
 * Parse WhatsApp token from message
 * Returns user ID if valid, null otherwise
 */
export function parseWhatsAppToken(token: string): number | null {
  try {
    const decoded = atob(token); // Base64 decode
    const [userIdStr] = decoded.split(':');
    const userId = parseInt(userIdStr, 10);
    
    if (isNaN(userId)) {
      return null;
    }
    
    return userId;
  } catch (error) {
    console.error('Failed to parse WhatsApp token:', error);
    return null;
  }
}

/**
 * Extract token from WhatsApp message
 * Looks for pattern [ID:xxxxx] in the message
 */
export function extractTokenFromMessage(message: string): string | null {
  const tokenPattern = /\[ID:([^\]]+)\]/;
  const match = message.match(tokenPattern);
  return match ? match[1] : null;
}

/**
 * Generate WhatsApp message with embedded token for logged-in users
 */
export function generateWhatsAppMessage(userId: number | null): string {
  // Using Unicode escape to ensure emoji displays correctly
  const baseMessage = "Hey DotSpark \u{1F44B}";
  
  if (!userId) {
    return baseMessage;
  }
  
  const token = generateWhatsAppToken(userId);
  return `${baseMessage} [ID:${token}]`;
}
