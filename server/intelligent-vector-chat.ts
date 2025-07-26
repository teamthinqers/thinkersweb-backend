import OpenAI from "openai";
import { 
  searchSimilarContent, 
  storeVectorEmbedding, 
  getConversationContext,
  suggestRelatedThoughts
} from './vector-db';
import { db } from '../db';
import { entries, wheels, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface IntelligentChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: Date;
  vectorId?: string;
  contextReferences?: string[];
}

export interface ChatIntelligence {
  contextualResponse: string;
  relatedThoughts: Array<{
    id: string;
    content: string;
    similarity: number;
    type: string;
  }>;
  suggestedActions: string[];
  conversationInsights: {
    themes: string[];
    mood: string;
    complexity: number;
    readinessForDotCreation: boolean;
  };
  vectorContext: Array<{
    source: string;
    relevance: number;
    excerpt: string;
  }>;
}

/**
 * Generate intelligent chat response using vector context
 */
export async function generateIntelligentVectorResponse(
  userMessage: string,
  userId: number,
  conversationHistory: IntelligentChatMessage[] = [],
  sessionId?: string
): Promise<ChatIntelligence> {
  try {
    // 1. Get contextual information from vector database
    const [contextResults, relatedThoughts] = await Promise.all([
      getConversationContext(userMessage, userId, 8),
      suggestRelatedThoughts(userMessage, userId, 5)
    ]);

    // 2. Analyze conversation themes and user intent
    const conversationInsights = await analyzeConversationIntelligence(
      userMessage,
      conversationHistory,
      contextResults
    );

    // 3. Generate contextually aware response
    const contextualResponse = await generateContextualResponse(
      userMessage,
      conversationHistory,
      contextResults,
      conversationInsights
    );

    // 4. Store this conversation exchange as vector embedding
    await storeConversationVector(userMessage, contextualResponse, userId, sessionId);

    // 5. Generate suggested actions based on context
    const suggestedActions = await generateActionSuggestions(
      userMessage,
      contextResults,
      conversationInsights
    );

    return {
      contextualResponse,
      relatedThoughts: relatedThoughts.map(thought => ({
        id: thought.id,
        content: thought.metadata.content,
        similarity: thought.score,
        type: thought.metadata.contentType
      })),
      suggestedActions,
      conversationInsights,
      vectorContext: contextResults.map(result => ({
        source: `${result.metadata.contentType}_${result.metadata.contentId}`,
        relevance: result.score,
        excerpt: result.metadata.content.substring(0, 150) + '...'
      }))
    };

  } catch (error) {
    console.error('Error generating intelligent vector response:', error);
    throw error;
  }
}

/**
 * Analyze conversation for intelligence insights
 */
