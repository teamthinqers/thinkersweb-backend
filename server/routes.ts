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
  entries,
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
  
  // Special routes for PWA files to ensure correct MIME types
  app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile('service-worker.js', { root: './public' });
  });
  
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile('manifest.json', { root: './public' });
  });
  
  app.get('/offline.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile('offline.html', { root: './public' });
  });

  // Get entries endpoint - uses auth when available, fallback to demo user
  app.get(`${apiPrefix}/entries`, async (req: Request, res: Response) => {
    try {
      // Allow direct user ID specification for debugging/special pages
      const directUserId = req.query.directUserId ? parseInt(req.query.directUserId as string) : undefined;
      
      // Get the authenticated user ID if available, otherwise fallback to demo user
      let userId = 1; // Demo user ID as fallback
      
      if (directUserId) {
        // Use the direct user ID if specified
        userId = directUserId;
        console.log(`⭐️ Using direct user ID: ${userId} from query parameter`);
      } else if (req.isAuthenticated && req.isAuthenticated() && (req as AuthenticatedRequest).user?.id) {
        // Otherwise use the authenticated user ID
        userId = (req as AuthenticatedRequest).user.id;
        console.log(`⭐️ Getting entries for authenticated user ID: ${userId}`);
      } else {
        console.log(`⭐️ Using demo user ID: ${userId} (no authenticated user)`);
      }

      // Parse query parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const tagIds = req.query.tagIds 
        ? (req.query.tagIds as string).split(',').map(id => parseInt(id)) 
        : undefined;
      const searchQuery = req.query.search as string | undefined;
      const isFavorite = req.query.favorite 
        ? req.query.favorite === 'true' 
        : undefined;
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
      
      // Add extensive logging to debug issues
      console.log(`📝 Entries request details:
      - User ID: ${userId}
      - Limit: ${limit}, Offset: ${offset}
      - Category ID: ${categoryId || 'none'}
      - Sort: ${sortBy} ${sortOrder}
      - Search: ${searchQuery || 'none'}
      - Favorite: ${isFavorite !== undefined ? String(isFavorite) : 'not specified'}`);
      
      // Get entries with user ID filter
      const result = await storage.getAllEntries({
        userId,
        categoryId,
        tagIds,
        searchQuery,
        isFavorite,
        limit,
        offset,
        sortBy,
        sortOrder
      });

      console.log(`📋 Found ${result.entries.length} entries (total: ${result.total})`);
      
      // For debugging, log first entry if available
      if (result.entries.length > 0) {
        console.log(`📄 First entry: ID ${result.entries[0].id}, Title: ${result.entries[0].title}`);
      }

      res.json(result);
    } catch (error) {
      console.error('Error getting entries:', error);
      res.status(500).json({ error: 'Failed to get entries' });
    }
  });

  // Get single entry endpoint - temporarily bypassing authentication for debugging
  app.get(`${apiPrefix}/entries/:id`, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      // Temporary hardcoded userId for debugging
      const userId = 1; // Assuming user ID 1 exists for testing

      const entry = await storage.getEntryWithDetails(entryId);
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      // Make sure the user can only access their own entries
      if (entry.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error getting entry:', error);
      res.status(500).json({ error: 'Failed to get entry' });
    }
  });
  
  // Create entry endpoint - uses auth when available, fallback to demo user
  app.post(`${apiPrefix}/entries`, async (req: Request, res: Response) => {
    try {
      // Get the authenticated user ID if available, otherwise fallback to demo user
      let userId = 1; // Demo user ID as fallback
      
      // Check if this is an authenticated request
      if (req.isAuthenticated && req.isAuthenticated() && (req as AuthenticatedRequest).user?.id) {
        userId = (req as AuthenticatedRequest).user.id;
        console.log(`⭐️ Creating entry for authenticated user ID: ${userId}`);
      } else {
        console.log(`⭐️ Creating entry for demo user ID: ${userId} (no authenticated user)`);
      }
      
      const { title, content, categoryId, tagIds, visibility, isFavorite } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      
      console.log(`⭐️ Creating entry with title: "${title?.substring(0, 30) || 'Untitled'}" for user ${userId}`);

      // Create entry with user ID
      const entryData = {
        userId,
        title: title || `Entry - ${new Date().toLocaleString()}`,
        content,
        categoryId: categoryId || null,
        visibility: visibility || 'private',
        isFavorite: isFavorite || false
      };
      
      // Insert entry and get the created entry back
      const [newEntry] = await db.insert(entries).values(entryData).returning();
      console.log(`⭐️ Created entry ID: ${newEntry.id}`);
      
      // If tags were provided, associate them with the entry
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const entryTagValues = tagIds.map(tagId => ({
          entryId: newEntry.id,
          tagId
        }));
        
        try {
          await db.insert(entryTags).values(entryTagValues);
          console.log(`⭐️ Added ${tagIds.length} tags to entry ID: ${newEntry.id}`);
        } catch (tagError) {
          console.error(`Error adding tags to entry: ${tagError}`);
          // Continue even if tag association fails
        }
      }
      
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error creating entry:', error);
      res.status(500).json({ error: 'Failed to create entry' });
    }
  });

  // Setup authentication middleware
  setupAuth(app);

  // Firebase authentication endpoint - creates/updates user on login
  app.post(`${apiPrefix}/auth/firebase`, async (req: Request, res: Response) => {
    try {
      const { uid, email, displayName, persistent = true } = req.body;
      
      if (!uid || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if user exists
      let user = await db.query.users.findFirst({
        where: eq(users.firebaseUid, uid)
      });
      
      // If user doesn't exist, create a new one
      if (!user) {
        console.log(`Creating new user from Firebase auth: ${email}`);
        
        // Generate a unique username based on email
        const username = email.split('@')[0].toLowerCase() + 
                        Math.floor(Math.random() * 1000).toString();
        
        // Insert the new user
        const [newUser] = await db.insert(users).values({
          email,
          username,
          firebaseUid: uid,
          fullName: displayName || null,
          password: '', // Firebase users don't have a password
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        user = newUser;
        
        // Add isNewUser flag for frontend to show welcome/onboarding
        user.isNewUser = true;
      } else {
        // Update existing user's info if needed
        if (displayName && !user.fullName) {
          await db.update(users)
            .set({ 
              fullName: displayName,
              updatedAt: new Date()
            })
            .where(eq(users.id, user.id));
          
          user.fullName = displayName;
        }
      }
      
      // Store user in session with persistent flag
      if (req.session) {
        req.session.userId = user.id;
        req.session.firebaseUid = uid;
        req.session.lastActivity = Date.now();
        req.session.persistent = persistent;
        
        console.log(`User session established for ${email} (persistent: ${persistent})`);
      }
      
      // Return user object
      res.status(200).json(user);
    } catch (error) {
      console.error('Error in Firebase auth endpoint:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
  
  // Session recovery endpoint - allows client to recover session without Firebase
  app.post(`${apiPrefix}/auth/recover`, async (req: Request, res: Response) => {
    try {
      const { uid, email, persistent = true } = req.body;
      
      if (!uid) {
        return res.status(400).json({ error: "Missing Firebase UID" });
      }
      
      // Check if user exists with this Firebase UID
      const user = await db.query.users.findFirst({
        where: eq(users.firebaseUid, uid)
      });
      
      if (!user) {
        console.log(`Session recovery failed: No user found with Firebase UID ${uid}`);
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if email matches if provided (additional security)
      if (email && user.email !== email) {
        console.log(`Session recovery denied: Email mismatch for UID ${uid}`);
        return res.status(403).json({ error: "Email mismatch" });
      }
      
      // Create a new session for the user
      if (req.session) {
        req.session.userId = user.id;
        req.session.firebaseUid = uid;
        req.session.lastActivity = Date.now();
        req.session.persistent = persistent;
        
        console.log(`Session recovered for ${user.email} (ID: ${user.id})`);
      }
      
      // Return user data
      res.status(200).json(user);
    } catch (error) {
      console.error('Error recovering session:', error);
      res.status(500).json({ error: 'Session recovery failed' });
    }
  });
  
  // Session refresh endpoint - keeps session alive
  app.post(`${apiPrefix}/auth/refresh`, async (req: Request, res: Response) => {
    try {
      // If no session exists, return error
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "No active session" });
      }
      
      // Update last activity timestamp
      req.session.lastActivity = Date.now();
      
      // Return success with user ID
      res.status(200).json({ 
        success: true, 
        timestamp: req.session.lastActivity,
        userId: req.session.userId
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      res.status(500).json({ error: 'Session refresh failed' });
    }
  });

  // DotSpark WhatsApp Chatbot Endpoints
  
  // Debug endpoint to simulate a WhatsApp message
  app.post(`${apiPrefix}/whatsapp/test-message`, async (req: Request, res: Response) => {
    try {
      const { message, phoneNumber, userId } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ error: 'Message and userId are required' });
      }

      console.log(`⭐️ TEST: Creating entry for test WhatsApp message from user ID: ${userId}`);
      
      // Format current time in a readable way for the title
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
      
      const entryData = {
        userId,
        title: `Test WhatsApp - ${timestamp}`,
        content: message,
        visibility: "private",
        isFavorite: false
      };
      
      const [newEntry] = await db.insert(entries).values(entryData).returning();
      console.log(`⭐️ TEST: Created entry ID ${newEntry.id} for test WhatsApp message`);

      // Return success with the new entry
      res.status(201).json({ 
        success: true, 
        entry: newEntry,
        message: `Created new entry with ID ${newEntry.id}`
      });
    } catch (error) {
      console.error("Error creating test WhatsApp entry:", error);
      res.status(500).json({ error: 'Failed to create test WhatsApp entry' });
    }
  });
  
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
  
  // DotSpark API endpoints
  
  // Simple chat API endpoint
  app.post(`${apiPrefix}/chat`, async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Generate a response based on the input message
      // For now, we'll just return a simple response
      
      // Get a friendly response
      let reply = "";
      
      if (message.toLowerCase().includes("hey dotspark") || message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
        reply = "Hey there! I'm your neural mirror. How can I help you today?";
      } else if (message.toLowerCase().includes("things on my mind")) {
        reply = "I'm here to help you process your thoughts. What specifically is on your mind today?";
      } else if (message.toLowerCase().includes("who are you") || message.toLowerCase().includes("what are you")) {
        reply = "I'm DotSpark, your neural mirror designed to reflect and enhance your own thinking patterns rather than replace them.";
      } else if (message.toLowerCase().includes("help")) {
        reply = "I can help you organize your thoughts, provide reflections on your ideas, and assist with learning. What would you like to explore?";
      } else {
        reply = "I'm processing your thoughts. Could you elaborate a bit more on what you're thinking about?";
      }
      
      res.status(200).json({ reply });
    } catch (error) {
      console.error('Chat processing error:', error);
      res.status(500).json({ error: 'Failed to process chat message' });
    }
  });
  
  // Get DotSpark status for the current user
  app.get(`${apiPrefix}/dotspark/status`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { getDotSparkStatus } = await import('./dotspark');
      const status = getDotSparkStatus(userId);
      
      res.status(200).json(status);
    } catch (error) {
      console.error("Error getting DotSpark status:", error);
      res.status(500).json({ error: 'Failed to get DotSpark status' });
    }
  });
  
  // Get insights generated by DotSpark
  app.get(`${apiPrefix}/dotspark/insights`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { generateUserInsights } = await import('./dotspark');
      const insights = await generateUserInsights(userId);
      
      res.status(200).json({ insights });
    } catch (error) {
      console.error("Error generating DotSpark insights:", error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });
  
  // Get topic recommendations based on user history
  app.get(`${apiPrefix}/dotspark/recommendations`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { getRecommendedTopics } = await import('./dotspark');
      const topics = await getRecommendedTopics(userId);
      
      res.status(200).json({ topics });
    } catch (error) {
      console.error("Error getting topic recommendations:", error);
      res.status(500).json({ error: 'Failed to get topic recommendations' });
    }
  });

  // Update DotSpark tuning parameters
  app.post(`${apiPrefix}/dotspark/tune`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      // Validate request body
      const tuningSchema = z.object({
        creativity: z.number().min(0).max(1).optional(),
        precision: z.number().min(0).max(1).optional(),
        speed: z.number().min(0).max(1).optional(),
        analytical: z.number().min(0).max(1).optional(),
        intuitive: z.number().min(0).max(1).optional(),
        specialties: z.record(z.string(), z.number().min(0).max(1)).optional(),
        learningFocus: z.array(z.string()).optional()
      });
      
      const validatedData = tuningSchema.parse(req.body);
      
      // Update DotSpark tuning
      const { updateDotSparkTuning, getDotSparkTuning } = await import('./dotspark');
      const updatedTuning = updateDotSparkTuning(userId, validatedData);
      
      // Award experience for tuning their DotSpark
      const { updateGameElements, awardExperience } = await import('./dotspark');
      
      // Check if the dotspark-tuner achievement should be unlocked
      const gameElements = await import('./dotspark').then(m => m.getGameElements(userId));
      const dotsparkTunerAchievement = gameElements.achievements.find(a => a.id === 'dotspark-tuner' || a.id === 'neural-tuner'); // Support both IDs for backward compatibility
      
      if (dotsparkTunerAchievement && !dotsparkTunerAchievement.unlocked) {
        // Unlock achievement
        const updatedAchievements = gameElements.achievements.map(a => 
          (a.id === 'dotspark-tuner' || a.id === 'neural-tuner') 
            ? { ...a, unlocked: true, progress: 1, unlockedAt: new Date().toISOString() }
            : a
        );
        
        updateGameElements(userId, { 
          achievements: updatedAchievements 
        });
        
        // Award extra XP for first-time tuning
        awardExperience(userId, 25, 'Completed first DotSpark tuning');
      } else {
        // Regular XP for tuning
        awardExperience(userId, 5, 'Updated DotSpark tuning');
      }
      
      res.status(200).json(updatedTuning);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid tuning parameters', details: error.errors });
      }
      console.error("Error updating DotSpark tuning:", error);
      res.status(500).json({ error: 'Failed to update DotSpark tuning' });
    }
  });
  
  // Debug endpoint to simulate a WhatsApp message through UI
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
      // Get the actual authenticated user ID - never default to a demo user for status checks
      const userId = req.user?.id;
      
      // If no user ID is available, return a proper error
      if (!userId) {
        console.log("WhatsApp status check without user ID");
        return res.status(401).json({ 
          isRegistered: false,
          error: 'User not authenticated' 
        });
      }
      
      console.log(`Getting WhatsApp status for user ID: ${userId}`);
      
      // Get status from the database
      const status = await getWhatsAppStatus(userId);
      
      // Add isConnected field explicitly for frontend use
      console.log(`Returning WhatsApp status to client:`, status);
      
      res.status(200).json({
        isRegistered: status.isRegistered,
        phoneNumber: status.phoneNumber,
        isConnected: status.isConnected || false,
        userId: status.userId
      });
    } catch (err) {
      console.error("WhatsApp chatbot status error:", err);
      // Even on error, return a properly formatted response
      res.status(500).json({ 
        isRegistered: false,
        error: 'Failed to get WhatsApp chatbot status' 
      });
    }
  });

  // Public debug endpoint to test WhatsApp message processing
  app.post(`${apiPrefix}/whatsapp/test-processing`, async (req: Request, res: Response) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ error: "phoneNumber and message are required" });
      }
      
      console.log(`⭐️ Testing WhatsApp message processing from ${phoneNumber}: ${message}`);
      
      // Format the phone number as a WhatsApp number
      const formattedNumber = phoneNumber.startsWith('whatsapp:') 
        ? phoneNumber 
        : `whatsapp:${phoneNumber}`;
      
      // Process the message but don't save entries
      const response = await processWhatsAppMessage(formattedNumber, message);
      
      return res.status(200).json({ 
        success: true, 
        response: response.message,
        message: "WhatsApp message processing tested" 
      });
    } catch (error) {
      console.error("Error in WhatsApp test processing route:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get WhatsApp contact number for the frontend
  app.get(`${apiPrefix}/whatsapp/contact`, async (req: Request, res: Response) => {
    try {
      // Use Twilio WhatsApp number directly - hardcoded to ensure consistency
      const whatsappNumber = "16067157733"; // Your Twilio WhatsApp number
      
      // Default welcome message
      const defaultMessage = encodeURIComponent("Hey DotSpark, I've got a few things on my mind — need your thoughts");
      
      // Log the WhatsApp number being used
      console.log(`Using Twilio WhatsApp number: ${whatsappNumber}`);
      
      // Use the standard WhatsApp click-to-chat link format with pre-filled message
      res.status(200).json({
        phoneNumber: whatsappNumber,
        directLink: `https://wa.me/${whatsappNumber}?text=${defaultMessage}`,
        defaultMessage: "Hey DotSpark, I've got a few things on my mind — need your thoughts"
      });
    } catch (err) {
      console.error("WhatsApp contact number error:", err);
      res.status(500).json({ error: 'Failed to get WhatsApp contact information' });
    }
  });
  
  // Special route to fix WhatsApp activation that was lost
  app.post(`${apiPrefix}/whatsapp/fix-activation`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { phoneNumber } = req.body;
      
      console.log(`⚙️ Fix activation request for user ${userId}, phone: ${phoneNumber || 'not provided'}`);
      
      // First, check if this user has any WhatsApp records
      const userWhatsappRecords = await db.query.whatsappUsers.findMany({
        where: eq(whatsappUsers.userId, userId),
        orderBy: [desc(whatsappUsers.lastMessageSentAt)]
      });
      
      if (userWhatsappRecords.length === 0) {
        console.log(`⚙️ No WhatsApp records found for user ${userId}`);
        
        // If phone number was provided, create a new record
        if (phoneNumber) {
          console.log(`⚙️ Creating new WhatsApp record for ${phoneNumber}`);
          
          await db.insert(whatsappUsers)
            .values({
              userId: userId,
              phoneNumber: phoneNumber,
              active: true,
              lastMessageSentAt: new Date()
            });
            
          return res.json({
            success: true,
            message: 'New WhatsApp activation created',
            isRegistered: true,
            isConnected: true,
            phoneNumber
          });
        } else {
          return res.status(404).json({ 
            error: 'No WhatsApp records found and no phone number provided' 
          });
        }
      }
      
      // If we have records but none are active, make the most recent one active
      if (!userWhatsappRecords.some(record => record.active)) {
        const mostRecent = userWhatsappRecords[0];
        
        console.log(`⚙️ Reactivating most recent WhatsApp record: ${mostRecent.phoneNumber}`);
        
        await db.update(whatsappUsers)
          .set({
            active: true,
            lastMessageSentAt: new Date()
          })
          .where(eq(whatsappUsers.id, mostRecent.id));
          
        return res.json({
          success: true,
          message: 'WhatsApp activation restored',
          isRegistered: true,
          isConnected: true,
          phoneNumber: mostRecent.phoneNumber
        });
      }
      
      // If we have records and at least one is active, return success
      const activeRecord = userWhatsappRecords.find(record => record.active);
      
      return res.json({
        success: true,
        message: 'WhatsApp already active',
        isRegistered: true,
        isConnected: true,
        phoneNumber: activeRecord?.phoneNumber
      });
    } catch (error) {
      console.error('Error fixing WhatsApp activation:', error);
      return res.status(500).json({ error: 'Failed to fix WhatsApp activation' });
    }
  });

  // Special route to ensure the problematic phone number is properly activated
  app.post(`${apiPrefix}/whatsapp/special-activation`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      
      const { phoneNumber } = req.body;
      
      // Only handle the specific number
      if (phoneNumber !== '+919840884459') {
        return res.status(400).json({ error: 'Invalid phone number for special activation' });
      }
      
      console.log(`🔥 SPECIAL ACTIVATION for ${phoneNumber} - User ID: ${userId}`);
      
      // 1. First check if the number exists
      const existingUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, phoneNumber)
      });
      
      if (existingUser) {
        // Update existing record
        await db.update(whatsappUsers)
          .set({
            userId: userId,
            active: true,
            lastMessageSentAt: new Date()
          })
          .where(eq(whatsappUsers.phoneNumber, phoneNumber));
          
        console.log(`🔥 Updated existing record for ${phoneNumber}`);
      } else {
        // Create new record
        await db.insert(whatsappUsers)
          .values({
            userId: userId,
            phoneNumber: phoneNumber,
            active: true,
            lastMessageSentAt: new Date()
          });
          
        console.log(`🔥 Created new record for ${phoneNumber}`);
      }
      
      // Return success
      return res.json({
        success: true,
        phoneNumber: phoneNumber,
        isRegistered: true,
        isConnected: true,
        userId: userId,
        message: 'Special WhatsApp activation successful'
      });
    } catch (error) {
      console.error('Error in special WhatsApp activation:', error);
      return res.status(500).json({ error: 'Special activation failed' });
    }
  });
  
  // Special debugging endpoint to diagnose WhatsApp numbers in the database
  app.get(`${apiPrefix}/whatsapp/debug-numbers`, async (req: Request, res: Response) => {
    try {
      console.log(`⭐️ Running WhatsApp number debug endpoint`);
      
      // Get all WhatsApp users from the database
      const whatsappUsers = await db.query.whatsappUsers.findMany();
      
      const formattedUsers = whatsappUsers.map(user => ({
        userId: user.userId,
        phoneNumber: user.phoneNumber,
        active: user.active,
        lastMessageSentAt: user.lastMessageSentAt?.toISOString()
      }));
      
      console.log(`⭐️ Found ${whatsappUsers.length} WhatsApp users in database:`);
      formattedUsers.forEach((user, i) => {
        console.log(`  ${i+1}. User ID: ${user.userId}, Phone: ${user.phoneNumber}, Active: ${user.active}`);
      });
      
      // Get recent entries to compare
      const recentEntries = await db.select()
        .from(entries)
        .orderBy(desc(entries.createdAt))
        .limit(10);
      
      console.log(`⭐️ Recent entries (${recentEntries.length} total):`);
      recentEntries.forEach((entry, i) => {
        console.log(`  ${i+1}. Entry ID: ${entry.id}, User ID: ${entry.userId}, Title: ${entry.title}, Created: ${entry.createdAt.toISOString()}`);
      });
      
      res.json({
        whatsappUsers: formattedUsers,
        recentEntries: recentEntries.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          title: entry.title,
          createdAt: entry.createdAt
        }))
      });
    } catch (error) {
      console.error('Error debugging WhatsApp numbers:', error);
      res.status(500).json({ error: 'Failed to debug WhatsApp numbers' });
    }
  });
  
  // Simplified WhatsApp number registration - just enter your phone and user ID
  app.post(`${apiPrefix}/whatsapp/link-number`, async (req: Request, res: Response) => {
    try {
      const { phoneNumber, userId } = req.body;
      
      if (!phoneNumber || !userId) {
        return res.status(400).json({ error: 'Phone number and user ID are required' });
      }
      
      // Normalize and standardize phone number format
      let normalizedPhone = phoneNumber.trim();
      if (normalizedPhone.startsWith('whatsapp:')) {
        normalizedPhone = normalizedPhone.replace('whatsapp:', '').trim();
      }
      
      // Make sure it has a + prefix for international format
      const standardizedPhone = normalizedPhone.startsWith('+') 
        ? normalizedPhone 
        : `+${normalizedPhone}`;
      
      console.log(`⭐️ Linking phone ${standardizedPhone} to user ID: ${userId}`);
      
      // Check if this phone is already registered
      const existingUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, standardizedPhone)
      });
      
      if (existingUser) {
        // Update the existing record
        await db.update(whatsappUsers)
          .set({ 
            userId: userId,
            active: true,
            lastMessageSentAt: new Date()
          })
          .where(eq(whatsappUsers.phoneNumber, standardizedPhone));
          
        console.log(`⭐️ Updated existing WhatsApp user - changed user ID from ${existingUser.userId} to ${userId}`);
      } else {
        // Create a new record
        const [newUser] = await db.insert(whatsappUsers).values({
          userId: userId,
          phoneNumber: standardizedPhone,
          active: true,
          lastMessageSentAt: new Date()
        }).returning();
        
        console.log(`⭐️ Created new WhatsApp user: ${JSON.stringify(newUser)}`);
      }
      
      res.status(200).json({ 
        success: true, 
        message: `Your phone number ${standardizedPhone} has been linked to user ID ${userId}` 
      });
    } catch (error) {
      console.error('Error linking WhatsApp number:', error);
      res.status(500).json({ error: 'Failed to link WhatsApp number' });
    }
  });
  
  // Simple endpoint to get the current user's ID
  app.get(`${apiPrefix}/current-user`, async (req: Request, res: Response) => {
    try {
      // Get the current user ID
      const userId = req.user?.id || 0;
      const isAuthenticated = req.isAuthenticated();
      
      console.log(`⭐️ Current user ID check: ${userId} (authenticated: ${isAuthenticated})`);
      
      res.json({
        userId,
        isAuthenticated,
        sessionData: req.session
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get current user' });
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
      
      console.log(`Registering WhatsApp DotSpark for: ${phoneNumber}`);
      
      // Register directly without verification
      const result = await registerWhatsAppUser(userId, phoneNumber);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Your DotSpark is now activated. You can now chat with it directly through WhatsApp."
        });
      } else {
        res.status(400).json({ success: false, error: result.message });
      }
    } catch (err) {
      console.error("WhatsApp direct registration error:", err);
      res.status(500).json({ success: false, error: 'Failed to register for WhatsApp DotSpark' });
    }
  });

  return httpServer;
}