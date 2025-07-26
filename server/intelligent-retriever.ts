import { db } from '../db';
import { entries, wheels, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc, or, ilike, sql } from 'drizzle-orm';
import { searchSimilarContent, VectorSearchResult } from './vector-db';
import { 
  classifyCognitiveStructure, 
  performSemanticAnalysis, 
  generateContextualInsights,
  extractKeyEntities,
  CognitiveStructure,
  SemanticAnalysis 
} from './cognitive-classifier';

export interface IntelligentRetrievalResult {
  cognitiveStructure: CognitiveStructure;
  semanticAnalysis: SemanticAnalysis;
  relatedContent: VectorSearchResult[];
  contextualInsights: {
    insights: string[];
    recommendations: string[];
    connections: string[];
    nextSteps: string[];
  };
  keyEntities: {
    entities: string[];
    concepts: string[];
    keywords: string[];
    topics: string[];
  };
  similarStructures: Array<{
    id: number;
    type: 'dot' | 'wheel' | 'chakra';
    heading: string;
    content: string;
    similarity: number;
    metadata: any;
  }>;
}

/**
 * Intelligent retrieval system for Dots, Wheels, and Chakras
 */
export async function performIntelligentRetrieval(
  query: string,
  userId: number,
  options: {
    includeVector?: boolean;
    includeDatabase?: boolean;
    includeSemantic?: boolean;
    limit?: number;
  } = {}
): Promise<IntelligentRetrievalResult> {
  const {
    includeVector = true,
    includeDatabase = true,
    includeSemantic = true,
    limit = 10
  } = options;

  try {
    // 1. Classify the cognitive structure of the query
    const cognitiveStructure = await classifyCognitiveStructure(query);
    
    // 2. Perform semantic analysis
    const semanticAnalysis = includeSemantic 
      ? await performSemanticAnalysis(query)
      : {
          themes: ['general'],
          mood: 'neutral',
          complexity: 'moderate' as const,
          actionOriented: false,
          timeHorizon: 'short-term' as const,
          domains: ['personal'],
          readinessScore: 70
        };

    // 3. Vector-based semantic search
    let relatedContent: VectorSearchResult[] = [];
    if (includeVector) {
      try {
        relatedContent = await searchSimilarContent(query, {
          topK: limit,
          threshold: 0.6,
          contentTypes: ['dot', 'wheel', 'chakra', 'entry'],
          userId,
          includeContent: true
        });
      } catch (error) {
        console.warn('Vector search failed, falling back to database search:', error);
      }
    }

    // 4. Database-based keyword search as fallback/supplement
    let similarStructures: Array<{
      id: number;
      type: 'dot' | 'wheel' | 'chakra';
      heading: string;
      content: string;
      similarity: number;
      metadata: any;
    }> = [];

    if (includeDatabase || relatedContent.length === 0) {
      similarStructures = await performDatabaseSearch(query, userId, limit);
    }

    // 5. Extract key entities from the query
    const keyEntities = await extractKeyEntities(query);

    // 6. Get user's recent content for context
    const userHistory = await getUserRecentContent(userId, 5);

    // 7. Generate contextual insights
    const contextualInsights = await generateContextualInsights(
      cognitiveStructure,
      relatedContent.map(item => ({
        content: (item as any).content || '',
        type: (item as any).metadata?.contentType || 'unknown',
        similarity: (item as any).similarity || 0
      })),
      userHistory
    );

    return {
      cognitiveStructure,
      semanticAnalysis,
      relatedContent,
      contextualInsights,
      keyEntities,
      similarStructures
    };

  } catch (error) {
    console.error('Error in intelligent retrieval:', error);
    
    // Fallback minimal response
    return {
      cognitiveStructure: {
        type: 'dot',
        confidence: 50,
        reasoning: 'Fallback classification',
        keyIndicators: [],
        suggestedStructure: {
          heading: 'Untitled',
          content: query
        }
      },
      semanticAnalysis: {
        themes: ['general'],
        mood: 'neutral',
        complexity: 'moderate',
        actionOriented: false,
        timeHorizon: 'short-term',
        domains: ['personal'],
        readinessScore: 50
      },
      relatedContent: [],
      contextualInsights: {
        insights: ['Content analysis available'],
        recommendations: ['Consider refining your input'],
        connections: [],
        nextSteps: ['Try a more specific query']
      },
      keyEntities: {
        entities: [],
        concepts: [],
        keywords: [],
        topics: []
      },
      similarStructures: []
    };
  }
}

/**
 * Database-based search for similar structures
 */
