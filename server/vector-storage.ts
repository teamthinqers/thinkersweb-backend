import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
let pinecone: Pinecone | null = null;

try {
  if (process.env.PINECONE_API_KEY) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    console.log('Pinecone initialized successfully for vector storage');
  } else {
    console.log('Pinecone API key not found - vector storage disabled');
  }
} catch (error) {
  console.error('Error initializing Pinecone:', error);
}

const INDEX_NAME = 'dotspark-vectors';

// Generate embedding for text content
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Store dot in vector database
export async function storeDotInVector(dotData: {
  id: string;
  userId: string;
  summary: string;
  anchor: string;
  pulse: string;
  sourceType: string;
  captureMode: string;
  wheelId?: string;
  chakraId?: string;
  category?: string;
  createdAt: Date;
}): Promise<boolean> {
  if (!pinecone) {
    console.log('Pinecone not initialized - skipping vector storage');
    return false;
  }

  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Create composite content for embedding
    const compositeContent = `${dotData.summary} ${dotData.anchor} ${dotData.pulse}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(compositeContent);
    
    // Store in Pinecone with metadata
    await index.upsert([
      {
        id: `dot_${dotData.userId}_${dotData.id}`,
        values: embedding,
        metadata: {
          userId: dotData.userId,
          contentType: 'dot',
          contentId: dotData.id,
          summary: dotData.summary,
          anchor: dotData.anchor,
          pulse: dotData.pulse,
          sourceType: dotData.sourceType,
          captureMode: dotData.captureMode,
          wheelId: dotData.wheelId || '',
          chakraId: dotData.chakraId || '',
          category: dotData.category || '',
          createdAt: dotData.createdAt.toISOString(),
          content: compositeContent
        }
      }
    ]);
    
    console.log(`Dot ${dotData.id} stored in vector database for user ${dotData.userId}`);
    return true;
  } catch (error) {
    console.error('Error storing dot in vector database:', error);
    return false;
  }
}

// Store wheel in vector database
export async function storeWheelInVector(wheelData: {
  id: string;
  userId: string;
  title: string;
  goals: string;
  timeline: string;
  progress?: string;
  chakraId?: string;
  category?: string;
  createdAt: Date;
}): Promise<boolean> {
  if (!pinecone) {
    console.log('Pinecone not initialized - skipping vector storage');
    return false;
  }

  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Create composite content for embedding
    const compositeContent = `${wheelData.title} ${wheelData.goals} ${wheelData.timeline} ${wheelData.progress || ''}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(compositeContent);
    
    // Store in Pinecone with metadata
    await index.upsert([
      {
        id: `wheel_${wheelData.userId}_${wheelData.id}`,
        values: embedding,
        metadata: {
          userId: wheelData.userId,
          contentType: 'wheel',
          contentId: wheelData.id,
          title: wheelData.title,
          goals: wheelData.goals,
          timeline: wheelData.timeline,
          progress: wheelData.progress || '',
          chakraId: wheelData.chakraId || '',
          category: wheelData.category || '',
          createdAt: wheelData.createdAt.toISOString(),
          content: compositeContent
        }
      }
    ]);
    
    console.log(`Wheel ${wheelData.id} stored in vector database for user ${wheelData.userId}`);
    return true;
  } catch (error) {
    console.error('Error storing wheel in vector database:', error);
    return false;
  }
}

// Store chakra in vector database
export async function storeChakraInVector(chakraData: {
  id: string;
  userId: string;
  title: string;
  purpose: string;
  vision: string;
  strategy?: string;
  category?: string;
  createdAt: Date;
}): Promise<boolean> {
  if (!pinecone) {
    console.log('Pinecone not initialized - skipping vector storage');
    return false;
  }

  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Create composite content for embedding
    const compositeContent = `${chakraData.title} ${chakraData.purpose} ${chakraData.vision} ${chakraData.strategy || ''}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(compositeContent);
    
    // Store in Pinecone with metadata
    await index.upsert([
      {
        id: `chakra_${chakraData.userId}_${chakraData.id}`,
        values: embedding,
        metadata: {
          userId: chakraData.userId,
          contentType: 'chakra',
          contentId: chakraData.id,
          title: chakraData.title,
          purpose: chakraData.purpose,
          vision: chakraData.vision,
          strategy: chakraData.strategy || '',
          category: chakraData.category || '',
          createdAt: chakraData.createdAt.toISOString(),
          content: compositeContent
        }
      }
    ]);
    
    console.log(`Chakra ${chakraData.id} stored in vector database for user ${chakraData.userId}`);
    return true;
  } catch (error) {
    console.error('Error storing chakra in vector database:', error);
    return false;
  }
}

// Search user's content in vector database
export async function searchUserVectors(
  userId: string,
  query: string,
  contentType?: 'dot' | 'wheel' | 'chakra',
  topK: number = 10
): Promise<any[]> {
  if (!pinecone) {
    console.log('Pinecone not initialized - vector search disabled');
    return [];
  }

  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);
    
    // Create filter for user-specific content
    const filter: any = { userId: userId };
    if (contentType) {
      filter.contentType = contentType;
    }
    
    // Search vectors
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK,
      filter,
      includeMetadata: true,
      includeValues: false
    });
    
    return searchResponse.matches || [];
  } catch (error) {
    console.error('Error searching user vectors:', error);
    return [];
  }
}

// Delete user content from vector database
export async function deleteUserVectorContent(
  userId: string,
  contentType: 'dot' | 'wheel' | 'chakra',
  contentId: string
): Promise<boolean> {
  if (!pinecone) {
    console.log('Pinecone not initialized - skipping vector deletion');
    return false;
  }

  try {
    const index = pinecone.index(INDEX_NAME);
    const vectorId = `${contentType}_${userId}_${contentId}`;
    
    await index.deleteOne(vectorId);
    console.log(`Deleted ${contentType} ${contentId} from vector database for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting from vector database:', error);
    return false;
  }
}