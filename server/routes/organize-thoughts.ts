import { Request, Response } from "express";
import { advancedThoughtOrganizer } from "../intelligence/advanced-organizer.js";
import { db } from "../../db/index.ts";
import { eq } from "drizzle-orm";
import { conversationSessions } from "../../shared/schema.js";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
  session?: { userId?: string };
}

/**
 * Handle continuing an "Organize Thoughts" conversation with advanced intelligence
 */
export async function continueOrganizeThoughts(req: AuthenticatedRequest, res: Response) {
  try {
    const { userInput, sessionId, action = 'continue' } = req.body;
    const userId = req.user?.id || req.session?.userId || '5'; // Fallback to default user

    if (!userInput && action !== 'save') {
      return res.status(400).json({ error: "User input is required" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    console.log(`🧠 Processing organize thoughts request - Action: ${action}, User: ${userId}`);

    // Handle different actions
    switch (action) {
      case 'save':
        return await handleSaveContent(req, res, sessionId, userId);
      
      case 'continue':
      default:
        return await handleContinueConversation(req, res, userInput, sessionId, userId);
    }

  } catch (error) {
    console.error('❌ Error in continueOrganizeThoughts:', error);
    return res.status(500).json({ 
      error: "I encountered an error while organizing your thoughts. Please try again.",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle continuing the conversation with intelligent responses
 */
async function handleContinueConversation(
  req: AuthenticatedRequest, 
  res: Response, 
  userInput: string, 
  sessionId: string, 
  userId: string
) {
  try {
    // Get conversation history from database
    const conversationHistory = await getConversationHistory(sessionId);
    
    // Use advanced thought organizer for intelligent conversation
    const result = await advancedThoughtOrganizer.organizeThoughtsIntelligently(
      userInput,
      sessionId,
      userId,
      conversationHistory
    );

    // Update session with new conversation data
    await updateConversationSession(sessionId, userInput, result.response, userId, result);

    return res.json({
      success: true,
      ...result,
      sessionId,
      conversationDepth: conversationHistory.length + 1
    });

  } catch (error) {
    console.error('Error handling conversation:', error);
    return res.status(500).json({ 
      error: "Failed to process conversation",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle saving organized content
 */
async function handleSaveContent(
  req: AuthenticatedRequest, 
  res: Response, 
  sessionId: string, 
  userId: string
) {
  try {
    const { structuredContent, confirmed = true } = req.body;
    
    if (!structuredContent || !confirmed) {
      return res.status(400).json({ error: "Structured content and confirmation required" });
    }

    // Save the organized content
    const saveResult = await advancedThoughtOrganizer.saveOrganizedContent(
      structuredContent,
      userId,
      sessionId
    );

    if (!saveResult.success) {
      return res.status(500).json({ 
        error: saveResult.error || "Failed to save organized content" 
      });
    }

    // Mark session as completed
    await db.update(conversationSessions)
      .set({
        status: 'completed',
        organizationSummary: JSON.stringify(structuredContent),
        updatedAt: new Date()
      })
      .where(eq(conversationSessions.sessionId, sessionId));

    return res.json({
      success: true,
      message: `Your ${structuredContent.type} has been saved successfully!`,
      savedItem: saveResult.savedItem,
      action: 'content_saved'
    });

  } catch (error) {
    console.error('Error saving content:', error);
    return res.status(500).json({ 
      error: "Failed to save organized content",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get conversation history from database
 */
async function getConversationHistory(sessionId: string): Promise<any[]> {
  try {
    const session = await db.select()
      .from(conversationSessions)
      .where(eq(conversationSessions.sessionId, sessionId))
      .limit(1);

    if (session.length === 0) {
      return [];
    }

    const conversationData = session[0].conversationData;
    if (!conversationData) {
      return [];
    }

    return JSON.parse(conversationData);
    
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

/**
 * Update conversation session with new messages
 */
async function updateConversationSession(
  sessionId: string,
  userInput: string,
  aiResponse: string,
  userId: string,
  result: any
) {
  try {
    const existingHistory = await getConversationHistory(sessionId);
    
    const newMessages = [
      ...existingHistory,
      { role: 'user', content: userInput, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    ];

    // Upsert session
    const sessionData = {
      sessionId,
      userId: Number(userId),
      thoughtType: result.structuredContent?.type || 'unknown',
      conversationData: JSON.stringify(newMessages),
      organizationSummary: result.structuredContent ? JSON.stringify(result.structuredContent) : null,
      status: result.action === 'present_structure' ? 'ready_to_save' : 'in_progress',
      updatedAt: new Date()
    };

    // Try to update existing session, if not exists, create new
    const existingSession = await db.select()
      .from(conversationSessions)
      .where(eq(conversationSessions.sessionId, sessionId))
      .limit(1);

    if (existingSession.length > 0) {
      await db.update(conversationSessions)
        .set(sessionData)
        .where(eq(conversationSessions.sessionId, sessionId));
    } else {
      await db.insert(conversationSessions).values({
        ...sessionData,
        createdAt: new Date()
      });
    }

  } catch (error) {
    console.error('Error updating conversation session:', error);
    // Don't throw - this is not critical for the response
  }
}

/**
 * Get conversation context for a session
 */
export async function getConversationContext(req: AuthenticatedRequest, res: Response) {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.session?.userId;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const session = await db.select()
      .from(conversationSessions)
      .where(eq(conversationSessions.sessionId, sessionId))
      .limit(1);

    if (session.length === 0) {
      return res.json({
        success: true,
        context: null,
        message: "No conversation found for this session"
      });
    }

    const sessionData = session[0];
    const conversationHistory = sessionData.conversationData ? JSON.parse(sessionData.conversationData) : [];

    return res.json({
      success: true,
      context: {
        sessionId,
        thoughtType: sessionData.thoughtType,
        status: sessionData.status,
        conversationLength: conversationHistory.length,
        lastMessage: conversationHistory[conversationHistory.length - 1],
        organizationSummary: sessionData.organizationSummary ? JSON.parse(sessionData.organizationSummary) : null,
        createdAt: sessionData.createdAt,
        updatedAt: sessionData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting conversation context:', error);
    return res.status(500).json({ 
      error: "Failed to retrieve conversation context",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}