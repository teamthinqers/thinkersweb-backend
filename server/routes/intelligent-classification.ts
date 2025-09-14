import type { Request, Response } from "express";
import { db } from "../../db";
import { entries, wheels } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

// Interface for classification result from your advanced core intelligence
interface ClassificationResult {
  type: 'dot' | 'wheel' | 'chakra';
  confidence: number;
  reasoning: string;
  suggestedStructure: {
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
    goals?: string;
    purpose?: string;
    timeline?: string;
  };
  alternativeClassifications?: Array<{
    type: 'dot' | 'wheel' | 'chakra';
    confidence: number;
    reasoning: string;
  }>;
}

// Interface for user confirmation and modifications
interface UserConfirmation {
  type: 'dot' | 'wheel' | 'chakra';
  data: {
    heading?: string;
    summary?: string;
    anchor?: string;
    pulse?: string;
    goals?: string;
    purpose?: string;
    timeline?: string;
    chakraId?: number | null;
  };
  originalClassification?: ClassificationResult;
}

/**
 * POST /api/intelligence/classify
 * Use your advanced core intelligence to analyze and classify input
 */
export async function classifyContent(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { content, context = '', sessionId = null } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required for classification' });
    }

    // TODO: Integrate with your advanced core intelligence system here
    // This is where you'll call your advanced classification logic
    
    // Placeholder for your intelligence system - replace with your actual implementation
    const classificationResult: ClassificationResult = await analyzeWithAdvancedIntelligence(
      content, 
      context, 
      userId, 
      sessionId
    );

    res.json({
      success: true,
      classification: classificationResult,
      sessionId: sessionId || `classify_${Date.now()}`,
      metadata: {
        contentLength: content.length,
        hasContext: Boolean(context),
        userId: userId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in content classification:', error);
    res.status(500).json({ 
      error: 'Failed to classify content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST /api/intelligence/confirm-and-save
 * Confirm classification and save to appropriate database table
 */
export async function confirmAndSave(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const confirmation: UserConfirmation = req.body;

    if (!confirmation.type || !confirmation.data) {
      return res.status(400).json({ error: 'Confirmation type and data are required' });
    }

    let savedItem: any = null;

    // Save based on confirmed type
    switch (confirmation.type) {
      case 'dot':
        savedItem = await saveDot(userId, confirmation.data);
        break;
      case 'wheel':
        savedItem = await saveWheel(userId, confirmation.data);
        break;
      case 'chakra':
        savedItem = await saveChakra(userId, confirmation.data);
        break;
      default:
        return res.status(400).json({ error: 'Invalid classification type' });
    }

    res.json({
      success: true,
      message: `${confirmation.type.charAt(0).toUpperCase() + confirmation.type.slice(1)} saved successfully`,
      savedItem: {
        id: savedItem.id,
        type: confirmation.type,
        data: savedItem
      },
      metadata: {
        originalClassification: confirmation.originalClassification,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving classified content:', error);
    res.status(500).json({ 
      error: 'Failed to save classified content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/intelligence/suggestions
 * Get contextual suggestions based on user's existing content
 */
export async function getContextualSuggestions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { content, limit = 5 } = req.query;

    // Get user's existing content for context
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      limit: 20
    });

    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      limit: 20
    });

    // TODO: Use your advanced intelligence to generate contextual suggestions
    const suggestions = await generateContextualSuggestions(
      content as string,
      userEntries,
      userWheels,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      suggestions,
      metadata: {
        userContentAnalyzed: {
          dots: userEntries.length,
          wheels: userWheels.length,
          chakras: userWheels.filter((w: any) => !w.chakraId).length
        }
      }
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions for saving different types

async function saveDot(userId: number, data: UserConfirmation['data']) {
  const { summary, anchor, pulse } = data;
  
  if (!summary || !anchor || !pulse) {
    throw new Error('Dot requires summary, anchor, and pulse');
  }

  // Generate one-word summary if needed
  const oneWordSummary = summary.split(' ')[0] || 'Insight';

  const entryData = {
    userId,
    title: summary.substring(0, 50) + (summary.length > 50 ? '...' : ''),
    content: JSON.stringify({
      oneWordSummary,
      summary,
      anchor,
      pulse,
      sourceType: 'intelligence',
      captureMode: 'ai-classified',
      dotType: 'three-layer'
    }),
    visibility: 'private'
  };

  const [newDot] = await db.insert(entries).values(entryData).returning();
  return newDot;
}

async function saveWheel(userId: number, data: UserConfirmation['data']) {
  const { heading, goals, timeline, chakraId } = data;
  
  if (!heading || !goals || !timeline) {
    throw new Error('Wheel requires heading, goals, and timeline');
  }

  // Validate chakraId if provided
  if (chakraId) {
    const parentChakra = await db.query.wheels.findFirst({
      where: and(eq(wheels.id, chakraId), eq(wheels.userId, userId))
    });
    
    if (!parentChakra) {
      throw new Error('Invalid chakra ID or access denied');
    }
  }

  const wheelData = {
    userId,
    chakraId: chakraId || null,
    heading,
    goals,
    timeline,
    color: '#EA580C', // Orange for wheels
    positionX: Math.floor(Math.random() * 400) + 100,
    positionY: Math.floor(Math.random() * 400) + 100,
  };

  const [newWheel] = await db.insert(wheels).values(wheelData).returning();
  return newWheel;
}

async function saveChakra(userId: number, data: UserConfirmation['data']) {
  const { heading, purpose, timeline } = data;
  
  if (!heading || !purpose || !timeline) {
    throw new Error('Chakra requires heading, purpose, and timeline');
  }

  const chakraData = {
    userId,
    chakraId: null, // This makes it a top-level Chakra
    heading,
    goals: purpose, // Maps to the 'goals' field in the wheels table
    timeline,
    color: '#B45309', // Dark amber for chakras
    positionX: Math.floor(Math.random() * 400) + 100,
    positionY: Math.floor(Math.random() * 400) + 100,
  };

  const [newChakra] = await db.insert(chakras).values(chakraData).returning();
  return newChakra;
}

// Placeholder functions for your advanced intelligence integration
// Replace these with your actual advanced core intelligence implementations

async function analyzeWithAdvancedIntelligence(
  content: string, 
  context: string, 
  userId: number, 
  sessionId: string | null
): Promise<ClassificationResult> {
  // TODO: Replace with your advanced core intelligence system
  // This is where you'll integrate your sophisticated analysis
  
  // Placeholder logic - replace with your actual implementation
  const words = content.split(' ').length;
  const hasTimeframe = /\b(months?|years?|weeks?|days?)\b/i.test(content);
  const hasGoals = /\b(goal|achieve|accomplish|build|create|develop)\b/i.test(content);
  const hasLifePurpose = /\b(purpose|mission|vision|life|identity|transform)\b/i.test(content);

  let type: 'dot' | 'wheel' | 'chakra';
  let confidence: number;
  let reasoning: string;

  if (hasLifePurpose && words > 20) {
    type = 'chakra';
    confidence = 0.85;
    reasoning = 'Content indicates life-level purpose, transformation, or identity - characteristic of a Chakra';
  } else if (hasGoals && hasTimeframe && words > 15) {
    type = 'wheel';
    confidence = 0.80;
    reasoning = 'Content shows goal-oriented thinking with timeline - characteristic of a Wheel';
  } else {
    type = 'dot';
    confidence = 0.75;
    reasoning = 'Content appears to be a single insight or realization - characteristic of a Dot';
  }

  return {
    type,
    confidence,
    reasoning,
    suggestedStructure: {
      summary: content.substring(0, 220),
      anchor: `Context: ${context || 'Generated insight'}`,
      pulse: 'focused'
    },
    alternativeClassifications: [
      {
        type: type === 'dot' ? 'wheel' : 'dot',
        confidence: confidence - 0.2,
        reasoning: `Alternative classification based on content structure`
      }
    ]
  };
}

async function generateContextualSuggestions(
  content: string,
  userEntries: any[],
  userWheels: any[],
  limit: number
) {
  // TODO: Replace with your advanced intelligence system
  // This should analyze user's existing content and provide intelligent suggestions
  
  return [
    {
      type: 'connection',
      suggestion: 'This insight could connect to your existing productivity wheel',
      confidence: 0.7
    },
    {
      type: 'expansion',
      suggestion: 'Consider developing this thought into a goal-oriented wheel',
      confidence: 0.6
    }
  ].slice(0, limit);
}