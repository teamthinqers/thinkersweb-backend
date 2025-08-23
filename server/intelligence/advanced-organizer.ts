import OpenAI from 'openai';
import { conversationEngine } from './conversation-engine.js';
import { db } from '../../db/index.ts';
import { eq } from 'drizzle-orm';
import { conversationSessions, entries } from '../../shared/schema.js';


// GPT-5 is now available as of August 2025. Support for gpt-5, gpt-5-mini, and gpt-5-nano added
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface OrganizationResult {
  action: 'continue_conversation' | 'present_structure' | 'save_content' | 'suggest_alternatives';
  response: string;
  structuredContent?: {
    type: 'dot' | 'wheel' | 'chakra';
    data: any;
    confidence: number;
  };
  conversationState: {
    depth: number;
    readyToOrganize: boolean;
    suggestedNextSteps: string[];
  };
  metadata: {
    processingTime: number;
    modelUsed: string;
    confidenceScore: number;
  };
}

/**
 * Advanced thought organizer that uses intelligent conversation to deeply understand
 * user thoughts before organizing them into structured content
 */
export class AdvancedThoughtOrganizer {
  
  /**
   * Main entry point for thought organization with intelligent conversation
   */
  async organizeThoughtsIntelligently(
    userInput: string,
    sessionId: string,
    userId: string,
    conversationHistory: any[] = []
  ): Promise<OrganizationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧠 Starting intelligent thought organization for user ${userId}`);
      
      // Step 1: Get intelligent conversation response
      const conversationResponse = await conversationEngine.generateIntelligentResponse(
        userInput,
        userId,
        sessionId,
        conversationHistory
      );
      
      // Step 2: Determine conversation depth and readiness
      const conversationDepth = conversationHistory.length;
      const isReadyToOrganize = await this.assessOrganizationReadiness(
        userInput,
        conversationHistory,
        conversationResponse
      );
      
      // Step 3: If ready, generate structured content
      if (isReadyToOrganize && conversationDepth >= 3) {
        const structuredContent = await this.generateStructuredContent(
          userInput,
          conversationHistory,
          userId
        );
        
        if (structuredContent) {
          return {
            action: 'present_structure',
            response: await this.createStructurePresentation(structuredContent, conversationResponse),
            structuredContent,
            conversationState: {
              depth: conversationDepth,
              readyToOrganize: true,
              suggestedNextSteps: conversationResponse.nextSteps
            },
            metadata: {
              processingTime: Date.now() - startTime,
              modelUsed: 'gpt-5',
              confidenceScore: conversationResponse.metadata.confidenceScore
            }
          };
        }
      }
      
      // Step 4: Continue conversation with intelligent response
      return {
        action: 'continue_conversation',
        response: conversationResponse.response,
        conversationState: {
          depth: conversationDepth,
          readyToOrganize: false,
          suggestedNextSteps: conversationResponse.nextSteps
        },
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-5',
          confidenceScore: conversationResponse.metadata.confidenceScore
        }
      };
      
    } catch (error) {
      console.error('❌ Error in intelligent thought organization:', error);
      return this.generateFallbackResult(userInput, Date.now() - startTime);
    }
  }

  /**
   * Assess whether the conversation has reached sufficient depth for organization
   */
  private async assessOrganizationReadiness(
    userInput: string,
    history: any[],
    conversationResponse: any
  ): Promise<boolean> {
    try {
      if (history.length < 2) return false;
      
      const assessmentPrompt = `Analyze this conversation to determine if the user's thoughts are ready to be organized into structured content:

CURRENT INPUT: "${userInput}"
CONVERSATION HISTORY: ${JSON.stringify(history.slice(-5))}
AI ANALYSIS: ${JSON.stringify(conversationResponse.contextualInsights)}

Criteria for readiness:
1. User has shared sufficient detail about their thoughts
2. Core themes and patterns have emerged
3. User seems ready to move from exploration to organization
4. There's enough substance to create meaningful structured content

Respond with JSON:
{
  "ready": true/false,
  "confidence": 0-1,
  "reasoning": "explanation",
  "missingElements": ["element1", "element2"] if not ready
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: assessmentPrompt }],
        response_format: { type: "json_object" },
      });

      const assessment = JSON.parse(response.choices[0].message.content || '{}');
      return assessment.ready && assessment.confidence > 0.7;
      
    } catch (error) {
      console.error('Error assessing organization readiness:', error);
      return history.length >= 4; // Fallback to simple length check
    }
  }

  /**
   * Generate structured content from conversation
   */
  private async generateStructuredContent(
    userInput: string,
    conversationHistory: any[],
    userId: string
  ) {
    try {
      // First, determine the best content type
      const contentType = await this.determineContentType(userInput, conversationHistory);
      
      // Then generate the appropriate structure
      switch (contentType.type) {
        case 'dot':
          return await this.generateDotStructure(userInput, conversationHistory, contentType.confidence);
        case 'wheel':
          return await this.generateWheelStructure(userInput, conversationHistory, contentType.confidence);
        case 'chakra':
          return await this.generateChakraStructure(userInput, conversationHistory, contentType.confidence);
        default:
          return await this.generateDotStructure(userInput, conversationHistory, 0.8); // Default to dot
      }
      
    } catch (error) {
      console.error('Error generating structured content:', error);
      return null;
    }
  }

  /**
   * Determine the most appropriate content type based on conversation
   */
  private async determineContentType(userInput: string, history: any[]) {
    try {
      const typePrompt = `Analyze this conversation to determine the best DotSpark content type:

CONVERSATION: ${JSON.stringify([...history, { role: 'user', content: userInput }])}

Content Types:
- DOT: Single insight, thought, or experience (3 layers: summary, anchor, pulse)
- WHEEL: Goal-oriented collection with specific objectives and timeline
- CHAKRA: Life purpose or fundamental principle that guides other content

Respond with JSON:
{
  "type": "dot|wheel|chakra",
  "confidence": 0-1,
  "reasoning": "explanation",
  "characteristics": ["characteristic1", "characteristic2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: typePrompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"type": "dot", "confidence": 0.8}');
      
    } catch (error) {
      console.error('Error determining content type:', error);
      return { type: 'dot', confidence: 0.8, reasoning: 'fallback' };
    }
  }

  /**
   * Generate dot structure from conversation
   */
  private async generateDotStructure(userInput: string, history: any[], confidence: number) {
    try {
      const dotPrompt = `Create a structured dot from this conversation:

CONVERSATION: ${JSON.stringify([...history, { role: 'user', content: userInput }])}

Generate a three-layer dot structure:
- SUMMARY: Concise essence (1-2 sentences)
- ANCHOR: Memory trigger or key detail that makes this stick
- PULSE: Emotional resonance or feeling (1-2 words)

Respond with JSON:
{
  "summary": "concise insight summary",
  "anchor": "memorable anchor point",
  "pulse": "emotional resonance",
  "sourceType": "conversation",
  "captureMode": "intelligent",
  "oneWordSummary": "single descriptive word"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: dotPrompt }],
        response_format: { type: "json_object" },
      });

      const dotData = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        type: 'dot' as const,
        data: dotData,
        confidence
      };
      
    } catch (error) {
      console.error('Error generating dot structure:', error);
      return null;
    }
  }

  /**
   * Generate wheel structure from conversation
   */
  private async generateWheelStructure(userInput: string, history: any[], confidence: number) {
    try {
      const wheelPrompt = `Create a structured wheel from this conversation:

CONVERSATION: ${JSON.stringify([...history, { role: 'user', content: userInput }])}

Generate a goal-oriented wheel structure:
- NAME: Clear, actionable title
- HEADING: Inspiring one-liner
- GOALS: Specific, measurable objectives
- TIMELINE: Realistic timeframe
- CATEGORY: Life domain (Personal, Professional, Health, etc.)

Respond with JSON:
{
  "name": "wheel name",
  "heading": "inspiring description",
  "goals": "specific objectives",
  "timeline": "realistic timeframe",
  "category": "life domain"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: wheelPrompt }],
        response_format: { type: "json_object" },
      });

      const wheelData = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        type: 'wheel' as const,
        data: wheelData,
        confidence
      };
      
    } catch (error) {
      console.error('Error generating wheel structure:', error);
      return null;
    }
  }

  /**
   * Generate chakra structure from conversation
   */
  private async generateChakraStructure(userInput: string, history: any[], confidence: number) {
    try {
      const chakraPrompt = `Create a structured chakra from this conversation:

CONVERSATION: ${JSON.stringify([...history, { role: 'user', content: userInput }])}

Generate a life-purpose chakra structure:
- NAME: Fundamental principle or purpose
- HEADING: Guiding philosophy
- DESCRIPTION: Deep meaning and application
- CATEGORY: Life domain it governs

Respond with JSON:
{
  "name": "fundamental principle",
  "heading": "guiding philosophy",
  "description": "meaning and application",
  "category": "life domain"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: chakraPrompt }],
        response_format: { type: "json_object" },
      });

      const chakraData = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        type: 'chakra' as const,
        data: chakraData,
        confidence
      };
      
    } catch (error) {
      console.error('Error generating chakra structure:', error);
      return null;
    }
  }

  /**
   * Create an engaging presentation of the structured content
   */
  private async createStructurePresentation(
    structuredContent: any,
    conversationResponse: any
  ): Promise<string> {
    try {
      const { type, data, confidence } = structuredContent;
      
      const presentationPrompt = `Create an engaging presentation of this structured content:

CONTENT TYPE: ${type}
STRUCTURED DATA: ${JSON.stringify(data)}
CONFIDENCE: ${confidence}
CONVERSATION INSIGHTS: ${JSON.stringify(conversationResponse.contextualInsights)}

Create a natural, conversational presentation that:
1. Acknowledges the conversation journey
2. Presents the structure clearly
3. Explains the reasoning
4. Invites confirmation or refinement

Keep it warm, personal, and insightful.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: presentationPrompt }],
        max_completion_tokens: 500
      });

      return response.choices[0].message.content || 
        `Based on our conversation, I've organized your thoughts into a ${type}. Would you like me to save this structure or refine it further?`;
      
    } catch (error) {
      console.error('Error creating structure presentation:', error);
      return `I've organized your thoughts into a structured format. Would you like to save this or make adjustments?`;
    }
  }

  /**
   * Save organized content to the appropriate database table
   */
  async saveOrganizedContent(
    structuredContent: any,
    userId: string,
    sessionId: string
  ): Promise<{ success: boolean; savedItem?: any; error?: string }> {
    try {
      const { type, data } = structuredContent;
      
      switch (type) {
        case 'dot':
          return await this.saveDotContent(data, userId);
        case 'wheel':
          return await this.saveWheelContent(data, userId);
        case 'chakra':
          return await this.saveChakraContent(data, userId);
        default:
          return { success: false, error: 'Unknown content type' };
      }
      
    } catch (error) {
      console.error('Error saving organized content:', error);
      return { success: false, error: 'Failed to save content' };
    }
  }

  /**
   * Save dot content to entries table
   */
  private async saveDotContent(data: any, userId: string) {
    try {
      const [savedDot] = await db.insert(entries).values({
        userId: Number(userId),
        data: JSON.stringify(data),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Store in vector DB for future context
      try {
        const { storeInVectorDB } = await import('../vector-db.js');
        await storeInVectorDB(
          `${data.summary} ${data.anchor}`,
          {
            userId: Number(userId),
            type: 'dot',
            id: savedDot.id
          },
          `dot_${userId}_${savedDot.id}_${Date.now()}`
        );
      } catch (vectorError) {
        console.warn('Failed to store in vector DB:', vectorError);
      }

      return { success: true, savedItem: savedDot };
      
    } catch (error) {
      console.error('Error saving dot:', error);
      return { success: false, error: 'Failed to save dot' };
    }
  }

  /**
   * Save wheel content (placeholder - would need wheels table implementation)
   */
  private async saveWheelContent(data: any, userId: string) {
    // TODO: Implement wheel saving when wheels table is ready
    console.log('Wheel saving not yet implemented:', data);
    return { success: false, error: 'Wheel saving not yet implemented' };
  }

  /**
   * Save chakra content (placeholder - would need chakras table implementation)
   */
  private async saveChakraContent(data: any, userId: string) {
    // TODO: Implement chakra saving when chakras table is ready
    console.log('Chakra saving not yet implemented:', data);
    return { success: false, error: 'Chakra saving not yet implemented' };
  }

  /**
   * Generate fallback result when main processing fails
   */
  private generateFallbackResult(userInput: string, processingTime: number): OrganizationResult {
    return {
      action: 'continue_conversation',
      response: "I'm here to help you organize your thoughts. Tell me more about what's on your mind, and I'll guide you through the process step by step.",
      conversationState: {
        depth: 0,
        readyToOrganize: false,
        suggestedNextSteps: ['Share more details about your thoughts', 'Explore the context behind your ideas']
      },
      metadata: {
        processingTime,
        modelUsed: 'fallback',
        confidenceScore: 0.3
      }
    };
  }
}

// Export singleton instance
export const advancedThoughtOrganizer = new AdvancedThoughtOrganizer();