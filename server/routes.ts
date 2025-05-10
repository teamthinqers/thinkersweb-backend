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
  
  // Special test endpoint for WhatsApp webhook verification
  app.get(`${apiPrefix}/whatsapp/test-webhook`, (req, res) => {
    console.log("⭐️ WhatsApp webhook test endpoint accessed");
    res.status(200).json({ 
      status: 'ok', 
      message: 'This test endpoint confirms that the WhatsApp webhook route is properly registered.'
    });
  });
  
  // Debug endpoint to simulate a WhatsApp message
  app.post(`${apiPrefix}/whatsapp/simulate`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      
      console.log(`⭐️ Simulating WhatsApp message from user ${req.user.id}: ${message}`);
      
      // Process the message as if it came from WhatsApp
      const from = "whatsapp:+12345678900"; // Fake WhatsApp number
      const response = await processWhatsAppMessage(from, message);
      
      // Create an entry connected to this user's account
      try {
        console.log(`⭐️ Creating entry for simulated WhatsApp message`);
        
        const entryData = {
          userId: req.user.id,
          title: `WhatsApp Simulation - ${new Date().toLocaleString()}`,
          content: message,
          visibility: "private",
          isFavorite: false
        };
        
        await db.insert(entries).values(entryData);
        console.log(`⭐️ Entry created successfully for simulated message`);
      } catch (entryError) {
        console.error("Error creating entry for simulated message:", entryError);
      }
      
      return res.status(200).json({ 
        success: true, 
        response: response.message,
        message: "WhatsApp message simulated and entry created" 
      });
    } catch (error) {
      console.error("Error in WhatsApp simulate route:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

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
      // Use Twilio WhatsApp number directly - hardcoded to ensure consistency
      const whatsappNumber = "16067157733"; // Your Twilio WhatsApp number
      
      // Log the WhatsApp number being used
      console.log(`Using Twilio WhatsApp number: ${whatsappNumber}`);
      
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
  
  // Generate a linking code for connecting WhatsApp to a DotSpark account
  app.post(`${apiPrefix}/whatsapp/generate-link-code`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Require user to be logged in - no demo user fallback
      if (!req.user || !req.user.id) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'You must log in to generate a WhatsApp link code'
        });
      }
      
      const userId = req.user.id;
      console.log("Generating WhatsApp link code for user ID:", userId);
      
      // Generate a random 6-digit code
      const linkCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in the database with a 15-minute expiration
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiration
      
      // Delete any previous unverified codes for this user
      await db.delete(whatsappOtpVerifications)
        .where(and(
          eq(whatsappOtpVerifications.userId, userId),
          eq(whatsappOtpVerifications.verified, false)
        ));
      
      // Insert the new verification code
      await db.insert(whatsappOtpVerifications).values({
        userId,
        phoneNumber: "pending", // Temporary placeholder, will be filled when user sends code from WhatsApp
        otpCode: linkCode,
        verified: false,
        expiresAt,
      });
      
      // Return the code to the client
      res.status(200).json({ 
        linkCode,
        expiresAt,
        message: "Send this code to the WhatsApp number within 15 minutes to link your account"
      });
      
    } catch (err) {
      console.error("Error generating WhatsApp link code:", err);
      res.status(500).json({ error: 'Failed to generate link code' });
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
      
      console.log(`Registering WhatsApp neural extension for: ${phoneNumber}`);
      
      // Register directly without verification
      const result = await registerWhatsAppUser(userId, phoneNumber);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Your neural extension is now activated. You can now chat with DotSpark directly through WhatsApp."
        });
      } else {
        res.status(400).json({ success: false, error: result.message });
      }
    } catch (err) {
      console.error("WhatsApp direct registration error:", err);
      res.status(500).json({ success: false, error: 'Failed to register for WhatsApp neural extension' });
    }
  });

  return httpServer;
}