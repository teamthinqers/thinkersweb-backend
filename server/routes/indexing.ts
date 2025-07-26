import { Router } from 'express';
import { z } from 'zod';
import { indexingSystem } from '../indexing-structure';

const router = Router();

// Schema validation for requests
const indexContentSchema = z.object({
  contentId: z.number().positive(),
  contentType: z.enum(['dot', 'wheel', 'chakra']),
});

const semanticSearchSchema = z.object({
  query: z.string().min(1),
  contentTypes: z.array(z.enum(['dot', 'wheel', 'chakra'])).optional(),
  limit: z.number().positive().max(50).optional(),
  threshold: z.number().min(0).max(1).optional(),
});

const clusterInsightsSchema = z.object({
  minClusterSize: z.number().positive().max(10).optional(),
  maxClusters: z.number().positive().max(20).optional(),
});

const relatedContentSchema = z.object({
  contentId: z.number().positive(),
  contentType: z.enum(['dot', 'wheel', 'chakra']),
});

/**
 * POST /api/indexing/index-content
 * Index specific content (dot, wheel, or chakra)
 */
router.post('/index-content', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { contentId, contentType } = indexContentSchema.parse(req.body);

    if (contentType === 'dot') {
      await indexingSystem.indexDot(contentId, userId);
    } else {
      await indexingSystem.indexWheel(contentId, userId);
    }

    res.json({ 
      success: true, 
      message: `Successfully indexed ${contentType} ${contentId}` 
    });

  } catch (error) {
    console.error('Index content error:', error);
    res.status(500).json({ 
      error: 'Failed to index content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/indexing/index-all
 * Index all user content
 */
router.post('/index-all', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await indexingSystem.indexAllUserContent(userId);

    res.json({ 
      success: true, 
      message: 'Successfully indexed all user content' 
    });

  } catch (error) {
    console.error('Index all content error:', error);
    res.status(500).json({ 
      error: 'Failed to index all content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/indexing/semantic-search
 * Perform semantic search across indexed content
 */
router.post('/semantic-search', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { query, contentTypes, limit, threshold } = semanticSearchSchema.parse(req.body);

    const results = await indexingSystem.semanticSearch(query, userId, {
      contentTypes,
      limit,
      threshold,
    });

    res.json({ 
      success: true,
      results,
      count: results.length
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ 
      error: 'Semantic search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/indexing/cluster-insights
 * Cluster user insights for pattern recognition
 */
router.post('/cluster-insights', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { minClusterSize, maxClusters } = clusterInsightsSchema.parse(req.body);

    const clusters = await indexingSystem.clusterInsights(userId, {
      minClusterSize,
      maxClusters,
    });

    res.json({ 
      success: true,
      clusters,
      count: clusters.length
    });

  } catch (error) {
    console.error('Cluster insights error:', error);
    res.status(500).json({ 
      error: 'Insight clustering failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/indexing/blind-spots
 * Detect blind spots and missing connections
 */
router.get('/blind-spots', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const analysis = await indexingSystem.detectBlindSpots(userId);

    res.json({ 
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Blind spot detection error:', error);
    res.status(500).json({ 
      error: 'Blind spot detection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/indexing/related-content
 * Find content related to a specific item
 */
router.post('/related-content', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { contentId, contentType } = relatedContentSchema.parse(req.body);

    const relatedItems = await indexingSystem.findRelatedContent(contentId, contentType, userId);

    res.json({ 
      success: true,
      relatedItems,
      count: relatedItems.length
    });

  } catch (error) {
    console.error('Related content error:', error);
    res.status(500).json({ 
      error: 'Failed to find related content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/indexing/remove-content
 * Remove content from index
 */
router.delete('/remove-content', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { contentId, contentType } = indexContentSchema.parse(req.body);

    await indexingSystem.removeFromIndex(contentId, contentType);

    res.json({ 
      success: true, 
      message: `Successfully removed ${contentType} ${contentId} from index` 
    });

  } catch (error) {
    console.error('Remove content error:', error);
    res.status(500).json({ 
      error: 'Failed to remove content from index',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/indexing/status
 * Get indexing system status and statistics
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get indexing statistics
    const status = {
      vectorDatabaseAvailable: !!process.env.PINECONE_API_KEY,
      openAIAvailable: !!process.env.OPENAI_API_KEY,
      indexName: 'dotspark-cognitive-index',
      features: {
        semanticSearch: true,
        insightClustering: true,
        blindSpotDetection: true,
        relatedContentFinding: true,
        automaticIndexing: true,
      },
    };

    res.json({ 
      success: true,
      status
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to get indexing status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;