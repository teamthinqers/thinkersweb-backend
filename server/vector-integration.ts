import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import { db } from "@db";
import { dots, wheels, chakras, vectorEmbeddings } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Pinecone
let pinecone: Pinecone | null = null;
let pineconeIndex: any = null;

if (process.env.PINECONE_API_KEY) {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  
  // Initialize index
  try {
    pineconeIndex = pinecone.index('dotspark-vectors');
    console.log('Pinecone vector database initialized for DotSpark content');
  } catch (error) {
    console.error('Failed to initialize Pinecone index:', error);
  }
}

export interface VectorContent {
  id: string;
  contentType: 'dot' | 'wheel' | 'chakra';
  contentId: number;
  userId: number;
  text: string;
  metadata: {
    contentType: string;
    contentId: number;
    userId: number;
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
    goals?: string;
    purpose?: string;
    timeline?: string;
    sourceType: string;
    captureMode?: string;
    createdAt: string;
  };
}

/**
 * Generate embeddings for text content using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store a dot in vector database
 */
export async function storeDotInVector(dotId: number, userId: number): Promise<boolean> {
  if (!pinecone || !pineconeIndex) {
    console.log('Pinecone not configured, skipping vector storage for dot');
    return false;
  }

  try {
    // Fetch dot data from database
    const dot = await db.query.dots.findFirst({
      where: eq(dots.id, dotId)
    });

    if (!dot) {
      console.error(`Dot ${dotId} not found`);
      return false;
    }

    // Create combined text for embedding
    const combinedText = `${dot.summary} ${dot.anchor} ${dot.pulse}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(combinedText);
    
    // Create vector ID
    const vectorId = `dot_${dotId}_${userId}`;
    
    // Prepare metadata
    const metadata: VectorContent['metadata'] = {
      contentType: 'dot',
      contentId: dotId,
      userId,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      createdAt: dot.createdAt.toISOString(),
    };

    // Store in Pinecone
    await pineconeIndex.upsert([{
      id: vectorId,
      values: embedding,
      metadata
    }]);

    // Store reference in our database
    await db.insert(vectorEmbeddings).values({
      contentType: 'dot',
      contentId: dotId,
      userId,
      vectorId,
      content: combinedText,
      metadata: JSON.stringify(metadata)
    }).onConflictDoNothing();

    console.log(`Dot ${dotId} stored in vector database with ID: ${vectorId}`);
    return true;
  } catch (error) {
    console.error(`Error storing dot ${dotId} in vector database:`, error);
    return false;
  }
}

/**
 * Store a wheel in vector database
 */
export async function storeWheelInVector(wheelId: number, userId: number): Promise<boolean> {
  if (!pinecone || !pineconeIndex) {
    console.log('Pinecone not configured, skipping vector storage for wheel');
    return false;
  }

  try {
    // Fetch wheel data from database
    const wheel = await db.query.wheels.findFirst({
      where: eq(wheels.id, wheelId)
    });

    if (!wheel) {
      console.error(`Wheel ${wheelId} not found`);
      return false;
    }

    // Create combined text for embedding
    const combinedText = `${wheel.heading} ${wheel.goals} ${wheel.timeline}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(combinedText);
    
    // Create vector ID
    const vectorId = `wheel_${wheelId}_${userId}`;
    
    // Prepare metadata
    const metadata: VectorContent['metadata'] = {
      contentType: 'wheel',
      contentId: wheelId,
      userId,
      heading: wheel.heading,
      goals: wheel.goals,
      timeline: wheel.timeline,
      sourceType: wheel.sourceType,
      createdAt: wheel.createdAt.toISOString(),
    };

    // Store in Pinecone
    await pineconeIndex.upsert([{
      id: vectorId,
      values: embedding,
      metadata
    }]);

    // Store reference in our database
    await db.insert(vectorEmbeddings).values({
      contentType: 'wheel',
      contentId: wheelId,
      userId,
      vectorId,
      content: combinedText,
      metadata: JSON.stringify(metadata)
    }).onConflictDoNothing();

    console.log(`Wheel ${wheelId} stored in vector database with ID: ${vectorId}`);
    return true;
  } catch (error) {
    console.error(`Error storing wheel ${wheelId} in vector database:`, error);
    return false;
  }
}

/**
 * Store a chakra in vector database
 */
