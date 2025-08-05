/**
 * DotSpark Activation System
 * Manages user activation status and eligibility for saving dots, wheels, and chakras
 */

import { db } from "@db";
import { users, userBehavior, insertUserBehaviorSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { Express, Request, Response, NextFunction } from "express";

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

/**
 * Check if user has DotSpark activated
 */
export async function checkDotSparkActivation(userId: number): Promise<{
  activated: boolean;
  activatedAt?: Date;
  subscriptionTier?: string;
}> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        dotSparkActivated: true,
        dotSparkActivatedAt: true,
        subscriptionTier: true,
      }
    });

    if (!user) {
      return { activated: false };
    }

    return {
      activated: user.dotSparkActivated || false,
      activatedAt: user.dotSparkActivatedAt || undefined,
      subscriptionTier: user.subscriptionTier || 'free',
    };
  } catch (error) {
    console.error('Error checking DotSpark activation:', error);
    return { activated: false };
  }
}

/**
 * Activate DotSpark for a user
 */
export async function activateDotSpark(userId: number, subscriptionTier: string = 'free'): Promise<{
  success: boolean;
  message: string;
  user?: any;
}> {
  try {
    const [updatedUser] = await db.update(users)
      .set({
        dotSparkActivated: true,
        dotSparkActivatedAt: new Date(),
        subscriptionTier: subscriptionTier,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Track activation in user behavior
    await trackUserBehavior(userId, 'dot_created', 'dot', userId, {
      subscriptionTier,
      activatedAt: new Date().toISOString(),
      activationType: 'dotspark_activated'
    });

    console.log(`DotSpark activated for user ${userId} with ${subscriptionTier} tier`);

    return {
      success: true,
      message: 'Your DotSpark is now active and ready to capture your thoughts',
      user: updatedUser
    };
  } catch (error) {
    console.error('Error activating DotSpark:', error);
    return {
      success: false,
      message: 'Failed to activate DotSpark'
    };
  }
}

/**
 * Middleware to check if user is authenticated AND has DotSpark activated
 */
export function requireDotSparkActivation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check DotSpark activation
  checkDotSparkActivation(userId).then(({ activated, subscriptionTier }) => {
    if (!activated) {
      return res.status(403).json({
        error: 'DotSpark activation required',
        message: 'You need to activate DotSpark to save dots, wheels, and chakras',
        code: 'DOTSPARK_NOT_ACTIVATED',
        userId: userId,
        subscriptionTier: subscriptionTier || 'free'
      });
    }

    // Add activation info to request
    (req as any).dotSparkActivation = { activated, subscriptionTier };
    next();
  }).catch(error => {
    console.error('Error checking DotSpark activation in middleware:', error);
    return res.status(500).json({
      error: 'Failed to verify DotSpark activation status'
    });
  });
}

/**
 * Track user behavior for intelligent insights
 */
export async function trackUserBehavior(
  userId: number,
  actionType: string,
  entityType?: string,
  entityId?: number,
  actionData?: any,
  sessionId?: string
): Promise<void> {
  try {
    const behaviorData = insertUserBehaviorSchema.parse({
      userId,
      actionType,
      entityType,
      entityId,
      actionData: actionData ? JSON.stringify(actionData) : null,
      sessionId,
    });

    await db.insert(userBehavior).values(behaviorData);
    
    console.log(`Tracked user behavior: ${actionType} for user ${userId}`);
  } catch (error) {
    console.error('Error tracking user behavior:', error);
    // Don't throw error - behavior tracking should not break main functionality
  }
}

/**
 * Setup DotSpark activation routes
 */
export function setupDotSparkRoutes(app: Express) {
  const apiPrefix = "/api/dotspark";

  // Check activation status
  app.get(`${apiPrefix}/status`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activation = await checkDotSparkActivation(userId);
      
      res.json({
        userId,
        ...activation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking DotSpark status:', error);
      res.status(500).json({ error: 'Failed to check activation status' });
    }
  });

  // Activate DotSpark
  app.post(`${apiPrefix}/activate`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { subscriptionTier = 'free' } = req.body;

      const result = await activateDotSpark(userId, subscriptionTier);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error activating DotSpark:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to activate DotSpark'
      });
    }
  });

  // Get user behavior analytics (for debugging/admin)
  app.get(`${apiPrefix}/behavior`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const behaviors = await db.query.userBehavior.findMany({
        where: eq(userBehavior.userId, userId),
        orderBy: (userBehavior, { desc }) => [desc(userBehavior.timestamp)],
        limit: 50
      });

      res.json({
        userId,
        behaviors: behaviors.map(b => ({
          ...b,
          actionData: b.actionData ? JSON.parse(b.actionData) : null
        })),
        total: behaviors.length
      });
    } catch (error) {
      console.error('Error fetching user behavior:', error);
      res.status(500).json({ error: 'Failed to fetch behavior data' });
    }
  });
}