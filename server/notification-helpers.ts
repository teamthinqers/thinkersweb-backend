import { db } from '@db';
import { notifications, users, thoughts } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface NotificationData {
  recipientId: number;
  actorId: number;
  notificationType: 'new_thought' | 'new_perspective' | 'spark_saved';
  thoughtId: number;
  thoughtHeading: string;
}

/**
 * Create or update a notification with smart grouping
 * If a similar notification exists within the last hour, group actors together
 */
export async function createOrUpdateNotification(data: NotificationData) {
  try {
    // Don't notify the user about their own actions
    if (data.recipientId === data.actorId) {
      return null;
    }

    // Check if a similar notification exists within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const existingNotification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.recipientId, data.recipientId),
        eq(notifications.notificationType, data.notificationType),
        eq(notifications.thoughtId, data.thoughtId),
        sql`${notifications.createdAt} > ${oneHourAgo}`
      ),
    });

    if (existingNotification) {
      // Notification exists - update it by adding the new actor
      const actorIds = JSON.parse(existingNotification.actorIds) as number[];
      
      // Only add if actor not already in the list
      if (!actorIds.includes(data.actorId)) {
        actorIds.push(data.actorId);
        
        const [updated] = await db.update(notifications)
          .set({
            actorIds: JSON.stringify(actorIds),
            isRead: false, // Mark as unread again when new activity happens
            updatedAt: new Date(),
          })
          .where(eq(notifications.id, existingNotification.id))
          .returning();
        
        return updated;
      }
      
      return existingNotification;
    } else {
      // Create new notification
      const [newNotification] = await db.insert(notifications)
        .values({
          recipientId: data.recipientId,
          actorIds: JSON.stringify([data.actorId]),
          notificationType: data.notificationType,
          thoughtId: data.thoughtId,
          thoughtHeading: data.thoughtHeading,
          isRead: false,
        })
        .returning();
      
      return newNotification;
    }
  } catch (error) {
    console.error('Notification creation error:', error);
    return null;
  }
}

/**
 * Notify all users except the actor about a new social thought
 */
export async function notifyNewThought(actorId: number, thoughtId: number, thoughtHeading: string) {
  try {
    // Get all registered users except the actor
    const allUsers = await db.query.users.findMany({
      columns: { id: true },
    });

    // Create notifications for all users except the actor
    const notificationPromises = allUsers
      .filter(user => user.id !== actorId)
      .map(user => 
        createOrUpdateNotification({
          recipientId: user.id,
          actorId,
          notificationType: 'new_thought',
          thoughtId,
          thoughtHeading,
        })
      );

    await Promise.all(notificationPromises);
    console.log(`✅ Created notifications for new thought ${thoughtId} by user ${actorId}`);
  } catch (error) {
    console.error('Error notifying new thought:', error);
  }
}

/**
 * Notify thought owner and thread participants about a new perspective
 */
export async function notifyNewPerspective(actorId: number, thoughtId: number, thoughtHeading: string, ownerId: number) {
  try {
    // Notify thought owner
    await createOrUpdateNotification({
      recipientId: ownerId,
      actorId,
      notificationType: 'new_perspective',
      thoughtId,
      thoughtHeading,
    });

    console.log(`✅ Created notification for new perspective on thought ${thoughtId} by user ${actorId}`);
  } catch (error) {
    console.error('Error notifying new perspective:', error);
  }
}

/**
 * Notify thought owner when someone saves their thought as a spark
 */
export async function notifySparkSaved(actorId: number, thoughtId: number, thoughtHeading: string, ownerId: number) {
  try {
    await createOrUpdateNotification({
      recipientId: ownerId,
      actorId,
      notificationType: 'spark_saved',
      thoughtId,
      thoughtHeading,
    });

    console.log(`✅ Created notification for spark saved on thought ${thoughtId} by user ${actorId}`);
  } catch (error) {
    console.error('Error notifying spark saved:', error);
  }
}
