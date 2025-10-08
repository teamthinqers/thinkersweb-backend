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
  insertDotSchema,
  insertWheelSchema,
  insertChakraSchema
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
import { eq, inArray, and, lt, desc, sql } from "drizzle-orm";
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
import { initializeVectorDB } from './vector-db';
import { vectorIntegration } from './vector-integration';
import { setupVectorAPI } from './routes/vector-api';

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
      
      const { fullName, headline, linkedinUrl } = req.body;
      const avatarFile = req.file;
      
      // Build update object using Drizzle schema field names
      const updates: any = {
        updatedAt: new Date(),
      };
      
      if (fullName) updates.fullName = fullName;
      if (headline) updates.linkedinHeadline = headline;
      if (linkedinUrl) updates.linkedinProfileUrl = linkedinUrl;
      
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
      
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
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

  return httpServer;
}