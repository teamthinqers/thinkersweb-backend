import { Router } from 'express';
import { db } from '@db';
import { 
  thoughts, 
  savedThoughts, 
  users, 
  perspectivesThreads, 
  perspectivesMessages,
  perspectivesParticipants 
} from '@shared/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { insertThoughtSchema, perspectivesMessagesInsertSchema } from '@shared/schema';
import { storeVectorEmbedding } from '../vector-db';
import { calculateNeuralStrength } from '../neural-strength';

const router = Router();

/**
 * GET /api/thoughts
 * Fetch social thoughts from all users for the /home thought cloud
 * Returns only thoughts with visibility='social'
 * PUBLIC ENDPOINT - No authentication required
 */
router.get('/', async (req, res) => {
  try {
    // Optional: userId available if logged in (for future features like checking if thought is saved)
    const userId = (req as any).user?.id;

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const recent = req.query.recent === 'true';

    // Get thoughts that are either visibility='social' OR sharedToSocial=true
    let query = db.query.thoughts.findMany({
      where: or(
        eq(thoughts.visibility, 'social'),
        eq(thoughts.sharedToSocial, true)
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

    // If recent filter, get thoughts from last 7 days
    if (recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      query = db.query.thoughts.findMany({
        where: and(
          or(
            eq(thoughts.visibility, 'social'),
            eq(thoughts.sharedToSocial, true)
          ),
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

    // Get contributors (users who saved each thought) for each thought
    const thoughtsWithContributors = await Promise.all(
      socialThoughts.map(async (thought) => {
        // Get up to 4 contributors (we'll show first 3 + count for rest)
        const contributors = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            avatar: users.avatar,
          })
          .from(savedThoughts)
          .innerJoin(users, eq(savedThoughts.userId, users.id))
          .where(eq(savedThoughts.thoughtId, thought.id))
          .limit(4);

        // Get total contributor count
        const [{ count: contributorCount }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(savedThoughts)
          .where(eq(savedThoughts.thoughtId, thought.id));

        return {
          ...thought,
          contributors,
          contributorCount,
        };
      })
    );

    // Calculate total count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(thoughts)
      .where(or(
        eq(thoughts.visibility, 'social'),
        eq(thoughts.sharedToSocial, true)
      ));

    res.json({
      success: true,
      thoughts: thoughtsWithContributors,
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

    // Store vector embedding for semantic search
    try {
      const embeddingContent = `${newThought.heading}\n\n${newThought.summary}${newThought.emotion ? `\nEmotion: ${newThought.emotion}` : ''}`;
      await storeVectorEmbedding(
        'thought',
        newThought.id,
        embeddingContent,
        userId,
        {
          heading: newThought.heading,
          visibility: newThought.visibility,
          emotion: newThought.emotion || '',
          createdAt: newThought.createdAt.toISOString(),
        }
      );
    } catch (error) {
      console.error('Vector embedding creation failed (non-fatal):', error);
      // Continue even if vector embedding fails
    }

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

    // Special case: Check if user is trying to save their own thought that was shared from MyNeura
    if (thought.userId === userId && thought.sharedToSocial) {
      return res.status(400).json({ error: 'Dot already exists' });
    }

    // Allow saving if it's user's own thought created directly in social (not shared from MyNeura)
    // Skip the ownership check for thoughts created directly in /social

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
 * POST /api/thoughts/:thoughtId/share-to-social
 * Share a personal thought from MyNeura to Social feed
 */
router.post('/:thoughtId/share-to-social', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Check if thought exists and belongs to user
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    if (thought.userId !== userId) {
      return res.status(403).json({ error: 'Can only share your own thoughts' });
    }

    if (thought.visibility !== 'personal') {
      return res.status(400).json({ error: 'Can only share personal thoughts' });
    }

    // Check if already shared
    if (thought.sharedToSocial) {
      return res.status(400).json({ error: 'Thought already shared' });
    }

    // Share to social by setting sharedToSocial flag
    const [updated] = await db.update(thoughts)
      .set({
        sharedToSocial: true,
        updatedAt: new Date(),
      })
      .where(eq(thoughts.id, thoughtId))
      .returning();

    res.json({
      success: true,
      thought: updated,
      message: 'Thought shared to social feed',
    });

  } catch (error) {
    console.error('Share to social error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share thought',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:id
 * Get detailed view of a specific thought
 * PUBLIC ENDPOINT - No authentication required (for social thoughts)
 */
router.get('/:id', async (req, res) => {
  try {
    // Optional: userId available if logged in
    const userId = (req as any).user?.id;

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

    // Check if user has saved this thought (only if logged in)
    let saved = null;
    if (userId) {
      saved = await db.query.savedThoughts.findFirst({
        where: and(
          eq(savedThoughts.userId, userId),
          eq(savedThoughts.thoughtId, thoughtId)
        ),
      });
    }

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

/**
 * GET /api/thoughts/neural-strength
 * Get user's neural strength percentage based on their progress
 * Requires authentication
 */
router.get('/neural-strength', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const neuralStrength = await calculateNeuralStrength(userId);

    res.json({
      success: true,
      ...neuralStrength,
    });

  } catch (error) {
    console.error('Neural strength calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate neural strength',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:thoughtId/perspectives
 * Get all perspective messages for a thought
 * Creates a social thread if it doesn't exist
 */
router.get('/:thoughtId/perspectives', async (req, res) => {
  try {
    const thoughtId = parseInt(req.params.thoughtId);

    if (!thoughtId || isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Check if thought exists
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Get or create social thread for this thought
    let thread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'social')
      ),
    });

    // Create thread if it doesn't exist
    if (!thread) {
      const [newThread] = await db.insert(perspectivesThreads).values({
        thoughtId,
        threadType: 'social',
      }).returning();
      thread = newThread;
    }

    // Get all messages for this thread with user info
    const messages = await db.query.perspectivesMessages.findMany({
      where: and(
        eq(perspectivesMessages.threadId, thread.id),
        eq(perspectivesMessages.isDeleted, false)
      ),
      orderBy: perspectivesMessages.createdAt,
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
          }
        }
      }
    });

    res.json({
      success: true,
      threadId: thread.id,
      messages,
    });

  } catch (error) {
    console.error('Fetch perspectives error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch perspectives',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/thoughts/:thoughtId/perspectives
 * Add a new perspective message to a thought
 * Requires authentication
 */
router.post('/:thoughtId/perspectives', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (!thoughtId || isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Validate message body
    const validatedData = perspectivesMessagesInsertSchema.parse({
      messageBody: req.body.messageBody,
      userId,
      threadId: 0, // Will be set below
    });

    // Get or create social thread for this thought
    let thread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'social')
      ),
    });

    if (!thread) {
      const [newThread] = await db.insert(perspectivesThreads).values({
        thoughtId,
        threadType: 'social',
      }).returning();
      thread = newThread;
    }

    // Insert the message
    const [newMessage] = await db.insert(perspectivesMessages).values({
      threadId: thread.id,
      userId,
      messageBody: validatedData.messageBody,
      visibilityScope: 'public',
    }).returning();

    // Update thread's last activity
    await db.update(perspectivesThreads)
      .set({ lastActivityAt: new Date() })
      .where(eq(perspectivesThreads.id, thread.id));

    // Add user as participant if not already
    const existingParticipant = await db.query.perspectivesParticipants.findFirst({
      where: and(
        eq(perspectivesParticipants.threadId, thread.id),
        eq(perspectivesParticipants.userId, userId)
      ),
    });

    if (!existingParticipant) {
      await db.insert(perspectivesParticipants).values({
        threadId: thread.id,
        userId,
      });
    }

    // Get the message with user info to return
    const messageWithUser = await db.query.perspectivesMessages.findFirst({
      where: eq(perspectivesMessages.id, newMessage.id),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: messageWithUser,
    });

  } catch (error) {
    console.error('Post perspective error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post perspective',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
