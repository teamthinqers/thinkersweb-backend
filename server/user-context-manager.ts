import { db } from '../db';
import { userBehavior, vectorEmbeddings, insertUserBehaviorSchema, dots, wheels, chakras } from '@shared/schema';
import { storeVectorEmbedding, generateEmbedding } from './vector-db';
import { eq, and, desc, or } from 'drizzle-orm';

export interface UserContextData {
  actionType: string;
  entityType?: string;
  entityId?: number;
  actionData?: Record<string, any>;
  sessionId?: string;
  content?: string;
  metadata?: Record<string, any>;
}

/**
 * Comprehensive user behavior and context tracking system
 * This makes DotSpark truly understand and remember the user
 */
export class UserContextManager {
  
  /**
   * Track user action and store in behavior database
   */
  static async trackUserAction(
    userId: number,
    actionData: UserContextData
  ): Promise<void> {
    try {
      const behaviorData = insertUserBehaviorSchema.parse({
        userId,
        actionType: actionData.actionType,
        entityType: actionData.entityType,
        entityId: actionData.entityId,
        actionData: JSON.stringify(actionData.actionData || {}),
        sessionId: actionData.sessionId || `session_${Date.now()}`,
        timestamp: new Date()
      });

      await db.insert(userBehavior).values(behaviorData);
      
      console.log(`📊 Tracked user action: ${actionData.actionType} for user ${userId}`);
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }

  /**
   * Store content in vector database with comprehensive metadata
   */
  static async storeUserContent(
    userId: number,
    contentType: string,
    contentId: number,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Enhanced metadata with user context
      const enhancedMetadata = {
        ...metadata,
        userId,
        timestamp: new Date().toISOString(),
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
        hasEmotionalContent: this.detectEmotionalContent(content),
        complexity: this.analyzeContentComplexity(content),
        themes: this.extractThemes(content)
      };

      await storeVectorEmbedding(
        contentType,
        contentId,
        content,
        userId,
        enhancedMetadata
      );

      console.log(`🧠 Stored vector embedding for ${contentType} ${contentId}`);
    } catch (error) {
      console.warn('Vector storage not available, content stored in DB only:', error);
    }
  }

  /**
   * Track dot creation with full context
   */
  static async trackDotCreation(
    userId: number,
    dotId: number,
    dotData: any,
    sessionId?: string
  ): Promise<void> {
    // 1. Track behavior
    await this.trackUserAction(userId, {
      actionType: 'dot_created',
      entityType: 'dot',
      entityId: dotId,
      actionData: {
        sourceType: dotData.sourceType,
        captureMode: dotData.captureMode,
        oneWordSummary: dotData.oneWordSummary,
        hasVoiceData: !!dotData.voiceData,
        contentLength: (dotData.summary + dotData.anchor + dotData.pulse).length
      },
      sessionId
    });

    // 2. Store in vector DB
    const fullContent = `${dotData.oneWordSummary}: ${dotData.summary}\nAnchor: ${dotData.anchor}\nPulse: ${dotData.pulse}`;
    await this.storeUserContent(
      userId,
      'dot',
      dotId,
      fullContent,
      {
        oneWordSummary: dotData.oneWordSummary,
        sourceType: dotData.sourceType,
        captureMode: dotData.captureMode,
        wheelId: dotData.wheelId,
        chakraId: dotData.chakraId
      }
    );
  }

  /**
   * Track wheel creation with full context
   */
  static async trackWheelCreation(
    userId: number,
    wheelId: number,
    wheelData: any,
    sessionId?: string
  ): Promise<void> {
    await this.trackUserAction(userId, {
      actionType: 'wheel_created',
      entityType: 'wheel',
      entityId: wheelId,
      actionData: {
        sourceType: wheelData.sourceType,
        category: wheelData.category,
        hasVoiceData: !!wheelData.voiceData,
        contentLength: (wheelData.heading + wheelData.goals + wheelData.timeline).length
      },
      sessionId
    });

    const fullContent = `${wheelData.heading}\nGoals: ${wheelData.goals}\nTimeline: ${wheelData.timeline}`;
    await this.storeUserContent(
      userId,
      'wheel',
      wheelId,
      fullContent,
      {
        heading: wheelData.heading,
        sourceType: wheelData.sourceType,
        category: wheelData.category,
        chakraId: wheelData.chakraId
      }
    );
  }

