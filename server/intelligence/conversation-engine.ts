import OpenAI from 'openai';
import { db } from '../../db/index.ts';
import { eq, desc, and, gte } from 'drizzle-orm';
import { conversationSessions, entries, wheels } from '../../shared/schema.js';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationMemory {
  userProfile: {
    id: string;
    interests: string[];
    cognitivePatterns: string[];
    recentFocus: string[];
    conversationStyle: string;
  };
  contextualHistory: {
    recentDots: any[];
    recentWheels: any[];
    conversationTopics: string[];
    emotionalPatterns: string[];
  };
  semanticConnections: {
    relatedContent: any[];
    thematicClusters: string[];
    conceptualLinks: string[];
  };
}

interface IntelligentResponse {
  response: string;
  conversationStrategy: string;
  followUpQuestions: string[];
  contextualInsights: string[];
  nextSteps: string[];
  metadata: {
    confidenceScore: number;
    emotionalTone: string;
    cognitiveDepth: number;
    personalRelevance: number;
  };
}

/**
 * Advanced conversation engine that creates highly intelligent, contextual conversations
 */
export class ConversationEngine {
  private vectorDB: any;
  
  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine() {
    try {
      // Try to initialize vector DB if available
      const { initializeVectorDB } = await import('../vector-db.js');
      this.vectorDB = await initializeVectorDB();
      console.log('🧠 Conversation Engine initialized with vector database');
    } catch (error) {
      console.warn('⚠️ Vector DB not available, using simplified memory');
      this.vectorDB = null;
    }
  }

  /**
   * Generate intelligent conversation response with deep context awareness
   */
  async generateIntelligentResponse(
    userInput: string,
    userId: string,
    sessionId: string,
    conversationHistory: any[] = []
  ): Promise<IntelligentResponse> {
    try {
      // Step 1: Build comprehensive user memory
      const memory = await this.buildUserMemory(userId);
      
      // Step 2: Analyze current conversation context
      const conversationContext = await this.analyzeConversationContext(userInput, conversationHistory);
      
      // Step 3: Find semantic connections in user's content
      const semanticContext = await this.findSemanticConnections(userInput, userId);
      
      // Step 4: Generate contextually-aware response
      const response = await this.generateContextualResponse(
        userInput,
        memory,
        conversationContext,
        semanticContext,
        conversationHistory
      );
      
      // Step 5: Store conversation in memory for future context
      await this.updateConversationMemory(userId, sessionId, userInput, response.response);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error in conversation engine:', error);
      return this.generateFallbackResponse(userInput);
    }
  }

  /**
   * Build comprehensive user memory profile
   */
  private async buildUserMemory(userId: string): Promise<ConversationMemory> {
    try {
      // Get recent user content (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentDots, recentWheels, conversationHistory] = await Promise.all([
        // Recent dots
        db.select()
          .from(entries)
          .where(and(
            eq(entries.userId, Number(userId)),
            gte(entries.createdAt, thirtyDaysAgo)
          ))
          .orderBy(desc(entries.createdAt))
          .limit(20),
        
        // Recent wheels
        db.select()
          .from(wheels)
          .where(and(
            eq(wheels.userId, Number(userId)),
            gte(wheels.createdAt, thirtyDaysAgo)
          ))
          .orderBy(desc(wheels.createdAt))
          .limit(10),
        
        // Recent conversations - simplified query without last_activity
        db.select()
          .from(conversationSessions)
          .where(eq(conversationSessions.userId, Number(userId)))
          .orderBy(desc(conversationSessions.createdAt))
          .limit(10)
      ]);

      // Analyze user patterns using AI
      const userProfile = await this.analyzeUserProfile(recentDots, recentWheels, conversationHistory);
      