export async function storeChakraInVector(chakraId: number, userId: number): Promise<boolean> {
  if (!pinecone || !pineconeIndex) {
    console.log('Pinecone not configured, skipping vector storage for chakra');
    return false;
  }

  try {
    // Fetch chakra data from database
    const chakra = await db.query.chakras.findFirst({
      where: eq(chakras.id, chakraId)
    });

    if (!chakra) {
      console.error(`Chakra ${chakraId} not found`);
      return false;
    }

    // Create combined text for embedding
    const combinedText = `${chakra.heading} ${chakra.purpose} ${chakra.timeline}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(combinedText);
    
    // Create vector ID
    const vectorId = `chakra_${chakraId}_${userId}`;
    
    // Prepare metadata
    const metadata: VectorContent['metadata'] = {
      contentType: 'chakra',
      contentId: chakraId,
      userId,
      heading: chakra.heading,
      purpose: chakra.purpose,
      timeline: chakra.timeline,
      sourceType: chakra.sourceType,
      createdAt: chakra.createdAt.toISOString(),
    };

    // Store in Pinecone
    await pineconeIndex.upsert([{
      id: vectorId,
      values: embedding,
      metadata
    }]);

    // Store reference in our database
    await db.insert(vectorEmbeddings).values({
      contentType: 'chakra',
      contentId: chakraId,
      userId,
      vectorId,
      content: combinedText,
      metadata: JSON.stringify(metadata)
    }).onConflictDoNothing();

    console.log(`Chakra ${chakraId} stored in vector database with ID: ${vectorId}`);
    return true;
  } catch (error) {
    console.error(`Error storing chakra ${chakraId} in vector database:`, error);
    return false;
  }
}

/**
 * Retrieve relevant user content from vector database
 */
export async function retrieveUserContent(
  query: string, 
  userId: number, 
  contentTypes: ('dot' | 'wheel' | 'chakra')[] = ['dot', 'wheel', 'chakra'],
  topK: number = 5
): Promise<VectorContent[]> {
  if (!pinecone || !pineconeIndex) {
    console.log('Pinecone not configured, returning empty results');
    return [];
  }

  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    
    // Query Pinecone with user filter
    const queryRequest = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
        contentType: { $in: contentTypes }
      }
    };

    const queryResponse = await pineconeIndex.query(queryRequest);
    
    // Transform results
    const results: VectorContent[] = queryResponse.matches.map((match: any) => ({
      id: match.id,
      contentType: match.metadata.contentType,
      contentId: match.metadata.contentId,
      userId: match.metadata.userId,
      text: '', // We don't store the full text in Pinecone metadata
      metadata: match.metadata,
      score: match.score
    }));

    console.log(`Retrieved ${results.length} relevant content items for user ${userId}`);
    return results;
  } catch (error) {
    console.error('Error retrieving user content from vector database:', error);
    return [];
  }
}

/**
 * Delete content from vector database
 */
export async function deleteFromVector(contentType: 'dot' | 'wheel' | 'chakra', contentId: number, userId: number): Promise<boolean> {
  if (!pinecone || !pineconeIndex) {
    console.log('Pinecone not configured, skipping vector deletion');
    return false;
  }

  try {
    const vectorId = `${contentType}_${contentId}_${userId}`;
    
    // Delete from Pinecone
    await pineconeIndex.deleteOne(vectorId);
    
    // Delete from our database
    await db.delete(vectorEmbeddings)
      .where(eq(vectorEmbeddings.vectorId, vectorId));

    console.log(`Deleted ${contentType} ${contentId} from vector database`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${contentType} ${contentId} from vector database:`, error);
    return false;
  }
}

/**
 * Batch migrate existing user content to vector database
 */
export async function migrateUserContentToVector(userId: number): Promise<{
  dots: number;
  wheels: number;
  chakras: number;
  errors: string[];
}> {
  const results = {
    dots: 0,
    wheels: 0,
    chakras: 0,
    errors: [] as string[]
  };

  if (!pinecone || !pineconeIndex) {
    results.errors.push('Pinecone not configured');
    return results;
  }

  try {
    // Migrate dots
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId)
    });

    for (const dot of userDots) {
      try {
        const success = await storeDotInVector(dot.id, userId);
        if (success) results.dots++;
      } catch (error) {
        results.errors.push(`Failed to migrate dot ${dot.id}: ${error}`);
      }
    }

    // Migrate wheels
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    });

    for (const wheel of userWheels) {
      try {
        const success = await storeWheelInVector(wheel.id, userId);
        if (success) results.wheels++;
      } catch (error) {
        results.errors.push(`Failed to migrate wheel ${wheel.id}: ${error}`);
      }
    }

    // Migrate chakras
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId)
    });

    for (const chakra of userChakras) {
      try {
        const success = await storeChakraInVector(chakra.id, userId);
        if (success) results.chakras++;
      } catch (error) {
        results.errors.push(`Failed to migrate chakra ${chakra.id}: ${error}`);
      }
    }

    console.log(`Migration completed for user ${userId}:`, results);
    return results;
  } catch (error) {
    results.errors.push(`Migration failed: ${error}`);
    return results;
  }
}

export const vectorIntegration = {
  storeDotInVector,
  storeWheelInVector,
  storeChakraInVector,
  retrieveUserContent,
  deleteFromVector,
  migrateUserContentToVector,
};