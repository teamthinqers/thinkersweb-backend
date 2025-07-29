import type { Express, Request, Response } from "express";
import { vectorIntegration } from '../vector-integration';

interface AuthenticatedRequest extends Request {
  user?: Express.User;
  session?: any;
}

export function setupVectorAPI(app: Express, apiPrefix: string) {
  // Migrate user content to vector database
  app.post(`${apiPrefix}/vector/migrate`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log(`Starting vector migration for user ${userId}`);
      
      const results = await vectorIntegration.migrateUserContentToVector(userId);
      
      res.json({
        success: true,
        message: 'Vector migration completed',
        results: {
          dotsStored: results.dots,
          wheelsStored: results.wheels,
          chakrasStored: results.chakras,
          totalItems: results.dots + results.wheels + results.chakras,
          errors: results.errors
        }
      });
    } catch (error) {
      console.error('Error in vector migration:', error);
      res.status(500).json({ error: 'Failed to migrate content to vector database' });
    }
  });

  // Retrieve user content from vector database
  app.post(`${apiPrefix}/vector/search`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { query, contentTypes = ['dot', 'wheel', 'chakra'], topK = 5 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`Vector search for user ${userId}: "${query}"`);
      
      const results = await vectorIntegration.retrieveUserContent(query, userId, contentTypes, topK);
      
      res.json({
        success: true,
        query,
        results: results.map(result => ({
          id: result.id,
          contentType: result.contentType,
          contentId: result.contentId,
          score: result.score || 0,
          metadata: result.metadata
        })),
        totalResults: results.length
      });
    } catch (error) {
      console.error('Error in vector search:', error);
      res.status(500).json({ error: 'Failed to search vector database' });
    }
  });

  // Get vector storage status for user
  app.get(`${apiPrefix}/vector/status`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if Pinecone is configured
      const pineconeConfigured = !!process.env.PINECONE_API_KEY;
      
      if (!pineconeConfigured) {
        return res.json({
          vectorDatabaseEnabled: false,
          message: 'Vector database not configured',
          userContent: {
            dots: 0,
            wheels: 0,
            chakras: 0,
            total: 0
          }
        });
      }

      // Count user's content in vector database
      const { db } = await import("@db");
      const { vectorEmbeddings } = await import("@shared/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const vectorContent = await db.query.vectorEmbeddings.findMany({
        where: eq(vectorEmbeddings.userId, userId)
      });

      const contentCounts = {
        dots: vectorContent.filter(v => v.contentType === 'dot').length,
        wheels: vectorContent.filter(v => v.contentType === 'wheel').length,
        chakras: vectorContent.filter(v => v.contentType === 'chakra').length,
        total: vectorContent.length
      };

      res.json({
        vectorDatabaseEnabled: true,
        userContent: contentCounts,
        message: `${contentCounts.total} items stored in vector database`
      });
    } catch (error) {
      console.error('Error checking vector status:', error);
      res.status(500).json({ error: 'Failed to check vector database status' });
    }
  });

  // Enhanced intelligence retrieval for chat interactions
  app.post(`${apiPrefix}/vector/intelligence`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { query, context = '', maxResults = 3 } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      console.log(`Intelligence retrieval for user ${userId}: "${query}"`);
      
      // Enhanced query combining user input with conversation context
      const enhancedQuery = context ? `${query} ${context}` : query;
      
      const results = await vectorIntegration.retrieveUserContent(
        enhancedQuery, 
        userId, 
        ['dot', 'wheel', 'chakra'], 
        maxResults
      );
      
      // Format results for AI consumption
      const intelligenceContext = results.map(result => {
        const { metadata } = result;
        let content = '';
        
        if (metadata.contentType === 'dot') {
          content = `Dot: ${metadata.summary} | Anchor: ${metadata.anchor} | Pulse: ${metadata.pulse}`;
        } else if (metadata.contentType === 'wheel') {
          content = `Wheel: ${metadata.heading} | Goals: ${metadata.goals} | Timeline: ${metadata.timeline}`;
        } else if (metadata.contentType === 'chakra') {
          content = `Chakra: ${metadata.heading} | Purpose: ${metadata.purpose} | Timeline: ${metadata.timeline}`;
        }
        
        return {
          type: metadata.contentType,
          content,
          relevanceScore: result.score || 0,
          createdAt: metadata.createdAt
        };
      }).filter(item => item.content.length > 0);

      res.json({
        success: true,
        query,
        intelligenceContext,
        contextAvailable: intelligenceContext.length > 0,
        message: intelligenceContext.length > 0 
          ? `Found ${intelligenceContext.length} relevant items from user's knowledge base`
          : 'No relevant context found in user\'s knowledge base'
      });
    } catch (error) {
      console.error('Error in intelligence retrieval:', error);
      res.status(500).json({ error: 'Failed to retrieve intelligence context' });
    }
  });
}