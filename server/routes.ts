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
  dots,
  wheels,
  dotConnections,
  wheelConnections,
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
  isAuthenticated(): boolean;
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

  // Dots and Wheels API Endpoints
  
  // Enhanced dots endpoint for three-layer system with voice support
  app.post(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      
      // Validate three-layer structure: summary (220), anchor (300), pulse (1 word)
      const { 
        summary, 
        anchor, 
        pulse, 
        sourceType = 'text',
        originalAudioBlob,
        transcriptionText 
      } = req.body;
      
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

      // Generate random position for dot on map (0-800 range for both x and y)
      const positionX = Math.floor(Math.random() * 800);
      const positionY = Math.floor(Math.random() * 600);
      
      // Prepare dot data for database
      const dotData = {
        userId,
        summary,
        anchor, 
        pulse,
        sourceType: sourceType === 'voice' ? 'voice' : 'text', // Only voice or text, no hybrid
        originalAudioBlob: sourceType === 'voice' ? originalAudioBlob : null,
        transcriptionText: sourceType === 'voice' ? transcriptionText : null,
        positionX,
        positionY
      };
      
      const [newDot] = await db.insert(dots).values(dotData).returning();
      res.status(201).json(newDot);
    } catch (error) {
      console.error('Error creating dot:', error);
      res.status(500).json({ error: 'Failed to create dot' });
    }
  });

  // Get dots for dashboard with enhanced features
  app.get(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      
      const userDots = await db.query.dots.findMany({
        where: eq(dots.userId, userId),
        orderBy: desc(dots.createdAt),
        limit: 100
      });

      // Return actual dots from dots table with random positioning
      const formattedDots = userDots.map(dot => ({
        id: dot.id,
        summary: dot.summary,
        anchor: dot.anchor,
        pulse: dot.pulse,
        sourceType: dot.sourceType,
        originalAudioBlob: dot.originalAudioBlob,
        transcriptionText: dot.transcriptionText,
        positionX: dot.positionX,
        positionY: dot.positionY,
        createdAt: dot.createdAt,
        updatedAt: dot.updatedAt,
        wheelId: dot.wheelId || null
      }));

      res.json(formattedDots);
    } catch (error) {
      console.error('Error fetching dots:', error);
      res.status(500).json({ error: 'Failed to fetch dots' });
    }
  });

  // Delete a dot
  app.delete(`${apiPrefix}/dots/:id`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId || 1;
      const dotId = parseInt(req.params.id);
      
      if (!dotId) {
        return res.status(400).json({ error: 'Invalid dot ID' });
      }
      
      // Verify ownership and delete
      const deletedDot = await db.delete(dots)
        .where(and(eq(dots.id, dotId), eq(dots.userId, userId)))
        .returning();
      
      if (deletedDot.length === 0) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }
      
      res.json({ message: 'Dot deleted successfully' });
    } catch (error) {
      console.error('Error deleting dot:', error);
      res.status(500).json({ error: 'Failed to delete dot' });
    }
  });

  return httpServer;
}