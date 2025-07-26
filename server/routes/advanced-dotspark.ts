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
 * Enhanced with dot/wheel/chakra saving functionality
 */
export async function advancedDotSparkChat(req: AuthenticatedRequest, res: Response) {
  try {
    const { message, model = 'gpt-4', sessionId, action } = req.body;
    const userId = req.user?.id || req.session?.userId || 'anonymous';

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if user wants to save a dot/wheel/chakra
    const saveKeywords = ['save this', 'save it', 'create this', 'yes save', 'confirm', 'looks good'];
    const wantsSave = saveKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    ) || action === 'save_structure';

    // Use Python DotSpark core for advanced processing
    const result = await runDotSparkCore(message, userId, model);

    // If user wants to save and we have structured output, save to database
    let savedItem = null;
    if (wantsSave && result.structuredOutput && userId !== 'anonymous') {
      try {
        const { db } = await import('@db');
        const { entries, wheels } = await import('@shared/schema');
        
        const structuredOutput = result.structuredOutput;
        
        // Determine what to save based on structured output
        if (structuredOutput.dot && structuredOutput.dot.summary) {
          // Save as a dot (entry)
          const entryData = {
            userId,
            title: structuredOutput.dot.summary.substring(0, 50) + (structuredOutput.dot.summary.length > 50 ? '...' : ''),
            content: JSON.stringify({
              oneWordSummary: structuredOutput.dot.pulse || 'insight',
              summary: structuredOutput.dot.summary,
              anchor: structuredOutput.dot.context || '',
              pulse: structuredOutput.dot.pulse || 'inspired',
              sourceType: 'text',
              dotType: 'three-layer',
              captureMode: 'ai_intelligence'
            }),
            visibility: 'private' as const
          };
          
          const [newDot] = await db.insert(entries).values(entryData).returning();
          savedItem = { type: 'dot', id: newDot.id, name: structuredOutput.dot.summary };
          
        } else if (structuredOutput.wheel && structuredOutput.wheel.heading) {
          // Save as a wheel
          const wheelData = {
            userId,
            name: structuredOutput.wheel.heading,
            goals: structuredOutput.wheel.summary || '',
            timeline: structuredOutput.wheel.timeline || 'medium-term',
            progress: 0,
            chakraId: null // Independent wheel for now
          };
          
          const [newWheel] = await db.insert(wheels).values(wheelData).returning();
          savedItem = { type: 'wheel', id: newWheel.id, name: structuredOutput.wheel.heading };
          
        } else if (structuredOutput.chakra && structuredOutput.chakra.heading) {
          // Save as a chakra (wheel without parent)
          const chakraData = {
            userId,
            name: structuredOutput.chakra.heading,
            goals: structuredOutput.chakra.purpose || '',
            timeline: structuredOutput.chakra.timeline || 'long-term',
            progress: 0,
            chakraId: null // Chakras have no parent
          };
          
          const [newChakra] = await db.insert(wheels).values(chakraData).returning();
          savedItem = { type: 'chakra', id: newChakra.id, name: structuredOutput.chakra.heading };
        }
        
      } catch (saveError) {
        console.error('Error saving structured content:', saveError);
        // Continue with response even if save fails
      }
    }

    // Enhanced response with save confirmation
    let responseText = result.response;
    if (savedItem) {
      responseText += `\n\n✅ **Saved Successfully!** Your ${savedItem.type} "${savedItem.name}" has been saved to your DotSpark grid. You can find it in your dashboard.`;
    } else if (wantsSave && userId === 'anonymous') {
      responseText += `\n\n💡 **Sign in to save:** I can organize your thoughts, but you'll need to sign in to save them to your personal DotSpark grid.`;
    }

    res.json({
      success: true,
      data: {
        response: responseText,
        structuredOutput: result.structuredOutput,
        sessionId: sessionId || `dotspark_${Date.now()}`,
        metadata: {
          ...result.metadata,
          savedItem: savedItem
        },
        features: {
          vectorMemory: true,
          cognitiveMapping: true,
          patternRecognition: true,
          contextAwareness: true,
          gridSaving: true
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