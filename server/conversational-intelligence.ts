import { OpenAI } from 'openai';
import { performIntelligentRetrieval } from './intelligent-retriever';
// import { storeEmbedding, searchSimilarContent } from './vector-db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ConversationContext {
  sessionId: string;
  userId: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    pointsDiscussed?: string[];
    keyTopics?: string[];
    lastMentionedPoint?: string;
  }>;
  currentTopics: string[];
  discussedPoints: Map<string, {
    content: string;
    details: string[];
    userInterest: number; // 1-10 scale
    lastDiscussed: Date;
  }>;
  contextualMemory: {
    referencedItems: string[];
    userPreferences: string[];
    conversationFlow: string[];
  };
}

const conversationContexts = new Map<string, ConversationContext>();

/**
 * Enhanced conversational intelligence with context awareness
 */
export class ConversationalIntelligence {
  
  /**
   * Initialize or retrieve conversation context
   */
  static getOrCreateContext(sessionId: string, userId: number): ConversationContext {
    if (!conversationContexts.has(sessionId)) {
      conversationContexts.set(sessionId, {
        sessionId,
        userId,
        messages: [],
        currentTopics: [],
        discussedPoints: new Map(),
        contextualMemory: {
          referencedItems: [],
          userPreferences: [],
          conversationFlow: []
        }
      });
    }
    return conversationContexts.get(sessionId)!;
  }

  /**
   * Process user message with intelligent context understanding
   */
  static async processMessageWithContext(
    message: string,
    sessionId: string,
    userId: number,
    conversationHistory: Array<{ role: string; content: string; timestamp?: string }> = []
  ): Promise<{
    response: string;
    detectedIntent: string;
    referencedPoint?: string;
    suggestedFollowUps: string[];
    contextUsed: boolean;
  }> {
    try {
      const context = this.getOrCreateContext(sessionId, userId);
      
      // Analyze the current message for references and intent
      const messageAnalysis = await this.analyzeMessageIntent(message, context, conversationHistory);
      
      // Check if user is referencing a previous point
      const referencedPoint = this.detectPointReference(message, context);
      
      // Generate contextually aware response
      const response = await this.generateContextualResponse(
        message,
        context,
        messageAnalysis,
        referencedPoint,
        userId
      );
      
      // Update conversation context
      await this.updateConversationContext(context, message, response, messageAnalysis);
      
      // Store conversation for future vector search
      await this.storeConversationMemory(userId, sessionId, message, response.response);
      
      return response;

    } catch (error) {
      console.error('Error in conversational intelligence:', error);
      
      // Fallback to basic response
      return {
        response: "I understand you're asking about something we discussed. Could you clarify which specific point you'd like me to elaborate on?",
        detectedIntent: 'clarification_needed',
        suggestedFollowUps: ['Can you be more specific?', 'Which point interests you most?'],
        contextUsed: false
      };
    }
  }

