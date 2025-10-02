import { Router } from 'express';
import { db } from '@db';
import { thoughts, savedThoughts, users } from '@shared/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { insertThoughtSchema } from '@shared/schema';

const router = Router();

/**
 * GET /api/thoughts
 * Fetch social thoughts from all users for the /home thought cloud
 * Returns only thoughts with visibility='social'
 */
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const recent = req.query.recent === 'true';

    let query = db.query.thoughts.findMany({
      where: eq(thoughts.visibility, 'social'),
      limit,
      offset,
      orderBy: desc(thoughts.createdAt),
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

    // If recent filter, get thoughts from last 7 days
    if (recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      query = db.query.thoughts.findMany({
        where: and(
          eq(thoughts.visibility, 'social'),
          sql`${thoughts.createdAt} >= ${sevenDaysAgo}`
        ),
        limit,
        offset,
        orderBy: desc(thoughts.createdAt),
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
    }

    const socialThoughts = await query;

    // Calculate total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(thoughts)
      .where(eq(thoughts.visibility, 'social'));

    res.json({
      success: true,
      thoughts: socialThoughts,
      total: count,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Social thoughts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social feed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/thoughts
 * Create a new thought (personal or social)
 */
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validatedData = insertThoughtSchema.parse({
      ...req.body,
      userId,
    });

    const [newThought] = await db.insert(thoughts)
      .values(validatedData)
      .returning();

    // Fetch with user info
    const thoughtWithUser = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, newThought.id),
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

    res.status(201).json({
      success: true,
      thought: thoughtWithUser,
    });

  } catch (error) {
    console.error('Thought creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create thought',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/myneura/thoughts
 * Get user's personal thoughts + saved social thoughts for /myneura page
 */
router.get('/myneura', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user's own personal thoughts
    const personalThoughts = await db.query.thoughts.findMany({
      where: and(
        eq(thoughts.userId, userId),
        eq(thoughts.visibility, 'personal')
      ),
      orderBy: desc(thoughts.createdAt),
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

    // Get saved social thoughts from others
    const saved = await db.query.savedThoughts.findMany({
      where: eq(savedThoughts.userId, userId),
      with: {
        thought: {
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
        }
      }
    });

    const savedThoughtsData = saved.map(s => ({
      ...s.thought,
      isSaved: true,
      savedAt: s.savedAt,
    }));

    // Combine and sort by creation date
    const allMyNeuraThoughts = [...personalThoughts, ...savedThoughtsData]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      thoughts: allMyNeuraThoughts,
      total: allMyNeuraThoughts.length,
    });

  } catch (error) {
    console.error('MyNeura thoughts fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personal thoughts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/myneura/save/:thoughtId
 * Save a social thought to user's MyNeura
 */
router.post('/myneura/save/:thoughtId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Check if thought exists and is social
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    if (thought.visibility !== 'social') {
      return res.status(403).json({ error: 'Can only save social thoughts' });
    }

    if (thought.userId === userId) {
      return res.status(400).json({ error: 'Cannot save your own thought' });
    }

    // Check if already saved
    const existing = await db.query.savedThoughts.findFirst({
      where: and(
        eq(savedThoughts.userId, userId),
        eq(savedThoughts.thoughtId, thoughtId)
      ),
    });

    if (existing) {
      return res.status(400).json({ error: 'Thought already saved' });
    }

    // Save it
    const [saved] = await db.insert(savedThoughts)
      .values({
        userId,
        thoughtId,
      })
      .returning();

    res.status(201).json({
      success: true,
      saved,
    });

  } catch (error) {
    console.error('Save thought error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save thought',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/myneura/save/:thoughtId
 * Remove a saved thought from MyNeura
 */
router.delete('/myneura/save/:thoughtId', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Delete the saved thought
    await db.delete(savedThoughts)
      .where(and(
        eq(savedThoughts.userId, userId),
        eq(savedThoughts.thoughtId, thoughtId)
      ));

    res.json({
      success: true,
      message: 'Thought removed from MyNeura',
    });

  } catch (error) {
    console.error('Remove saved thought error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove thought',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:id
 * Get detailed view of a specific thought
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const thoughtId = parseInt(req.params.id);

    if (isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
            email: true,
            bio: true,
          }
        }
      }
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Check if user has saved this thought
    const saved = await db.query.savedThoughts.findFirst({
      where: and(
        eq(savedThoughts.userId, userId),
        eq(savedThoughts.thoughtId, thoughtId)
      ),
    });

    res.json({
      success: true,
      thought: {
        ...thought,
        isSaved: !!saved,
      },
    });

  } catch (error) {
    console.error('Thought detail fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch thought details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
