// Import OpenAI client
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { Pinecone } from '@pinecone-database/pinecone';
import { db } from '@db';
import { dots, wheels, vectorEmbeddings } from '@shared/schema';
import { eq, and, sql, desc, asc } from 'drizzle-orm';

/**
 * Advanced Indexing Structure for DotSpark
 * 
 * This system provides comprehensive indexing for Dots, Wheels, and Chakras with:
 * - Semantic search using OpenAI embeddings and Pinecone vector database
 * - Dot-wheel mapping and relationship tracking
 * - Insight clustering for pattern recognition
 * - Blind spot detection through gap analysis
 * - Cross-reference linking between cognitive structures
 */

interface EmbeddingMetadata {
  userId: number;
  contentType: 'dot' | 'wheel' | 'chakra';
  contentId: number;
  category?: string;
  sourceType?: string;
  captureMode?: string;
  createdAt: string;
  wheelId?: number;
  chakraId?: number;
  layer?: string; // For dots: summary, anchor, pulse
}

interface IndexedContent {
  id: number;
  content: string;
  metadata: EmbeddingMetadata;
  embedding?: number[];
}

interface SemanticSearchResult {
  id: number;
  contentType: 'dot' | 'wheel' | 'chakra';
  content: string;
  score: number;
  metadata: EmbeddingMetadata;
}

interface InsightCluster {
  clusterId: string;
  theme: string;
  confidence: number;
  items: SemanticSearchResult[];
  centralConcept: string;
  patterns: string[];
}

interface BlindSpotAnalysis {
  detectedGaps: string[];
  suggestedAreas: string[];
  missingConnections: {
    fromType: string;
    fromId: number;
    toType: string;
    recommendedContent: string;
  }[];
  confidence: number;
}

export class DotSparkIndexingSystem {
  private pinecone: Pinecone | null = null;
  private indexName = 'dotspark-cognitive-index';

  constructor() {
    if (process.env.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    }
  }

  /**
   * Generate embeddings for content using OpenAI
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: content,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Index a dot with all its layers
   */
  async indexDot(dotId: number, userId: number): Promise<void> {
    try {
      const dot = await db.query.dots.findFirst({
        where: eq(dots.id, dotId),
        with: {
          wheel: true,
        },
      });

      if (!dot) {
        throw new Error(`Dot with ID ${dotId} not found`);
      }

      // Create composite content for semantic indexing
      const compositeContent = `${dot.summary} ${dot.anchor} ${dot.pulse}`;
      
      // Index main dot content
      await this.indexContent({
        id: dot.id,
        content: compositeContent,
        metadata: {
          userId,
          contentType: 'dot',
          contentId: dot.id,
          sourceType: dot.sourceType,
          captureMode: dot.captureMode,
          createdAt: dot.createdAt.toISOString(),
          wheelId: dot.wheelId || undefined,
          chakraId: (dot.wheel as any)?.chakraId || undefined,
        },
      });

      // Index individual layers for granular search
      const layers = [
        { content: dot.summary, layer: 'summary' },
        { content: dot.anchor, layer: 'anchor' },
        { content: dot.pulse, layer: 'pulse' },
      ];

      for (const layer of layers) {
        await this.indexContent({
          id: dot.id,
          content: layer.content,
          metadata: {
            userId,
            contentType: 'dot',
            contentId: dot.id,
            sourceType: dot.sourceType,
            captureMode: dot.captureMode,
            createdAt: dot.createdAt.toISOString(),
            wheelId: dot.wheelId || undefined,
            chakraId: (dot.wheel as any)?.chakraId || undefined,
            layer: layer.layer,
          },
        });
      }

      console.log(`Successfully indexed dot ${dotId} with all layers`);
    } catch (error) {
      console.error(`Failed to index dot ${dotId}:`, error);
      throw error;
    }
  }

