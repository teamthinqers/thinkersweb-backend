import { Router, Request, Response } from 'express';
import { db } from '@db';
import { notifications, users } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/notifications-simple
 * Simplified notifications endpoint with direct session check
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check session directly
    const userId = (req as any).session?.userId || (req as any).user?.id;
    
    console.log('Notifications request - userId from session:', userId);
    
    if (!userId) {
      console.log('No userId found in session');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch notifications with related data
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.recipientId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
      with: {
        badge: true,
        thought: {
          columns: {
            id: true,
            heading: true,
          }
        }
      }
    });

    // Enrich with actor data
    const enrichedNotifications = await Promise.all(
      userNotifications.map(async (notification) => {
        const actorIds = JSON.parse(notification.actorIds) as number[];
        
        // Fetch actors individually to avoid SQL issues
        const actors = [];
        for (const actorId of actorIds) {
          const actor = await db.query.users.findFirst({
            where: eq(users.id, actorId),
            columns: {
              id: true,
              fullName: true,
              avatar: true,
            }
          });
          if (actor) actors.push(actor);
        }

        return {
          ...notification,
          actors,
          actorCount: actorIds.length,
        };
      })
    );

    // Count unread
    const unreadNotifications = await db.query.notifications.findMany({
      where: and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      )
    });

    res.json({
      success: true,
      notifications: enrichedNotifications,
      unreadCount: unreadNotifications.length,
    });

  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/notifications-simple/:id/read
 * Mark notification as read
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId || (req as any).user?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify notification belongs to user
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, userId)
      ),
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Mark as read
    await db.update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.id, notificationId));

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark as read',
    });
  }
});

/**
 * PATCH /api/notifications-simple/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await db.update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all as read',
    });
  }
});

export default router;
