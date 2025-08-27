import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { db } from '../db';
import { vectorEmbeddings, insertVectorEmbeddingSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Pinecone client (only if API key is available)
let pinecone: Pinecone | null = null;

try {
  if (process.env.PINECONE_API_KEY) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  } else {
    console.warn('Pinecone API key not found. Vector database functionality will be disabled.');
  }
} catch (error) {
  console.warn('Failed to initialize Pinecone client:', error);
}

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Vector database configuration
const VECTOR_CONFIG = {
  indexName: process.env.PINECONE_INDEX_NAME || 'dotspark-vectors',
  dimension: 1536, // OpenAI text-embedding-3-small dimension
  metric: 'cosine',
  namespace: 'dotspark'
};

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    contentType: string;
    contentId: number;
    userId: number;
    content: string;
    [key: string]: any;
  };
}

export interface SimilaritySearchOptions {
  topK?: number;
  threshold?: number;
  contentTypes?: string[];
  userId?: number;
  includeContent?: boolean;
}

/**
 * Initialize Pinecone index if it doesn't exist
 */
export async function initializeVectorDB(): Promise<void> {
  if (!pinecone) {
    throw new Error('Pinecone client not initialized. Please provide PINECONE_API_KEY environment variable.');
  }
  
  try {
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList.indexes?.find(index => index.name === VECTOR_CONFIG.indexName);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${VECTOR_CONFIG.indexName}`);
      await pinecone.createIndex({
        name: VECTOR_CONFIG.indexName,
        dimension: VECTOR_CONFIG.dimension,
        metric: VECTOR_CONFIG.metric as any,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });

      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    console.log('Vector database initialized successfully');
  } catch (error) {
    console.error('Error initializing vector database:', error);
    throw error;
  }
}

/**
 * Generate embeddings using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' ').trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store content with vector embedding
 */
export async function storeVectorEmbedding(
  contentType: string,
  contentId: number,
  content: string,
  userId?: number,
  metadata: Record<string, any> = {}
): Promise<string> {
  if (!pinecone) {
    throw new Error('Vector database not available. Pinecone client not initialized.');
  }
  
  try {
    // Generate embedding
    const embedding = await generateEmbedding(content);
    
    // Create unique vector ID
    const vectorId = `${contentType}_${contentId}_${Date.now()}`;
    
    // Prepare metadata
    const vectorMetadata = {
      contentType,
      contentId,
      userId: userId || 0,
      content: content.substring(0, 1000), // Truncate for metadata
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Store in Pinecone
    const index = pinecone.index(VECTOR_CONFIG.indexName);
    await index.namespace(VECTOR_CONFIG.namespace).upsert([{
      id: vectorId,
      values: embedding,
      metadata: vectorMetadata
    }]);

    // Store in PostgreSQL for tracking
    const embeddingData = insertVectorEmbeddingSchema.parse({
      contentType,
      contentId,
      userId,
      vectorId,
      content,
      metadata: JSON.stringify(metadata)
    });

    await db.insert(vectorEmbeddings).values(embeddingData);

    console.log(`Stored vector embedding for ${contentType} ${contentId}`);
    return vectorId;
  } catch (error) {
    console.error('Error storing vector embedding:', error);
    throw error;
  }
}

/**
 * Search for similar content using vector similarity
 */
export async function searchSimilarContent(
  query: string,
  options: SimilaritySearchOptions = {}
): Promise<VectorSearchResult[]> {
  if (!pinecone) {
    console.warn('Vector search not available - Pinecone client not initialized');
    return [];
  }
  const {
    topK = 10,
    threshold = 0.7,
    contentTypes = [],
    userId,
    includeContent = true
  } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Prepare filter
    const filter: Record<string, any> = {};
    if (contentTypes.length > 0) {
      filter.contentType = { $in: contentTypes };
    }
    if (userId) {
      filter.userId = userId;
    }

    // Search in Pinecone
    const index = pinecone.index(VECTOR_CONFIG.indexName);
    const searchResults = await index.namespace(VECTOR_CONFIG.namespace).query({
      vector: queryEmbedding,
      topK,
      filter,
      includeMetadata: true
    });

    // Filter results by threshold and format
    const results: VectorSearchResult[] = searchResults.matches
      ?.filter(match => (match.score || 0) >= threshold)
      .map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as any
      })) || [];

    console.log(`Found ${results.length} similar content items for query: "${query}"`);
    return results;
  } catch (error) {
    console.error('Error searching similar content:', error);
    throw error;
  }
}

/**
 * Find related content based on existing content
 */
export async function findRelatedContent(
  contentType: string,
  contentId: number,
  options: SimilaritySearchOptions = {}
): Promise<VectorSearchResult[]> {
  try {
    // Get the original content from database
    const embedding = await db.query.vectorEmbeddings.findFirst({
      where: and(
        eq(vectorEmbeddings.contentType, contentType),
        eq(vectorEmbeddings.contentId, contentId)
      )
    });

    if (!embedding) {
      throw new Error(`No embedding found for ${contentType} ${contentId}`);
    }

    // Use the content for similarity search
    return await searchSimilarContent(embedding.content, {
      ...options,
      // Exclude the original content from results
      contentTypes: options.contentTypes?.filter(type => type !== contentType || contentId !== embedding.contentId)
    });
  } catch (error) {
    console.error('Error finding related content:', error);
    throw error;
  }
}

/**
 * Update vector embedding when content changes
 */
export async function updateVectorEmbedding(
  contentType: string,
  contentId: number,
  newContent: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  if (!pinecone) {
    console.warn('Vector update not available - Pinecone client not initialized');
    return;
  }
  
  try {
    // Find existing embedding
    const existing = await db.query.vectorEmbeddings.findFirst({
      where: and(
        eq(vectorEmbeddings.contentType, contentType),
        eq(vectorEmbeddings.contentId, contentId)
      )
    });

    if (existing) {
      // Generate new embedding
      const embedding = await generateEmbedding(newContent);
      
      // Update in Pinecone
      const index = pinecone.index(VECTOR_CONFIG.indexName);
      await index.namespace(VECTOR_CONFIG.namespace).upsert([{
        id: existing.vectorId,
        values: embedding,
        metadata: {
          ...JSON.parse(existing.metadata || '{}'),
          content: newContent.substring(0, 1000),
          timestamp: new Date().toISOString(),
          ...metadata
        }
      }]);

      // Update in PostgreSQL
      await db.update(vectorEmbeddings)
        .set({
          content: newContent,
          metadata: JSON.stringify({
            ...JSON.parse(existing.metadata || '{}'),
            ...metadata
          }),
          updatedAt: new Date()
        })
        .where(eq(vectorEmbeddings.id, existing.id));

      console.log(`Updated vector embedding for ${contentType} ${contentId}`);
    } else {
      // Create new embedding if it doesn't exist
      await storeVectorEmbedding(contentType, contentId, newContent, undefined, metadata);
    }
  } catch (error) {
    console.error('Error updating vector embedding:', error);
    throw error;
  }
}

/**
 * Get conversation context for intelligent responses
 */
export async function getConversationContext(
  query: string,
  userId: number,
  limit: number = 8
): Promise<VectorSearchResult[]> {
  return await searchSimilarContent(query, {
    topK: limit,
    threshold: 0.6,
    contentTypes: ['conversation', 'entry', 'dot'],
    userId,
    includeContent: true
  });
}

/**
 * Suggest related thoughts based on current input
 */
export async function suggestRelatedThoughts(
  thought: string,
  userId: number,
  limit: number = 5
): Promise<VectorSearchResult[]> {
  return await searchSimilarContent(thought, {
    topK: limit,
    threshold: 0.7,
    contentTypes: ['entry', 'dot', 'wheel', 'chakra'],
    userId,
    includeContent: true
  });
}



/**
 * Delete vector embedding
 */
export async function deleteVectorEmbedding(contentType: string, contentId: number): Promise<void> {
  if (!pinecone) {
    console.warn('Vector deletion not available - Pinecone client not initialized');
    return;
  }
  
  try {
    // Find existing embedding
    const existing = await db.query.vectorEmbeddings.findFirst({
      where: and(
        eq(vectorEmbeddings.contentType, contentType),
        eq(vectorEmbeddings.contentId, contentId)
      )
    });

    if (existing) {
      // Delete from Pinecone
      const index = pinecone.index(VECTOR_CONFIG.indexName);
      await index.namespace(VECTOR_CONFIG.namespace).deleteOne(existing.vectorId);

      // Delete from PostgreSQL
      await db.delete(vectorEmbeddings)
        .where(eq(vectorEmbeddings.id, existing.id));

      console.log(`Deleted vector embedding for ${contentType} ${contentId}`);
    }
  } catch (error) {
    console.error('Error deleting vector embedding:', error);
    throw error;
  }
}



/**
 * Batch process existing content for vector embeddings
 */
export async function batchProcessExistingContent(): Promise<void> {
  try {
    console.log('Starting batch processing of existing content...');
    
    // Process entries (you can extend this to other content types)
    const entries = await db.query.entries.findMany({
      limit: 100, // Process in batches
      where: (entries, { notExists }) => notExists(
        db.select().from(vectorEmbeddings).where(
          and(
            eq(vectorEmbeddings.contentType, 'entry'),
            eq(vectorEmbeddings.contentId, entries.id)
          )
        )
      )
    });

    for (const entry of entries) {
      await storeVectorEmbedding(
        'entry',
        entry.id,
        `${entry.title}\n${entry.content}`,
        entry.userId || undefined,
        {
          title: entry.title,
          category: entry.categoryId,
          visibility: entry.visibility,
          isFavorite: entry.isFavorite
        }
      );
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Processed ${entries.length} entries for vector embeddings`);
  } catch (error) {
    console.error('Error in batch processing:', error);
    throw error;
  }
}