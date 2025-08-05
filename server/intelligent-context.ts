/**
 * Intelligent Context System
 * Manages contextual retrieval of user data using Pinecone vector database
 */

import { db } from "@db";
import { 
  vectorEmbeddings, 
  dots, 
  wheels, 
  chakras, 
  userBehavior,
  conversationSessions,
  insertVectorEmbeddingSchema 
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { trackUserBehavior } from "./dotspark-activation";

// OpenAI for embeddings
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pinecone client (assuming it's already initialized in vector-db.ts)
let pineconeIndex: any = null;

/**
 * Initialize Pinecone index for intelligent context
 */
export async function initializeIntelligentContext() {
  try {
    // Try to import Pinecone initialization from existing vector-db setup
    try {
      const vectorDb = await import('./vector-db');
      if (vectorDb.getVectorIndex && typeof vectorDb.getVectorIndex === 'function') {
        pineconeIndex = await vectorDb.getVectorIndex();
        console.log('Intelligent context system initialized with Pinecone');
      } else {
        console.log('Pinecone not available, using local vector storage only');
      }
    } catch (importError) {
      console.log('Vector database module not found, using local storage only');
    }
  } catch (error) {
    console.warn('Failed to initialize intelligent context with Pinecone, falling back to local storage:', error);
  }
}

/**
 * Generate embedding for text content
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Store content in vector database for intelligent retrieval
 */
export async function storeInVectorDB(
  userId: number,
  contentType: 'dot' | 'wheel' | 'chakra' | 'conversation' | 'user_behavior',
  contentId: number,
  content: string,
  metadata: any = {}
): Promise<boolean> {
  try {
    // Generate unique vector ID
    const vectorId = `${contentType}_${userId}_${contentId}_${Date.now()}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(content);
    
    // Prepare metadata
    const vectorMetadata = {
      userId,
      contentType,
      contentId,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Store in Pinecone if available
    if (pineconeIndex) {
      try {
        await pineconeIndex.upsert([{
          id: vectorId,
          values: embedding,
          metadata: vectorMetadata
        }]);
        console.log(`Stored ${contentType} ${contentId} in Pinecone with ID: ${vectorId}`);
      } catch (pineconeError) {
        console.warn('Pinecone storage failed, continuing with local storage:', pineconeError);
      }
    }

    // Store in local database
    const embeddingData = insertVectorEmbeddingSchema.parse({
      contentType,
      contentId,
      userId,
      vectorId,
      content,
      embedding: JSON.stringify(embedding),
      metadata: JSON.stringify(vectorMetadata),
    });

    await db.insert(vectorEmbeddings).values(embeddingData);

    return true;
  } catch (error) {
    console.error('Error storing in vector database:', error);
    return false;
  }
}

/**
 * Retrieve contextually relevant content for intelligent chat
 */
export async function getIntelligentContext(
  userId: number,
  query: string,
  limit: number = 10,
  contentTypes?: string[]
): Promise<{
  dots: any[];
  wheels: any[];
  chakras: any[];
  conversations: any[];
  behaviors: any[];
  relevanceScores: Record<string, number>;
}> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    let relevantVectors: any[] = [];

    // Search in Pinecone if available
    if (pineconeIndex) {
      try {
        const searchResponse = await pineconeIndex.query({
          vector: queryEmbedding,
          topK: limit,
          filter: {
            userId: userId,
            ...(contentTypes && { contentType: { $in: contentTypes } })
          },
          includeMetadata: true
        });

        relevantVectors = searchResponse.matches || [];
        console.log(`Found ${relevantVectors.length} relevant vectors from Pinecone`);
      } catch (pineconeError) {
        console.warn('Pinecone search failed, falling back to local search:', pineconeError);
      }
    }

    // Fallback to local database search if Pinecone fails or no results
    if (relevantVectors.length === 0) {
      const localVectors = await db.query.vectorEmbeddings.findMany({
        where: and(
          eq(vectorEmbeddings.userId, userId),
          contentTypes ? sql`content_type = ANY(${contentTypes})` : undefined
        ),
        orderBy: desc(vectorEmbeddings.createdAt),
        limit: limit
      });

      relevantVectors = localVectors.map(v => ({
        id: v.vectorId,
        score: 0.5, // Default score for local results
        metadata: JSON.parse(v.metadata || '{}')
      }));
    }

    // Organize results by content type
    const results = {
      dots: [],
      wheels: [],
      chakras: [],
      conversations: [],
      behaviors: [],
      relevanceScores: {} as Record<string, number>
    };

    // Fetch actual content based on vector results
    for (const vector of relevantVectors) {
      const { contentType, contentId } = vector.metadata;
      results.relevanceScores[`${contentType}_${contentId}`] = vector.score;

      switch (contentType) {
        case 'dot':
          const dot = await db.query.dots.findFirst({
            where: eq(dots.id, contentId)
          });
          if (dot) results.dots.push(dot);
          break;

        case 'wheel':
          const wheel = await db.query.wheels.findFirst({
            where: eq(wheels.id, contentId)
          });
          if (wheel) results.wheels.push(wheel);
          break;

        case 'chakra':
          const chakra = await db.query.chakras.findFirst({
            where: eq(chakras.id, contentId)
          });
          if (chakra) results.chakras.push(chakra);
          break;

        case 'conversation':
          const conversation = await db.query.conversationSessions.findFirst({
            where: eq(conversationSessions.id, contentId)
          });
          if (conversation) results.conversations.push(conversation);
          break;

        case 'user_behavior':
          const behavior = await db.query.userBehavior.findFirst({
            where: eq(userBehavior.id, contentId)
          });
          if (behavior) results.behaviors.push(behavior);
          break;
      }
    }

    // Track search behavior
    await trackUserBehavior(userId, 'search_query', 'search', undefined, {
      query,
      resultsCount: relevantVectors.length,
      contentTypes: contentTypes || ['all']
    });

    console.log(`Retrieved intelligent context for user ${userId}: ${results.dots.length} dots, ${results.wheels.length} wheels, ${results.chakras.length} chakras`);

    return results;
  } catch (error) {
    console.error('Error retrieving intelligent context:', error);
    return {
      dots: [],
      wheels: [],
      chakras: [],
      conversations: [],
      behaviors: [],
      relevanceScores: {}
    };
  }
}

/**
 * Get user's complete context summary for intelligent chat
 */
export async function getUserContextSummary(userId: number): Promise<{
  totalDots: number;
  totalWheels: number;
  totalChakras: number;
  recentActivity: any[];
  interests: string[];
  behaviorPatterns: any[];
}> {
  try {
    // Get counts
    const [dotsCount] = await db.select({ count: sql<number>`count(*)` }).from(dots).where(eq(dots.userId, userId));
    const [wheelsCount] = await db.select({ count: sql<number>`count(*)` }).from(wheels).where(eq(wheels.userId, userId));
    const [chakrasCount] = await db.select({ count: sql<number>`count(*)` }).from(chakras).where(eq(chakras.userId, userId));

    // Get recent activity
    const recentActivity = await db.query.userBehavior.findMany({
      where: eq(userBehavior.userId, userId),
      orderBy: desc(userBehavior.timestamp),
      limit: 20
    });

    // Analyze behavior patterns
    const behaviorPatterns = await db
      .select({
        actionType: userBehavior.actionType,
        count: sql<number>`count(*)`,
        lastActivity: sql<string>`max(timestamp)`
      })
      .from(userBehavior)
      .where(eq(userBehavior.userId, userId))
      .groupBy(userBehavior.actionType)
      .orderBy(sql`count(*) desc`);

    // Extract interests from content (simplified - could be enhanced with NLP)
    const recentDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt),
      limit: 10
    });

    const interests = [...new Set(
      recentDots.flatMap(dot => 
        [dot.summary, dot.anchor, dot.pulse]
          .join(' ')
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 4)
          .slice(0, 3)
      )
    )].slice(0, 10);

    return {
      totalDots: dotsCount.count,
      totalWheels: wheelsCount.count,
      totalChakras: chakrasCount.count,
      recentActivity: recentActivity.map(activity => ({
        ...activity,
        actionData: activity.actionData ? JSON.parse(activity.actionData) : null
      })),
      interests,
      behaviorPatterns
    };
  } catch (error) {
    console.error('Error getting user context summary:', error);
    return {
      totalDots: 0,
      totalWheels: 0,
      totalChakras: 0,
      recentActivity: [],
      interests: [],
      behaviorPatterns: []
    };
  }
}

/**
 * Enhanced chat response with intelligent context
 */
export async function generateIntelligentChatResponse(
  userId: number,
  message: string,
  conversationHistory: any[] = [],
  sessionId?: string
): Promise<{
  response: string;
  context: any;
  suggestedActions: string[];
  relatedContent: any;
}> {
  try {
    // Get intelligent context based on the message
    const context = await getIntelligentContext(userId, message, 5);
    const userSummary = await getUserContextSummary(userId);

    // Prepare context for AI
    const contextPrompt = `
User Context:
- Total Dots: ${userSummary.totalDots}
- Total Wheels: ${userSummary.totalWheels}  
- Total Chakras: ${userSummary.totalChakras}
- Key Interests: ${userSummary.interests.join(', ')}

Relevant Content:
${context.dots.map(dot => `Dot: ${dot.summary} | ${dot.anchor} | ${dot.pulse}`).join('\n')}
${context.wheels.map(wheel => `Wheel: ${wheel.heading} | ${wheel.goals}`).join('\n')}
${context.chakras.map(chakra => `Chakra: ${chakra.heading} | ${chakra.purpose}`).join('\n')}

Recent Activity:
${userSummary.recentActivity.slice(0, 5).map(activity => `${activity.actionType}: ${activity.entityType || 'general'}`).join('\n')}
`;

    // Generate AI response with context
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are DotSpark AI, an intelligent assistant that helps users organize their thoughts into Dots (insights), Wheels (goals), and Chakras (life purposes). 

Use the provided user context to give personalized, relevant responses. Reference their existing content when appropriate. Be encouraging and insightful.

User's Context: ${contextPrompt}`
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role || 'user',
          content: msg.content || msg.message
        })),
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const response = aiResponse.choices[0]?.message?.content || "I'm here to help you organize your thoughts with DotSpark.";

    // Generate suggested actions based on context
    const suggestedActions = [];
    if (context.dots.length < 3) suggestedActions.push("Create a new Dot to capture an insight");
    if (context.wheels.length < 2) suggestedActions.push("Set up a Wheel to organize your goals");
    if (context.chakras.length === 0) suggestedActions.push("Define a Chakra for your life purpose");
    if (userSummary.recentActivity.length > 0) suggestedActions.push("Review your recent activity patterns");

    // Track chat interaction
    await trackUserBehavior(userId, 'chat_interaction', 'chat', undefined, {
      message: message.substring(0, 100),
      responseLength: response.length,
      contextUsed: {
        dotsCount: context.dots.length,
        wheelsCount: context.wheels.length,
        chakrasCount: context.chakras.length
      }
    }, sessionId);

    return {
      response,
      context: userSummary,
      suggestedActions,
      relatedContent: context
    };
  } catch (error) {
    console.error('Error generating intelligent chat response:', error);
    return {
      response: "I'm experiencing some technical difficulties, but I'm here to help you organize your thoughts with DotSpark.",
      context: {},
      suggestedActions: ["Try creating a new Dot with your current thoughts"],
      relatedContent: { dots: [], wheels: [], chakras: [], conversations: [], behaviors: [], relevanceScores: {} }
    };
  }
}