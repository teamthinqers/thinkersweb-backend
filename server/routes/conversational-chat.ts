import { Request, Response } from 'express';
import { ConversationalIntelligence } from '../conversational-intelligence';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Enhanced chat with conversational intelligence and context memory
 */
export async function intelligentConversationalChat(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = user.id;
    const { 
      message, 
      sessionId = `session_${userId}_${Date.now()}`,
      conversationHistory = [],
      model = 'gpt-4o'
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process message with conversational intelligence
    const intelligentResponse = await ConversationalIntelligence.processMessageWithContext(
      message,
      sessionId,
      userId,
      conversationHistory
    );

    // Get conversation summary for additional context
    const conversationSummary = await ConversationalIntelligence.getConversationSummary(sessionId);

    return res.json({
      success: true,
      data: {
        response: intelligentResponse.response,
        sessionId,
        conversationContext: {
          detectedIntent: intelligentResponse.detectedIntent,
          referencedPoint: intelligentResponse.referencedPoint,
          contextUsed: intelligentResponse.contextUsed,
          suggestedFollowUps: intelligentResponse.suggestedFollowUps
        },
        conversationSummary,
        metadata: {
          model: model,
          timestamp: new Date().toISOString(),
          processingTime: Date.now()
        }
      }
    });

  } catch (error) {
    console.error('Error in intelligent conversational chat:', error);
    return res.status(500).json({ 
      error: 'Failed to process conversational chat',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get conversation context and summary
 */
export async function getConversationContext(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const conversationSummary = await ConversationalIntelligence.getConversationSummary(sessionId);

    return res.json({
      success: true,
      data: {
        sessionId,
        summary: conversationSummary,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting conversation context:', error);
    return res.status(500).json({ 
      error: 'Failed to get conversation context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Continue conversation with specific point reference
 */
export async function continueWithPoint(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = user.id;
    const { 
      pointReference,
      followUpQuestion,
      sessionId,
      conversationHistory = []
    } = req.body;

    if (!pointReference || !followUpQuestion || !sessionId) {
      return res.status(400).json({ 
        error: 'Point reference, follow-up question, and session ID are required' 
      });
    }

    // Construct a contextually aware message
    const contextualMessage = `Regarding the point about "${pointReference}", ${followUpQuestion}`;

    // Process with conversational intelligence
    const intelligentResponse = await ConversationalIntelligence.processMessageWithContext(
      contextualMessage,
      sessionId,
      userId,
      conversationHistory
    );

    return res.json({
      success: true,
      data: {
        response: intelligentResponse.response,
        originalPoint: pointReference,
        followUpQuestion,
        sessionId,
        contextUsed: intelligentResponse.contextUsed,
        suggestedFollowUps: intelligentResponse.suggestedFollowUps,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error continuing with point:', error);
    return res.status(500).json({ 
      error: 'Failed to continue conversation with point',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}