  /**
   * Track chakra creation with full context
   */
  static async trackChakraCreation(
    userId: number,
    chakraId: number,
    chakraData: any,
    sessionId?: string
  ): Promise<void> {
    await this.trackUserAction(userId, {
      actionType: 'chakra_created',
      entityType: 'chakra',
      entityId: chakraId,
      actionData: {
        sourceType: chakraData.sourceType,
        hasVoiceData: !!chakraData.voiceData,
        contentLength: (chakraData.heading + chakraData.purpose + chakraData.timeline).length
      },
      sessionId
    });

    const fullContent = `${chakraData.heading}\nPurpose: ${chakraData.purpose}\nTimeline: ${chakraData.timeline}`;
    await this.storeUserContent(
      userId,
      'chakra',
      chakraId,
      fullContent,
      {
        heading: chakraData.heading,
        sourceType: chakraData.sourceType,
        isLifePurpose: true
      }
    );
  }

  /**
   * Track mapping/linking actions
   */
  static async trackMappingAction(
    userId: number,
    fromType: string,
    fromId: number,
    toType: string,
    toId: number | null,
    action: 'linked' | 'unlinked',
    sessionId?: string
  ): Promise<void> {
    await this.trackUserAction(userId, {
      actionType: `mapping_${action}`,
      entityType: fromType,
      entityId: fromId,
      actionData: {
        fromType,
        fromId,
        toType,
        toId,
        action
      },
      sessionId
    });
  }

  /**
   * Get user's cognitive patterns and preferences
   */
  static async getUserCognitiveProfile(userId: number): Promise<{
    preferences: Record<string, any>;
    patterns: Record<string, any>;
    recentThemes: string[];
    creativityScore: number;
  }> {
    try {
      // Get recent behavior
      const recentActions = await db.query.userBehavior.findMany({
        where: eq(userBehavior.userId, userId),
        limit: 50,
        orderBy: desc(userBehavior.timestamp)
      });

      // Get user's content
      const [userDots, userWheels, userChakras] = await Promise.all([
        db.query.dots.findMany({
          where: eq(dots.userId, userId),
          limit: 20,
          orderBy: desc(dots.createdAt)
        }),
        db.query.wheels.findMany({
          where: eq(wheels.userId, userId),
          limit: 10,
          orderBy: desc(wheels.createdAt)
        }),
        db.query.chakras.findMany({
          where: eq(chakras.userId, userId),
          limit: 5,
          orderBy: desc(chakras.createdAt)
        })
      ]);

      // Analyze patterns
      const sourceTypePattern = this.analyzeSourceTypePreference(recentActions);
      const captureModePattern = this.analyzeCaptureMode(recentActions);
      const contentThemes = this.analyzeContentThemes([...userDots, ...userWheels, ...userChakras]);
      const creativityScore = this.calculateCreativityScore(userDots, userWheels, userChakras);

      return {
        preferences: {
          sourceType: sourceTypePattern,
          captureMode: captureModePattern,
          contentLength: this.analyzeContentLengthPreference(userDots)
        },
        patterns: {
          creationFrequency: this.analyzeCreationFrequency(recentActions),
          mappingBehavior: this.analyzeMappingBehavior(recentActions),
          timeOfDay: this.analyzeTimePatterns(recentActions)
        },
        recentThemes: contentThemes,
        creativityScore
      };
    } catch (error) {
      console.error('Error getting user cognitive profile:', error);
      return {
        preferences: {},
        patterns: {},
        recentThemes: [],
        creativityScore: 50
      };
    }
  }

  /**
   * Get contextual suggestions for user input
   */
  static async getContextualSuggestions(
    userId: number,
    currentInput: string,
    contentType: 'dot' | 'wheel' | 'chakra'
  ): Promise<{
    relatedContent: string[];
    suggestedMappings: string[];
    insights: string[];
  }> {
    try {
      // Get similar content from vector database
      const { searchSimilarContent } = await import('./vector-db');
      const similarContent = await searchSimilarContent(currentInput, {
        userId,
        topK: 5,
        threshold: 0.7,
        contentTypes: ['dot', 'wheel', 'chakra']
      });

      return {
        relatedContent: similarContent.map(item => item.metadata.content.substring(0, 100)),
        suggestedMappings: await this.getSuggestedMappings(userId, contentType, currentInput),
        insights: await this.generatePersonalizedInsights(userId, currentInput, contentType)
      };
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
      return {
        relatedContent: [],
        suggestedMappings: [],
        insights: []
      };
    }
  }

  // ===== PRIVATE ANALYSIS METHODS =====

  private static detectEmotionalContent(content: string): boolean {
    const emotionalWords = ['feel', 'love', 'hate', 'excited', 'worried', 'happy', 'sad', 'angry', 'grateful'];
    return emotionalWords.some(word => content.toLowerCase().includes(word));
  }

