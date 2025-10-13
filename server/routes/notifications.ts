import { Router } from 'express';
import { db } from '@db';
import { notifications, users, thoughts, badges } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 * Returns notifications with unread count and badge/thought info
 */
router.get('/', async (req, res) => {
  try {
    // Check both new auth (req.user) and session formats (userId and passport.user)
    const userId = (req as any).user?.id || 
                   (req as any).session?.userId || 
                   (req as any).session?.passport?.user;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch all notifications for the user, ordered by most recent
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.recipientId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50, // Limit to last 50 notifications
      with: {
        thought: {
          columns: {
            id: true,
            heading: true,
          }
        },
        badge: {
          columns: {
            id: true,
            name: true,
            icon: true,
            description: true,
          }
        }
      }
    });

    // Count unread notifications
    const [{ count: unreadCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      ));

    // Parse actor IDs and fetch actor details for each notification
    const enrichedNotifications = await Promise.all(
      userNotifications.map(async (notification) => {
        const actorIds = JSON.parse(notification.actorIds) as number[];
        
        // Fetch actor user details
        const actors = await db.query.users.findMany({
          where: sql`${users.id} = ANY(${actorIds})`,
          columns: {
            id: true,
            fullName: true,
            avatar: true,
          },
        });

        return {
          ...notification,
          actors,
          actorCount: actorIds.length,
        };
      })
    );

    res.json({
      success: true,
      notifications: enrichedNotifications,
      unreadCount: Number(unreadCount),
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 * NOTE: Must be defined BEFORE /:id/read to avoid route matching issues
 */
router.patch('/read-all', async (req, res) => {
  try {
    // Check both new auth (req.user) and session formats (userId and passport.user)
    const userId = (req as any).user?.id || 
                   (req as any).session?.userId || 
                   (req as any).session?.passport?.user;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Mark all user's notifications as read
    await db.update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch('/:id/read', async (req, res) => {
  try {
    // Check both new auth (req.user) and session formats (userId and passport.user)
    const userId = (req as any).user?.id || 
                   (req as any).session?.userId || 
                   (req as any).session?.passport?.user;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
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
    const [updated] = await db.update(notifications)
      .set({
        isRead: true,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    res.json({
      success: true,
      notification: updated,
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