  /**
   * Index a wheel with its goals/purpose and associated dots
   */
  async indexWheel(wheelId: number, userId: number): Promise<void> {
    try {
      const wheel = await db.query.wheels.findFirst({
        where: eq(wheels.id, wheelId),
        with: {
          dots: true,
          chakra: true,
        },
      });

      if (!wheel) {
        throw new Error(`Wheel with ID ${wheelId} not found`);
      }

      // Determine if this is a chakra (top-level) or regular wheel
      const isChakra = !wheel.chakraId;
      const contentType = isChakra ? 'chakra' : 'wheel';

      // Create content for indexing
      const wheelContent = [
        wheel.name,
        wheel.heading,
        wheel.goals || wheel.purpose,
        wheel.timeline,
        wheel.category,
      ].filter(Boolean).join(' ');

      // Include associated dot summaries for richer context
      const dotSummaries = wheel.dots.map(dot => dot.summary).join(' ');
      const compositeContent = `${wheelContent} ${dotSummaries}`;

      await this.indexContent({
        id: wheel.id,
        content: compositeContent,
        metadata: {
          userId,
          contentType,
          contentId: wheel.id,
          category: wheel.category,
          createdAt: wheel.createdAt.toISOString(),
          chakraId: wheel.chakraId || undefined,
        },
      });

      console.log(`Successfully indexed ${contentType} ${wheelId}`);
    } catch (error) {
      console.error(`Failed to index wheel ${wheelId}:`, error);
      throw error;
    }
  }

  /**
   * Core indexing function for any content
   */
  private async indexContent(content: IndexedContent): Promise<void> {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content.content);
      
      // Store in vector database if available
      if (this.pinecone) {
        const index = this.pinecone.index(this.indexName);
        
        await index.upsert([{
          id: `${content.metadata.contentType}-${content.id}-${content.metadata.layer || 'main'}`,
          values: embedding,
          metadata: {
            ...content.metadata,
            content: content.content,
          },
        }]);
      }

