import { Router } from 'express';
import { db } from '@db';
import { 
  thoughts, 
  savedThoughts, 
  users, 
  perspectivesThreads, 
  perspectivesMessages,
  perspectivesParticipants,
  sparks,
  sparksInsertSchema
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
      const emotionsArray = newThought.emotions ? JSON.parse(newThought.emotions) : [];
      const emotionsStr = emotionsArray.length > 0 ? `\nEmotions: ${emotionsArray.join(', ')}` : '';
      const embeddingContent = `${newThought.heading}\n\n${newThought.summary}${emotionsStr}`;
      await storeVectorEmbedding(
        'thought',
        newThought.id,
        embeddingContent,
        userId,
        {
          heading: newThought.heading,
          visibility: newThought.visibility,
          emotions: emotionsArray.join(', '),
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
 * GET /api/thoughts/stats
 * Get statistics for social thoughts and saved sparks
 * REQUIRES AUTHENTICATION
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Count total social thoughts (visibility='social' OR sharedToSocial=true)
    const [{ count: thoughtsCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(thoughts)
      .where(or(
        eq(thoughts.visibility, 'social'),
        eq(thoughts.sharedToSocial, true)
      ));

    // Count total saved sparks for this user
    const [{ count: savedSparksCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(sparks)
      .where(eq(sparks.userId, userId));

    res.json({
      success: true,
      stats: {
        thoughtsCount,
        savedSparksCount,
      },
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
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

/**
 * GET /api/thoughts/:thoughtId/perspectives/personal
 * Fetch personal perspectives (self-reflections) for a thought in MyNeura
 * Returns messages from the user's personal thread
 * REQUIRES AUTHENTICATION
 */
router.get('/:thoughtId/perspectives/personal', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (!thoughtId || isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Check if thought exists and belongs to user or is saved by user
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Check if it's user's own thought or a saved thought
    const isSaved = await db.query.savedThoughts.findFirst({
      where: and(
        eq(savedThoughts.userId, userId),
        eq(savedThoughts.thoughtId, thoughtId)
      ),
    });

    if (thought.userId !== userId && !isSaved) {
      return res.status(403).json({ error: 'Not authorized to view personal perspectives' });
    }

    // Get or create personal thread for this thought and user
    let thread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'personal'),
        eq(perspectivesThreads.userId, userId)
      ),
    });

    // Create thread if it doesn't exist
    if (!thread) {
      const [newThread] = await db.insert(perspectivesThreads).values({
        thoughtId,
        threadType: 'personal',
        userId,
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
    console.error('Fetch personal perspectives error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personal perspectives',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/thoughts/:thoughtId/perspectives/personal
 * Add a personal perspective (self-reflection) to a thought in MyNeura
 * Creates personal thread if needed
 * REQUIRES AUTHENTICATION
 */
router.post('/:thoughtId/perspectives/personal', async (req, res) => {
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

    // Check if thought exists and belongs to user or is saved by user
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Check if it's user's own thought or a saved thought
    const isSaved = await db.query.savedThoughts.findFirst({
      where: and(
        eq(savedThoughts.userId, userId),
        eq(savedThoughts.thoughtId, thoughtId)
      ),
    });

    if (thought.userId !== userId && !isSaved) {
      return res.status(403).json({ error: 'Not authorized to add personal perspectives' });
    }

    // Get or create personal thread for this thought and user
    let thread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'personal'),
        eq(perspectivesThreads.userId, userId)
      ),
    });

    if (!thread) {
      const [newThread] = await db.insert(perspectivesThreads).values({
        thoughtId,
        threadType: 'personal',
        userId,
      }).returning();
      thread = newThread;
    }

    // Insert the message
    const [newMessage] = await db.insert(perspectivesMessages).values({
      threadId: thread.id,
      userId,
      messageBody: validatedData.messageBody,
      visibilityScope: 'personal',
    }).returning();

    // Update thread's last activity
    await db.update(perspectivesThreads)
      .set({ lastActivityAt: new Date() })
      .where(eq(perspectivesThreads.id, thread.id));

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
    console.error('Post personal perspective error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post personal perspective',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:thoughtId/social-thread-status
 * Check if a thought has a social thread (for showing "Social Perspective" button)
 * REQUIRES AUTHENTICATION
 */
router.get('/:thoughtId/social-thread-status', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const thoughtId = parseInt(req.params.thoughtId);

    if (!thoughtId || isNaN(thoughtId)) {
      return res.status(400).json({ error: 'Invalid thought ID' });
    }

    // Check if thought has a social thread
    const socialThread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'social')
      ),
    });

    // Also check if thought is shared to social or was imported from social
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    const hasSocialThread = !!socialThread;
    const isSharedOrImported = thought?.sharedToSocial || thought?.visibility === 'social';

    res.json({
      success: true,
      hasSocialThread,
      isSharedOrImported,
      shouldShowSocialButton: hasSocialThread || isSharedOrImported,
    });

  } catch (error) {
    console.error('Check social thread status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check social thread status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:thoughtId/evolved-summary
 * Generate AI-powered evolved thought summary based on thought and perspectives
 */
router.get('/:thoughtId/evolved-summary', async (req, res) => {
  try {
    const thoughtId = parseInt(req.params.thoughtId);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get thought
    const thought = await db.query.thoughts.findFirst({
      where: eq(thoughts.id, thoughtId),
    });

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Get all perspectives (both personal and social)
    const personalThread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'personal'),
        eq(perspectivesThreads.userId, userId)
      ),
      with: {
        messages: {
          with: { user: true },
          orderBy: desc(perspectivesMessages.createdAt)
        }
      }
    });

    const socialThread = await db.query.perspectivesThreads.findFirst({
      where: and(
        eq(perspectivesThreads.thoughtId, thoughtId),
        eq(perspectivesThreads.threadType, 'social')
      ),
      with: {
        messages: {
          with: { user: true },
          orderBy: desc(perspectivesMessages.createdAt)
        }
      }
    });

    const allPerspectives = [
      ...(personalThread?.messages || []),
      ...(socialThread?.messages || [])
    ];

    // Generate evolved thought using AI
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Based on this original thought and various perspectives, create an evolved, deeper insight.

Original Thought:
Heading: ${thought.heading}
Summary: ${thought.summary}

Perspectives shared:
${allPerspectives.map(p => `- ${p.messageBody}`).join('\n')}

Generate a concise evolved thought (2-3 sentences) that synthesizes the original thought with all perspectives to reveal a deeper understanding.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const evolvedSummary = completion.choices[0]?.message?.content || 'Unable to generate evolved thought';

    res.json({
      success: true,
      evolvedSummary,
      thoughtContext: {
        heading: thought.heading,
        summary: thought.summary,
        perspectivesCount: allPerspectives.length
      }
    });

  } catch (error) {
    console.error('Generate evolved summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate evolved summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/thoughts/:thoughtId/sparks
 * Get user's saved sparks for a thought
 */
router.get('/:thoughtId/sparks', async (req, res) => {
  try {
    const thoughtId = parseInt(req.params.thoughtId);
    let userId = (req as any).user?.id;

    // Fallback to test user for development (similar to chat routes)
    if (!userId) {
      console.log('No authenticated user found for sparks GET, using test userId for demo');
      userId = 5; // Use test user ID for demonstration
    }

    const userSparks = await db.query.sparks.findMany({
      where: and(
        eq(sparks.thoughtId, thoughtId),
        eq(sparks.userId, userId)
      ),
      orderBy: desc(sparks.createdAt)
    });

    res.json({
      success: true,
      sparks: userSparks
    });

  } catch (error) {
    console.error('Get sparks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sparks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/thoughts/:thoughtId/sparks
 * Create a new spark for a thought
 */
router.post('/:thoughtId/sparks', async (req, res) => {
  try {
    const thoughtId = parseInt(req.params.thoughtId);
    let userId = (req as any).user?.id;

    // Fallback to test user for development (similar to chat routes)
    if (!userId) {
      console.log('No authenticated user found for sparks POST, using test userId for demo');
      userId = 5; // Use test user ID for demonstration
    }

    const validatedData = sparksInsertSchema.parse({
      thoughtId,
      userId,
      content: req.body.content
    });

    const [newSpark] = await db.insert(sparks).values(validatedData).returning();

    res.status(201).json({
      success: true,
      spark: newSpark
    });

  } catch (error) {
    console.error('Create spark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create spark',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/thoughts/:thoughtId/sparks/:sparkId
 * Delete a spark
 */
router.delete('/:thoughtId/sparks/:sparkId', async (req, res) => {
  try {
    const sparkId = parseInt(req.params.sparkId);
    let userId = (req as any).user?.id;

    // Fallback to test user for development (similar to chat routes)
    if (!userId) {
      console.log('No authenticated user found for sparks DELETE, using test userId for demo');
      userId = 5; // Use test user ID for demonstration
    }

    await db.delete(sparks).where(
      and(
        eq(sparks.id, sparkId),
        eq(sparks.userId, userId)
      )
    );

    res.json({ success: true });

  } catch (error) {
    console.error('Delete spark error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete spark'
    });
  }
});

/**
 * GET /api/thoughts/:thoughtId/social-sparks
 * Get ALL sparks from all users for a thought (social sparks)
 */
router.get('/:thoughtId/social-sparks', async (req, res) => {
  try {
    const thoughtId = parseInt(req.params.thoughtId);
    let userId = (req as any).user?.id;

    // Fallback to test user for development (similar to chat routes)
    if (!userId) {
      console.log('No authenticated user found for social-sparks GET, using test userId for demo');
      userId = 5; // Use test user ID for demonstration
    }

    // Get all sparks for this thought from all users
    const allSparks = await db.query.sparks.findMany({
      where: eq(sparks.thoughtId, thoughtId),
      orderBy: desc(sparks.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      sparks: allSparks
    });

  } catch (error) {
    console.error('Get social sparks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get social sparks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/user/sparks-count
 * Get total sparks count for the logged-in user
 */
router.get('/user/sparks-count', async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userSparks = await db.query.sparks.findMany({
      where: eq(sparks.userId, userId),
    });

    res.json({
      success: true,
      count: userSparks.length
    });

  } catch (error) {
    console.error('Get sparks count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sparks count'
    });
  }
});

export default router;
