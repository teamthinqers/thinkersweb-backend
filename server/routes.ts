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
  type User 
} from "@shared/schema";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { connectionsService } from "./connections";
import { db } from "@db";
import { setupAuth, isAuthenticated } from "./auth";
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
      const userId = req.user?.id || 1; // Default to demo user in dev environment
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
      const userId = req.user?.id || 1; // Default to demo user in dev environment
      
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
      const userId = req.user?.id || 1; // Default to demo user in dev environment
      
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
      
      const userId = req.user?.id || 1; // Default to demo user in dev environment
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
  
  // Simple dots endpoint for three-layer system
  app.post(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      
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
      
      const entryData = {
        userId,
        title: summary.substring(0, 50) + (summary.length > 50 ? '...' : ''),
        content: JSON.stringify({
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

  // Get dots for dashboard
  app.get(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      
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

  // Create dot through AI chat conversation
  app.post(`${apiPrefix}/chat/create-dot`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
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
      const userId = req.user?.id || req.session?.userId || 1;
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

  return httpServer;
}