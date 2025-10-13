import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  entries,
  users, 
  whatsappOtpVerifications,
  whatsappUsers,
  wheels,
  dots,
  chakras,
  categories,
  vectorEmbeddings,
  conversationSessions,
  thoughts,
  insertDotSchema,
  insertWheelSchema,
  insertChakraSchema,
  badges,
  userBadges,
  notifications,
  sparks,
  savedThoughts,
  perspectivesMessages,
  perspectivesThreads,
  cognitiveIdentity,
  thinqCircles,
  thinqCircleMembers,
  thinqCircleInvites,
  circleDots,
  circleSparks,
  circlePerspectives
} from "@shared/schema";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { connectionsService } from "./connections";
import { db } from "@db";
import { setupNewAuth, requireAuth } from "./auth-new";
import { 
  setupDotSparkRoutes, 
  trackUserBehavior
} from "./dotspark-activation";
import { 
  initializeIntelligentContext,
  storeInVectorDB,
  getIntelligentContext,
  generateIntelligentChatResponse,
  getUserContextSummary
} from "./intelligent-context";
import { continueOrganizeThoughts } from "./routes/organize-thoughts";
import { 
  extractWhatsAppMessage, 
  processWhatsAppMessage, 
  registerWhatsAppUser,
  unregisterWhatsAppUser,
  getWhatsAppStatus,
} from "./whatsapp";
import { eq, inArray, and, or, lt, desc, sql, count } from "drizzle-orm";
import twilio from "twilio";
import multer from "multer";
import path from "path";
import fs from "fs";
import whatsappWebhookRouter from "./whatsapp-webhook";
import { calculateGridPositions } from "./grid-positioning";
import { advancedChatEngine } from './advanced-chat';
import { intelligentFeatures } from './intelligent-features';
import vectorSearchRouter from './routes/vector-search';
import indexingRouter from './routes/indexing';
import userContentRouter from './routes/user-content';
import socialRouter from './routes/social';
import thoughtsRouter from './routes/thoughts';
import notificationsRouter from './routes/notifications';
import notificationsSimpleRouter from './routes/notifications-simple';
import { initializeVectorDB } from './vector-db';
import { vectorIntegration } from './vector-integration';
import { setupVectorAPI } from './routes/vector-api';
import { notifyBadgeUnlock } from './notification-helpers';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: Express.User;
  file?: Express.Multer.File;
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
  setupNewAuth(app);
  
  // Serve uploaded files
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));
  
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const multerStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });
  
  // Profile update endpoint
  app.post(`${apiPrefix}/profile/update`, requireAuth, upload.single('avatar'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { fullName, headline, linkedinUrl, bio } = req.body;
      const avatarFile = req.file;
      
      // Build update object using Drizzle schema field names
      const updates: any = {
        updatedAt: new Date(),
      };
      
      if (fullName) updates.fullName = fullName;
      if (headline) updates.linkedinHeadline = headline;
      if (linkedinUrl) updates.linkedinProfileUrl = linkedinUrl;
      if (bio !== undefined) updates.bio = bio; // Allow empty string to clear bio
      
      if (avatarFile) {
        // Save avatar path to database
        const avatarPath = `/uploads/avatars/${avatarFile.filename}`;
        updates.avatar = avatarPath;
        updates.linkedinPhotoUrl = avatarPath; // Update LinkedIn photo URL too
      }
      
      // Update user in database
      await db.update(users)
        .set(updates)
        .where(eq(users.id, userId));
      
      // Fetch updated user data and refresh session
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      if (updatedUser && req.user) {
        // Update session with fresh user data
        req.user.fullName = updatedUser.fullName;
        req.user.linkedinHeadline = updatedUser.linkedinHeadline;
        req.user.linkedinProfileUrl = updatedUser.linkedinProfileUrl;
        req.user.avatar = updatedUser.avatar;
        req.user.linkedinPhotoUrl = updatedUser.linkedinPhotoUrl;
        req.user.bio = updatedUser.bio;
        
        // Save the updated session and wait for it to complete
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('Session save error:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      
      res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Search users by name (authenticated endpoint)
  app.get(`${apiPrefix}/users/search`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.json({ success: true, users: [] });
      }
      
      // Search users by name (case-insensitive, partial match)
      const searchResults = await db.query.users.findMany({
        where: sql`LOWER(${users.fullName}) LIKE LOWER(${`%${query}%`})`,
        columns: {
          id: true,
          fullName: true,
          linkedinHeadline: true,
          linkedinPhotoUrl: true,
          avatar: true,
        },
        limit: 10,
      });
      
      res.json({ success: true, users: searchResults });
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  });

  // Get user profile by ID (public endpoint for viewing other users' profiles)
  app.get(`${apiPrefix}/users/:userId`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Fetch user profile (only public fields - no email or sensitive data)
      const userProfile = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          fullName: true,
          linkedinHeadline: true,
          linkedinProfileUrl: true,
          linkedinPhotoUrl: true,
          avatar: true,
          aboutMe: true,
          cognitiveIdentityPublic: true,
        }
      });
      
      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ success: true, user: userProfile });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Update user's About Me
  app.patch(`${apiPrefix}/users/about-me`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { aboutMe } = req.body;

      await db.update(users)
        .set({ 
          aboutMe, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      res.json({ success: true, message: 'About Me updated successfully' });
    } catch (error) {
      console.error('Error updating About Me:', error);
      res.status(500).json({ error: 'Failed to update About Me' });
    }
  });

  // Update cognitive identity privacy setting
  app.patch(`${apiPrefix}/users/cognitive-identity-privacy`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { isPublic } = req.body;

      await db.update(users)
        .set({ 
          cognitiveIdentityPublic: isPublic, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      res.json({ success: true, message: 'Privacy setting updated successfully' });
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      res.status(500).json({ error: 'Failed to update privacy setting' });
    }
  });

  // === BADGE SYSTEM ROUTES ===

  // Get all available badges
  app.get(`${apiPrefix}/badges`, async (req: Request, res: Response) => {
    try {
      const allBadges = await db.query.badges.findMany({
        orderBy: (badges, { asc }) => [asc(badges.tier), asc(badges.createdAt)],
      });
      
      res.json({ success: true, badges: allBadges });
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Get user's badges with status (earned/locked)
  app.get(`${apiPrefix}/users/:userId/badges`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Get all badges
      const allBadges = await db.query.badges.findMany({
        orderBy: (badges, { asc }) => [asc(badges.tier), asc(badges.createdAt)],
      });

      // Get user's earned badges
      const earnedBadges = await db.query.userBadges.findMany({
        where: eq(userBadges.userId, userId),
        with: {
          badge: true,
        },
      });

      // Create a map of earned badge IDs
      const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId));
      const earnedBadgeMap = new Map(earnedBadges.map(ub => [ub.badgeId, ub.earnedAt]));

      // Combine all badges with earned status
      const badgesWithStatus = allBadges.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id),
        earnedAt: earnedBadgeMap.get(badge.id) || null,
      }));

      res.json({ success: true, badges: badgesWithStatus });
    } catch (error) {
      console.error('Error fetching user badges:', error);
      res.status(500).json({ error: 'Failed to fetch user badges' });
    }
  });

  // Get user's pending badge notifications
  app.get(`${apiPrefix}/badges/pending`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get unnotified badges
      const pendingBadges = await db.query.userBadges.findMany({
        where: and(
          eq(userBadges.userId, userId),
          eq(userBadges.notified, false)
        ),
        with: {
          badge: true,
        },
      });

      res.json({ success: true, badges: pendingBadges });
    } catch (error) {
      console.error('Error fetching pending badges:', error);
      res.status(500).json({ error: 'Failed to fetch pending badges' });
    }
  });

  // Mark badge as notified
  app.patch(`${apiPrefix}/badges/:userBadgeId/notified`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const userBadgeId = parseInt(req.params.userBadgeId);
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (isNaN(userBadgeId)) {
        return res.status(400).json({ error: 'Invalid badge ID' });
      }

      // Update badge notification status
      await db.update(userBadges)
        .set({ notified: true })
        .where(and(
          eq(userBadges.id, userBadgeId),
          eq(userBadges.userId, userId)
        ));

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking badge as notified:', error);
      res.status(500).json({ error: 'Failed to update badge status' });
    }
  });

  // Award a badge to a user (internal helper function, can also be used via API)
  async function awardBadge(userId: number, badgeKey: string): Promise<boolean> {
    try {
      // Find the badge by key
      const badge = await db.query.badges.findFirst({
        where: eq(badges.badgeKey, badgeKey),
      });

      if (!badge) {
        console.error(`Badge with key "${badgeKey}" not found`);
        return false;
      }

      // Check if user already has this badge
      const existing = await db.query.userBadges.findFirst({
        where: and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badge.id)
        ),
      });

      if (existing) {
        return false; // Already has badge
      }

      // Award the badge
      await db.insert(userBadges).values({
        userId,
        badgeId: badge.id,
        notified: false,
      });

      // Create a notification for the badge unlock using the helper
      await notifyBadgeUnlock(userId, badge.id);

      console.log(`Badge "${badgeKey}" awarded to user ${userId} with notification created`);
      return true;
    } catch (error) {
      console.error(`Error awarding badge "${badgeKey}" to user ${userId}:`, error);
      return false;
    }
  }

  // Expose awardBadge function for use in other routes
  (app as any).awardBadge = awardBadge;
  
  // Setup DotSpark activation routes
  setupDotSparkRoutes(app);
  
  // Initialize intelligent context system
  initializeIntelligentContext();

  // DotSpark WhatsApp Chatbot Endpoints
  
  // Use the WhatsApp Business API webhook router for all WhatsApp webhook requests
  app.use(`${apiPrefix}/whatsapp/webhook`, whatsappWebhookRouter);

  // Register a phone number for DotSpark WhatsApp chatbot
  app.post(`${apiPrefix}/whatsapp/register`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
  app.post(`${apiPrefix}/whatsapp/unregister`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
  app.get(`${apiPrefix}/whatsapp/status`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
  app.post(`${apiPrefix}/whatsapp/direct-register`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
      
      // Add DotSpark activation status to response
      // For authenticated users, DotSpark is always activated
      let dotSparkActivated = !!req.session?.userId;
      let subscriptionTier = 'free';
      
      response.dotSparkActivated = dotSparkActivated;
      response.subscriptionTier = subscriptionTier;
      
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

  // Enhanced Intelligent Chat Context API - Requires DotSpark activation
  app.post(`${apiPrefix}/chat/intelligent`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    
    try {
      const userId = req.user?.id;
      const { message, conversationHistory = [], sessionId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Use intelligent context system for enhanced chat
      const response = await generateIntelligentChatResponse(
        userId,
        message,
        conversationHistory,
        sessionId
      );

      // Store conversation in vector database for future context
      await storeInVectorDB(userId, 'conversation', Date.now(), message, {
        sessionId,
        responseLength: response.response.length,
        contextUsed: {
          dotsCount: response.relatedContent.dots.length,
          wheelsCount: response.relatedContent.wheels.length,
          chakrasCount: response.relatedContent.chakras.length
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`Intelligent chat response generated in ${responseTime}ms for user ${userId}`);
      
      res.status(200).json({
        reply: response.response,
        responseTime,
        dotSparkActivated: true,
        context: response.context,
        suggestedActions: response.suggestedActions,
        relatedContent: {
          dotsCount: response.relatedContent.dots.length,
          wheelsCount: response.relatedContent.wheels.length,
          chakrasCount: response.relatedContent.chakras.length,
          relevantDots: response.relatedContent.dots.slice(0, 3),
          relevantWheels: response.relatedContent.wheels.slice(0, 2),
          relevantChakras: response.relatedContent.chakras.slice(0, 2)
        }
      });
    } catch (error) {
      console.error('Error in intelligent chat endpoint:', error);
      res.status(500).json({ 
        error: 'Failed to generate intelligent response',
        fallback: 'Please try the regular chat endpoint'
      });
    }
  });

  // Get user context summary for intelligent features
  app.get(`${apiPrefix}/context/summary`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const summary = await getUserContextSummary(userId);
      
      res.json({
        userId,
        ...summary,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting user context summary:', error);
      res.status(500).json({ error: 'Failed to retrieve user context' });
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
  
  // Enhanced dots endpoint with DotSpark activation and intelligent tracking
  app.post(`${apiPrefix}/dots`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
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

      // Store in vector database for intelligent retrieval
      const vectorContent = `${summary} ${anchor} ${pulse}`;
      await storeInVectorDB(userId, 'dot', newDot.id, vectorContent, {
        oneWordSummary,
        sourceType,
        dotType: 'three-layer'
      });

      // Track dot creation behavior
      await trackUserBehavior(userId, 'dot_created', 'dot', newDot.id, {
        oneWordSummary,
        sourceType,
        dotType: 'three-layer',
        hasVoiceData: sourceType === 'voice'
      });

      console.log(`✅ Dot created successfully: ID ${newDot.id} for user ${userId} with DotSpark activation`);

      res.status(201).json(newDot);
    } catch (error) {
      console.error('Error creating dot:', error);
      res.status(500).json({ error: 'Failed to create dot' });
    }
  });

  // Get dots for dashboard - supports both real and preview modes
  app.get(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const isPreview = req.query.preview === 'true';
      
      if (isPreview) {
        // Return preview dots from preview_dots table
        const previewDotsData = await db.execute(sql`
          SELECT id, summary, anchor, pulse, wheel_id, source_type, capture_mode, position_x, position_y, created_at
          FROM preview_dots 
          ORDER BY created_at DESC
        `);
        
        const previewDots = previewDotsData.rows.map((dot: any) => ({
          id: dot.id.toString(),
          oneWordSummary: dot.summary.split(' ')[0] || 'Insight',
          summary: dot.summary,
          anchor: dot.anchor,
          pulse: dot.pulse,
          sourceType: dot.source_type,
          captureMode: dot.capture_mode,
          timestamp: dot.created_at,
          wheelId: dot.wheel_id?.toString() || undefined,
          position: { x: dot.position_x, y: dot.position_y },
          voiceData: null
        }));
        
        return res.json(previewDots);
      }
      
      // Real mode - requires authentication
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Additional security: check if user is trying to access bypass data in production
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Security: Only block if explicitly mixed modes are detected
      const isExplicitDemoRequest = req.headers['x-demo-mode'] === 'true';
      const isBypassUser = user.firebaseUid?.includes('bypass');
      
      // Block bypass users trying to access production data (only if explicitly requested)
      if (isBypassUser && isExplicitDemoRequest === false) {
        console.log('Bypass user attempting production access - allowing for compatibility');
      }
      
      // Block production users trying to access demo data (only if explicitly requested)
      if (!isBypassUser && isExplicitDemoRequest === true) {
        return res.status(403).json({ error: 'Production users cannot access demo mode' });
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
            if (!entry.content) return false;
            const parsed = JSON.parse(entry.content);
            return parsed.dotType === 'three-layer';
          } catch {
            return false;
          }
        })
        .map(entry => {
          const parsed = JSON.parse(entry.content || '{}');
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
        
        const dotData = {
          userId,
          oneWordSummary,
          summary: dotProposal.summary,
          anchor: dotProposal.anchor,
          pulse: dotProposal.pulse,
          sourceType: 'text',
          captureMode: 'ai',
        };
        
        const [newDot] = await db.insert(dots).values(dotData).returning();
        
        // Store in vector database for intelligent retrieval
        try {
          await vectorIntegration.storeDotInVector(newDot.id, userId);
        } catch (error) {
          console.error('Failed to store dot in vector database:', error);
        }
        
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
      
      // Create the Chakra in the dedicated chakras table
      const chakraData = {
        userId,
        heading,
        purpose, // Maps to the 'purpose' field in the chakras table
        timeline,
        sourceType,
        color: '#B45309', // Dark amber color for Chakras
        positionX: Math.floor(Math.random() * 400) + 100,
        positionY: Math.floor(Math.random() * 400) + 100,
      };
      
      const newChakraResult = await db.insert(chakras).values(chakraData).returning();
      const newChakra = Array.isArray(newChakraResult) ? newChakraResult[0] : newChakraResult;
      
      // Store in vector database for intelligent retrieval
      try {
        await vectorIntegration.storeChakraInVector(newChakra.id, userId);
      } catch (error) {
        console.error('Failed to store chakra in vector database:', error);
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Chakra created successfully',
        chakra: {
          id: newChakra.id,
          heading: newChakra.heading,
          purpose: newChakra.purpose,
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
      
      // Store in vector database for intelligent retrieval
      try {
        await vectorIntegration.storeWheelInVector(newWheel.id, userId);
      } catch (error) {
        console.error('Failed to store wheel in vector database:', error);
      }
      
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

  // GET wheels endpoint - supports both real and preview modes
  app.get(`${apiPrefix}/wheels`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const isPreview = req.query.preview === 'true';
      
      if (isPreview) {
        // Return preview wheels from preview_wheels table
        const previewWheelsData = await db.execute(sql`
          SELECT id, name, heading, goals, purpose, timeline, category, color, chakra_id, position_x, position_y, radius, created_at
          FROM preview_wheels 
          ORDER BY created_at DESC
        `);
        
        const previewWheels = previewWheelsData.rows.map((wheel: any) => ({
          id: wheel.id.toString(),
          name: wheel.name,
          heading: wheel.heading,
          goals: wheel.goals,
          purpose: wheel.purpose, // For chakras (top-level wheels)
          timeline: wheel.timeline,
          category: wheel.category,
          color: wheel.color,
          dots: [], // Dots will be loaded separately
          connections: [],
          position: { x: wheel.position_x, y: wheel.position_y },
          radius: wheel.radius,
          chakraId: wheel.chakra_id?.toString() || undefined,
          createdAt: wheel.created_at
        }));
        
        return res.json(previewWheels);
      }
      
      // Real mode - requires authentication for user-specific data
      const userId = req.user?.id || req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
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
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const isPreview = req.query.preview === 'true';
      
      if (isPreview) {
        // Return preview mode data with proper hierarchical positioning
        // Business chakra centered at (400, 300)
        const chakraCenter = { x: 400, y: 300 };
        const chakraRadius = 210; // Half of 420px diameter for preview mode
        
        // Position 3 wheels inside the chakra in triangular arrangement
        const wheel1 = { x: chakraCenter.x - 80, y: chakraCenter.y - 60 }; // GTM Strategy (top-left)
        const wheel2 = { x: chakraCenter.x + 80, y: chakraCenter.y - 60 }; // Leadership (top-right)  
        const wheel3 = { x: chakraCenter.x, y: chakraCenter.y + 80 };     // Product (bottom)
        
        // Position dots inside each wheel with frontend naming convention
        const wheelRadius = 50;
        
        // GTM Strategy wheel dots (5 dots) - using frontend naming pattern
        const gtmDots = [
          { id: 'preview-dot-0-0', x: wheel1.x + Math.cos(0) * 30, y: wheel1.y + Math.sin(0) * 30 },
          { id: 'preview-dot-0-1', x: wheel1.x + Math.cos(1.26) * 30, y: wheel1.y + Math.sin(1.26) * 30 },
          { id: 'preview-dot-0-2', x: wheel1.x + Math.cos(2.51) * 30, y: wheel1.y + Math.sin(2.51) * 30 },
          { id: 'preview-dot-0-3', x: wheel1.x + Math.cos(3.77) * 30, y: wheel1.y + Math.sin(3.77) * 30 },
          { id: 'preview-dot-0-4', x: wheel1.x + Math.cos(5.03) * 30, y: wheel1.y + Math.sin(5.03) * 30 }
        ];
        
        // Leadership wheel dots (4 dots)
        const leadershipDots = [
          { id: 'preview-dot-1-0', x: wheel2.x + Math.cos(0) * 25, y: wheel2.y + Math.sin(0) * 25 },
          { id: 'preview-dot-1-1', x: wheel2.x + Math.cos(1.57) * 25, y: wheel2.y + Math.sin(1.57) * 25 },
          { id: 'preview-dot-1-2', x: wheel2.x + Math.cos(3.14) * 25, y: wheel2.y + Math.sin(3.14) * 25 },
          { id: 'preview-dot-1-3', x: wheel2.x + Math.cos(4.71) * 25, y: wheel2.y + Math.sin(4.71) * 25 }
        ];
        
        // Product Innovation wheel dots (3 dots)  
        const productDots = [
          { id: 'preview-dot-2-0', x: wheel3.x + Math.cos(0) * 25, y: wheel3.y + Math.sin(0) * 25 },
          { id: 'preview-dot-2-1', x: wheel3.x + Math.cos(2.09) * 25, y: wheel3.y + Math.sin(2.09) * 25 },
          { id: 'preview-dot-2-2', x: wheel3.x + Math.cos(4.19) * 25, y: wheel3.y + Math.sin(4.19) * 25 }
        ];
        
        // Health wheel dots (positioned within their respective wheels)
        // Health Chakra is at position (1300, 250) with radius ~210px
        const healthChakraCenter = { x: 1300, y: 250 };
        
        // Fitness wheel (top-left in health chakra)
        const fitnessWheel = { x: healthChakraCenter.x - 50, y: healthChakraCenter.y - 80 };
        const fitnessRadius = 30;
        const fitnessDots = [
          { id: 'preview-dot-health-1-0', x: fitnessWheel.x + Math.cos(0) * fitnessRadius, y: fitnessWheel.y + Math.sin(0) * fitnessRadius },
          { id: 'preview-dot-health-1-1', x: fitnessWheel.x + Math.cos(1.57) * fitnessRadius, y: fitnessWheel.y + Math.sin(1.57) * fitnessRadius },
          { id: 'preview-dot-health-1-2', x: fitnessWheel.x + Math.cos(3.14) * fitnessRadius, y: fitnessWheel.y + Math.sin(3.14) * fitnessRadius },
          { id: 'preview-dot-health-1-3', x: fitnessWheel.x + Math.cos(4.71) * fitnessRadius, y: fitnessWheel.y + Math.sin(4.71) * fitnessRadius }
        ];
        
        // Nutrition wheel (top-right in health chakra)
        const nutritionWheel = { x: healthChakraCenter.x + 50, y: healthChakraCenter.y - 80 };
        const nutritionDots = [
          { id: 'preview-dot-health-2-0', x: nutritionWheel.x + Math.cos(0) * 25, y: nutritionWheel.y + Math.sin(0) * 25 },
          { id: 'preview-dot-health-2-1', x: nutritionWheel.x + Math.cos(2.09) * 25, y: nutritionWheel.y + Math.sin(2.09) * 25 },
          { id: 'preview-dot-health-2-2', x: nutritionWheel.x + Math.cos(4.19) * 25, y: nutritionWheel.y + Math.sin(4.19) * 25 }
        ];
        
        // Mental wellness wheel (bottom center in health chakra)
        const mentalWheel = { x: healthChakraCenter.x, y: healthChakraCenter.y + 80 };
        const mentalDots = [
          { id: 'preview-dot-health-3-0', x: mentalWheel.x + Math.cos(0) * fitnessRadius, y: mentalWheel.y + Math.sin(0) * fitnessRadius },
          { id: 'preview-dot-health-3-1', x: mentalWheel.x + Math.cos(1.57) * fitnessRadius, y: mentalWheel.y + Math.sin(1.57) * fitnessRadius },
          { id: 'preview-dot-health-3-2', x: mentalWheel.x + Math.cos(3.14) * fitnessRadius, y: mentalWheel.y + Math.sin(3.14) * fitnessRadius },
          { id: 'preview-dot-health-3-3', x: mentalWheel.x + Math.cos(4.71) * fitnessRadius, y: mentalWheel.y + Math.sin(4.71) * fitnessRadius }
        ];
        
        const healthDots = [...fitnessDots, ...nutritionDots, ...mentalDots];
        
        // Individual scattered dots - spread across grid avoiding main structures
        const scatteredDots = [
          { id: 'scattered-1', x: 800, y: 120 },  // Top-right corner
          { id: 'scattered-2', x: 950, y: 180 },  // Far right
          { id: 'scattered-3', x: 850, y: 350 },  // Bottom-right
          { id: 'scattered-4', x: 120, y: 450 },  // Bottom-left
          { id: 'scattered-5', x: 750, y: 500 },  // Bottom-center
          { id: 'scattered-6', x: 50, y: 320 },   // Left edge
          { id: 'scattered-7', x: 900, y: 280 },  // Right side
          { id: 'scattered-8', x: 180, y: 80 },   // Top-left area
          { id: 'scattered-9', x: 1050, y: 400 }, // Far bottom-right
          { id: 'scattered-10', x: 600, y: 50 }   // Top edge
        ];
        
        // Combine all dot positions
        const allDots = [...gtmDots, ...leadershipDots, ...productDots, ...healthDots, ...scatteredDots];
        const dotPositions = allDots.reduce((acc, dot) => {
          acc[dot.id] = { x: dot.x, y: dot.y };
          return acc;
        }, {} as Record<string, { x: number; y: number }>);
        
        const previewPositions = {
          dotPositions,
          wheelPositions: {
            'preview-wheel-0': wheel1, // GTM Strategy 
            'preview-wheel-1': wheel2, // Leadership Development
            'preview-wheel-2': wheel3  // Product Innovation
          },
          chakraPositions: {
            'preview-chakra-business': chakraCenter
          },
          statistics: {
            totalDots: 22,
            totalWheels: 3,
            totalChakras: 1,
            freeDots: 15 // Health (5) + Scattered dots (10)
          }
        };
        
        return res.json({
          success: true,
          data: previewPositions
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
            if (!entry.content) return false;
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
      const conversationHistory: Array<{role: "user" | "system" | "assistant", content: string, timestamp: Date}> = [];
      
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
        userId ? String(userId) : undefined,
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
  
  // Use the user content router for authenticated user-generated content
  app.use(`${apiPrefix}/user-content`, userContentRouter);
  
  // Mount social feed routes for the thought cloud (legacy)
  app.use(`${apiPrefix}/social`, requireAuth, socialRouter);
  
  // Mount new thoughts system routes - PUBLIC for social feed, protected endpoints handle auth internally
  app.use(`${apiPrefix}/thoughts`, thoughtsRouter);
  
  // Mount notifications system routes - authentication handled internally like thoughts
  app.use(`${apiPrefix}/notifications`, notificationsRouter);
  
  // Mount simplified notifications endpoint with better session handling
  app.use(`${apiPrefix}/notifications-simple`, notificationsSimpleRouter);

  // ===========================
  // MAPPING ROUTES
  // ===========================

  // PUT /api/mapping/dot-to-wheel - Map/unmap dot to wheel
  app.put(`${apiPrefix}/mapping/dot-to-wheel`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { dotId, wheelId } = req.body;
      
      if (!dotId) {
        return res.status(400).json({ error: 'dotId is required' });
      }

      console.log(`Mapping dot ${dotId} to wheel ${wheelId || 'null (unmap)'} for user ${userId}`);

      // Handle both integer and string dot IDs (entries have string IDs like "entry_123")
      let result: any[] = [];
      
      // Try dots table first (integer IDs)
      if (/^\d+$/.test(dotId)) {
        result = await db.update(dots)
          .set({ 
            wheelId: wheelId ? parseInt(wheelId) : null,
            updatedAt: new Date()
          })
          .where(and(
            eq(dots.id, parseInt(dotId)),
            eq(dots.userId, parseInt(userId.toString()))
          ))
          .returning();
      }
      
      // If not found in dots table, try entries table (string IDs like "entry_234")
      if (result.length === 0 && dotId.startsWith('entry_')) {
        const entryId = parseInt(dotId.replace('entry_', ''));
        const entryResult = await db.query.entries.findFirst({
          where: and(eq(entries.id, entryId), eq(entries.userId, parseInt(userId.toString())))
        });
        
        if (entryResult) {
          try {
            const content = JSON.parse(entryResult.content || '{}');
            content.wheelId = wheelId;
            
            await db.update(entries)
              .set({ content: JSON.stringify(content), updatedAt: new Date() })
              .where(and(eq(entries.id, entryId), eq(entries.userId, parseInt(userId.toString()))));
            
            result = [{ id: dotId, wheelId, success: true }];
          } catch (parseError) {
            console.error('Failed to parse entry content:', parseError);
          }
        }
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }

      console.log('Dot mapping updated successfully:', result[0]);

      return res.json({ 
        success: true, 
        message: wheelId ? 'Dot mapped to wheel successfully' : 'Dot unmapped successfully',
        dot: result[0] 
      });

    } catch (error) {
      console.error('Error mapping dot to wheel:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/mapping/wheel-to-chakra - Map/unmap wheel to chakra  
  app.put(`${apiPrefix}/mapping/wheel-to-chakra`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { wheelId, chakraId } = req.body;
      
      if (!wheelId) {
        return res.status(400).json({ error: 'wheelId is required' });
      }

      console.log(`Mapping wheel ${wheelId} to chakra ${chakraId || 'null (unmap)'} for user ${userId}`);

      // Update wheel's chakraId (null to unmap, chakraId to map)
      const result = await db.update(wheels)
        .set({ 
          chakraId: chakraId ? parseInt(chakraId) : null,
          updatedAt: new Date()
        })
        .where(and(
          eq(wheels.id, parseInt(wheelId)),
          eq(wheels.userId, parseInt(userId.toString()))
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Wheel not found or unauthorized' });
      }

      console.log('Wheel mapping updated successfully:', result[0]);

      return res.json({ 
        success: true, 
        message: chakraId ? 'Wheel mapped to chakra successfully' : 'Wheel unmapped successfully',
        wheel: result[0] 
      });

    } catch (error) {
      console.error('Error mapping wheel to chakra:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/mapping/dot-to-chakra - Map/unmap dot directly to chakra (long-term vision alignment)
  app.put(`${apiPrefix}/mapping/dot-to-chakra`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { dotId, chakraId } = req.body;
      
      if (!dotId) {
        return res.status(400).json({ error: 'dotId is required' });
      }

      console.log(`Direct mapping dot ${dotId} to chakra ${chakraId || 'null (unmap)'} for user ${userId}`);

      // First, get the current dot to preserve wheelId when unmapping
      const currentDot = await db.query.dots.findFirst({
        where: and(
          eq(dots.id, parseInt(dotId)),
          eq(dots.userId, parseInt(userId.toString()))
        )
      });

      if (!currentDot) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }

      // Update dot's chakraId (null to unmap, chakraId to map)
      // If mapping to chakra, remove wheelId to avoid conflicts
      // If unmapping from chakra, preserve existing wheelId
      const result = await db.update(dots)
        .set({ 
          chakraId: chakraId ? parseInt(chakraId) : null,
          wheelId: chakraId ? null : currentDot.wheelId, // Clear wheelId when mapping to chakra, preserve when unmapping
          updatedAt: new Date()
        })
        .where(and(
          eq(dots.id, parseInt(dotId)),
          eq(dots.userId, parseInt(userId.toString()))
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }

      console.log('Dot-to-chakra mapping updated successfully:', result[0]);

      return res.json({ 
        success: true, 
        message: chakraId ? 'Dot mapped directly to chakra successfully' : 'Dot unmapped from chakra successfully',
        dot: result[0] 
      });

    } catch (error) {
      console.error('Error mapping dot to chakra:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Mount indexing routes for comprehensive cognitive structure indexing
  app.use(`${apiPrefix}/indexing`, indexingRouter);
  
  // Mount indexing demo routes
  const indexingDemoRouter = await import('./routes/indexing-demo');
  app.use(`${apiPrefix}/indexing`, indexingDemoRouter.default);
  
  // Register vector integration API
  setupVectorAPI(app, apiPrefix);

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
  // VOICE TRANSCRIPTION
  // ==========================================

  // Voice transcription endpoint using OpenAI Whisper
  app.post(`${apiPrefix}/transcribe-voice`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { audio, layer } = req.body;
      
      if (!audio) {
        return res.status(400).json({ error: 'Audio data is required' });
      }
      
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audio, 'base64');
      
      // Import the OpenAI voice processing function
      const { processVoiceInput } = await import('./openai.js');
      
      // Process the voice input with appropriate layer context
      const result = await processVoiceInput(audioBuffer, 'voice.wav', layer || 'summary');
      
      res.json({
        success: true,
        transcription: result.processedText,
        rawTranscription: result.transcription
      });
      
    } catch (error) {
      console.error('Voice transcription error:', error);
      res.status(500).json({ 
        error: 'Failed to transcribe voice recording' 
      });
    }
  });

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
  app.post(`${apiPrefix}/intelligence/classify`, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return await classifyContent(req, res);
  });
  
  // Confirm classification and save to grid
  app.post(`${apiPrefix}/intelligence/confirm-and-save`, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return await confirmAndSave(req, res);
  });
  
  // Get contextual suggestions based on user content
  app.get(`${apiPrefix}/intelligence/suggestions`, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return await getContextualSuggestions(req, res);
  });

  // Vector DB initialization moved to post-startup for faster deployment

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

  // Get user dashboard data (landing page)
  app.get(`${apiPrefix}/dashboard`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { calculateNeuralStrength } = await import('./neural-strength');

      // Get neural strength data
      const neuralStrength = await calculateNeuralStrength(userId);

      // Get counts for dots, wheels, chakras
      const [dotsCount] = await db.select({ count: count() }).from(dots).where(eq(dots.userId, userId));
      const [wheelsCount] = await db.select({ count: count() }).from(wheels).where(eq(wheels.userId, userId));
      const [chakrasCount] = await db.select({ count: count() }).from(chakras).where(eq(chakras.userId, userId));

      // Calculate collective growth percentage (platform-wide)
      // Formula: Each item (thoughts + sparks + perspectives) contributes 0.5% towards growth, capped at 100%
      // Count social thoughts (visibility='social' OR sharedToSocial=true) - must match display logic
      const [platformThoughtsCount] = await db.select({ count: count() }).from(thoughts).where(or(
        eq(thoughts.visibility, 'social'),
        eq(thoughts.sharedToSocial, true)
      ));
      // Count sparks where users saved sparks on OTHER people's social thoughts (social engagement metric)
      const platformSparksResult = await db
        .select({ count: count() })
        .from(sparks)
        .innerJoin(thoughts, eq(sparks.thoughtId, thoughts.id))
        .where(and(
          or(
            eq(thoughts.visibility, 'social'),
            eq(thoughts.sharedToSocial, true)
          ),
          sql`${sparks.userId} != ${thoughts.userId}` // Spark owner is different from thought owner
        ));
      const platformSparksCount = platformSparksResult[0] || { count: 0 };
      
      // Count perspectives on social thoughts (visibility='social' OR sharedToSocial=true, excluding soft-deleted)
      const platformPerspectivesResult = await db
        .select({ count: count() })
        .from(perspectivesMessages)
        .innerJoin(perspectivesThreads, eq(perspectivesMessages.threadId, perspectivesThreads.id))
        .innerJoin(thoughts, eq(perspectivesThreads.thoughtId, thoughts.id))
        .where(and(
          or(
            eq(thoughts.visibility, 'social'),
            eq(thoughts.sharedToSocial, true)
          ),
          eq(perspectivesMessages.isDeleted, false)
        ));
      const platformPerspectivesCount = platformPerspectivesResult[0] || { count: 0 };
      
      const totalPlatformItems = (platformThoughtsCount?.count || 0) + 
                                  (platformSparksCount?.count || 0) + 
                                  (platformPerspectivesCount?.count || 0);
      const collectiveGrowthPercentage = Math.min(100, Math.round(totalPlatformItems * 0.5));

      // Get recent activity (last 5 items across all types)
      const recentDots = await db.query.dots.findMany({
        where: eq(dots.userId, userId),
        orderBy: desc(dots.createdAt),
        limit: 5,
      });

      const recentWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
        orderBy: desc(wheels.createdAt),
        limit: 5,
      });

      const recentThoughts = await db.query.thoughts.findMany({
        where: and(
          eq(thoughts.userId, userId),
          eq(thoughts.visibility, 'social')
        ),
        orderBy: desc(thoughts.createdAt),
        limit: 5,
      });

      // Count MyNeura thoughts (personal thoughts + saved social thoughts)
      const [personalThoughtsCount] = await db.select({ count: count() })
        .from(thoughts)
        .where(and(
          eq(thoughts.userId, userId),
          eq(thoughts.visibility, 'personal')
        ));
      
      const [savedSocialThoughtsCount] = await db.select({ count: count() })
        .from(savedThoughts)
        .where(eq(savedThoughts.userId, userId));
      
      const myNeuraThoughtsCount = (personalThoughtsCount?.count || 0) + (savedSocialThoughtsCount?.count || 0);

      // Count personal sparks (sparks on user's own thoughts only)
      const personalSparksResult = await db
        .select({ count: count() })
        .from(sparks)
        .innerJoin(thoughts, eq(sparks.thoughtId, thoughts.id))
        .where(and(
          eq(sparks.userId, userId),
          eq(thoughts.userId, userId)
        ));
      const personalSparksCount = personalSparksResult[0]?.count || 0;

      // Combine and sort all recent activity
      const recentActivity = [
        ...recentDots.map(d => ({ type: 'dot', data: d, timestamp: d.createdAt })),
        ...recentWheels.map(w => ({ type: 'wheel', data: w, timestamp: w.createdAt })),
        ...recentThoughts.map(t => ({ type: 'thought', data: t, timestamp: t.createdAt })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      res.json({
        success: true,
        data: {
          neuralStrength,
          collectiveGrowth: {
            percentage: collectiveGrowthPercentage,
          },
          stats: {
            dots: dotsCount?.count || 0,
            wheels: wheelsCount?.count || 0,
            chakras: chakrasCount?.count || 0,
            thoughts: neuralStrength.stats.thoughtsCount,
            savedSparks: neuralStrength.stats.userSparksCount,
            perspectives: neuralStrength.stats.perspectivesCount,
          },
          // MyNeura-specific stats (for MyNeura box and toolbar)
          myNeuraStats: {
            thoughts: Number(myNeuraThoughtsCount),
            sparks: Number(personalSparksCount),
          },
          // Platform-wide stats for Social Neura box (collective brain)
          socialStats: {
            thoughts: platformThoughtsCount?.count || 0,
            sparks: platformSparksCount?.count || 0,
            perspectives: platformPerspectivesCount?.count || 0,
          },
          recentActivity,
        },
      });

    } catch (error) {
      console.error('Dashboard data error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Save cognitive identity configuration
  app.post(`${apiPrefix}/cognitive-identity/configure`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const configData = req.body;

      // Check if user already has a cognitive identity configuration
      const existing = await db.query.cognitiveIdentity.findFirst({
        where: eq(cognitiveIdentity.userId, userId)
      });

      let result;
      if (existing) {
        // Update existing configuration
        [result] = await db.update(cognitiveIdentity)
          .set({
            ...configData,
            updatedAt: new Date()
          })
          .where(eq(cognitiveIdentity.userId, userId))
          .returning();
      } else {
        // Create new configuration
        [result] = await db.insert(cognitiveIdentity)
          .values({
            userId,
            ...configData
          })
          .returning();
      }

      // Mark cognitive identity as completed
      await db.update(users)
        .set({
          cognitiveIdentityCompleted: true,
          cognitiveIdentityCompletedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Cognitive identity configuration error:', error);
      res.status(500).json({ 
        error: 'Failed to save cognitive identity configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get cognitive identity configuration
  app.get(`${apiPrefix}/cognitive-identity/config`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const config = await db.query.cognitiveIdentity.findFirst({
        where: eq(cognitiveIdentity.userId, userId)
      });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          cognitiveIdentityCompleted: true
        }
      });

      res.json({
        success: true,
        data: config,
        configured: user?.cognitiveIdentityCompleted || false
      });

    } catch (error) {
      console.error('Get cognitive identity configuration error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cognitive identity configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get public user dashboard data (for public profiles)
  app.get(`${apiPrefix}/users/:userId/dashboard`, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { calculateNeuralStrength } = await import('./neural-strength');

      // Get neural strength data for the user
      const neuralStrength = await calculateNeuralStrength(userId);

      // Get counts for dots, wheels, chakras
      const [dotsCount] = await db.select({ count: count() }).from(dots).where(eq(dots.userId, userId));
      const [wheelsCount] = await db.select({ count: count() }).from(wheels).where(eq(wheels.userId, userId));
      const [chakrasCount] = await db.select({ count: count() }).from(chakras).where(eq(chakras.userId, userId));

      res.json({
        success: true,
        data: {
          neuralStrength,
          stats: {
            dots: dotsCount?.count || 0,
            wheels: wheelsCount?.count || 0,
            chakras: chakrasCount?.count || 0,
            thoughts: neuralStrength.stats.thoughtsCount,
            savedSparks: neuralStrength.stats.userSparksCount,
            perspectives: neuralStrength.stats.perspectivesCount,
          },
        },
      });

    } catch (error) {
      console.error('Public dashboard data error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's cognitive identity (respects privacy settings)
  app.get(`${apiPrefix}/users/:userId/cognitive-identity`, async (req: Request, res: Response) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      const requestingUserId = (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).session?.userId;

      if (!targetUserId || isNaN(targetUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if viewing own profile
      const isOwnProfile = requestingUserId === targetUserId;

      // Get user's privacy setting
      const user = await db.query.users.findFirst({
        where: eq(users.id, targetUserId),
        columns: {
          cognitiveIdentityPublic: true,
          cognitiveIdentityCompleted: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if cognitive identity is accessible
      const isPublic = user.cognitiveIdentityPublic;
      if (!isOwnProfile && !isPublic) {
        return res.json({
          success: true,
          data: null,
          isPublic: false,
          configured: user.cognitiveIdentityCompleted
        });
      }

      // Fetch cognitive identity
      const config = await db.query.cognitiveIdentity.findFirst({
        where: eq(cognitiveIdentity.userId, targetUserId)
      });

      res.json({
        success: true,
        data: config,
        isPublic: isPublic,
        configured: user.cognitiveIdentityCompleted || false
      });

    } catch (error) {
      console.error('Get user cognitive identity error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch cognitive identity',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== THINQ CIRCLES API ROUTES =====

  // Create a new ThinQ Circle
  app.post(`${apiPrefix}/thinq-circles`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { name, description } = req.body;

      if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: 'Circle name must be at least 3 characters' });
      }

      // Create circle
      const [circle] = await db.insert(thinqCircles).values({
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: userId,
      }).returning();

      // Add creator as owner
      await db.insert(thinqCircleMembers).values({
        circleId: circle.id,
        userId: userId,
        role: 'owner',
      });

      res.json({
        success: true,
        circle,
      });

    } catch (error) {
      console.error('Create ThinQ Circle error:', error);
      res.status(500).json({ 
        error: 'Failed to create circle',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search users (autocomplete for invites)
  app.get(`${apiPrefix}/users/search`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.json({ success: true, users: [] });
      }

      const searchTerm = `%${query.trim()}%`;
      
      const foundUsers = await db.query.users.findMany({
        where: or(
          sql`${users.fullName} ILIKE ${searchTerm}`,
          sql`${users.email} ILIKE ${searchTerm}`
        ),
        columns: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          linkedinPhotoUrl: true,
        },
        limit: 10,
      });

      res.json({
        success: true,
        users: foundUsers,
      });

    } catch (error) {
      console.error('User search error:', error);
      res.status(500).json({ 
        error: 'Failed to search users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Invite members to circle (both existing users and email invites)
  app.post(`${apiPrefix}/thinq-circles/:circleId/invite`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circleId = parseInt(req.params.circleId);
      const { existingUserIds, emailInvites } = req.body; // existingUserIds: number[], emailInvites: string[]

      // Verify user is circle owner or member
      const membership = await db.query.thinqCircleMembers.findFirst({
        where: and(
          eq(thinqCircleMembers.circleId, circleId),
          eq(thinqCircleMembers.userId, userId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this circle' });
      }

      const circle = await db.query.thinqCircles.findFirst({
        where: eq(thinqCircles.id, circleId),
      });

      if (!circle) {
        return res.status(404).json({ error: 'Circle not found' });
      }

      const results = {
        existingUsers: [] as any[],
        emailInvites: [] as any[],
      };

      // Invite existing users
      if (existingUserIds && existingUserIds.length > 0) {
        for (const inviteeUserId of existingUserIds) {
          // Check if already a member
          const existingMember = await db.query.thinqCircleMembers.findFirst({
            where: and(
              eq(thinqCircleMembers.circleId, circleId),
              eq(thinqCircleMembers.userId, inviteeUserId)
            ),
          });

          if (existingMember) {
            results.existingUsers.push({ userId: inviteeUserId, status: 'already_member' });
            continue;
          }

          // Create invite
          const token = `circle_${circleId}_${inviteeUserId}_${Date.now()}`;
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          const [invite] = await db.insert(thinqCircleInvites).values({
            circleId,
            inviterUserId: userId,
            inviteeEmail: '', // Will be filled from user lookup
            inviteeUserId: inviteeUserId,
            token,
            expiresAt,
          }).returning();

          // Create notification
          await db.insert(notifications).values({
            recipientId: inviteeUserId,
            actorIds: JSON.stringify([userId]),
            notificationType: 'circle_invite',
            circleInviteId: invite.id,
            circleName: circle.name,
          });

          results.existingUsers.push({ userId: inviteeUserId, status: 'invited', inviteId: invite.id });
        }
      }

      // Email invites for non-users
      if (emailInvites && emailInvites.length > 0) {
        for (const email of emailInvites) {
          // Check if email belongs to existing user
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (existingUser) {
            results.emailInvites.push({ email, status: 'user_exists', userId: existingUser.id });
            continue;
          }

          // Create invite with token
          const crypto = await import('crypto');
          const token = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

          const [invite] = await db.insert(thinqCircleInvites).values({
            circleId,
            inviterUserId: userId,
            inviteeEmail: email,
            token,
            expiresAt,
          }).returning();

          // TODO: Send email with magic link
          const inviteLink = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/join-circle?token=${token}`;
          console.log(`\n🔗 Circle Invite Link for ${email}:\n${inviteLink}\n`);

          results.emailInvites.push({ email, status: 'invited', inviteId: invite.id, inviteLink });
        }
      }

      res.json({
        success: true,
        results,
      });

    } catch (error) {
      console.error('Invite to circle error:', error);
      res.status(500).json({ 
        error: 'Failed to send invites',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's circles
  app.get(`${apiPrefix}/thinq-circles/my-circles`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circles = await db.query.thinqCircleMembers.findMany({
        where: eq(thinqCircleMembers.userId, userId),
        with: {
          circle: {
            with: {
              creator: {
                columns: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  linkedinPhotoUrl: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        circles: circles.map(m => ({
          ...m.circle,
          role: m.role,
        })),
      });

    } catch (error) {
      console.error('Get circles error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch circles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Accept circle invite
  app.post(`${apiPrefix}/thinq-circles/invites/:inviteId/accept`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const inviteId = parseInt(req.params.inviteId);

      const invite = await db.query.thinqCircleInvites.findFirst({
        where: eq(thinqCircleInvites.id, inviteId),
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invite not found' });
      }

      if (invite.inviteeUserId !== userId) {
        return res.status(403).json({ error: 'This invite is not for you' });
      }

      if (invite.status !== 'pending') {
        return res.status(400).json({ error: 'Invite already processed' });
      }

      if (new Date() > invite.expiresAt) {
        await db.update(thinqCircleInvites)
          .set({ status: 'expired' })
          .where(eq(thinqCircleInvites.id, inviteId));
        return res.status(400).json({ error: 'Invite expired' });
      }

      // Add to circle
      await db.insert(thinqCircleMembers).values({
        circleId: invite.circleId,
        userId: userId,
        role: 'member',
      });

      // Update invite status
      await db.update(thinqCircleInvites)
        .set({ 
          status: 'accepted',
          claimedAt: new Date(),
        })
        .where(eq(thinqCircleInvites.id, inviteId));

      // Mark notification as read
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.circleInviteId, inviteId));

      res.json({
        success: true,
        circleId: invite.circleId,
      });

    } catch (error) {
      console.error('Accept invite error:', error);
      res.status(500).json({ 
        error: 'Failed to accept invite',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Reject circle invite
  app.post(`${apiPrefix}/thinq-circles/invites/:inviteId/reject`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const inviteId = parseInt(req.params.inviteId);

      const invite = await db.query.thinqCircleInvites.findFirst({
        where: eq(thinqCircleInvites.id, inviteId),
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invite not found' });
      }

      if (invite.inviteeUserId !== userId) {
        return res.status(403).json({ error: 'This invite is not for you' });
      }

      // Update invite status
      await db.update(thinqCircleInvites)
        .set({ status: 'rejected' })
        .where(eq(thinqCircleInvites.id, inviteId));

      // Mark notification as read
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.circleInviteId, inviteId));

      res.json({
        success: true,
      });

    } catch (error) {
      console.error('Reject invite error:', error);
      res.status(500).json({ 
        error: 'Failed to reject invite',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Validate invite token (public endpoint)
  app.get(`${apiPrefix}/thinq-circles/invites/validate/:token`, async (req: Request, res: Response) => {
    try {
      const token = req.params.token;

      const invite = await db.query.thinqCircleInvites.findFirst({
        where: eq(thinqCircleInvites.token, token),
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invite not found' });
      }

      // Get circle name and inviter name
      const circle = await db.query.thinqCircles.findFirst({
        where: eq(thinqCircles.id, invite.circleId),
      });

      const inviter = await db.query.users.findFirst({
        where: eq(users.id, invite.inviterUserId),
      });

      res.json({
        success: true,
        invite: {
          id: invite.id,
          circleId: invite.circleId,
          circleName: circle?.name || 'Unknown Circle',
          inviterName: inviter?.fullName || 'Someone',
          inviteeEmail: invite.inviteeEmail,
          status: invite.status,
          expiresAt: invite.expiresAt,
        },
      });

    } catch (error) {
      console.error('Validate invite error:', error);
      res.status(500).json({ 
        error: 'Failed to validate invite',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get circle details with members
  app.get(`${apiPrefix}/thinq-circles/:circleId`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circleId = parseInt(req.params.circleId);

      // Verify user is a member
      const membership = await db.query.thinqCircleMembers.findFirst({
        where: and(
          eq(thinqCircleMembers.circleId, circleId),
          eq(thinqCircleMembers.userId, userId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this circle' });
      }

      const circle = await db.query.thinqCircles.findFirst({
        where: eq(thinqCircles.id, circleId),
        with: {
          creator: {
            columns: {
              id: true,
              fullName: true,
              avatar: true,
              linkedinPhotoUrl: true,
            },
          },
          members: {
            with: {
              user: {
                columns: {
                  id: true,
                  fullName: true,
                  email: true,
                  avatar: true,
                  linkedinPhotoUrl: true,
                },
              },
            },
          },
        },
      });

      if (!circle) {
        return res.status(404).json({ error: 'Circle not found' });
      }

      // Get counts
      const [dotsCount] = await db.select({ count: count() })
        .from(circleDots)
        .where(eq(circleDots.circleId, circleId));

      const [sparksCount] = await db.select({ count: count() })
        .from(circleSparks)
        .where(eq(circleSparks.circleId, circleId));

      res.json({
        success: true,
        circle: {
          ...circle,
          stats: {
            dots: dotsCount?.count || 0,
            sparks: sparksCount?.count || 0,
            members: circle.members.length,
          },
        },
      });

    } catch (error) {
      console.error('Get circle details error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch circle details',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get circle thoughts
  app.get(`${apiPrefix}/thinq-circles/:circleId/thoughts`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circleId = parseInt(req.params.circleId);

      // Verify user is a member
      const membership = await db.query.thinqCircleMembers.findFirst({
        where: and(
          eq(thinqCircleMembers.circleId, circleId),
          eq(thinqCircleMembers.userId, userId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this circle' });
      }

      // Fetch thoughts shared to this circle
      const circleThoughts = await db.query.circleDots.findMany({
        where: eq(circleDots.circleId, circleId),
        with: {
          thought: {
            with: {
              user: {
                columns: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  linkedinPhotoUrl: true,
                },
              },
            },
          },
          sharedByUser: {
            columns: {
              id: true,
              fullName: true,
              avatar: true,
              linkedinPhotoUrl: true,
            },
          },
        },
        orderBy: desc(circleDots.sharedAt),
      });

      // Transform to thought format
      const thoughts = circleThoughts.map(cd => ({
        ...cd.thought,
        sharedBy: cd.sharedByUser,
        sharedAt: cd.sharedAt,
      }));

      res.json({
        thoughts,
      });

    } catch (error) {
      console.error('Get circle thoughts error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch circle thoughts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create and share thought to circle
  app.post(`${apiPrefix}/thinq-circles/:circleId/create-thought`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circleId = parseInt(req.params.circleId);
      const { heading, summary, emotions, anchor } = req.body;

      // Verify user is a member
      const membership = await db.query.thinqCircleMembers.findFirst({
        where: and(
          eq(thinqCircleMembers.circleId, circleId),
          eq(thinqCircleMembers.userId, userId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this circle' });
      }

      // Validate input
      if (!heading || !summary) {
        return res.status(400).json({ error: 'Heading and summary are required' });
      }

      // Create the thought
      const [thought] = await db.insert(thoughts).values({
        userId,
        heading: heading.trim(),
        summary: summary.trim(),
        emotions: emotions?.trim() || null,
        anchor: anchor?.trim() || null,
        visibility: 'personal',
        channel: 'circle',
        sharedToSocial: false,
      }).returning();

      // Share to circle
      await db.insert(circleDots).values({
        circleId,
        thoughtId: thought.id,
        sharedBy: userId,
      });

      res.json({
        success: true,
        thought,
      });

    } catch (error) {
      console.error('Create circle thought error:', error);
      res.status(500).json({ 
        error: 'Failed to create thought',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Share existing thought to circle
  app.post(`${apiPrefix}/thinq-circles/:circleId/share-thought`, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const circleId = parseInt(req.params.circleId);
      const { thoughtId } = req.body;

      if (!thoughtId) {
        return res.status(400).json({ error: 'Thought ID is required' });
      }

      // Verify user is a member
      const membership = await db.query.thinqCircleMembers.findFirst({
        where: and(
          eq(thinqCircleMembers.circleId, circleId),
          eq(thinqCircleMembers.userId, userId)
        ),
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this circle' });
      }

      // Verify thought exists and user owns it
      const thought = await db.query.thoughts.findFirst({
        where: eq(thoughts.id, thoughtId),
      });

      if (!thought) {
        return res.status(404).json({ error: 'Thought not found' });
      }

      if (thought.userId !== userId) {
        return res.status(403).json({ error: 'You can only share your own thoughts' });
      }

      // Check if already shared to this circle
      const existingShare = await db.query.circleDots.findFirst({
        where: and(
          eq(circleDots.circleId, circleId),
          eq(circleDots.thoughtId, thoughtId)
        ),
      });

      if (existingShare) {
        return res.status(400).json({ error: 'Thought already shared to this circle' });
      }

      // Share to circle
      await db.insert(circleDots).values({
        circleId,
        thoughtId,
        sharedBy: userId,
      });

      res.json({
        success: true,
        message: 'Thought shared to circle successfully',
      });

    } catch (error) {
      console.error('Share thought to circle error:', error);
      res.status(500).json({ 
        error: 'Failed to share thought',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return httpServer;
}