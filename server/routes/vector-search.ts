import express from 'express';
import { 
  searchSimilarContent, 
  suggestRelatedThoughts, 
  getConversationContext,
  storeVectorEmbedding,
  findRelatedContent,
  initializeVectorDB 
} from '../vector-db';
import { isAuthenticated } from '../auth';

const router = express.Router();

/**
 * Initialize vector database
 */
router.post('/initialize', async (req, res) => {
  try {
    await initializeVectorDB();
    res.json({ success: true, message: 'Vector database initialized successfully' });
  } catch (error) {
    console.error('Error initializing vector DB:', error);
    res.status(500).json({ 
      error: 'Failed to initialize vector database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Search for similar content
 */
router.post('/search', isAuthenticated, async (req, res) => {
  try {
    const { query, topK = 10, threshold = 0.7, contentTypes = [], includeContent = true } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const results = await searchSimilarContent(query, {
      topK,
      threshold,
      contentTypes,
      userId: req.user?.id,
      includeContent
    });

    res.json({
      success: true,
      query,
      resultsCount: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching similar content:', error);
    res.status(500).json({ 
      error: 'Failed to search similar content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get related thoughts for current input
 */
router.post('/related-thoughts', isAuthenticated, async (req, res) => {
  try {
    const { thought, limit = 3 } = req.body;
    
    if (!thought || typeof thought !== 'string') {
      return res.status(400).json({ error: 'Thought is required and must be a string' });
    }

    const suggestions = await suggestRelatedThoughts(thought, req.user!.id, limit);

    res.json({
      success: true,
      thought,
      suggestions
    });
  } catch (error) {
    console.error('Error getting related thoughts:', error);
    res.status(500).json({ 
      error: 'Failed to get related thoughts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get conversation context for intelligent responses
 */
router.post('/conversation-context', isAuthenticated, async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const context = await getConversationContext(query, req.user!.id, limit);

    res.json({
      success: true,
      query,
      contextItems: context.length,
      context
    });
  } catch (error) {
    console.error('Error getting conversation context:', error);
    res.status(500).json({ 
      error: 'Failed to get conversation context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Store new content with vector embedding
 */
router.post('/store', isAuthenticated, async (req, res) => {
  try {
    const { contentType, contentId, content, metadata = {} } = req.body;
    
    if (!contentType || !contentId || !content) {
      return res.status(400).json({ 
        error: 'contentType, contentId, and content are required' 
      });
    }

    const vectorId = await storeVectorEmbedding(
      contentType,
      contentId,
      content,
      req.user!.id,
      metadata
    );

    res.json({
      success: true,
      message: 'Content stored with vector embedding',
      vectorId,
      contentType,
      contentId
    });
  } catch (error) {
    console.error('Error storing vector embedding:', error);
    res.status(500).json({ 
      error: 'Failed to store vector embedding',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Find content related to specific item
 */
router.get('/related/:contentType/:contentId', isAuthenticated, async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { limit = 5, threshold = 0.7 } = req.query;

    const related = await findRelatedContent(contentType, parseInt(contentId), {
      topK: parseInt(limit as string),
      threshold: parseFloat(threshold as string),
      userId: req.user!.id
    });

    res.json({
      success: true,
      contentType,
      contentId: parseInt(contentId),
      relatedCount: related.length,
      related
    });
  } catch (error) {
    console.error('Error finding related content:', error);
    res.status(500).json({ 
      error: 'Failed to find related content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Semantic search across all user content
 */
router.post('/semantic-search', isAuthenticated, async (req, res) => {
  try {
    const { 
      query, 
      contentTypes = ['entry', 'dot', 'wheel', 'chakra'], 
      limit = 20,
      threshold = 0.6 
    } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const results = await searchSimilarContent(query, {
      topK: limit,
      threshold,
      contentTypes,
      userId: req.user!.id,
      includeContent: true
    });

    // Group results by content type for organized display
    const groupedResults = results.reduce((acc, result) => {
      const type = result.metadata.contentType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(result);
      return acc;
    }, {} as Record<string, typeof results>);

    res.json({
      success: true,
      query,
      totalResults: results.length,
      resultsByType: Object.keys(groupedResults).map(type => ({
        contentType: type,
        count: groupedResults[type].length,
        results: groupedResults[type]
      })),
      allResults: results
    });
  } catch (error) {
    console.error('Error performing semantic search:', error);
    res.status(500).json({ 
      error: 'Failed to perform semantic search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get vector database statistics
 */
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const { db } = await import('../../db');
    const { vectorEmbeddings } = await import('@shared/schema');
    const { eq, count, sql } = await import('drizzle-orm');

    // Get user's vector embedding stats
    const userEmbeddings = await db
      .select({
        contentType: vectorEmbeddings.contentType,
        count: sql<number>`count(*)::int`
      })
      .from(vectorEmbeddings)
      .where(eq(vectorEmbeddings.userId, req.user!.id))
      .groupBy(vectorEmbeddings.contentType);

    const totalCount = await db
      .select({ count: count() })
      .from(vectorEmbeddings)
      .where(eq(vectorEmbeddings.userId, req.user!.id));

    res.json({
      success: true,
      userId: req.user!.id,
      totalEmbeddings: totalCount[0]?.count || 0,
      embeddingsByType: userEmbeddings,
      vectorDimensions: 1536,
      indexName: process.env.PINECONE_INDEX_NAME || 'dotspark-vectors'
    });
  } catch (error) {
    console.error('Error getting vector stats:', error);
    res.status(500).json({ 
      error: 'Failed to get vector database statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;