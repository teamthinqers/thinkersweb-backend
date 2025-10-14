/**
 * WhatsApp Token Utilities (Server-side)
 * Used to parse user tokens from WhatsApp messages for auto-linking
 */

/**
 * Parse WhatsApp token from encoded string
 * Returns user ID if valid, null otherwise
 */
export function parseWhatsAppToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
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
 * Extract user ID from WhatsApp message with embedded token
 * Returns null if no valid token found
 */
export function extractUserIdFromMessage(message: string): number | null {
  const token = extractTokenFromMessage(message);
  
  if (!token) {
    return null;
  }
  
  return parseWhatsAppToken(token);
}

/**
 * Clean message by removing the token
 * Returns the original message without the [ID:xxxxx] part
 */
export function cleanMessageFromToken(message: string): string {
  return message.replace(/\s*\[ID:[^\]]+\]\s*/g, '').trim();
}