  private static analyzeContentComplexity(content: string): 'simple' | 'moderate' | 'complex' {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    
    if (words < 10 || sentences <= 1) return 'simple';
    if (words < 50 || sentences <= 3) return 'moderate';
    return 'complex';
  }

  private static extractThemes(content: string): string[] {
    // Simple theme extraction - in production, you'd use NLP
    const themes: string[] = [];
    
    if (/work|job|career|business/.test(content.toLowerCase())) themes.push('career');
    if (/health|fitness|exercise/.test(content.toLowerCase())) themes.push('health');
    if (/family|relationship|love/.test(content.toLowerCase())) themes.push('relationships');
    if (/learn|study|education/.test(content.toLowerCase())) themes.push('learning');
    if (/money|financial|income/.test(content.toLowerCase())) themes.push('finance');
    if (/creative|art|music|write/.test(content.toLowerCase())) themes.push('creativity');
    
    return themes.length > 0 ? themes : ['general'];
  }

  private static analyzeSourceTypePreference(actions: any[]): 'text' | 'voice' | 'hybrid' {
    const sources = actions
      .filter(a => a.actionData)
      .map(a => {
        try {
          return JSON.parse(a.actionData)?.sourceType;
        } catch {
          return null;
        }
      })
      .filter(s => s);

    const textCount = sources.filter(s => s === 'text').length;
    const voiceCount = sources.filter(s => s === 'voice').length;
    
    if (textCount > voiceCount * 2) return 'text';
    if (voiceCount > textCount * 2) return 'voice';
    return 'hybrid';
  }

  private static analyzeCaptureMode(actions: any[]): 'natural' | 'ai' | 'hybrid' {
    // Similar analysis for capture mode
    return 'natural'; // Default for now
  }

  private static analyzeContentThemes(content: any[]): string[] {
    const allContent = content.map(c => 
      `${c.summary || c.heading || ''} ${c.anchor || c.goals || c.purpose || ''} ${c.pulse || c.timeline || ''}`
    ).join(' ');
    
    return this.extractThemes(allContent);
  }

  private static calculateCreativityScore(dots: any[], wheels: any[], chakras: any[]): number {
    // Calculate based on variety, frequency, and content richness
    const varietyScore = Math.min(100, (dots.length * 2 + wheels.length * 5 + chakras.length * 10));
    const uniquenessScore = new Set([...dots.map(d => d.oneWordSummary), ...wheels.map(w => w.heading)]).size * 5;
    
    return Math.min(100, (varietyScore + uniquenessScore) / 2);
  }

  private static analyzeCreationFrequency(actions: any[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    actions.forEach(action => {
      const key = action.actionType;
      frequency[key] = (frequency[key] || 0) + 1;
    });
    return frequency;
  }

  private static analyzeMappingBehavior(actions: any[]): Record<string, number> {
    return actions
      .filter(a => a.actionType.includes('mapping'))
      .reduce((acc, action) => {
        acc[action.actionType] = (acc[action.actionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }

  private static analyzeTimePatterns(actions: any[]): Record<string, number> {
    const timePattern: Record<string, number> = {};
    actions.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      timePattern[timeSlot] = (timePattern[timeSlot] || 0) + 1;
    });
    return timePattern;
  }

  private static analyzeContentLengthPreference(dots: any[]): 'brief' | 'moderate' | 'detailed' {
    if (dots.length === 0) return 'moderate';
    
    const avgLength = dots.reduce((sum, dot) => 
      sum + (dot.summary?.length || 0) + (dot.anchor?.length || 0) + (dot.pulse?.length || 0), 0
    ) / dots.length;
    
    if (avgLength < 50) return 'brief';
    if (avgLength < 150) return 'moderate';
    return 'detailed';
  }

  private static async getSuggestedMappings(
    userId: number,
    contentType: string,
    input: string
  ): Promise<string[]> {
    // Get user's existing structures for mapping suggestions
    const suggestions: string[] = [];
    
    if (contentType === 'dot') {
      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
        limit: 3
      });
      suggestions.push(...userWheels.map((wheel: any) => `Map to wheel: ${wheel.heading}`));
    }
    
    return suggestions;
  }

  private static async generatePersonalizedInsights(
    userId: number,
    input: string,
    contentType: string
  ): Promise<string[]> {
    const profile = await this.getUserCognitiveProfile(userId);
    const insights: string[] = [];
    
    if (profile.creativityScore > 80) {
      insights.push("Your creativity is flourishing! This aligns with your innovative thinking pattern.");
    }
    
    if (profile.recentThemes.includes('career') && contentType === 'wheel') {
      insights.push("This seems to align with your career focus. Consider connecting to existing career goals.");
    }
    
    return insights;
  }
}