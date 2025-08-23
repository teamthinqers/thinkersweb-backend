import OpenAI from 'openai';
import { db } from '../../db/index.ts';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { conversationSessions, entries, wheels, chakras, userBehavior } from '../../shared/schema.js';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserMemoryProfile {
  personalityTraits: string[];
  communicationStyle: string;
  interests: string[];
  expertise: string[];
  currentGoals: string[];
  emotionalPatterns: string[];
  conversationPreferences: string[];
  cognitiveStyle: string;
  problemSolvingApproach: string;
  learningStyle: string;
  values: string[];
  currentChallenges: string[];
  relationships: string[];
  professionalContext: string[];
}

interface ConversationContext {
  recentTopics: string[];
  emotionalJourney: string[];
  unsolvedQuestions: string[];
  recurringThemes: string[];
  progressPoints: string[];
  contextualConnections: string[];
  conversationFlow: string;
  userMood: string;
  engagementLevel: number;
}

interface IntelligentResponse {
  response: string;
  reasoning: string;
  personalConnections: string[];
  followUpStrategy: string;
  contextualDepth: number;
  emotionalIntelligence: number;
  nextConversationPaths: string[];
  memoryUpdates: string[];
}

/**
 * Advanced user memory engine that creates ChatGPT-level intelligence
 * by deeply understanding and remembering user patterns, preferences, and context
 */
export class UserMemoryEngine {
  private vectorDB: any;
  
  constructor() {
    this.initializeMemoryEngine();
  }

  private async initializeMemoryEngine() {
    try {
      const { initializeVectorDB } = await import('../vector-db.js');
      this.vectorDB = await initializeVectorDB();
      console.log('🧠 User Memory Engine initialized with advanced context awareness');
    } catch (error) {
      console.warn('⚠️ Vector DB not available, using simplified memory');
      this.vectorDB = null;
    }
  }

  /**
   * Generate ChatGPT-level intelligent response with deep user understanding
   */
  async generateIntelligentResponse(
    userInput: string,
    userId: string,
    sessionId: string,
    conversationHistory: any[] = []
  ): Promise<IntelligentResponse> {
    try {
      console.log(`🧠 Generating intelligent response for user ${userId}`);
      
      // Step 1: Build comprehensive user memory profile
      const userMemory = await this.buildUserMemoryProfile(userId);
      
      // Step 2: Analyze current conversation context
      const conversationContext = await this.analyzeConversationContext(
        userInput, 
        conversationHistory, 
        userMemory
      );
      
      // Step 3: Find relevant connections across user's entire history
      const contextualConnections = await this.findContextualConnections(
        userInput, 
        userId, 
        userMemory
      );
      
      // Step 4: Generate sophisticated response with multiple intelligence layers
      const response = await this.generateMultiLayeredResponse(
        userInput,
        userMemory,
        conversationContext,
        contextualConnections,
        conversationHistory
      );
      
      // Step 5: Update user memory with new insights
      await this.updateUserMemory(userId, sessionId, userInput, response, userMemory);
      
      return response;
      
    } catch (error) {
      console.error('❌ Error in user memory engine:', error);
      return this.generateFallbackIntelligentResponse(userInput);
    }
  }

  /**
   * Build comprehensive user memory profile from all available data
   */
  private async buildUserMemoryProfile(userId: string): Promise<UserMemoryProfile> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch comprehensive user data
      const [recentDots, recentWheels, recentChakras, conversations, behaviorData] = await Promise.all([
        // Recent dots (insights and experiences)
        db.select()
          .from(entries)
          .where(and(
            eq(entries.userId, Number(userId)),
            gte(entries.createdAt, thirtyDaysAgo)
          ))
          .orderBy(desc(entries.createdAt))
          .limit(50),
        
        // Recent wheels (goals and projects)
        db.select()
          .from(wheels)
          .where(and(
            eq(wheels.userId, Number(userId)),
            gte(wheels.createdAt, thirtyDaysAgo)
          ))
          .orderBy(desc(wheels.createdAt))
          .limit(20),
        
        // Recent chakras (life principles)
        db.select()
          .from(chakras)
          .where(and(
            eq(chakras.userId, Number(userId)),
            gte(chakras.createdAt, thirtyDaysAgo)
          ))
          .orderBy(desc(chakras.createdAt))
          .limit(10),
        
        // Conversation history
        db.select()
          .from(conversationSessions)
          .where(eq(conversationSessions.userId, Number(userId)))
          .orderBy(desc(conversationSessions.createdAt))
          .limit(20),
        
        // User behavior patterns
        db.select()
          .from(userBehavior)
          .where(and(
            eq(userBehavior.userId, Number(userId)),
            gte(userBehavior.timestamp, thirtyDaysAgo)
          ))
          .orderBy(desc(userBehavior.timestamp))
          .limit(100)
      ]);