  /**
   * Analyze message intent and context
   */
  private static async analyzeMessageIntent(
    message: string,
    context: ConversationContext,
    history: Array<{ role: string; content: string; timestamp?: string }>
  ): Promise<{
    intent: string;
    confidence: number;
    topics: string[];
    isFollowUp: boolean;
    referenceTerms: string[];
  }> {
    try {
      const recentMessages = history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const prompt = `
      Analyze this message in the context of the conversation:

      Recent conversation:
      ${recentMessages}

      Current message: "${message}"

      Recent topics discussed: ${context.currentTopics.join(', ')}
      Points discussed: ${Array.from(context.discussedPoints.keys()).join(', ')}

      Determine:
      1. Intent (follow_up_question, new_topic, clarification_request, point_reference, etc.)
      2. Is this referencing a previous point or topic?
      3. What specific terms suggest references to previous content?
      4. Main topics in this message
      5. Confidence level (0-100)

      Respond with JSON:
      {
        "intent": "follow_up_question|new_topic|clarification_request|point_reference|general_question",
        "confidence": 85,
        "topics": ["topic1", "topic2"],
        "isFollowUp": true|false,
        "referenceTerms": ["term1", "term2"]
      }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1000 // Increased for detailed intent analysis
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        intent: result.intent || 'general_question',
        confidence: Math.min(Math.max(result.confidence || 50, 0), 100),
        topics: Array.isArray(result.topics) ? result.topics : [],
        isFollowUp: Boolean(result.isFollowUp),
        referenceTerms: Array.isArray(result.referenceTerms) ? result.referenceTerms : []
      };

    } catch (error) {
      console.error('Error analyzing message intent:', error);
      
      // Simple fallback analysis
      const isFollowUp = /\b(that|this|it|one|point|more|elaborate|explain|detail)\b/i.test(message);
      const hasReference = /\b(you mentioned|you said|earlier|before|above|previous)\b/i.test(message);
      
      return {
        intent: isFollowUp || hasReference ? 'follow_up_question' : 'general_question',
        confidence: 60,
        topics: [],
        isFollowUp: isFollowUp || hasReference,
        referenceTerms: []
      };
    }
  }

  /**
   * Detect which specific point the user is referencing
   */
  private static detectPointReference(
    message: string,
    context: ConversationContext
  ): string | undefined {
    const recentPoints = Array.from(context.discussedPoints.entries())
      .sort((a, b) => b[1].lastDiscussed.getTime() - a[1].lastDiscussed.getTime())
      .slice(0, 10);

    // Look for direct matches or semantic similarity
    for (const [point, data] of recentPoints) {
      // Direct keyword matches
      const pointKeywords = point.toLowerCase().split(/\s+/);
      const messageWords = message.toLowerCase().split(/\s+/);
      
      const matchCount = pointKeywords.filter(keyword => 
        messageWords.some(word => word.includes(keyword) || keyword.includes(word))
      ).length;
      
      if (matchCount >= 2 || (pointKeywords.length <= 3 && matchCount >= 1)) {
        return point;
      }
    }

    // If message contains reference terms like "that point", "the first one", etc.
    if (/\b(that|this|first|second|third|last|previous|earlier)\s+(point|one|item|topic)\b/i.test(message)) {
      // Return the most recently discussed point
      return recentPoints[0]?.[0];
    }

    return undefined;
  }

  /**
   * Generate contextually aware response
   */
  private static async generateContextualResponse(
    message: string,
    context: ConversationContext,
    analysis: { intent: string; confidence: number; topics: string[]; isFollowUp: boolean },
    referencedPoint: string | undefined,
    userId: number
  ): Promise<{
    response: string;
    detectedIntent: string;
    referencedPoint?: string;
    suggestedFollowUps: string[];
    contextUsed: boolean;
  }> {
    try {
      let contextualInfo = '';
      let contextUsed = false;

      // If we detected a referenced point, provide specific context
      if (referencedPoint && context.discussedPoints.has(referencedPoint)) {
        const pointData = context.discussedPoints.get(referencedPoint)!;
        contextualInfo = `
        Referenced point: "${referencedPoint}"
        Previous details: ${pointData.details.join(', ')}
        Context: This was discussed earlier in our conversation.
        `;
        contextUsed = true;
      } else if (analysis.isFollowUp) {
        // Get recent conversation context
        const recentTopics = context.currentTopics.slice(-3);
        const recentPoints = Array.from(context.discussedPoints.entries())
          .sort((a, b) => b[1].lastDiscussed.getTime() - a[1].lastDiscussed.getTime())
          .slice(0, 3);
        
        contextualInfo = `
        Recent topics: ${recentTopics.join(', ')}
        Recent points discussed: ${recentPoints.map(([point]) => point).join(', ')}
        Context: User seems to be following up on previous discussion.
        `;
        contextUsed = true;
      }

      // Get intelligent retrieval for additional context
      let retrievalContext = '';
      try {
        const retrievalResults = await performIntelligentRetrieval(message, userId, {
          includeVector: true,
          includeDatabase: true,
          includeSemantic: false,
          limit: 3
        });
        
        if (retrievalResults.relatedContent.length > 0 || retrievalResults.similarStructures.length > 0) {
          retrievalContext = `
          Related user content found: ${retrievalResults.relatedContent.length + retrievalResults.similarStructures.length} items
          This might relate to the user's previous thoughts or structures.
          `;
          contextUsed = true;
        }
      } catch (error) {
        console.warn('Vector retrieval failed, continuing without it:', error);
      }

      const prompt = `
      You are an intelligent AI assistant with conversational memory. Respond to the user's message with full context awareness.

      User message: "${message}"
      
      ${contextualInfo}
      ${retrievalContext}

      Intent detected: ${analysis.intent}
      Is follow-up: ${analysis.isFollowUp}
      Confidence: ${analysis.confidence}%

      Guidelines:
      1. If referencing a specific point, elaborate on that exact point with detailed explanations
      2. If this is a follow-up, acknowledge the connection to previous discussion
      3. Provide comprehensive, detailed answers that anticipate follow-up questions
      4. Use natural conversation flow with seamless continuity
      5. Be specific and actionable in your response

      Respond with JSON:
      {
        "response": "Your detailed response here...",
        "suggestedFollowUps": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
      }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1500 // Increased for comprehensive contextual responses
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        response: result.response || "I understand you're asking about our previous discussion. Let me provide more details based on what we covered earlier.",
        detectedIntent: analysis.intent,
        referencedPoint,
        suggestedFollowUps: Array.isArray(result.suggestedFollowUps) 
          ? result.suggestedFollowUps 
          : ['Tell me more about this', 'How does this apply to my situation?', 'What should I do next?'],
        contextUsed
      };

    } catch (error) {
      console.error('Error generating contextual response:', error);
      
      return {
        response: referencedPoint 
          ? `Let me elaborate on "${referencedPoint}": ${context.discussedPoints.get(referencedPoint)?.content || 'This point was discussed earlier in our conversation.'}`
          : "I understand you're referencing something from our conversation. Let me provide more context based on what we've discussed.",
        detectedIntent: analysis.intent,
        referencedPoint,
        suggestedFollowUps: ['Can you be more specific?', 'What aspect interests you most?'],
        contextUsed: !!referencedPoint
      };
    }
  }

  /**
   * Update conversation context with new information
   */
  private static async updateConversationContext(
    context: ConversationContext,
    userMessage: string,
    aiResponse: { response: string; detectedIntent: string; referencedPoint?: string },
    analysis: { topics: string[]; referenceTerms: string[] }
  ): Promise<void> {
    try {
      // Add messages to history
      context.messages.push(
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
          lastMentionedPoint: aiResponse.referencedPoint
        },
        {
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
          pointsDiscussed: await this.extractPointsFromResponse(aiResponse.response),
          keyTopics: analysis.topics
        }
      );

      // Update current topics
      context.currentTopics = Array.from(new Set([...context.currentTopics, ...analysis.topics])).slice(-10);

      // Extract and store new points discussed in AI response
      const newPoints = await this.extractPointsFromResponse(aiResponse.response);
      for (const point of newPoints) {
        if (!context.discussedPoints.has(point)) {
          context.discussedPoints.set(point, {
            content: point,
            details: [],
            userInterest: aiResponse.referencedPoint === point ? 8 : 5,
            lastDiscussed: new Date()
          });
        } else {
          // Update existing point
          const existing = context.discussedPoints.get(point)!;
          existing.lastDiscussed = new Date();
          if (aiResponse.referencedPoint === point) {
            existing.userInterest = Math.min(existing.userInterest + 1, 10);
          }
        }
      }

      // Keep only recent messages (last 20) for memory efficiency
      context.messages = context.messages.slice(-20);

    } catch (error) {
      console.error('Error updating conversation context:', error);
    }
  }

  /**
   * Extract key points from AI response
   */
  private static async extractPointsFromResponse(response: string): Promise<string[]> {
    try {
      // Simple extraction using patterns
      const points: string[] = [];
      
      // Look for numbered points
      const numberedMatches = response.match(/\d+\.\s*([^.!?]+[.!?])/g);
      if (numberedMatches) {
        points.push(...numberedMatches.map(match => match.replace(/^\d+\.\s*/, '').trim()));
      }
      
      // Look for bullet points
      const bulletMatches = response.match(/[-•*]\s*([^.!?]+[.!?])/g);
      if (bulletMatches) {
        points.push(...bulletMatches.map(match => match.replace(/^[-•*]\s*/, '').trim()));
      }
      
      // Look for sentences that introduce concepts
      const conceptMatches = response.match(/(?:First|Second|Third|Additionally|Also|Furthermore|Moreover),?\s*([^.!?]+[.!?])/gi);
      if (conceptMatches) {
        points.push(...conceptMatches.map(match => match.replace(/^(?:First|Second|Third|Additionally|Also|Furthermore|Moreover),?\s*/i, '').trim()));
      }

      return points.slice(0, 5); // Limit to 5 key points
      
    } catch (error) {
      console.error('Error extracting points from response:', error);
      return [];
    }
  }

  /**
   * Store conversation in vector database for future reference
   */
  private static async storeConversationMemory(
    userId: number,
    sessionId: string,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      const conversationSnippet = `User: ${userMessage}\nAssistant: ${aiResponse}`;
      
      // Store in vector database if available
      try {
        const { storeEmbedding } = await import('./vector-db');
        await storeEmbedding(
          conversationSnippet,
          {
            contentType: 'conversation',
            userId,
            sessionId,
            timestamp: new Date().toISOString(),
            userMessage,
            aiResponse: aiResponse.substring(0, 500) // Store truncated response
          }
        );
      } catch (vectorError) {
        console.warn('Vector storage not available, continuing without it:', vectorError);
      }
      
    } catch (error) {
      console.warn('Failed to store conversation memory:', error);
      // Non-critical error, continue without vector storage
    }
  }

  /**
   * Get conversation summary for context
   */
  static async getConversationSummary(sessionId: string): Promise<{
    topicsDiscussed: string[];
    keyPoints: string[];
    userInterests: string[];
    conversationFlow: string[];
  }> {
    const context = conversationContexts.get(sessionId);
    
    if (!context) {
      return {
        topicsDiscussed: [],
        keyPoints: [],
        userInterests: [],
        conversationFlow: []
      };
    }

    const topicCounts = new Map<string, number>();
    context.currentTopics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    const sortedTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const keyPoints = Array.from(context.discussedPoints.entries())
      .sort((a, b) => b[1].userInterest - a[1].userInterest)
      .slice(0, 10)
      .map(([point]) => point);

    const userInterests = Array.from(context.discussedPoints.entries())
      .filter(([, data]) => data.userInterest >= 7)
      .map(([point]) => point);

    return {
      topicsDiscussed: sortedTopics,
      keyPoints,
      userInterests,
      conversationFlow: context.contextualMemory.conversationFlow
    };
  }
}