async function performDatabaseSearch(
  query: string,
  userId: number,
  limit: number
): Promise<Array<{
  id: number;
  type: 'dot' | 'wheel' | 'chakra';
  heading: string;
  content: string;
  similarity: number;
  metadata: any;
}>> {
  try {
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const searchPattern = `%${keywords.join('%')}%`;

    // Search in entries (dots)
    const entryResults = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, userId),
        or(
          ilike(entries.title, searchPattern),
          ilike(entries.content, searchPattern)
        )
      ),
      limit: Math.ceil(limit / 2),
      orderBy: desc(entries.createdAt)
    });

    // Search in wheels (including chakras)
    const wheelResults = await db.query.wheels.findMany({
      where: and(
        eq(wheels.userId, userId),
        or(
          ilike(wheels.heading, searchPattern),
          ilike(wheels.goals, searchPattern),
          sql`${wheels.purpose} ILIKE ${searchPattern}`
        )
      ),
      limit: Math.ceil(limit / 2),
      orderBy: desc(wheels.createdAt)
    });

    const results: Array<{
      id: number;
      type: 'dot' | 'wheel' | 'chakra';
      heading: string;
      content: string;
      similarity: number;
      metadata: any;
    }> = [];

    // Process entry results
    entryResults.forEach(entry => {
      const content = `${entry.title} ${entry.content}`;
      const similarity = calculateTextSimilarity(query, content);
      
      results.push({
        id: entry.id,
        type: 'dot',
        heading: entry.title,
        content: entry.content,
        similarity,
        metadata: {
          category: entry.categoryId,
          visibility: entry.visibility,
          createdAt: entry.createdAt
        }
      });
    });

    // Process wheel results
    wheelResults.forEach(wheel => {
      const content = `${wheel.heading} ${wheel.goals || wheel.purpose || ''}`;
      const similarity = calculateTextSimilarity(query, content);
      const type = wheel.chakraId === null ? 'chakra' : 'wheel';
      
      results.push({
        id: wheel.id,
        type,
        heading: wheel.heading,
        content: wheel.goals || wheel.purpose || '',
        similarity,
        metadata: {
          timeline: wheel.timeline,
          chakraId: wheel.chakraId,
          createdAt: wheel.createdAt
        }
      });
    });

    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

  } catch (error) {
    console.error('Error in database search:', error);
    return [];
  }
}

/**
 * Get user's recent content for context
 */
async function getUserRecentContent(
  userId: number,
  limit: number
): Promise<Array<{ content: string; timestamp: Date }>> {
  try {
    // Get recent entries
    const recentEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      limit: Math.ceil(limit / 2),
      orderBy: desc(entries.createdAt)
    });

    // Get recent wheels
    const recentWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      limit: Math.ceil(limit / 2),
      orderBy: desc(wheels.createdAt)
    });

    const history: Array<{ content: string; timestamp: Date }> = [];

    recentEntries.forEach(entry => {
      history.push({
        content: `${entry.title}: ${entry.content}`,
        timestamp: entry.createdAt
      });
    });

    recentWheels.forEach(wheel => {
      history.push({
        content: `${wheel.heading}: ${wheel.goals || wheel.purpose || ''}`,
        timestamp: wheel.createdAt
      });
    });

    return history
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting user history:', error);
    return [];
  }
}

/**
 * Simple text similarity calculation
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set(Array.from(words1).filter(word => words2.has(word)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Enhanced search with intelligent ranking
 */
export async function performEnhancedSearch(
  query: string,
  userId: number,
  filters: {
    types?: ('dot' | 'wheel' | 'chakra')[];
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    complexity?: ('simple' | 'moderate' | 'complex')[];
    domains?: string[];
  } = {}
): Promise<{
  results: IntelligentRetrievalResult;
  rankedContent: Array<{
    item: any;
    relevanceScore: number;
    matchReasons: string[];
  }>;
}> {
  try {
    // Get base intelligent retrieval
    const results = await performIntelligentRetrieval(query, userId, {
      includeVector: true,
      includeDatabase: true,
      includeSemantic: true,
      limit: 20
    });

    // Apply filters and ranking
    const rankedContent = await rankSearchResults(
      [...results.relatedContent, ...results.similarStructures],
      query,
      results.semanticAnalysis,
      filters
    );

    return {
      results,
      rankedContent
    };

  } catch (error) {
    console.error('Error in enhanced search:', error);
    throw error;
  }
}

/**
 * Rank search results with intelligent scoring
 */
async function rankSearchResults(
  items: any[],
  query: string,
  semanticAnalysis: SemanticAnalysis,
  filters: any
): Promise<Array<{
  item: any;
  relevanceScore: number;
  matchReasons: string[];
}>> {
  return items.map(item => {
    let score = item.similarity || 0;
    const reasons: string[] = [];

    // Boost score based on semantic analysis alignment
    if (semanticAnalysis.themes.some(theme => 
      item.content?.toLowerCase().includes(theme.toLowerCase())
    )) {
      score += 0.2;
      reasons.push('Theme alignment');
    }

    // Boost recent content
    if (item.metadata?.createdAt) {
      const daysSinceCreated = (Date.now() - new Date(item.metadata.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += 0.1;
        reasons.push('Recent content');
      }
    }

    // Apply type filters
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(item.type || item.metadata?.contentType)) {
        score *= 0.5;
      }
    }

    return {
      item,
      relevanceScore: Math.min(score, 1),
      matchReasons: reasons
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}