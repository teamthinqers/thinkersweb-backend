import { Router } from "express";
import { db } from "@db";
import { dots, users } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/social/dots
 * Fetch public dots from all users for the thought cloud
 * Returns dots with user information for social feed
 */
router.get('/dots', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    // Require authentication to view social feed
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch recent dots from all users with user information
    // Limit to 50 most recent dots to keep the thought cloud manageable
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const allDots = await db.query.dots.findMany({
      limit,
      offset,
      orderBy: desc(dots.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
            email: true,
          }
        }
      }
    });

    // Calculate total count for pagination
    const totalCount = await db.$count(dots);

    res.json({
      success: true,
      dots: allDots,
      total: totalCount,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Social dots fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/social/dot/:id
 * Get detailed view of a specific dot for the expanded modal
 */
router.get('/dot/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const dotId = parseInt(req.params.id);

    if (isNaN(dotId)) {
      return res.status(400).json({ error: 'Invalid dot ID' });
    }

    const dot = await db.query.dots.findFirst({
      where: eq(dots.id, dotId),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
            email: true,
            bio: true,
          }
        },
        wheel: true,
        chakra: true,
      }
    });

    if (!dot) {
      return res.status(404).json({ error: 'Dot not found' });
    }

    res.json({
      success: true,
      dot,
    });

  } catch (error) {
    console.error('Dot detail fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dot details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/social/stats
 * Get statistics for the social feed
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get total dots count
    const totalDots = await db.$count(dots);

    // Get unique users count who have created dots
    const uniqueUsers = await db.selectDistinct({ userId: dots.userId }).from(dots);

    // Get today's dots count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.json({
      success: true,
      stats: {
        totalDots,
        activeUsers: uniqueUsers.length,
        liveStatus: 'active',
      }
    });

  } catch (error) {
    console.error('Social stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
