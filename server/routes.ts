import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCategorySchema, 
  insertEntrySchema, 
  insertTagSchema, 
  insertConnectionSchema, 
  insertSharedEntrySchema, 
  sharedEntries, 
  entryTags, 
  entries,
  users, 
  whatsappOtpVerifications,
  whatsappUsers,
  wheels,
  type User 
} from "@shared/schema";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { connectionsService } from "./connections";
import { db } from "@db";
import { setupAuth, isAuthenticated } from "./auth";
import { continueOrganizeThoughts } from "./routes/organize-thoughts";
import { 
  extractWhatsAppMessage, 
  processWhatsAppMessage, 
  registerWhatsAppUser,
  unregisterWhatsAppUser,
  getWhatsAppStatus,
} from "./whatsapp";
import { eq, inArray, and, lt, desc } from "drizzle-orm";
import twilio from "twilio";
import whatsappWebhookRouter from "./whatsapp-webhook";
import { calculateGridPositions } from "./grid-positioning";
import { advancedChatEngine } from './advanced-chat';
import { intelligentFeatures } from './intelligent-features';
import vectorSearchRouter from './routes/vector-search';
import indexingRouter from './routes/indexing';
import { initializeVectorDB } from './vector-db';
import previewDataRouter from './routes/preview-data';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Simple health check endpoint for network connectivity tests
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  // Setup authentication middleware
  setupAuth(app);

  // DotSpark WhatsApp Chatbot Endpoints
  
  // Use the WhatsApp Business API webhook router for all WhatsApp webhook requests
  app.use(`${apiPrefix}/whatsapp/webhook`, whatsappWebhookRouter);

  // Register a phone number for DotSpark WhatsApp chatbot
  app.post(`${apiPrefix}/whatsapp/register`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      const result = await registerWhatsAppUser(userId, phoneNumber);
      res.status(200).json(result);
    } catch (err) {
      console.error("WhatsApp chatbot registration error:", err);
      res.status(500).json({ error: 'Failed to register for WhatsApp chatbot' });
    }
  });

  // Unregister a phone number from DotSpark WhatsApp chatbot
  app.post(`${apiPrefix}/whatsapp/unregister`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const result = await unregisterWhatsAppUser(userId);
      res.status(200).json(result);
    } catch (err) {
      console.error("WhatsApp chatbot unregistration error:", err);
      res.status(500).json({ error: 'Failed to unregister from WhatsApp chatbot' });
    }
  });

  // Get DotSpark WhatsApp chatbot status
  app.get(`${apiPrefix}/whatsapp/status`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const status = await getWhatsAppStatus(userId);
      res.status(200).json(status);
    } catch (err) {
      console.error("WhatsApp chatbot status error:", err);
      res.status(500).json({ error: 'Failed to get WhatsApp chatbot status' });
    }
  });

  // Get WhatsApp contact number for the frontend
  app.get(`${apiPrefix}/whatsapp/contact`, async (req: Request, res: Response) => {
    try {
      // Use the actual WhatsApp number directly
      const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER || "15557649526";
      
      // Log the WhatsApp number being used
      console.log(`Using direct WhatsApp number: ${whatsappNumber}`);
      
      // Use the standard WhatsApp click-to-chat link format for direct numbers
      res.status(200).json({
        phoneNumber: whatsappNumber,
        directLink: `https://wa.me/${whatsappNumber}`
      });
    } catch (err) {
      console.error("WhatsApp contact number error:", err);
      res.status(500).json({ error: 'Failed to get WhatsApp contact information' });
    }
  });

  // Direct WhatsApp registration (no OTP needed)
  app.post(`${apiPrefix}/whatsapp/direct-register`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Received direct WhatsApp registration request:", req.body);
      
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      console.log(`Registering WhatsApp DotSpark extension for: ${phoneNumber}`);
      
      // Register directly without verification
      const result = await registerWhatsAppUser(userId, phoneNumber);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Your DotSpark extension is now activated. You can now chat with DotSpark directly through WhatsApp."
        });
      } else {
        res.status(400).json({ success: false, error: result.message });
      }
    } catch (err) {
      console.error("WhatsApp direct registration error:", err);
      res.status(500).json({ success: false, error: 'Failed to register for WhatsApp DotSpark extension' });
    }
  });

  // Chat endpoint with conditional CogniShield monitoring
  app.post(`${apiPrefix}/chat`, async (req: Request, res: Response) => {
    const startTime = Date.now();
    
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Set headers for immediate response
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Check if user is authenticated and has CogniShield configured
      let cogniProfile = undefined;
      let hasCogniShieldConfigured = false;
      
      if (req.session?.userId) {
        const userId = req.session.userId;
        
        // Check if user has configured CogniShield
        try {
          const userProfile = await db.query.users.findFirst({
            where: eq(users.id, userId)
          });
          
          if (userProfile) {
            // Check if user has completed CogniShield configuration
            // We'll check if they have cognitive tuning parameters saved
            hasCogniShieldConfigured = !!(
              userProfile.bio && 
              (userProfile.bio.includes('cogni_configured') || 
               userProfile.bio.includes('cognitive') ||
               userProfile.fullName?.includes('tuned'))
            );
            
            // Only apply CogniShield if user has configured it
            if (hasCogniShieldConfigured) {
              cogniProfile = {
                decisionSpeed: 0.7,
                riskTolerance: 0.6,
                analyticalDepth: 0.8,
                communicationStyle: 0.5,
                detailLevel: 0.7,
                creativityBias: 0.6,
                logicalStructure: 0.8,
                learningStyle: "visual",
                conceptualApproach: 0.7,
                priorityFramework: ["accuracy", "efficiency", "innovation"],
                ethicalStance: "balanced",
                domainExpertise: ["general"],
                professionalLevel: "mid"
              };
            }
          }
        } catch (error) {
          console.log('Could not load user profile for CogniShield check:', error);
        }
      }

      // Generate response with performance tracking
      const chatResult = await generateChatResponse(
        message,
        conversationHistory,
        cogniProfile,
        hasCogniShieldConfigured
      );
      
      const responseTime = Date.now() - startTime;
      console.log(`Chat response generated in ${responseTime}ms`);
      
      const response: any = { 
        reply: chatResult.response,
        responseTime
      };
      
      if (hasCogniShieldConfigured && chatResult.cogniShieldAlert) {
        response.cogniShieldAlert = chatResult.cogniShieldAlert;
        response.alignmentScore = chatResult.alignmentAnalysis?.deviationScore ? 
          Math.round((1 - chatResult.alignmentAnalysis.deviationScore) * 100) : undefined;
      }
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Chat processing error:', error);
      
      // Fallback response
      const reply = "I'd be happy to help. Could you elaborate a bit more on what you're asking about?";
      
      res.status(200).json({ reply });
    }
  });

  // Endpoint to mark CogniShield as configured
  app.post(`${apiPrefix}/cognishield/configure`, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.session.userId;
      
      // Update user profile to mark CogniShield as configured
      await db.update(users)
        .set({ 
          bio: 'cogni_configured',
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.status(200).json({ success: true, message: 'CogniShield configuration saved' });
    } catch (error) {
      console.error('Error saving CogniShield configuration:', error);
      res.status(500).json({ error: 'Failed to save CogniShield configuration' });
    }
  });

  // Voice transcription endpoint
  app.post(`${apiPrefix}/transcribe-voice`, async (req: Request, res: Response) => {
    try {
      const { audio, layer } = req.body;
      
      if (!audio || !layer) {
        return res.status(400).json({ error: 'Audio data and layer are required' });
      }
      
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Import the OpenAI transcription function
      const { processVoiceInput } = await import('./openai.js');
      
      // Process the voice input
      const result = await processVoiceInput(audioBuffer, `${layer}.wav`, layer as 'summary' | 'anchor' | 'pulse');
      
      res.json({ 
        transcription: result.processedText,
        originalTranscription: result.transcription 
      });
    } catch (error) {
      console.error('Voice transcription error:', error);
      res.status(500).json({ error: 'Failed to transcribe voice' });
    }
  });

  // Dots and Wheels API Endpoints
  
  // Simple dots endpoint for three-layer system - requires authentication and DotSpark activation
  app.post(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has activated DotSpark
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // TODO: Add DotSpark activation check once activation system is implemented
      // For now, allow all authenticated users to create dots
      
      let { summary, anchor, pulse, sourceType = 'text' } = req.body;
      const { summaryVoiceUrl, anchorVoiceUrl, pulseVoiceUrl, summaryAudio, anchorAudio, pulseAudio } = req.body;
      
      // If this is a voice dot with audio data, transcribe it using OpenAI
      if (sourceType === 'voice') {
        try {
          // Import the OpenAI transcription function
          const { processVoiceInput } = await import('./openai.js');
          
          // Process each layer if audio data is provided
          if (summaryAudio && !summary) {
            const audioBuffer = Buffer.from(summaryAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'summary.wav', 'summary');
            summary = result.processedText;
          }
          
          if (anchorAudio && !anchor) {
            const audioBuffer = Buffer.from(anchorAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'anchor.wav', 'anchor');
            anchor = result.processedText;
          }
          
          if (pulseAudio && !pulse) {
            const audioBuffer = Buffer.from(pulseAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'pulse.wav', 'pulse');
            pulse = result.processedText;
          }
        } catch (transcriptionError) {
          console.error('Voice transcription error:', transcriptionError);
          // Continue with provided text if transcription fails
        }
      }
      
      // Validate three-layer structure after transcription
      if (!summary || summary.length > 220) {
        return res.status(400).json({ 
          error: 'Please distill your thoughts. Sharply defined thoughts can spark better (max 220 charac)' 
        });
      }
      
      if (!anchor || anchor.length > 300) {
        return res.status(400).json({ 
          error: 'Anchor text must be 300 characters or less' 
        });
      }
      
      if (!pulse || pulse.trim().split(/\s+/).length !== 1) {
        return res.status(400).json({ 
          error: 'Pulse must be exactly one word describing the emotion' 
        });
      }
      
      // Generate one-word summary using OpenAI
      let oneWordSummary = 'Insight'; // Default fallback
      try {
        const { generateOneWordSummary } = await import('./openai.js');
        oneWordSummary = await generateOneWordSummary(summary, anchor);
      } catch (error) {
        console.error('Error generating one-word summary:', error);
      }
      
      const entryData = {
        userId,
        title: summary.substring(0, 50) + (summary.length > 50 ? '...' : ''),
        content: JSON.stringify({
          oneWordSummary,
          summary,
          anchor, 
          pulse,
          sourceType,
          dotType: 'three-layer',
          voiceData: sourceType === 'voice' ? {
            summaryVoiceUrl: summaryVoiceUrl || null,
            anchorVoiceUrl: anchorVoiceUrl || null,
            pulseVoiceUrl: pulseVoiceUrl || null
          } : null
        }),
        visibility: 'private'
      };
      
      const [newDot] = await db.insert(entries).values(entryData).returning();
      res.status(201).json(newDot);
    } catch (error) {
      console.error('Error creating dot:', error);
      res.status(500).json({ error: 'Failed to create dot' });
    }
  });

  // Get dots for dashboard - requires authentication
  app.get(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify user exists and is authenticated
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userEntries = await db.query.entries.findMany({
        where: eq(entries.userId, userId),
        orderBy: desc(entries.createdAt),
        limit: 50
      });

      // Filter and parse three-layer dots
      const dots = userEntries
        .filter(entry => {
          try {
            const parsed = JSON.parse(entry.content);
            return parsed.dotType === 'three-layer';
          } catch {
            return false;
          }
        })
        .map(entry => {
          const parsed = JSON.parse(entry.content);
          return {
            id: entry.id,
            oneWordSummary: parsed.oneWordSummary || 'Insight',
            summary: parsed.summary,
            anchor: parsed.anchor,
            pulse: parsed.pulse,
            sourceType: parsed.sourceType || 'text',
            captureMode: parsed.captureMode || 'natural',
            timestamp: entry.createdAt,
            wheelId: 'general', // Default wheel for now
            voiceData: parsed.voiceData || null
          };
        });

      res.json(dots);
    } catch (error) {
      console.error('Error fetching dots:', error);
      res.status(500).json({ error: 'Failed to fetch dots' });
    }
  });

  // Enhanced Intelligent Chat API with cognitive structure training
  app.post(`${apiPrefix}/chat/enhanced`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let userId = req.user?.id || req.session?.userId;
      if (!userId) {
        console.log('No authenticated user found, using test userId for demo');
        userId = 1; // Use a test user ID for demonstration
      }
      const { message, messages = [], model = 'gpt-4o', sessionId = null } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Import enhanced chat functions
      const { generateEnhancedChatResponse } = await import('./enhanced-chat.js');

      // Convert messages to enhanced format
      const enhancedMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
        metadata: msg.metadata || {}
      }));

      // Generate enhanced response with cognitive coaching
      const result = await generateEnhancedChatResponse(message, enhancedMessages, model, userId, sessionId);

      res.json({
        response: result.response,
        analysis: result.analysis,
        structureProposal: result.structureProposal,
        action: result.action,
        metadata: result.metadata,
        conversationQuality: result.metadata.conversationQuality
      });

    } catch (error) {
      console.error('Error in enhanced chat:', error);
      res.status(500).json({ error: 'Failed to process enhanced chat message' });
    }
  });

  // Enhanced intelligent chat endpoint for conversational dot creation
  app.post(`${apiPrefix}/chat/intelligent`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        // For testing purposes, allow anonymous users with a default userId
        console.log('No authenticated user found, using test userId for demo');
        userId = 1; // Use a test user ID for demonstration
      }
      const { message, messages = [], action = 'chat', model = 'gpt-4o', sessionId = null } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Import intelligent chat functions
      const { generateIntelligentChatResponse, processConfirmedDot } = await import('./intelligent-chat.js');

      // Handle different actions
      if (action === 'confirm_dot') {
        // User is confirming a dot proposal
        const { dotProposal } = req.body;
        if (!dotProposal) {
          return res.status(400).json({ error: 'Dot proposal is required for confirmation' });
        }

        // Save the confirmed dot
        const { generateOneWordSummary } = await import('./openai.js');
        const oneWordSummary = await generateOneWordSummary(dotProposal.summary, dotProposal.anchor);
        
        const entryData = {
          userId,
          title: dotProposal.summary.substring(0, 50) + (dotProposal.summary.length > 50 ? '...' : ''),
          content: JSON.stringify({
            oneWordSummary,
            summary: dotProposal.summary,
            anchor: dotProposal.anchor,
            pulse: dotProposal.pulse,
            sourceType: 'text',
            captureMode: 'ai',
            dotType: 'three-layer'
          }),
          visibility: 'private'
        };
        
        const [newDot] = await db.insert(entries).values(entryData).returning();
        
        return res.json({
          reply: "Hey ThinQer, your dot is saved. You can find your dot in DotSpark Map in the Neura section for reference. Thank you!",
          action: 'dot_saved',
          dotId: newDot.id,
          success: true
        });
      }

      // Handle organize thoughts with session persistence
      if (action === 'organize_thoughts') {
        const { handleOrganizeThoughts } = await import('./thought-organizer-clean.js');
        const result = await handleOrganizeThoughts(
          message,
          messages,
          userId,
          sessionId,
          model
        );
        
        return res.json({
          response: result.response,
          action: result.action || 'organize_thoughts',
          savedItems: result.savedItems || [],
          conversationState: result.conversationState
        });
      }

      // Generate intelligent conversational response with session context
      const result = await generateIntelligentChatResponse(message, messages, model, userId, sessionId);

      res.json({
        response: result.response,
        reply: result.response, // Keep backward compatibility
        action: result.action || 'continue',
        conversationState: result.conversationState,
        dotProposal: result.dotProposal,
        needsConfirmation: result.dotProposal?.needsConfirmation || false
      });

    } catch (error) {
      console.error('Error in intelligent chat:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });

  // Legacy chat endpoint - kept for backward compatibility
  app.post(`${apiPrefix}/chat/create-dot`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { message, messages = [] } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Process the chat message to create a structured dot
      const structuredDot = await processEntryFromChat(message, messages);

      // Create the entry content with AI mode designation
      const entryContent = {
        dotType: 'three-layer',
        summary: structuredDot.summary,
        anchor: structuredDot.anchor,
        pulse: structuredDot.pulse,
        sourceType: 'text',
        captureMode: 'ai'
      };

      // Insert into database
      const [newEntry] = await db.insert(entries).values({
        userId,
        title: `AI Dot: ${entryContent.summary.substring(0, 50)}${entryContent.summary.length > 50 ? '...' : ''}`,
        content: JSON.stringify(entryContent),
        categoryId: structuredDot.categoryId || 1
      }).returning();

      res.status(201).json({ 
        success: true, 
        message: 'AI-assisted dot created successfully',
        dotId: newEntry.id,
        dot: {
          summary: entryContent.summary,
          anchor: entryContent.anchor,
          pulse: entryContent.pulse,
          sourceType: 'text',
          captureMode: 'ai'
        }
      });
    } catch (error) {
      console.error('Error creating AI dot:', error);
      res.status(500).json({ error: 'Failed to create AI-assisted dot' });
    }
  });

  // Delete a specific dot
  app.delete(`${apiPrefix}/dots/:id`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const dotId = parseInt(req.params.id);

      if (!dotId) {
        return res.status(400).json({ error: 'Invalid dot ID' });
      }

      // First verify the dot belongs to the user
      const existingEntry = await db.query.entries.findFirst({
        where: and(eq(entries.id, dotId), eq(entries.userId, userId))
      });

      if (!existingEntry) {
        return res.status(404).json({ error: 'Dot not found or access denied' });
      }

      // Delete the dot
      await db.delete(entries).where(
        and(eq(entries.id, dotId), eq(entries.userId, userId))
      );

      res.json({ success: true, message: 'Dot deleted successfully' });
    } catch (error) {
      console.error('Error deleting dot:', error);
      res.status(500).json({ error: 'Failed to delete dot' });
    }
  });

  // Create a new Chakra (top-level wheel with chakraId = null)
  app.post(`${apiPrefix}/chakras`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let { heading, purpose, timeline, sourceType = 'text' } = req.body;
      const { headingVoiceUrl, purposeVoiceUrl, timelineVoiceUrl, headingAudio, purposeAudio, timelineAudio } = req.body;
      
      // If this is a voice chakra with audio data, transcribe it using OpenAI
      if (sourceType === 'voice') {
        try {
          // Import the OpenAI transcription function
          const { processVoiceInput } = await import('./openai.js');
          
          // Process each layer if audio data is provided
          if (headingAudio && !heading) {
            const audioBuffer = Buffer.from(headingAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'heading.wav', 'summary');
            heading = result.processedText;
          }
          
          if (purposeAudio && !purpose) {
            const audioBuffer = Buffer.from(purposeAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'purpose.wav', 'anchor');
            purpose = result.processedText;
          }
          
          if (timelineAudio && !timeline) {
            const audioBuffer = Buffer.from(timelineAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'timeline.wav', 'pulse');
            timeline = result.processedText;
          }
        } catch (transcriptionError) {
          console.error('Voice transcription error:', transcriptionError);
          // Continue with provided text if transcription fails
        }
      }
      
      // Validate three-layer structure after transcription
      if (!heading || heading.length > 100) {
        return res.status(400).json({ 
          error: 'Heading must be between 1 and 100 characters' 
        });
      }
      
      if (!purpose || purpose.length > 500) {
        return res.status(400).json({ 
          error: 'Purpose must be between 1 and 500 characters' 
        });
      }
      
      if (!timeline || timeline.length > 200) {
        return res.status(400).json({ 
          error: 'Timeline must be between 1 and 200 characters' 
        });
      }
      
      // Create the Chakra (wheel with chakraId = null)
      const chakraData = {
        userId,
        chakraId: null, // This makes it a top-level Chakra
        heading,
        goals: purpose, // Maps to the 'goals' field in the wheels table
        timeline,
        color: '#8B5CF6', // Default purple color for Chakras
        positionX: Math.floor(Math.random() * 400) + 100,
        positionY: Math.floor(Math.random() * 400) + 100,
      };
      
      const newChakraResult = await db.insert(wheels).values(chakraData).returning();
      const newChakra = Array.isArray(newChakraResult) ? newChakraResult[0] : newChakraResult;
      
      res.status(201).json({ 
        success: true, 
        message: 'Chakra created successfully',
        chakra: {
          id: newChakra.id,
          heading: newChakra.heading,
          purpose: newChakra.goals, // Return as 'purpose' for consistency with frontend
          timeline: newChakra.timeline,
          sourceType,
          color: newChakra.color,
          position: { x: newChakra.positionX, y: newChakra.positionY },
          createdAt: newChakra.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating Chakra:', error);
      res.status(500).json({ error: 'Failed to create Chakra' });
    }
  });

  // Create a new Wheel (belongs to a chakra or standalone) - requires authentication and DotSpark activation
  app.post(`${apiPrefix}/wheels`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user exists and is authenticated
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // TODO: Add DotSpark activation check once activation system is implemented
      // For now, allow all authenticated users to create wheels

      let { heading, goals, timeline, chakraId, sourceType = 'text' } = req.body;
      const { headingVoiceUrl, goalsVoiceUrl, timelineVoiceUrl, headingAudio, goalsAudio, timelineAudio } = req.body;
      
      // If this is a voice wheel with audio data, transcribe it using OpenAI
      if (sourceType === 'voice') {
        try {
          // Import the OpenAI transcription function
          const { processVoiceInput } = await import('./openai.js');
          
          // Process each layer if audio data is provided
          if (headingAudio && !heading) {
            const audioBuffer = Buffer.from(headingAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'heading.wav', 'summary');
            heading = result.processedText;
          }
          
          if (goalsAudio && !goals) {
            const audioBuffer = Buffer.from(goalsAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'goals.wav', 'anchor');
            goals = result.processedText;
          }
          
          if (timelineAudio && !timeline) {
            const audioBuffer = Buffer.from(timelineAudio, 'base64');
            const result = await processVoiceInput(audioBuffer, 'timeline.wav', 'pulse');
            timeline = result.processedText;
          }
        } catch (transcriptionError) {
          console.error('Voice transcription error:', transcriptionError);
          // Continue with provided text if transcription fails
        }
      }
      
      // Validate required fields
      if (!heading || heading.length > 100) {
        return res.status(400).json({ 
          error: 'Heading must be between 1 and 100 characters' 
        });
      }
      
      if (!goals || goals.length > 500) {
        return res.status(400).json({ 
          error: 'Goals must be between 1 and 500 characters' 
        });
      }
      
      if (!timeline || timeline.length > 200) {
        return res.status(400).json({ 
          error: 'Timeline must be between 1 and 200 characters' 
        });
      }
      
      // Validate chakraId if provided
      if (chakraId) {
        const parentChakra = await db.query.wheels.findFirst({
          where: and(eq(wheels.id, parseInt(chakraId)), eq(wheels.userId, userId))
        });
        
        if (!parentChakra) {
          return res.status(400).json({ 
            error: 'Invalid chakra ID or access denied' 
          });
        }
      }
      
      // Create the Wheel
      const wheelData = {
        userId,
        chakraId: chakraId ? parseInt(chakraId) : null,
        heading,
        goals,
        timeline,
        color: '#EA580C', // Default orange color for Wheels
        positionX: Math.floor(Math.random() * 400) + 100,
        positionY: Math.floor(Math.random() * 400) + 100,
      };
      
      const newWheelResult = await db.insert(wheels).values(wheelData).returning();
      const newWheel = Array.isArray(newWheelResult) ? newWheelResult[0] : newWheelResult;
      
      res.status(201).json({ 
        success: true, 
        message: 'Wheel created successfully',
        wheel: {
          id: newWheel.id,
          heading: newWheel.heading,
          goals: newWheel.goals,
          timeline: newWheel.timeline,
          chakraId: newWheel.chakraId,
          sourceType,
          color: newWheel.color,
          position: { x: newWheel.positionX, y: newWheel.positionY },
          createdAt: newWheel.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating Wheel:', error);
      res.status(500).json({ error: 'Failed to create Wheel' });
    }
  });

  // GET wheels endpoint - fetch user's wheels
  app.get(`${apiPrefix}/wheels`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      
      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
        orderBy: desc(wheels.createdAt)
      });
      
      // Transform to frontend format
      const formattedWheels = userWheels.map(wheel => ({
        id: wheel.id.toString(),
        name: wheel.heading,
        heading: wheel.heading,
        goals: wheel.goals,
        timeline: wheel.timeline,
        category: 'User Created',
        color: wheel.color,
        dots: [], // Dots will be loaded separately
        connections: [],
        position: { x: wheel.positionX || 400, y: wheel.positionY || 300 },
        chakraId: wheel.chakraId ? wheel.chakraId.toString() : undefined,
        createdAt: wheel.createdAt
      }));
      
      res.json(formattedWheels);
    } catch (error) {
      console.error('Error fetching wheels:', error);
      res.status(500).json({ error: 'Failed to fetch wheels' });
    }
  });

  // Grid positioning API endpoints - simplified version using existing entries
  app.get(`${apiPrefix}/grid/positions`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || 1; // Demo user fallback
      const isPreview = req.query.preview === 'true';
      
      if (isPreview) {
        // Return comprehensive preview data - Business Chakra with 3 wheels + Health & Individual wheels
        const businessChakra = {
          id: 'preview-chakra-business',
          name: 'Build an Enduring Company',
          heading: 'Strategic Business Vision',
          purpose: 'Creating a sustainable, impactful business that generates lasting value for customers, employees, and society while achieving profitable growth and market leadership',
          timeline: '5-10 years strategic horizon',
          category: 'Professional',
          color: '#B45309', // Dark amber for chakras
          chakraId: null, // Top-level chakra
          position: { x: 400, y: 300 },
          radius: 370,
          dots: [],
          connections: [],
          createdAt: new Date()
        };

        const gtmWheel = {
          id: 'preview-wheel-gtm',
          name: 'GTM Strategy',
          heading: 'Go-to-Market Excellence',
          goals: 'Develop comprehensive go-to-market strategy focusing on customer acquisition, retention, pricing optimization, and market penetration to achieve sustainable revenue growth',
          timeline: '6-12 months execution',
          category: 'Professional',
          color: '#EA580C', // Orange for wheels
          chakraId: 'preview-chakra-business',
          position: { x: 320, y: 240 },
          radius: 120,
          dots: [],
          connections: [],
          createdAt: new Date()
        };

        const leadershipWheel = {
          id: 'preview-wheel-leadership',
          name: 'Leadership Development',
          heading: 'Building Exceptional Teams',
          goals: 'Cultivate leadership capabilities, build high-performing teams, establish strong company culture, and develop effective management systems for scaling operations',
          timeline: '12-18 months development',
          category: 'Professional',
          color: '#EA580C',
          chakraId: 'preview-chakra-business',
          position: { x: 480, y: 240 },
          radius: 120,
          dots: [],
          connections: [],
          createdAt: new Date()
        };

        const productWheel = {
          id: 'preview-wheel-product',
          name: 'Product Innovation',
          heading: 'Next-Gen Product Development',
          goals: 'Drive product innovation through user research, feature development, technical excellence, and market differentiation to maintain competitive advantage',
          timeline: '3-6 months sprint cycles',
          category: 'Professional',
          color: '#EA580C',
          chakraId: 'preview-chakra-business',
          position: { x: 400, y: 380 },
          radius: 120,
          dots: [],
          connections: [],
          createdAt: new Date()
        };

        // Independent wheels
        const healthWheel = {
          id: 'preview-wheel-health',
          name: 'Health & Wellness',
          heading: 'Optimal Physical & Mental Health',
          goals: 'Maintain consistent exercise routine, balanced nutrition, quality sleep, stress management, and regular health checkups for long-term wellbeing',
          timeline: 'Daily habits & quarterly reviews',
          category: 'Health',
          color: '#EA580C',
          chakraId: null,
          position: { x: 800, y: 300 },
          radius: 120,
          dots: [],
          connections: [],
          createdAt: new Date()
        };

        const individualWheel = {
          id: 'preview-wheel-individual',
          name: 'Individual Development',
          heading: 'Personal Growth & Learning',
          goals: 'Continuous skill development, knowledge acquisition, personal reflection, networking, and pursuing meaningful experiences for holistic growth',
          timeline: 'Ongoing with monthly milestones',
          category: 'Personal',
          color: '#EA580C',
          chakraId: null,
          position: { x: 100, y: 300 },
          radius: 120,
          dots: [],
          connections: [],
          createdAt: new Date()
        };
        
        // Create comprehensive dots for each wheel
        const gtmDots = [
          {
            id: 'preview-dot-gtm-1',
            oneWordSummary: 'Positioning',
            summary: 'Define unique value proposition that differentiates us from competitors while addressing core customer pain points effectively',
            anchor: 'Conduct comprehensive competitive analysis and customer interviews to identify positioning gaps and opportunities in the market',
            pulse: 'confident',
            wheelId: 'preview-wheel-gtm',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-gtm-2',
            oneWordSummary: 'Pricing',
            summary: 'Develop value-based pricing strategy that maximizes revenue while remaining competitive and accessible to target market',
            anchor: 'Analyze customer willingness to pay, competitor pricing models, and cost structure to optimize pricing tiers and packages',
            pulse: 'focused',
            wheelId: 'preview-wheel-gtm',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-gtm-3',
            oneWordSummary: 'Channels',
            summary: 'Establish multi-channel distribution strategy leveraging digital marketing, partnerships, and direct sales approaches',
            anchor: 'Map customer journey and identify optimal touchpoints for acquisition, conversion, and retention across all channels',
            pulse: 'excited',
            wheelId: 'preview-wheel-gtm',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-gtm-4',
            oneWordSummary: 'Metrics',
            summary: 'Implement comprehensive analytics framework to track customer acquisition cost, lifetime value, and conversion metrics',
            anchor: 'Define key performance indicators and measurement systems to optimize marketing spend and sales effectiveness',
            pulse: 'analytical',
            wheelId: 'preview-wheel-gtm',
            sourceType: 'text',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-gtm-5',
            oneWordSummary: 'Launch',
            summary: 'Execute coordinated product launch campaign with PR, content marketing, and strategic partnerships for maximum impact',
            anchor: 'Create detailed launch timeline with contingency plans, stakeholder communication, and success metrics for evaluation',
            pulse: 'determined',
            wheelId: 'preview-wheel-gtm',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          }
        ];

        const leadershipDots = [
          {
            id: 'preview-dot-leadership-1',
            oneWordSummary: 'Culture',
            summary: 'Foster collaborative, innovative company culture that attracts top talent and drives high performance across all teams',
            anchor: 'Define core values, behavioral expectations, and recognition systems that reinforce desired cultural attributes',
            pulse: 'inspired',
            wheelId: 'preview-wheel-leadership',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-leadership-2',
            oneWordSummary: 'Delegation',
            summary: 'Master effective delegation by matching tasks to team member strengths while providing clear expectations and support',
            anchor: 'Develop systematic approach to task assignment, progress tracking, and feedback delivery to ensure successful outcomes',
            pulse: 'empowering',
            wheelId: 'preview-wheel-leadership',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-leadership-3',
            oneWordSummary: 'Feedback',
            summary: 'Establish regular feedback loops and coaching conversations to accelerate team member development and performance',
            anchor: 'Implement structured feedback frameworks that promote growth mindset and continuous improvement across the organization',
            pulse: 'supportive',
            wheelId: 'preview-wheel-leadership',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-leadership-4',
            oneWordSummary: 'Vision',
            summary: 'Communicate compelling vision that aligns team efforts and motivates sustained high performance toward shared goals',
            anchor: 'Develop clear messaging and storytelling capabilities to inspire teams and stakeholders around company mission',
            pulse: 'visionary',
            wheelId: 'preview-wheel-leadership',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          }
        ];

        const productDots = [
          {
            id: 'preview-dot-product-1',
            oneWordSummary: 'Research',
            summary: 'Conduct deep user research to understand unmet needs and validate assumptions before development investment',
            anchor: 'Implement systematic user research methodology including interviews, surveys, and behavioral analytics for insights',
            pulse: 'curious',
            wheelId: 'preview-wheel-product',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-product-2',
            oneWordSummary: 'Prototyping',
            summary: 'Rapid prototyping and iteration cycles to test concepts quickly and fail fast before major resource commitment',
            anchor: 'Establish agile development processes with regular user testing and feedback integration for continuous improvement',
            pulse: 'innovative',
            wheelId: 'preview-wheel-product',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-product-3',
            oneWordSummary: 'Quality',
            summary: 'Maintain high technical standards through code reviews, testing automation, and performance optimization practices',
            anchor: 'Implement comprehensive quality assurance processes to ensure reliable, scalable, and maintainable product development',
            pulse: 'meticulous',
            wheelId: 'preview-wheel-product',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-product-4',
            oneWordSummary: 'Roadmap',
            summary: 'Strategic product roadmap balancing customer needs, technical feasibility, and business objectives for growth',
            anchor: 'Prioritize features based on impact analysis, resource requirements, and alignment with company strategic goals',
            pulse: 'strategic',
            wheelId: 'preview-wheel-product',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          }
        ];

        const healthDots = [
          {
            id: 'preview-dot-health-1',
            oneWordSummary: 'Exercise',
            summary: 'Consistent strength training and cardio routine 5x weekly to maintain optimal physical fitness and energy levels',
            anchor: 'Schedule workout sessions like non-negotiable meetings and track progress through measurable fitness benchmarks',
            pulse: 'energized',
            wheelId: 'preview-wheel-health',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-health-2',
            oneWordSummary: 'Nutrition',
            summary: 'Balanced whole food diet with proper hydration and mindful eating habits to fuel peak performance',
            anchor: 'Meal prep and nutrition tracking to maintain consistent energy levels and support long-term health goals',
            pulse: 'nourished',
            wheelId: 'preview-wheel-health',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-health-3',
            oneWordSummary: 'Sleep',
            summary: '7-8 hours quality sleep nightly with consistent sleep schedule and optimized sleep environment for recovery',
            anchor: 'Establish evening routine and eliminate screen time 1 hour before bed to improve sleep quality and duration',
            pulse: 'rested',
            wheelId: 'preview-wheel-health',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-health-4',
            oneWordSummary: 'Stress',
            summary: 'Daily meditation and stress management techniques to maintain mental clarity and emotional equilibrium',
            anchor: 'Practice mindfulness, deep breathing, and regular stress assessment to prevent burnout and maintain wellbeing',
            pulse: 'calm',
            wheelId: 'preview-wheel-health',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-health-5',
            oneWordSummary: 'Checkups',
            summary: 'Regular medical and dental checkups with preventive care to maintain long-term health and catch issues early',
            anchor: 'Schedule annual physicals, dental cleanings, and specialized screenings based on age and risk factors',
            pulse: 'proactive',
            wheelId: 'preview-wheel-health',
            sourceType: 'text',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          }
        ];

        const individualDots = [
          {
            id: 'preview-dot-individual-1',
            oneWordSummary: 'Reading',
            summary: 'Read 24 books annually across leadership, technology, and personal development to expand knowledge and perspectives',
            anchor: 'Dedicated daily reading time with note-taking and reflection to maximize learning retention and application',
            pulse: 'curious',
            wheelId: 'preview-wheel-individual',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-2',
            oneWordSummary: 'Skills',
            summary: 'Develop new technical and soft skills through online courses, workshops, and hands-on practice projects',
            anchor: 'Identify skill gaps and create structured learning plans with milestones and practical application opportunities',
            pulse: 'motivated',
            wheelId: 'preview-wheel-individual',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-3',
            oneWordSummary: 'Network',
            summary: 'Build meaningful professional relationships through industry events, mentorship, and peer collaboration',
            anchor: 'Actively engage with community leaders, attend conferences, and maintain regular communication with key contacts',
            pulse: 'connected',
            wheelId: 'preview-wheel-individual',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-4',
            oneWordSummary: 'Reflection',
            summary: 'Weekly self-reflection sessions to assess progress, identify areas for improvement, and celebrate achievements',
            anchor: 'Structured reflection process including goal review, lesson learned documentation, and next week planning',
            pulse: 'thoughtful',
            wheelId: 'preview-wheel-individual',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-5',
            oneWordSummary: 'Travel',
            summary: 'Experience new cultures and environments through travel to broaden perspective and inspire creativity',
            anchor: 'Plan meaningful travel experiences that combine exploration, learning, and personal growth opportunities',
            pulse: 'adventurous',
            wheelId: 'preview-wheel-individual',
            sourceType: 'text',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-6',
            oneWordSummary: 'Hobbies',
            summary: 'Pursue creative hobbies and interests outside work to maintain work-life balance and personal fulfillment',
            anchor: 'Dedicate time to activities that bring joy and provide mental stimulation beyond professional responsibilities',
            pulse: 'fulfilled',
            wheelId: 'preview-wheel-individual',
            sourceType: 'voice',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-7',
            oneWordSummary: 'Goals',
            summary: 'Set and track quarterly personal development goals aligned with long-term vision and values',
            anchor: 'Create SMART goals with regular progress reviews and adjustments to ensure continuous growth and achievement',
            pulse: 'focused',
            wheelId: 'preview-wheel-individual',
            sourceType: 'text',
            captureMode: 'natural',
            timestamp: new Date(),
            voiceData: null
          },
          {
            id: 'preview-dot-individual-8',
            oneWordSummary: 'Mentoring',
            summary: 'Both seek mentorship from experienced leaders and provide guidance to emerging professionals for mutual growth',
            anchor: 'Establish mentor relationships and actively contribute to others development through knowledge sharing and support',
            pulse: 'generous',
            wheelId: 'preview-wheel-individual',
            sourceType: 'voice',
            captureMode: 'ai',
            timestamp: new Date(),
            voiceData: null
          }
        ];
        // Assign dots to wheels
        gtmWheel.dots = gtmDots;
        leadershipWheel.dots = leadershipDots;
        productWheel.dots = productDots;
        healthWheel.dots = healthDots;
        individualWheel.dots = individualDots;

        // All wheels
        const allWheels = [businessChakra, gtmWheel, leadershipWheel, productWheel, healthWheel, individualWheel];
        const allDots = [...gtmDots, ...leadershipDots, ...productDots, ...healthDots, ...individualDots];

        // Separate chakras from regular wheels
        const chakras = allWheels.filter(w => !w.chakraId);
        const regularWheels = allWheels.filter(w => w.chakraId);

        // Calculate totals
        const totalDots = allDots.length;
        const totalWheels = regularWheels.length;
        const totalChakras = chakras.length;

        return res.json({
          success: true,
          data: {
            wheels: allWheels,
            chakras,
            regularWheels,
            totalDots,
            totalWheels,
            totalChakras,
            gridPositions: allWheels.map(wheel => ({
              id: wheel.id,
              position: wheel.position,
              radius: wheel.radius
            }))
          }
        });
      }
      
      // For non-preview mode, use existing entries data 
      const userEntries = await db.query.entries.findMany({
        where: eq(entries.userId, userId),
        orderBy: desc(entries.createdAt),
        limit: 50
      });

      // Filter and parse three-layer dots
      const userDots = userEntries
        .filter(entry => {
          try {
            const parsed = JSON.parse(entry.content);
            return parsed.dotType === 'three-layer';
          } catch {
            return false;
          }
        })
        .map((entry, index) => ({
          id: entry.id.toString(),
          x: 200 + (index % 5) * 80 + Math.random() * 40,
          y: 200 + Math.floor(index / 5) * 80 + Math.random() * 40
        }));
      
      // Get wheels data
      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId)
      });
      
      const chakras = userWheels.filter(wheel => !wheel.chakraId);
      const regularWheels = userWheels.filter(wheel => wheel.chakraId);
      
      // Generate positions for wheels and chakras
      const wheelPositions = regularWheels.reduce((acc, wheel, index) => {
        acc[wheel.id] = {
          x: wheel.positionX || (300 + index * 150),
          y: wheel.positionY || (250 + index * 120)
        };
        return acc;
      }, {} as Record<string, { x: number; y: number }>);
      
      const chakraPositions = chakras.reduce((acc, chakra, index) => {
        acc[chakra.id] = {
          x: chakra.positionX || (400 + index * 200),
          y: chakra.positionY || (300 + index * 150)
        };
        return acc;
      }, {} as Record<string, { x: number; y: number }>);
      
      const dotPositions = userDots.reduce((acc, dot) => {
        acc[dot.id] = { x: dot.x, y: dot.y };
        return acc;
      }, {} as Record<string, { x: number; y: number }>);
      
      return res.json({
        success: true,
        data: {
          dotPositions,
          wheelPositions,
          chakraPositions,
          statistics: {
            totalDots: userDots.length,
            totalWheels: regularWheels.length,
            totalChakras: chakras.length,
            freeDots: userDots.length
          }
        }
      });
      
    } catch (error) {
      console.error('Grid positioning error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to calculate grid positions'
      });
    }
  });

  // Advanced "Organize Thoughts" API route
  app.post(`${apiPrefix}/organize-thoughts/continue`, continueOrganizeThoughts);

  // Advanced Chat API with Multi-Model Support
  app.post(`${apiPrefix}/advanced-chat`, async (req, res) => {
    try {
      const { message, model = 'gpt-4o', conversationHistory = [], userId, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const { generateAdvancedChatResponse } = await import('./advanced-chat');
      
      const response = await generateAdvancedChatResponse(
        message,
        conversationHistory,
        model,
        userId?.toString(),
        sessionId
      );

      res.json({
        success: true,
        response: response.response,
        analysis: response.analysis,
        cognitiveDepth: response.cognitiveDepth,
        conversationFlow: response.conversationFlow,
        metadata: response.metadata
      });
    } catch (error) {
      console.error('Advanced chat error:', error);
      res.status(500).json({ 
        error: 'Failed to generate advanced chat response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced Chat API with Cognitive Coaching
  app.post(`${apiPrefix}/enhanced-chat`, async (req, res) => {
    try {
      const { message, model = 'gpt-4o', sessionId, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const { generateEnhancedChatResponse } = await import('./enhanced-chat');
      
      // Get conversation history from session if available  
      const conversationHistory: Array<{role: string, content: string}> = [];
      
      const response = await generateEnhancedChatResponse(
        message,
        conversationHistory,
        model,
        userId,
        sessionId
      );

      res.json({
        success: true,
        response: response.response,
        analysis: response.analysis,
        structureProposal: response.structureProposal,
        action: response.action,
        metadata: response.metadata
      });
    } catch (error) {
      console.error('Enhanced chat error:', error);
      res.status(500).json({ 
        error: 'Failed to generate enhanced chat response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ==========================================
  // ADVANCED CHAT SYSTEM - ChatGPT Level Intelligence
  // ==========================================

  // Advanced chat processing with sophisticated AI capabilities
  app.post(`${apiPrefix}/chat/advanced`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { 
        message, 
        sessionId, 
        previousMessages = [], 
        model = 'claude-sonnet-4',
        context = {} 
      } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ 
          error: 'Message and sessionId are required' 
        });
      }

      const userId = req.user?.id;
      
      // Process message with advanced chat engine
      const result = await advancedChatEngine.processAdvancedMessage(
        message,
        sessionId,
        userId,
        previousMessages,
        model
      );

      res.json({
        success: true,
        data: {
          response: result.response,
          analysis: result.analysis,
          metadata: result.metadata,
          sessionId,
          userId
        }
      });

    } catch (error) {
      console.error('Advanced chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process advanced chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get intelligent conversation suggestions
  app.post(`${apiPrefix}/chat/suggestions`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, conversationHistory = [], context = {} } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const suggestions = await intelligentFeatures.generateSmartSuggestions(
        message,
        conversationHistory,
        context
      );

      res.json({
        success: true,
        data: { suggestions }
      });

    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to generate suggestions' 
      });
    }
  });

  // Analyze conversation patterns and user insights
  app.post(`${apiPrefix}/chat/analyze-patterns`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { conversationHistory = [], sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'SessionId is required' });
      }

      const insights = await intelligentFeatures.analyzeConversationPatterns(
        conversationHistory,
        sessionId
      );

      res.json({
        success: true,
        data: { insights }
      });

    } catch (error) {
      console.error('Pattern analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze conversation patterns' 
      });
    }
  });

  // Generate adaptive responses based on user profile
  app.post(`${apiPrefix}/chat/adaptive-response`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, userInsight, context = {} } = req.body;

      if (!message || !userInsight) {
        return res.status(400).json({ 
          error: 'Message and userInsight are required' 
        });
      }

      const adaptiveResponse = await intelligentFeatures.generateAdaptiveResponse(
        message,
        userInsight,
        context
      );

      res.json({
        success: true,
        data: { adaptiveResponse }
      });

    } catch (error) {
      console.error('Adaptive response error:', error);
      res.status(500).json({ 
        error: 'Failed to generate adaptive response' 
      });
    }
  });

  // Predict conversation flow and engagement
  app.post(`${apiPrefix}/chat/predict-flow`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentMessage, conversationHistory = [], userInsight } = req.body;

      if (!currentMessage || !userInsight) {
        return res.status(400).json({ 
          error: 'currentMessage and userInsight are required' 
        });
      }

      const prediction = await intelligentFeatures.predictConversationFlow(
        currentMessage,
        conversationHistory,
        userInsight
      );

      res.json({
        success: true,
        data: { prediction }
      });

    } catch (error) {
      console.error('Flow prediction error:', error);
      res.status(500).json({ 
        error: 'Failed to predict conversation flow' 
      });
    }
  });

  // Real-time sentiment analysis
  app.post(`${apiPrefix}/chat/sentiment-analysis`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { messages = [] } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ 
          error: 'Messages array is required' 
        });
      }

      const sentimentAnalysis = await intelligentFeatures.analyzeSentimentFlow(messages);

      res.json({
        success: true,
        data: { sentimentAnalysis }
      });

    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze sentiment' 
      });
    }
  });

  // Enhance conversation memory with context awareness
  app.post(`${apiPrefix}/chat/enhance-memory`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId, newMessage, existingContext = [] } = req.body;

      if (!sessionId || !newMessage) {
        return res.status(400).json({ 
          error: 'SessionId and newMessage are required' 
        });
      }

      const enhancedMemory = await intelligentFeatures.enhanceContextMemory(
        sessionId,
        newMessage,
        existingContext
      );

      res.json({
        success: true,
        data: { enhancedMemory }
      });

    } catch (error) {
      console.error('Memory enhancement error:', error);
      res.status(500).json({ 
        error: 'Failed to enhance conversation memory' 
      });
    }
  });

  // Multi-modal context analysis
  app.post(`${apiPrefix}/chat/multimodal-analysis`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { textContent, voiceData, visualContext } = req.body;

      if (!textContent) {
        return res.status(400).json({ 
          error: 'textContent is required' 
        });
      }

      const analysis = await intelligentFeatures.analyzeMultiModalContext(
        textContent,
        voiceData,
        visualContext
      );

      res.json({
        success: true,
        data: { analysis }
      });

    } catch (error) {
      console.error('Multi-modal analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze multi-modal context' 
      });
    }
  });

  // Intelligent error recovery
  app.post(`${apiPrefix}/chat/error-recovery`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { errorContext, userMessage, conversationHistory = [] } = req.body;

      if (!errorContext || !userMessage) {
        return res.status(400).json({ 
          error: 'errorContext and userMessage are required' 
        });
      }

      const recovery = await intelligentFeatures.handleIntelligentErrorRecovery(
        errorContext,
        userMessage,
        conversationHistory
      );

      res.json({
        success: true,
        data: { recovery }
      });

    } catch (error) {
      console.error('Error recovery error:', error);
      res.status(500).json({ 
        error: 'Failed to handle error recovery' 
      });
    }
  });

  // Generate personalized conversation summary
  app.get(`${apiPrefix}/chat/summary/:sessionId`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ 
          error: 'SessionId is required' 
        });
      }

      const summary = await advancedChatEngine.generatePersonalizedSummary(sessionId);

      res.json({
        success: true,
        data: { summary, sessionId }
      });

    } catch (error) {
      console.error('Summary generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate conversation summary' 
      });
    }
  });

  // ==========================================
  // VECTOR DATABASE INTEGRATION
  // ==========================================

  // Mount vector search routes
  app.use(`${apiPrefix}/vector`, vectorSearchRouter);
  
  // Use preview data routes  
  app.use(`${apiPrefix}/preview`, previewDataRouter);
  
  // Mount indexing routes for comprehensive cognitive structure indexing
  app.use(`${apiPrefix}/indexing`, indexingRouter);
  
  // Mount indexing demo routes
  const indexingDemoRouter = await import('./routes/indexing-demo');
  app.use(`${apiPrefix}/indexing`, indexingDemoRouter.default);

  // ==========================================
  // COGNITIVE ANALYSIS & INTELLIGENT RETRIEVAL
  // ==========================================

  // Import cognitive analysis routes
  const {
    analyzeCognitiveStructure,
    performIntelligentQuery,
    performAdvancedSearch,
    getContextualInsights,
    batchAnalyzeContent
  } = await import('./routes/cognitive-analysis');

  // Cognitive structure analysis
  app.post(`${apiPrefix}/cognitive/analyze`, analyzeCognitiveStructure);
  
  // Intelligent retrieval
  app.post(`${apiPrefix}/cognitive/query`, performIntelligentQuery);
  
  // Advanced search with filters
  app.post(`${apiPrefix}/cognitive/search`, performAdvancedSearch);
  
  // Get contextual insights
  app.post(`${apiPrefix}/cognitive/insights`, getContextualInsights);
  
  // Batch content analysis
  app.post(`${apiPrefix}/cognitive/batch`, batchAnalyzeContent);

  // ==========================================
  // ADVANCED DOTSPARK INTELLIGENCE
  // ==========================================

  // Import advanced DotSpark routes with Python backend integration
  const {
    advancedDotSparkChat,
    organizeUserThoughts,
    multiModelDotSpark,
    getDotSparkStatus
  } = await import('./routes/advanced-dotspark');

  // Advanced DotSpark chat with Python backend logic
  app.post(`${apiPrefix}/dotspark/chat`, advancedDotSparkChat as any);
  
  // Organize thoughts into Dot/Wheel/Chakra structure
  app.post(`${apiPrefix}/dotspark/organize`, organizeUserThoughts as any);
  
  // Multi-model processing (GPT-4 + DeepSeek)
  app.post(`${apiPrefix}/dotspark/multi-model`, multiModelDotSpark as any);
  
  // DotSpark intelligence status and capabilities
  app.get(`${apiPrefix}/dotspark/status`, getDotSparkStatus as any);

  // ==========================================
  // CONVERSATIONAL INTELLIGENCE
  // ==========================================

  // Import conversational chat routes
  const {
    intelligentConversationalChat,
    getConversationContext,
    continueWithPoint
  } = await import('./routes/conversational-chat');

  // Intelligent conversational chat with context memory
  app.post(`${apiPrefix}/chat/conversational`, intelligentConversationalChat);
  
  // Get conversation context and summary
  app.get(`${apiPrefix}/chat/context/:sessionId`, getConversationContext);
  
  // Continue conversation with specific point reference
  app.post(`${apiPrefix}/chat/continue-point`, continueWithPoint);

  // ==========================================
  // DOTSPARK ACTIVATION SYSTEM
  // ==========================================

  // Import activation routes
  const activationRoutes = await import('./routes/activation');
  app.use(`${apiPrefix}/activation`, activationRoutes.default);

  // ==========================================
  // ADVANCED CORE INTELLIGENCE CLASSIFICATION
  // ==========================================

  // Import intelligent classification routes
  const {
    classifyContent,
    confirmAndSave,
    getContextualSuggestions
  } = await import('./routes/intelligent-classification');

  // Advanced core intelligence content classification
  app.post(`${apiPrefix}/intelligence/classify`, classifyContent);
  
  // Confirm classification and save to grid
  app.post(`${apiPrefix}/intelligence/confirm-and-save`, confirmAndSave);
  
  // Get contextual suggestions based on user content
  app.get(`${apiPrefix}/intelligence/suggestions`, getContextualSuggestions);

  // Initialize vector database on startup
  try {
    await initializeVectorDB();
    console.log('Vector database initialization completed');
  } catch (error) {
    console.error('Vector database initialization failed:', error);
    // Continue without vector DB for now - can be initialized manually via API
  }

  // ==========================================
  // INTELLIGENT VECTOR-ENHANCED CHAT
  // ==========================================

  // Enhanced chat with vector context and intelligence
  app.post(`${apiPrefix}/chat/intelligent`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, conversationHistory = [], sessionId } = req.body;
      const userId = req.user?.id || req.session?.userId;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { generateIntelligentVectorResponse } = await import('./intelligent-vector-chat');
      
      const result = await generateIntelligentVectorResponse(
        message,
        userId,
        conversationHistory,
        sessionId
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Intelligent chat error:', error);
      res.status(500).json({ 
        error: 'Failed to generate intelligent response',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced content creation with vector intelligence
  app.post(`${apiPrefix}/content/enhance`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { contentType, contentText } = req.body;
      const userId = req.user?.id || req.session?.userId;

      if (!contentText || !contentType) {
        return res.status(400).json({ error: 'Content text and type are required' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { enhanceContentWithVectorIntelligence } = await import('./intelligent-vector-chat');
      
      const result = await enhanceContentWithVectorIntelligence(
        contentType as 'dot' | 'wheel' | 'chakra',
        contentText,
        userId
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Content enhancement error:', error);
      res.status(500).json({ 
        error: 'Failed to enhance content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get intelligent search suggestions
  app.get(`${apiPrefix}/search/suggestions`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      const { limit = 6 } = req.query;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { getIntelligentSearchSuggestions } = await import('./intelligent-vector-chat');
      
      const suggestions = await getIntelligentSearchSuggestions(
        userId,
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: { suggestions }
      });

    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to generate search suggestions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test vector database functionality
  app.get(`${apiPrefix}/vector/test`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { storeVectorEmbedding, searchSimilarContent } = await import('./vector-db');

      // Test data
      const testContent = "I'm learning about personal productivity and goal setting";
      const testId = Date.now();

      // Store test embedding
      const vectorId = await storeVectorEmbedding(
        'test',
        testId,
        testContent,
        userId,
        { purpose: 'system_test' }
      );

      // Search for similar content
      const results = await searchSimilarContent(testContent, {
        topK: 3,
        threshold: 0.5,
        userId,
        includeContent: true
      });

      res.json({
        success: true,
        data: {
          message: 'Vector database test completed successfully',
          testVectorId: vectorId,
          searchResults: results.length,
          systemStatus: 'operational'
        }
      });

    } catch (error) {
      console.error('Vector database test error:', error);
      res.status(500).json({ 
        error: 'Vector database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        systemStatus: 'error'
      });
    }
  });

  return httpServer;
}