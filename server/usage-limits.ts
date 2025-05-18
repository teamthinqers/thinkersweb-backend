/**
 * Server-side handling of usage limits
 */

import { Request, Response, NextFunction } from 'express';

// Constants for usage limits
const TRIAL_USER_LIMIT = 10; // Max number of prompts for unregistered users
const REGISTERED_USER_LIMIT = 25; // Max number of prompts for registered users

// Map to store device usage (this will reset on server restart - in a production app, this should be stored in the database)
const deviceUsageMap = new Map<string, number>();
const userUsageMap = new Map<number, number>();

/**
 * Middleware to check usage limits for WhatsApp messages
 * This only checks registered users since WhatsApp interactions require registration
 */
export function checkWhatsAppUsageLimits(req: Request, res: Response, next: NextFunction) {
  // Check if request has user info from auth
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = req.user.id;
  const currentUsage = userUsageMap.get(userId) || 0;

  if (currentUsage >= REGISTERED_USER_LIMIT) {
    return res.status(403).json({ 
      error: 'Usage limit exceeded',
      message: 'You have exceeded your limit, contact DotSpark team for continued usage.'
    });
  }

  // Increment usage for this user
  userUsageMap.set(userId, currentUsage + 1);
  
  // Continue with the request
  next();
}

/**
 * API endpoint to check current usage
 */
export function getCurrentUsage(req: Request, res: Response) {
  let currentUsage = 0;
  let limit = TRIAL_USER_LIMIT;
  let isRegistered = false;

  // If user is logged in, get usage from user map
  if (req.user && req.user.id) {
    currentUsage = userUsageMap.get(req.user.id) || 0;
    limit = REGISTERED_USER_LIMIT;
    isRegistered = true;
  } 
  // Otherwise use device ID from request headers
  else {
    const deviceId = req.headers['x-device-id'] as string;
    if (deviceId) {
      currentUsage = deviceUsageMap.get(deviceId) || 0;
    }
  }

  res.json({
    currentUsage,
    limit,
    remaining: Math.max(0, limit - currentUsage),
    isRegistered
  });
}

/**
 * API endpoint to increment usage
 */
export function incrementUsage(req: Request, res: Response) {
  let currentUsage = 0;
  let limit = TRIAL_USER_LIMIT;
  let isRegistered = false;

  // If user is logged in, increment user usage
  if (req.user && req.user.id) {
    currentUsage = userUsageMap.get(req.user.id) || 0;
    userUsageMap.set(req.user.id, currentUsage + 1);
    currentUsage += 1;
    limit = REGISTERED_USER_LIMIT;
    isRegistered = true;
  } 
  // Otherwise use device ID
  else {
    const deviceId = req.headers['x-device-id'] as string;
    if (deviceId) {
      currentUsage = deviceUsageMap.get(deviceId) || 0;
      deviceUsageMap.set(deviceId, currentUsage + 1);
      currentUsage += 1;
    } else {
      return res.status(400).json({ error: 'Device ID is required for unregistered users' });
    }
  }

  const hasExceededLimit = currentUsage >= limit;
  
  res.json({
    currentUsage,
    limit,
    remaining: Math.max(0, limit - currentUsage),
    isRegistered,
    hasExceededLimit
  });
}

/**
 * Manually check if a user has exceeded their limit
 * This is used internally by other server endpoints
 */
export function hasUserExceededLimit(userId: number): boolean {
  const currentUsage = userUsageMap.get(userId) || 0;
  return currentUsage >= REGISTERED_USER_LIMIT;
}

/**
 * Reset usage for a specific user
 */
export function resetUserUsage(req: Request, res: Response) {
  // This would typically require admin privileges
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  userUsageMap.set(userId, 0);
  
  res.json({
    userId,
    usage: 0,
    message: 'Usage reset successfully'
  });
}