      // Analyze data with AI to build personality profile
      const profileAnalysis = await this.analyzeUserPersonality(
        recentDots, 
        recentWheels, 
        recentChakras, 
        conversations, 
        behaviorData
      );

      return profileAnalysis;
      
    } catch (error) {
      console.error('Error building user memory profile:', error);
      return this.getDefaultUserProfile();
    }
  }

  /**
   * Use AI to analyze user personality and patterns from their content
   */
  private async analyzeUserPersonality(
    dots: any[], 
    wheels: any[], 
    chakras: any[], 
    conversations: any[], 
    behavior: any[]
  ): Promise<UserMemoryProfile> {
    try {
      const analysisData = {
        dots: dots.map(d => ({
          summary: this.extractTextFromData(d.data) || d.summary,
          anchor: this.extractAnchorFromData(d.data) || d.anchor,
          pulse: this.extractPulseFromData(d.data) || d.pulse,
          timestamp: d.createdAt
        })),
        wheels: wheels.map(w => ({
          heading: w.heading,
          goals: w.goals,
          timeline: w.timeline,
          timestamp: w.createdAt
        })),
        chakras: chakras.map(c => ({
          heading: c.heading,
          purpose: c.purpose,
          timeline: c.timeline,
          timestamp: c.createdAt
        })),
        conversations: conversations.map(c => ({
          summary: c.organizationSummary,
          type: c.thoughtType,
          timestamp: c.createdAt
        })),
        behaviorPatterns: behavior.map(b => ({
          action: b.actionType,
          entity: b.entityType,
          timestamp: b.timestamp
        }))
      };

      const personalityPrompt = `Analyze this user's comprehensive data to build a deep personality and memory profile:

USER DATA:
${JSON.stringify(analysisData, null, 2)}

Based on this data, provide a comprehensive psychological and behavioral profile in JSON format:

{
  "personalityTraits": ["trait1", "trait2", "trait3"],
  "communicationStyle": "detailed communication preference",
  "interests": ["interest1", "interest2"],
  "expertise": ["area1", "area2"],
  "currentGoals": ["goal1", "goal2"],
  "emotionalPatterns": ["pattern1", "pattern2"],
  "conversationPreferences": ["preference1", "preference2"],
  "cognitiveStyle": "analytical|creative|practical|intuitive|mixed",
  "problemSolvingApproach": "detailed approach description",
  "learningStyle": "visual|auditory|kinesthetic|mixed",
  "values": ["value1", "value2"],
  "currentChallenges": ["challenge1", "challenge2"],
  "relationships": ["relationship insight1", "insight2"],
  "professionalContext": ["context1", "context2"]
}

Be insightful, specific, and accurate based on the actual data patterns.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: personalityPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('Error analyzing user personality:', error);
      return this.getDefaultUserProfile();
    }
  }

  /**
   * Analyze current conversation context with emotional and cognitive awareness
   */
  private async analyzeConversationContext(
    userInput: string,
    history: any[],
    userMemory: UserMemoryProfile
  ): Promise<ConversationContext> {
    try {
      const contextPrompt = `Analyze this conversation context with deep psychological awareness:

USER INPUT: "${userInput}"
CONVERSATION HISTORY: ${JSON.stringify(history.slice(-10))}
USER PERSONALITY: ${JSON.stringify(userMemory)}

Provide comprehensive context analysis in JSON format:
{
  "recentTopics": ["topic1", "topic2"],
  "emotionalJourney": ["emotional state progression"],
  "unsolvedQuestions": ["question1", "question2"],
  "recurringThemes": ["theme1", "theme2"],
  "progressPoints": ["progress1", "progress2"],
  "contextualConnections": ["connection1", "connection2"],
  "conversationFlow": "detailed flow analysis",
  "userMood": "current emotional state",
  "engagementLevel": 0.8
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: contextPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.4
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.error('Error analyzing conversation context:', error);
      return this.getDefaultConversationContext();
    }
  }

  /**
   * Find contextual connections across user's entire history using vector search
   */
  private async findContextualConnections(
    userInput: string,
    userId: string,
    userMemory: UserMemoryProfile
  ) {
    try {
      if (!this.vectorDB) {
        return { relatedContent: [], semanticConnections: [] };
      }

      // Try to import and use vector search if available
      try {
        const vectorDB = await import('../vector-db.js');
        if (vectorDB.searchVectorDB) {
          const semanticResults = await vectorDB.searchVectorDB(userInput, {
            userId: Number(userId),
            limit: 15,
            threshold: 0.6
          });
          
          return {
            relatedContent: semanticResults,
            thematicConnections: await this.findThematicConnections(userInput, userMemory.interests, userId)
          };
        }
      } catch (error) {
        console.warn('Vector search not available:', error);
      }

      // Fallback if vector search not available
      return {
        relatedContent: [],
        thematicConnections: await this.findThematicConnections(userInput, userMemory.interests, userId)
      };
      
    } catch (error) {
      console.error('Error finding contextual connections:', error);
      return { relatedContent: [], thematicConnections: [] };
    }
  }

  /**
   * Generate sophisticated multi-layered response like ChatGPT
   */
  private async generateMultiLayeredResponse(
    userInput: string,
    userMemory: UserMemoryProfile,
    conversationContext: ConversationContext,
    connections: any,
    history: any[]
  ): Promise<IntelligentResponse> {
    try {
      const systemPrompt = `You are an exceptionally intelligent AI assistant with deep understanding of this specific user. You have ChatGPT-level conversational intelligence with perfect memory and context awareness.

USER PERSONALITY PROFILE:
${JSON.stringify(userMemory, null, 2)}

CONVERSATION CONTEXT:
${JSON.stringify(conversationContext, null, 2)}

RELATED CONTENT FROM USER'S HISTORY:
${connections.relatedContent.slice(0, 5).map((item: any) => item.content).join('\n')}

CONVERSATION HISTORY:
${JSON.stringify(history.slice(-8))}

INSTRUCTIONS:
1. Respond with exceptional intelligence, showing deep understanding of the user
2. Reference relevant parts of their history naturally and meaningfully
3. Adapt your communication style to match their preferences perfectly
4. Show emotional intelligence and empathy
5. Provide insightful connections and perspectives they might not have considered
6. Ask thoughtful follow-up questions that drive meaningful exploration
7. Remember details about their life, goals, challenges, and interests
8. Be genuinely helpful while maintaining natural conversation flow

USER MESSAGE: "${userInput}"

Respond in JSON format:
{
  "response": "your intelligent, contextual response",
  "reasoning": "internal reasoning for your response approach",
  "personalConnections": ["connection1", "connection2"],
  "followUpStrategy": "strategy for continuing this conversation",
  "contextualDepth": 1-10,
  "emotionalIntelligence": 1-10,
  "nextConversationPaths": ["path1", "path2", "path3"],
  "memoryUpdates": ["insight1", "insight2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1200
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        response: result.response || "That's fascinating. I'd love to understand more about your perspective on this.",
        reasoning: result.reasoning || "Engaging with user's thoughts",
        personalConnections: result.personalConnections || [],
        followUpStrategy: result.followUpStrategy || "Continue exploring",
        contextualDepth: result.contextualDepth || 5,
        emotionalIntelligence: result.emotionalIntelligence || 7,
        nextConversationPaths: result.nextConversationPaths || [],
        memoryUpdates: result.memoryUpdates || []
      };
      
    } catch (error) {
      console.error('Error generating multi-layered response:', error);
      return this.generateFallbackIntelligentResponse(userInput);
    }
  }

  /**
   * Update user memory with new insights from conversation
   */
  private async updateUserMemory(
    userId: string,
    sessionId: string,
    userInput: string,
    response: IntelligentResponse,
    currentMemory: UserMemoryProfile
  ) {
    try {
      // Store conversation in vector database for future reference
      if (this.vectorDB) {
        try {
          const vectorDB = await import('../vector-db.js');
          if (vectorDB.storeInVectorDB) {
            await vectorDB.storeInVectorDB(
              `${userInput} | ${response.response}`,
              {
                userId: Number(userId),
                sessionId,
                type: 'intelligent_conversation',
                contextualDepth: response.contextualDepth,
                emotionalIntelligence: response.emotionalIntelligence,
                personalConnections: response.personalConnections,
                memoryUpdates: response.memoryUpdates,
                timestamp: new Date().toISOString()
              },
              `intelligent_conv_${userId}_${sessionId}_${Date.now()}`
            );
          }
        } catch (error) {
          console.warn('Vector storage not available:', error);
        }
      }

      // Update conversation session with enriched data
      await db.update(conversationSessions)
        .set({
          conversationData: JSON.stringify([
            { 
              role: 'user', 
              content: userInput, 
              timestamp: new Date(),
              contextAnalysis: response.reasoning
            },
            { 
              role: 'assistant', 
              content: response.response, 
              timestamp: new Date(),
              personalConnections: response.personalConnections,
              contextualDepth: response.contextualDepth,
              emotionalIntelligence: response.emotionalIntelligence
            }
          ]),
          organizationSummary: JSON.stringify({
            memoryUpdates: response.memoryUpdates,
            conversationFlow: response.followUpStrategy,
            nextPaths: response.nextConversationPaths
          }),
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.sessionId, sessionId));
        
    } catch (error) {
      console.error('Error updating user memory:', error);
    }
  }

  /**
   * Find thematic connections based on user interests and patterns
   */
  private async findThematicConnections(
    userInput: string,
    interests: string[],
    userId: string
  ) {
    try {
      // This would use more sophisticated matching based on themes
      return interests.filter(interest => 
        userInput.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(userInput.toLowerCase())
      );
    } catch (error) {
      console.error('Error finding thematic connections:', error);
      return [];
    }
  }

  /**
   * Extract text content from various data formats
   */
  private extractTextFromData(data: any): string {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed.summary || parsed.text || data;
      } catch {
        return data;
      }
    }
    return data?.summary || data?.text || '';
  }

  private extractAnchorFromData(data: any): string {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed.anchor || '';
      } catch {
        return '';
      }
    }
    return data?.anchor || '';
  }

  private extractPulseFromData(data: any): string {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed.pulse || '';
      } catch {
        return '';
      }
    }
    return data?.pulse || '';
  }

  /**
   * Default user profile for new users
   */
  private getDefaultUserProfile(): UserMemoryProfile {
    return {
      personalityTraits: ['curious', 'thoughtful'],
      communicationStyle: 'supportive and engaging',
      interests: [],
      expertise: [],
      currentGoals: [],
      emotionalPatterns: [],
      conversationPreferences: ['meaningful dialogue', 'thoughtful questions'],
      cognitiveStyle: 'balanced',
      problemSolvingApproach: 'collaborative exploration',
      learningStyle: 'mixed',
      values: [],
      currentChallenges: [],
      relationships: [],
      professionalContext: []
    };
  }

  /**
   * Default conversation context
   */
  private getDefaultConversationContext(): ConversationContext {
    return {
      recentTopics: [],
      emotionalJourney: [],
      unsolvedQuestions: [],
      recurringThemes: [],
      progressPoints: [],
      contextualConnections: [],
      conversationFlow: 'exploratory',
      userMood: 'neutral',
      engagementLevel: 0.7
    };
  }

  /**
   * Fallback intelligent response when main processing fails
   */
  private generateFallbackIntelligentResponse(userInput: string): IntelligentResponse {
    return {
      response: "I'm truly interested in understanding your perspective on this. Could you tell me more about what's driving these thoughts?",
      reasoning: "Fallback engagement strategy",
      personalConnections: [],
      followUpStrategy: "Deep listening and exploration",
      contextualDepth: 3,
      emotionalIntelligence: 5,
      nextConversationPaths: ["Explore deeper context", "Ask about related experiences"],
      memoryUpdates: []
    };
  }
}

// Export singleton instance
export const userMemoryEngine = new UserMemoryEngine();