      return {
        userProfile,
        contextualHistory: {
          recentDots,
          recentWheels,
          conversationTopics: this.extractTopics(conversationHistory),
          emotionalPatterns: this.extractEmotionalPatterns(recentDots)
        },
        semanticConnections: {
          relatedContent: [],
          thematicClusters: [],
          conceptualLinks: []
        }
      };
      
    } catch (error) {
      console.error('Error building user memory:', error);
      return this.getDefaultMemory(userId);
    }
  }

  /**
   * Analyze user profile using AI to understand patterns and preferences
   */
  private async analyzeUserProfile(recentDots: any[], recentWheels: any[], conversations: any[]) {
    try {
      const contentSummary = {
        dots: recentDots.map(d => d.data?.summary || d.summary).filter(Boolean),
        wheels: recentWheels.map(w => w.heading).filter(Boolean),
        conversations: conversations.map(c => c.organizationSummary).filter(Boolean)
      };

      const analysisPrompt = `Analyze this user's content to understand their cognitive patterns, interests, and communication style:

RECENT DOTS: ${JSON.stringify(contentSummary.dots)}
RECENT WHEELS: ${JSON.stringify(contentSummary.wheels)}
CONVERSATIONS: ${JSON.stringify(contentSummary.conversations)}

Provide analysis in JSON format:
{
  "interests": ["interest1", "interest2"],
  "cognitivePatterns": ["pattern1", "pattern2"],
  "recentFocus": ["focus1", "focus2"],
  "conversationStyle": "preferred style",
  "emotionalTone": "general emotional state",
  "thinkingStyle": "analytical|creative|practical|philosophical"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('Error analyzing user profile:', error);
      return {
        interests: [],
        cognitivePatterns: [],
        recentFocus: [],
        conversationStyle: "supportive",
        emotionalTone: "neutral",
        thinkingStyle: "balanced"
      };
    }
  }

  /**
   * Analyze current conversation context for depth and direction
   */
  private async analyzeConversationContext(userInput: string, history: any[]) {
    try {
      const contextPrompt = `Analyze this conversation context:

USER INPUT: "${userInput}"
CONVERSATION HISTORY: ${JSON.stringify(history.slice(-5))}

Provide analysis in JSON format:
{
  "emotionalState": "current emotional tone",
  "topicDepth": 1-10,
  "conversationStage": "exploration|deepening|clarification|resolution",
  "userIntent": "what the user is trying to achieve",
  "keyThemes": ["theme1", "theme2"],
  "conversationDirection": "where this conversation should lead"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: contextPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('Error analyzing conversation context:', error);
      return {
        emotionalState: "neutral",
        topicDepth: 1,
        conversationStage: "exploration",
        userIntent: "sharing thoughts",
        keyThemes: [],
        conversationDirection: "continue exploring"
      };
    }
  }

  /**
   * Find semantic connections using vector search
   */
  private async findSemanticConnections(userInput: string, userId: string) {
    try {
      if (!this.vectorDB) {
        return { relatedContent: [], relevanceScore: 0 };
      }

      // Try to search for semantically similar content
      const { searchVectorDB } = await import('../vector-db.js');
      const searchResults = await searchVectorDB(userInput, {
        userId: Number(userId),
        limit: 10,
        threshold: 0.7
      });

      return {
        relatedContent: searchResults,
        relevanceScore: searchResults.length > 0 ? searchResults[0].score : 0
      };
      
    } catch (error) {
      console.error('Error finding semantic connections:', error);
      return { relatedContent: [], relevanceScore: 0 };
    }
  }

  /**
   * Generate contextually-aware, intelligent response
   */
  private async generateContextualResponse(
    userInput: string,
    memory: ConversationMemory,
    conversationContext: any,
    semanticContext: any,
    history: any[]
  ): Promise<IntelligentResponse> {
    try {
      const systemPrompt = `You are an advanced AI conversation partner for DotSpark, a cognitive enhancement platform. Your role is to engage in deep, meaningful conversations that help users organize and understand their thoughts.

USER PROFILE:
- Interests: ${memory.userProfile.interests.join(', ')}
- Thinking Style: ${memory.userProfile.conversationStyle}
- Recent Focus: ${memory.userProfile.recentFocus.join(', ')}
- Cognitive Patterns: ${memory.userProfile.cognitivePatterns.join(', ')}

CONVERSATION CONTEXT:
- Current Stage: ${conversationContext.conversationStage}
- Topic Depth: ${conversationContext.topicDepth}/10
- User Intent: ${conversationContext.userIntent}
- Emotional State: ${conversationContext.emotionalState}

SEMANTIC CONNECTIONS:
${semanticContext.relatedContent.length > 0 ? 
  'Related content from user history:\n' + 
  semanticContext.relatedContent.slice(0, 3).map((item: any) => `- ${item.content}`).join('\n')
  : 'No directly related content found'}

GUIDELINES:
1. Be genuinely curious and ask thoughtful follow-up questions
2. Make connections to their previous thoughts and patterns
3. Help them explore deeper layers of their thinking
4. Be supportive but challenge them to think more deeply
5. Adapt your communication style to match their preferences
6. Reference relevant previous content when appropriate
7. Guide toward insight and clarity, not just information gathering
8. Keep responses conversational, not clinical

Respond to: "${userInput}"

Provide your response in JSON format:
{
  "response": "your conversational response",
  "conversationStrategy": "your approach for this response",
  "followUpQuestions": ["question1", "question2"],
  "contextualInsights": ["insight1", "insight2"],
  "nextSteps": ["step1", "step2"],
  "metadata": {
    "confidenceScore": 0-1,
    "emotionalTone": "tone",
    "cognitiveDepth": 1-10,
    "personalRelevance": 0-1
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-6).map((msg: any) => ({
            role: msg.role || 'user',
            content: msg.content || msg.message
          })),
          { role: "user", content: userInput }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Ensure all required fields exist
      return {
        response: result.response || "That's interesting. Tell me more about what's driving this thought.",
        conversationStrategy: result.conversationStrategy || "exploratory engagement",
        followUpQuestions: result.followUpQuestions || [],
        contextualInsights: result.contextualInsights || [],
        nextSteps: result.nextSteps || [],
        metadata: {
          confidenceScore: result.metadata?.confidenceScore || 0.7,
          emotionalTone: result.metadata?.emotionalTone || "supportive",
          cognitiveDepth: result.metadata?.cognitiveDepth || 3,
          personalRelevance: result.metadata?.personalRelevance || 0.5
        }
      };
      
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return this.generateFallbackResponse(userInput);
    }
  }

  /**
   * Update conversation memory for future context
   */
  private async updateConversationMemory(
    userId: string,
    sessionId: string,
    userInput: string,
    aiResponse: string
  ) {
    try {
      // Store in vector database for semantic search
      if (this.vectorDB) {
        const { storeInVectorDB } = await import('../vector-db.js');
        await storeInVectorDB(
          `${userInput} | ${aiResponse}`,
          {
            userId: Number(userId),
            sessionId,
            type: 'conversation',
            timestamp: new Date().toISOString()
          },
          `conversation_${userId}_${sessionId}_${Date.now()}`
        );
      }
      
      // Update session data
      await db.update(conversationSessions)
        .set({
          conversationData: JSON.stringify([
            { role: 'user', content: userInput, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() }
          ]),
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.sessionId, sessionId));
        
    } catch (error) {
      console.error('Error updating conversation memory:', error);
    }
  }

  /**
   * Extract topics from conversation history
   */
  private extractTopics(conversations: any[]): string[] {
    return conversations
      .map(c => c.organizationSummary)
      .filter(Boolean)
      .flatMap(summary => {
        try {
          const parsed = JSON.parse(summary);
          return [parsed.summary, parsed.anchor].filter(Boolean);
        } catch {
          return [summary];
        }
      })
      .slice(0, 10);
  }

  /**
   * Extract emotional patterns from user content
   */
  private extractEmotionalPatterns(dots: any[]): string[] {
    return dots
      .map(d => d.data?.pulse || d.pulse)
      .filter(Boolean)
      .slice(0, 20);
  }

  /**
   * Generate fallback response when main processing fails
   */
  private generateFallbackResponse(userInput: string): IntelligentResponse {
    const fallbackResponses = [
      "That's a fascinating perspective. What led you to think about this?",
      "I'm curious about the deeper layers of this thought. Can you explore what's behind it?",
      "Tell me more about how this connects to what's been on your mind lately.",
      "What aspects of this feel most important to you right now?",
      "I sense there's more to unpack here. What would you like to explore further?"
    ];

    return {
      response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      conversationStrategy: "exploratory fallback",
      followUpQuestions: ["What's the most important aspect of this for you?"],
      contextualInsights: [],
      nextSteps: ["Continue exploring this topic"],
      metadata: {
        confidenceScore: 0.5,
        emotionalTone: "supportive",
        cognitiveDepth: 2,
        personalRelevance: 0.3
      }
    };
  }

  /**
   * Get default memory structure
   */
  private getDefaultMemory(userId: string): ConversationMemory {
    return {
      userProfile: {
        id: userId,
        interests: [],
        cognitivePatterns: [],
        recentFocus: [],
        conversationStyle: "supportive"
      },
      contextualHistory: {
        recentDots: [],
        recentWheels: [],
        conversationTopics: [],
        emotionalPatterns: []
      },
      semanticConnections: {
        relatedContent: [],
        thematicClusters: [],
        conceptualLinks: []
      }
    };
  }
}

// Export singleton instance
export const conversationEngine = new ConversationEngine();