async function analyzeConversationIntelligence(
  userMessage: string,
  conversationHistory: IntelligentChatMessage[],
  vectorContext: any[]
): Promise<any> {
  const analysisPrompt = `Analyze this conversation for intelligent insights:

Current Message: "${userMessage}"

Recent Conversation:
${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Vector Context Available:
${vectorContext.slice(0, 3).map(ctx => `- ${ctx.metadata.contentType}: ${ctx.metadata.content.substring(0, 100)}`).join('\n')}

Analyze and respond with JSON:
{
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "exploring|focused|confused|satisfied|excited|contemplative",
  "complexity": 1-10,
  "readinessForDotCreation": boolean,
  "dominantIntent": "learning|creating|organizing|reflecting|exploring",
  "cognitiveDepth": 1-10,
  "contextualRelevance": 1-10
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 300,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error analyzing conversation intelligence:', error);
    return {
      themes: [],
      mood: 'exploring',
      complexity: 5,
      readinessForDotCreation: false,
      dominantIntent: 'exploring',
      cognitiveDepth: 5,
      contextualRelevance: 5
    };
  }
}

/**
 * Generate contextually aware response using vector insights
 */
async function generateContextualResponse(
  userMessage: string,
  conversationHistory: IntelligentChatMessage[],
  vectorContext: any[],
  insights: any
): Promise<string> {
  const contextualPrompt = `You are DotSpark, an intelligent thinking companion. Generate a contextually aware response using the user's historical thoughts and current conversation.

Current Message: "${userMessage}"

User's Related Thoughts/Context:
${vectorContext.slice(0, 5).map(ctx => 
  `- From ${ctx.metadata.contentType}: "${ctx.metadata.content.substring(0, 200)}..." (Relevance: ${Math.round(ctx.score * 100)}%)`
).join('\n')}

Conversation Insights:
- Themes: ${insights.themes?.join(', ') || 'None identified'}
- Current Mood: ${insights.mood || 'Unknown'}
- Cognitive Depth: ${insights.cognitiveDepth || 5}/10
- Intent: ${insights.dominantIntent || 'Exploring'}

Guidelines:
1. Reference relevant past thoughts naturally when applicable
2. Build on established themes and patterns
3. Match the user's cognitive depth and mood
4. Provide insights that connect current thoughts to past reflections
5. Suggest natural progressions or deeper explorations
6. Keep responses conversational and supportive
7. If readiness for dot creation is high, gently suggest organizing thoughts

Generate a thoughtful, contextually intelligent response (150-300 words):`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are DotSpark, an intelligent thinking companion that helps users organize and develop their thoughts." },
        { role: "user", content: contextualPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return response.choices[0].message.content || "I'm here to help you explore your thoughts further.";
  } catch (error) {
    console.error('Error generating contextual response:', error);
    return "I'm here to help you explore your thoughts. Could you share more about what's on your mind?";
  }
}

/**
 * Generate action suggestions based on context
 */
async function generateActionSuggestions(
  userMessage: string,
  vectorContext: any[],
  insights: any
): Promise<string[]> {
  const suggestions: string[] = [];

  // Dynamic suggestions based on conversation insights
  if (insights.readinessForDotCreation) {
    suggestions.push("Organize your current thoughts into a structured dot");
  }

  if (insights.complexity >= 7) {
    suggestions.push("Break this complex idea into smaller, manageable parts");
  }

  if (vectorContext.length > 3) {
    suggestions.push("Explore connections between your current and past thoughts");
  }

  if (insights.mood === 'confused') {
    suggestions.push("Let's clarify the core aspects of what you're thinking about");
  }

  if (insights.cognitiveDepth >= 8) {
    suggestions.push("Consider creating a wheel to organize related thoughts");
  }

  // Content-based suggestions
  const contentTypes = vectorContext.map(ctx => ctx.metadata.contentType);
  if (contentTypes.includes('wheel') && !contentTypes.includes('chakra')) {
    suggestions.push("Consider if these thoughts connect to a larger life theme (chakra)");
  }

  // Default suggestions if none generated
  if (suggestions.length === 0) {
    suggestions.push(
      "Continue exploring this topic",
      "Save this insight as a new dot",
      "Find related thoughts from your past reflections"
    );
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

/**
 * Store conversation exchange as vector embedding
 */
async function storeConversationVector(
  userMessage: string,
  assistantResponse: string,
  userId: number,
  sessionId?: string
): Promise<void> {
  try {
    const conversationContent = `User: ${userMessage}\nDotSpark: ${assistantResponse}`;
    
    // Create a unique content ID for this conversation exchange
    const contentId = Date.now();
    
    await storeVectorEmbedding(
      'conversation',
      contentId,
      conversationContent,
      userId,
      {
        sessionId: sessionId || 'unknown',
        userMessage: userMessage.substring(0, 500),
        assistantResponse: assistantResponse.substring(0, 500),
        timestamp: new Date().toISOString(),
        exchangeType: 'chat'
      }
    );
  } catch (error) {
    console.error('Error storing conversation vector:', error);
    // Don't throw - conversation storage is not critical for response generation
  }
}

/**
 * Enhance existing dot/wheel/chakra creation with vector intelligence
 */
export async function enhanceContentWithVectorIntelligence(
  contentType: 'dot' | 'wheel' | 'chakra',
  contentText: string,
  userId: number
): Promise<{
  enhancedContent: string;
  relatedContent: Array<{
    type: string;
    content: string;
    similarity: number;
  }>;
  suggestions: string[];
}> {
  try {
    // Find related content
    const relatedContent = await searchSimilarContent(contentText, {
      topK: 5,
      threshold: 0.7,
      contentTypes: ['entry', 'dot', 'wheel', 'chakra'],
      userId,
      includeContent: true
    });

    // Generate enhancement suggestions
    const enhancementPrompt = `Enhance this ${contentType} content using related thoughts:

Original Content: "${contentText}"

Related Thoughts:
${relatedContent.map(item => 
  `- ${item.metadata.contentType}: "${item.metadata.content.substring(0, 150)}..." (${Math.round(item.score * 100)}% similar)`
).join('\n')}

Provide JSON response:
{
  "enhancedContent": "improved version that naturally incorporates insights from related thoughts",
  "suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: enhancementPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 500,
    });

    const enhancement = JSON.parse(response.choices[0].message.content || '{}');

    return {
      enhancedContent: enhancement.enhancedContent || contentText,
      relatedContent: relatedContent.map(item => ({
        type: item.metadata.contentType,
        content: item.metadata.content,
        similarity: item.score
      })),
      suggestions: enhancement.suggestions || []
    };

  } catch (error) {
    console.error('Error enhancing content with vector intelligence:', error);
    return {
      enhancedContent: contentText,
      relatedContent: [],
      suggestions: []
    };
  }
}

/**
 * Get intelligent search suggestions based on user's content patterns
 */
export async function getIntelligentSearchSuggestions(
  userId: number,
  limit: number = 6
): Promise<string[]> {
  try {
    // Get user's most recent content to understand patterns
    const recentEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      orderBy: desc(entries.createdAt),
      limit: 10
    });

    if (recentEntries.length === 0) {
      return [
        "Personal growth insights",
        "Professional development",
        "Creative ideas",
        "Problem-solving strategies",
        "Learning experiences",
        "Future goals"
      ];
    }

    // Analyze content themes for suggestions
    const contentTexts = recentEntries.map(entry => `${entry.title} ${entry.content}`).join(' ');
    
    const suggestionPrompt = `Based on this user's recent thoughts and entries, suggest ${limit} intelligent search queries they might want to explore:

Recent Content Themes:
${contentTexts.substring(0, 1000)}

Generate ${limit} specific, thoughtful search suggestions that would help them discover relevant past thoughts or explore related concepts. Respond with JSON:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: suggestionPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.suggestions || [];

  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return [
      "Recent insights and learnings",
      "Goals and aspirations",
      "Creative thoughts and ideas",
      "Personal reflections",
      "Professional development",
      "Problem-solving approaches"
    ];
  }
}