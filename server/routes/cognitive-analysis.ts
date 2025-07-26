import { Request, Response } from 'express';
import { classifyCognitiveStructure, performSemanticAnalysis, generateContextualInsights, extractKeyEntities } from '../cognitive-classifier';
import { performIntelligentRetrieval, performEnhancedSearch } from '../intelligent-retriever';
import { isAuthenticated } from '../auth';

/**
 * Analyze content and classify cognitive structure
 */
export async function analyzeCognitiveStructure(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const classification = await classifyCognitiveStructure(content);
    const semanticAnalysis = await performSemanticAnalysis(content);
    const keyEntities = await extractKeyEntities(content);

    return res.json({
      success: true,
      data: {
        classification,
        semanticAnalysis,
        keyEntities,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in cognitive structure analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze cognitive structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Perform intelligent retrieval based on query
 */
export async function performIntelligentQuery(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { 
      query, 
      includeVector = true, 
      includeDatabase = true, 
      includeSemantic = true,
      limit = 10 
    } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await performIntelligentRetrieval(query, userId, {
      includeVector,
      includeDatabase,
      includeSemantic,
      limit: Math.min(limit, 50) // Cap at 50 results
    });

    return res.json({
      success: true,
      data: {
        query,
        results,
        processedAt: new Date().toISOString(),
        resultCount: {
          vectorResults: results.relatedContent.length,
          databaseResults: results.similarStructures.length,
          totalInsights: results.contextualInsights.insights.length
        }
      }
    });

  } catch (error) {
    console.error('Error in intelligent query:', error);
    return res.status(500).json({ 
      error: 'Failed to process intelligent query',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Enhanced search with filters and intelligent ranking
 */
export async function performAdvancedSearch(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { 
      query,
      filters = {}
    } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Validate filters
    const validFilters = {
      types: Array.isArray(filters.types) ? filters.types.filter((t: string) => 
        ['dot', 'wheel', 'chakra'].includes(t)
      ) : undefined,
      timeRange: ['day', 'week', 'month', 'year', 'all'].includes(filters.timeRange) 
        ? filters.timeRange : 'all',
      complexity: Array.isArray(filters.complexity) ? filters.complexity.filter((c: string) =>
        ['simple', 'moderate', 'complex'].includes(c)
      ) : undefined,
      domains: Array.isArray(filters.domains) ? filters.domains : undefined
    };

    const searchResults = await performEnhancedSearch(query, userId, validFilters);

    return res.json({
      success: true,
      data: {
        query,
        filters: validFilters,
        ...searchResults,
        processedAt: new Date().toISOString(),
        statistics: {
          totalResults: searchResults.rankedContent.length,
          cognitiveType: searchResults.results.cognitiveStructure.type,
          confidence: searchResults.results.cognitiveStructure.confidence,
          complexity: searchResults.results.semanticAnalysis.complexity,
          readinessScore: searchResults.results.semanticAnalysis.readinessScore
        }
      }
    });

  } catch (error) {
    console.error('Error in advanced search:', error);
    return res.status(500).json({ 
      error: 'Failed to perform advanced search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get contextual insights for specific content
 */
export async function getContextualInsights(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { content, contentType, contentId } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Classify the cognitive structure
    const cognitiveStructure = await classifyCognitiveStructure(content);
    
    // Get related content from intelligent retrieval
    const retrievalResults = await performIntelligentRetrieval(content, userId, {
      includeVector: true,
      includeDatabase: true,
      includeSemantic: false,
      limit: 5
    });

    // Generate insights
    const insights = await generateContextualInsights(
      cognitiveStructure,
      retrievalResults.relatedContent.map(item => ({
        content: (item as any).content || '',
        type: (item as any).metadata?.contentType || 'unknown',
        similarity: (item as any).similarity || 0
      })),
      retrievalResults.similarStructures.map(item => ({
        content: `${item.heading}: ${item.content}`,
        timestamp: new Date(item.metadata?.createdAt || Date.now())
      }))
    );

    return res.json({
      success: true,
      data: {
        content,
        contentType,
        contentId,
        cognitiveStructure,
        insights,
        relatedContentCount: retrievalResults.relatedContent.length,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating contextual insights:', error);
    return res.status(500).json({ 
      error: 'Failed to generate contextual insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Batch analyze multiple pieces of content
 */
export async function batchAnalyzeContent(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { contents } = req.body;
    
    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'Contents array is required' });
    }

    if (contents.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 contents allowed per batch' });
    }

    const results = await Promise.all(
      contents.map(async (content: string, index: number) => {
        try {
          const classification = await classifyCognitiveStructure(content);
          const semanticAnalysis = await performSemanticAnalysis(content);
          const keyEntities = await extractKeyEntities(content);

          return {
            index,
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            classification,
            semanticAnalysis,
            keyEntities,
            success: true
          };
        } catch (error) {
          return {
            index,
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            error: error instanceof Error ? error.message : 'Analysis failed',
            success: false
          };
        }
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return res.json({
      success: true,
      data: {
        totalProcessed: contents.length,
        successful: successful.length,
        failed: failed.length,
        results,
        summary: {
          dotCount: successful.filter(r => r.classification?.type === 'dot').length,
          wheelCount: successful.filter(r => r.classification?.type === 'wheel').length,
          chakraCount: successful.filter(r => r.classification?.type === 'chakra').length,
          averageConfidence: successful.length > 0 
            ? successful.reduce((sum, r) => sum + (r.classification?.confidence || 0), 0) / successful.length
            : 0
        },
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in batch analysis:', error);
    return res.status(500).json({ 
      error: 'Failed to perform batch analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}