      // Store in PostgreSQL for backup and querying
      await db.insert(vectorEmbeddings).values({
        contentType: content.metadata.contentType,
        contentId: content.metadata.contentId,
        userId: content.metadata.userId,
        vectorId: `${content.metadata.contentType}-${content.id}-${content.metadata.layer || 'main'}`,
        content: content.content,
        metadata: JSON.stringify(content.metadata),
      }).onConflictDoUpdate({
        target: vectorEmbeddings.vectorId,
        set: {
          content: content.content,
          metadata: JSON.stringify(content.metadata),
          updatedAt: sql`now()`,
        },
      });

    } catch (error) {
      console.error('Failed to index content:', error);
      throw error;
    }
  }

  /**
   * Semantic search across all indexed content
   */
  async semanticSearch(query: string, userId: number, options?: {
    contentTypes?: ('dot' | 'wheel' | 'chakra')[];
    limit?: number;
    threshold?: number;
  }): Promise<SemanticSearchResult[]> {
    try {
      const { contentTypes = ['dot', 'wheel', 'chakra'], limit = 20, threshold = 0.7 } = options || {};
      
      if (!this.pinecone) {
        // Fallback to database text search
        return this.fallbackTextSearch(query, userId, contentTypes, limit);
      }

      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search in Pinecone
      const index = this.pinecone.index(this.indexName);
      
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: limit,
        filter: {
          userId: { $eq: userId },
          contentType: { $in: contentTypes },
        },
        includeMetadata: true,
      });

      // Format results
      const results: SemanticSearchResult[] = searchResults.matches
        .filter(match => (match.score || 0) >= threshold)
        .map(match => ({
          id: match.metadata?.contentId as number,
          contentType: match.metadata?.contentType as 'dot' | 'wheel' | 'chakra',
          content: match.metadata?.content as string,
          score: match.score || 0,
          metadata: match.metadata as unknown as EmbeddingMetadata,
        }));

      return results;
    } catch (error) {
      console.error('Semantic search failed:', error);
      return this.fallbackTextSearch(query, userId, options?.contentTypes || ['dot', 'wheel', 'chakra'], options?.limit || 20);
    }
  }

  /**
   * Fallback text search when vector search is unavailable
   */
  private async fallbackTextSearch(query: string, userId: number, contentTypes: string[], limit: number): Promise<SemanticSearchResult[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const results = await db.query.vectorEmbeddings.findMany({
      where: and(
        eq(vectorEmbeddings.userId, userId),
        sql`LOWER(${vectorEmbeddings.content}) LIKE ${searchTerm}`
      ),
      limit,
      orderBy: desc(vectorEmbeddings.createdAt),
    });

    return results.map(result => ({
      id: result.contentId,
      contentType: result.contentType as 'dot' | 'wheel' | 'chakra',
      content: result.content,
      score: 0.8, // Default similarity score for text search
      metadata: JSON.parse(result.metadata || '{}') as EmbeddingMetadata,
    }));
  }

  /**
   * Cluster insights based on semantic similarity
   */
  async clusterInsights(userId: number, options?: {
    minClusterSize?: number;
    maxClusters?: number;
  }): Promise<InsightCluster[]> {
    try {
      const { minClusterSize = 3, maxClusters = 10 } = options || {};
      
      // Get all user content for clustering
      const userContent = await db.query.vectorEmbeddings.findMany({
        where: eq(vectorEmbeddings.userId, userId),
        orderBy: desc(vectorEmbeddings.createdAt),
      });

      if (userContent.length < minClusterSize) {
        return [];
      }

      // Use AI to analyze and cluster content
      const contentTexts = userContent.map(item => item.content).join('\n\n');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing cognitive patterns and clustering insights. Analyze the following content and identify ${maxClusters} main thematic clusters. For each cluster, provide:
            1. A descriptive theme name
            2. Central concept
            3. Key patterns observed
            4. Confidence score (0-1)
            
            Return results as JSON array with structure:
            [{
              "theme": "Theme Name",
              "centralConcept": "Main concept",
              "patterns": ["pattern1", "pattern2"],
              "confidence": 0.85,
              "contentIds": [1, 2, 3]
            }]`
          },
          {
            role: 'user',
            content: contentTexts
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const clusters = JSON.parse(response.choices[0].message.content || '[]');
      
      // Map back to full content
      return clusters.map((cluster: any, index: number) => ({
        clusterId: `cluster-${index}`,
        theme: cluster.theme,
        confidence: cluster.confidence,
        centralConcept: cluster.centralConcept,
        patterns: cluster.patterns,
        items: userContent
          .filter(item => cluster.contentIds?.includes(item.contentId))
          .map(item => ({
            id: item.contentId,
            contentType: item.contentType as 'dot' | 'wheel' | 'chakra',
            content: item.content,
            score: cluster.confidence,
            metadata: JSON.parse(item.metadata || '{}') as EmbeddingMetadata,
          })),
      }));

    } catch (error) {
      console.error('Insight clustering failed:', error);
      return [];
    }
  }

  /**
   * Detect blind spots and missing connections
   */
  async detectBlindSpots(userId: number): Promise<BlindSpotAnalysis> {
    try {
      // Get user's content patterns
      const userDots = await db.query.dots.findMany({
        where: eq(dots.userId, userId),
        with: { wheel: true },
      });

      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
        with: { dots: true },
      });

      // Analyze content for gaps
      const dotCategories = userDots.map(dot => (dot.wheel as any)?.category).filter(Boolean);
      const wheelCategories = userWheels.map(wheel => (wheel as any).category);
      const allCategories = Array.from(new Set([...dotCategories, ...wheelCategories]));

      const contentSummary = {
        totalDots: userDots.length,
        totalWheels: userWheels.length,
        categories: allCategories,
        recentActivity: userDots.slice(-10).map(dot => dot.summary).join(' '),
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert cognitive coach analyzing thinking patterns. Based on the user's content, identify:
            1. Potential blind spots or missing perspectives
            2. Underrepresented areas that could benefit from more attention
            3. Missing connections between existing concepts
            4. Suggested areas for exploration
            
            Return as JSON:
            {
              "detectedGaps": ["gap1", "gap2"],
              "suggestedAreas": ["area1", "area2"],
              "missingConnections": [
                {
                  "fromType": "dot/wheel/chakra",
                  "fromId": 1,
                  "toType": "wheel",
                  "recommendedContent": "Connection description"
                }
              ],
              "confidence": 0.8
            }`
          },
          {
            role: 'user',
            content: `User content analysis:
            Total Dots: ${contentSummary.totalDots}
            Total Wheels: ${contentSummary.totalWheels}
            Categories: ${contentSummary.categories.join(', ')}
            Recent Content: ${contentSummary.recentActivity}`
          }
        ],
        temperature: 0.4,
        max_tokens: 800,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        detectedGaps: analysis.detectedGaps || [],
        suggestedAreas: analysis.suggestedAreas || [],
        missingConnections: analysis.missingConnections || [],
        confidence: analysis.confidence || 0.7,
      };

    } catch (error) {
      console.error('Blind spot detection failed:', error);
      return {
        detectedGaps: [],
        suggestedAreas: [],
        missingConnections: [],
        confidence: 0,
      };
    }
  }

  /**
   * Find related content based on semantic similarity
   */
  async findRelatedContent(contentId: number, contentType: 'dot' | 'wheel' | 'chakra', userId: number): Promise<SemanticSearchResult[]> {
    try {
      // Get the source content
      let sourceContent = '';
      
      if (contentType === 'dot') {
        const dot = await db.query.dots.findFirst({
          where: eq(dots.id, contentId),
        });
        if (dot) {
          sourceContent = `${dot.summary} ${dot.anchor} ${dot.pulse}`;
        }
      } else {
        const wheel = await db.query.wheels.findFirst({
          where: eq(wheels.id, contentId),
        });
        if (wheel) {
          sourceContent = [wheel.name, wheel.heading, wheel.goals || wheel.purpose].filter(Boolean).join(' ');
        }
      }

      if (!sourceContent) {
        return [];
      }

      // Search for similar content
      return this.semanticSearch(sourceContent, userId, {
        limit: 10,
        threshold: 0.6,
      });

    } catch (error) {
      console.error('Failed to find related content:', error);
      return [];
    }
  }

  /**
   * Bulk index all user content
   */
  async indexAllUserContent(userId: number): Promise<void> {
    try {
      // Index all dots
      const userDots = await db.query.dots.findMany({
        where: eq(dots.userId, userId),
      });

      for (const dot of userDots) {
        await this.indexDot(dot.id, userId);
      }

      // Index all wheels/chakras
      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
      });

      for (const wheel of userWheels) {
        await this.indexWheel(wheel.id, userId);
      }

      console.log(`Successfully indexed all content for user ${userId}`);
    } catch (error) {
      console.error(`Failed to index all content for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove content from index
   */
  async removeFromIndex(contentId: number, contentType: 'dot' | 'wheel' | 'chakra'): Promise<void> {
    try {
      // Remove from Pinecone if available
      if (this.pinecone) {
        const index = this.pinecone.index(this.indexName);
        const vectorId = `${contentType}-${contentId}-main`;
        await index.deleteOne(vectorId);
        
        // Remove layer-specific entries for dots
        if (contentType === 'dot') {
          const layerIds = ['summary', 'anchor', 'pulse'].map(layer => `${contentType}-${contentId}-${layer}`);
          await index.deleteMany(layerIds);
        }
      }

      // Remove from PostgreSQL
      await db.delete(vectorEmbeddings)
        .where(and(
          eq(vectorEmbeddings.contentType, contentType),
          eq(vectorEmbeddings.contentId, contentId)
        ));

      console.log(`Successfully removed ${contentType} ${contentId} from index`);
    } catch (error) {
      console.error(`Failed to remove ${contentType} ${contentId} from index:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const indexingSystem = new DotSparkIndexingSystem();