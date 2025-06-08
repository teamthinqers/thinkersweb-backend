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
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

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

      // Use the enhanced chat response with conditional CogniShield monitoring
      const chatResult = await generateChatResponse(
        message,
        conversationHistory,
        cogniProfile,
        hasCogniShieldConfigured // Only monitor if configured
      );
      
      // Return response with CogniShield analysis only if configured
      const response: any = { 
        reply: chatResult.response
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

  return httpServer;
}