import { Request, Response } from 'express';
import { runDotSparkCore, organizeThoughts } from '../intelligent-dotspark-core';

interface AuthenticatedRequest extends Request {
  user?: any;
  session?: {
    userId?: string;
  };
}

/**
 * Advanced DotSpark conversational interface
 * Uses Python backend logic for sophisticated cognitive processing
 */
export async function advancedDotSparkChat(req: AuthenticatedRequest, res: Response) {
  try {
    const { message, model = 'gpt-4', sessionId } = req.body;
    const userId = req.user?.id || req.session?.userId || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Use Python DotSpark core for advanced processing
    const result = await runDotSparkCore(message, userId, model);

    res.json({
      success: true,
      data: {
        response: result.response,
        structuredOutput: result.structuredOutput,
        sessionId: sessionId || `dotspark_${Date.now()}`,
        metadata: result.metadata,
        features: {
          vectorMemory: true,
          cognitiveMapping: true,
          patternRecognition: true,
          contextAwareness: true
        }
      }
    });

  } catch (error) {
    console.error('Advanced DotSpark chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process with advanced DotSpark intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Organize thoughts into structured Dot/Wheel/Chakra format
 * Uses Python backend logic for advanced cognitive structuring
 */
export async function organizeUserThoughts(req: AuthenticatedRequest, res: Response) {
  try {
    const { thoughts, model = 'gpt-4', userId: requestUserId } = req.body;
    const userId = requestUserId || req.user?.id || req.session?.userId || 'anonymous';

    if (!thoughts) {
      return res.status(400).json({ error: 'Thoughts text is required' });
    }

    // Use Python organize thoughts logic
    const result = await organizeThoughts(thoughts, userId, model);

    res.json({
      success: true,
      data: {
        response: result.response,
        structuredOutput: result.structuredOutput,
        metadata: result.metadata,
        cognitive_structure: {
          dot: result.structuredOutput?.dot,
          wheel: result.structuredOutput?.wheel,
          chakra: result.structuredOutput?.chakra,
          linkages: result.structuredOutput?.suggested_linkages
        }
      }
    });

  } catch (error) {
    console.error('Thought organization error:', error);
    res.status(500).json({ 
      error: 'Failed to organize thoughts with DotSpark intelligence',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Multi-model DotSpark processing
 * Supports both GPT-4 and DeepSeek for cognitive analysis
 */
export async function multiModelDotSpark(req: AuthenticatedRequest, res: Response) {
  try {
    const { message, models = ['gpt-4'], sessionId } = req.body;
    const userId = req.user?.id || req.session?.userId || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process with multiple models for comparison
    const results = await Promise.allSettled(
      models.map(async (model: 'gpt-4' | 'deepseek') => {
        const result = await runDotSparkCore(message, userId, model);
        return { model, ...result };
      })
    );

    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    const failedResults = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => ({ error: result.reason?.message || 'Processing failed' }));

    res.json({
      success: true,
      data: {
        results: successfulResults,
        failures: failedResults,
        sessionId: sessionId || `multi_${Date.now()}`,
        summary: {
          totalModels: models.length,
          successfulModels: successfulResults.length,
          failedModels: failedResults.length
        }
      }
    });

  } catch (error) {
    console.error('Multi-model DotSpark error:', error);
    res.status(500).json({ 
      error: 'Failed to process with multi-model DotSpark',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * DotSpark intelligence status and capabilities
 */
export async function getDotSparkStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const capabilities = {
      advanced_cognitive_processing: true,
      vector_memory_integration: true,
      multi_model_support: ['gpt-4', 'deepseek'],
      structured_output_generation: true,
      pattern_recognition: true,
      context_awareness: true,
      python_backend_integration: true,
      pinecone_vector_database: true,
      conversation_memory: true,
      thought_organization: true
    };

    const status = {
      service: 'DotSpark Advanced Intelligence',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      capabilities,
      endpoints: {
        chat: '/api/dotspark/chat',
        organize: '/api/dotspark/organize',
        multiModel: '/api/dotspark/multi-model',
        status: '/api/dotspark/status'
      }
    };

    res.json({ success: true, data: status });

  } catch (error) {
    console.error('DotSpark status error:', error);
    res.status(500).json({ 
      error: 'Failed to get DotSpark status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}