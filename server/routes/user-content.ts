import express from 'express';
import { db } from '@db';
import { entries, users, dots, wheels, chakras, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc, sql, inArray, isNotNull } from 'drizzle-orm';
import { z } from 'zod';

// Schema removed - using direct validation for entries table format

const insertWheelSchema = z.object({
  name: z.string(),
  heading: z.string().optional(),
  goals: z.string().optional(),
  purpose: z.string().optional(),
  timeline: z.string().optional(),
  category: z.string(),
  color: z.string(),
  chakraId: z.string().optional(),
  userId: z.number()
});

const router = express.Router();

// ENHANCED AUTHENTICATION CHECK: Support both Firebase and session auth
const checkDotSparkActivation = async (req: any, res: any, next: any) => {
  try {
    // Check multiple auth sources - req.user (Passport/Firebase) or req.session.userId (session)
    let userId = req.user?.id || req.session?.userId;
    let user = req.user;
    
    if (!userId) {
      console.log('❌ Authentication failed - no user ID found');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to access DotSpark features'
      });
    }
    
    // If we only have userId from session, fetch full user data
    if (!user && userId) {
      try {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
        
        if (dbUser) {
          user = {
            id: dbUser.id,
            username: dbUser.username || '',
            email: dbUser.email,
            firebaseUid: dbUser.firebaseUid,
            fullName: dbUser.fullName || dbUser.username || 'User',
            bio: dbUser.bio,
            avatarUrl: dbUser.avatar,
            createdAt: dbUser.createdAt,
            updatedAt: dbUser.updatedAt
          };
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
    
    // Ensure req.user is set for consistency
    req.user = user || { id: userId };
    
    // Enable DotSpark activation for authenticated users (simplified for smooth UX)
    req.user.dotSparkActivated = true;
    
    console.log(`✅ Authenticated user ${userId} accessing DotSpark`);
    next();
  } catch (error) {
    console.error('Error in authentication check:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Create a new dot and store in entries table (consistent with existing data)
router.post('/dots', async (req, res) => {
  // Enhanced authentication - check all sources
  let userId = req.user?.id || req.session?.userId;
  if (!userId && req.headers['x-user-id']) {
    userId = parseInt(req.headers['x-user-id'] as string);
  }
  
  if (!userId) {
    console.log('❌ Dots POST - Authentication failed');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please sign in to create dots'
    });
  }
  
  console.log(`✅ Dots POST - User ${userId} authenticated`);
  try {
    
    // Check if user wants raw mode (no AI processing)
    const rawMode = req.body.rawMode === true || req.body.captureMode === 'raw';
    
    // Validate input data using simplified validation for entries format
    let dotData = {
      oneWordSummary: req.body.oneWordSummary,
      summary: req.body.summary,
      anchor: req.body.anchor || '',
      pulse: req.body.pulse,
      sourceType: req.body.sourceType || 'text',
      captureMode: rawMode ? 'raw' : (req.body.captureMode || 'natural'),
      wheelId: req.body.wheelId && req.body.wheelId !== '' ? parseInt(req.body.wheelId) : null,
      voiceData: req.body.voiceData || null,
      rawMode: rawMode
    };
    
    // If NOT in raw mode, apply automatic processing (current behavior)
    if (!rawMode) {
      // Apply character limits and processing as before
      if (dotData.summary && dotData.summary.length > 220) {
        dotData.summary = dotData.summary.substring(0, 220);
      }
      if (dotData.anchor && dotData.anchor.length > 300) {
        dotData.anchor = dotData.anchor.substring(0, 300);
      }
      if (dotData.pulse && dotData.pulse.includes(' ')) {
        dotData.pulse = dotData.pulse.split(' ')[0];
      }
    }
    // In raw mode, preserve user input exactly as provided
    
    // Generate oneWordSummary if not provided
    if (!dotData.oneWordSummary) {
      try {
        const { generateOneWordSummary } = await import('../openai.js');
        dotData.oneWordSummary = await generateOneWordSummary(dotData.summary, dotData.anchor);
      } catch (error) {
        console.error('Error generating one-word summary:', error);
        dotData.oneWordSummary = dotData.summary.split(' ')[0] || 'Insight';
      }
    }
    
    // Basic validation
    if (!dotData.oneWordSummary || !dotData.summary || !dotData.pulse) {
      return res.status(400).json({ 
        error: 'Missing required fields: oneWordSummary, summary, and pulse are required' 
      });
    }
    
    // Create dot in proper dots table
    const [newDot] = await db.insert(dots).values({
      userId: userId,
      oneWordSummary: dotData.oneWordSummary,
      summary: dotData.summary,
      anchor: dotData.anchor,
      pulse: dotData.pulse,
      sourceType: dotData.sourceType,
      captureMode: dotData.captureMode === 'raw' ? 'natural' : dotData.captureMode,
      wheelId: dotData.wheelId,
      voiceData: dotData.voiceData ? JSON.stringify(dotData.voiceData) : null
    }).returning();

    // 🧠 COMPREHENSIVE USER CONTEXT TRACKING FOR MANUAL INPUT
    try {
      const { UserContextManager } = await import('../user-context-manager');
      await UserContextManager.trackDotCreation(
        userId,
        newDot.id,
        {
          oneWordSummary: dotData.oneWordSummary,
          summary: dotData.summary,
          anchor: dotData.anchor,
          pulse: dotData.pulse,
          sourceType: dotData.sourceType,
          captureMode: dotData.captureMode === 'raw' ? 'natural' : dotData.captureMode,
          wheelId: dotData.wheelId,
          voiceData: dotData.voiceData
        },
        req.sessionID
      );
      console.log('✅ User context tracked for manual dot creation');
    } catch (contextError) {
      console.warn('⚠️ Context tracking failed:', contextError);
    }
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `dot_${userId}_${newDot.id}_${Date.now()}`;
      const content = `${dotData.summary} ${dotData.anchor} ${dotData.pulse}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'dot',
        contentId: newDot.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          sourceType: dotData.sourceType,
          captureMode: dotData.captureMode,
          wheelId: dotData.wheelId,
          createdAt: newDot.createdAt
        })
      });
      
      console.log(`Stored dot ${newDot.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - dot is still created
    }
    
    // Return formatted response matching the fetch format
    const responseData = {
      id: `dot_${newDot.id}`,
      oneWordSummary: dotData.oneWordSummary,
      summary: dotData.summary,
      anchor: dotData.anchor,
      pulse: dotData.pulse,
      sourceType: dotData.sourceType,
      captureMode: dotData.captureMode,
      wheelId: dotData.wheelId?.toString(),
      timestamp: newDot.createdAt,
      createdAt: newDot.createdAt,
      updatedAt: newDot.updatedAt,
      voiceData: dotData.voiceData
    };
    
    res.status(201).json({
      success: true,
      dot: responseData,
      message: 'Dot created successfully'
    });
    
  } catch (error) {
    console.error('Error creating dot:', error);
    res.status(500).json({ 
      error: 'Failed to create dot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new wheel with Pinecone storage
router.post('/wheels', async (req, res) => {
  // Enhanced authentication - check all sources
  let userId = req.user?.id || req.session?.userId;
  if (!userId && req.headers['x-user-id']) {
    userId = parseInt(req.headers['x-user-id'] as string);
  }
  
  if (!userId) {
    console.log('❌ Wheels POST - Authentication failed');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please sign in to create wheels'
    });
  }
  
  console.log(`✅ Wheels POST - User ${userId} authenticated`);
  try {
    
    // Prepare wheel data with proper defaults for database schema
    const wheelCreateData = {
      userId: userId,
      heading: req.body.heading || req.body.name || '',
      goals: req.body.goals || '',
      timeline: req.body.timeline || '',
      category: req.body.category || 'Personal',
      color: req.body.color || '#F59E0B', // Default amber color
      chakraId: req.body.chakraId ? parseInt(req.body.chakraId) : null,
      positionX: req.body.positionX || Math.floor(Math.random() * 400) + 100,
      positionY: req.body.positionY || Math.floor(Math.random() * 300) + 100,
      radius: req.body.radius || 95,
      sourceType: req.body.sourceType || 'text',
      voiceData: req.body.voiceData || null
    };
    
    console.log('Creating wheel with data:', wheelCreateData);
    
    // Create wheel in database using raw insert
    const [newWheel] = await db.insert(wheels).values(wheelCreateData).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `wheel_${userId}_${newWheel.id}_${Date.now()}`;
      const content = `${newWheel.heading} ${newWheel.goals || ''} ${newWheel.timeline || ''}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: newWheel.chakraId ? 'wheel' : 'chakra',
        contentId: newWheel.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          category: newWheel.category,
          color: newWheel.color,
          chakraId: newWheel.chakraId,
          isChakra: !newWheel.chakraId,
          createdAt: newWheel.createdAt
        })
      });
      
      console.log(`Stored ${newWheel.chakraId ? 'wheel' : 'chakra'} ${newWheel.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - wheel is still created
    }
    
    res.status(201).json({
      success: true,
      wheel: newWheel,
      message: `${newWheel.chakraId ? 'Wheel' : 'Chakra'} created successfully`
    });
    
  } catch (error) {
    console.error('Error creating wheel:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create wheel' });
  }
});

// Remove broken router definition

// Get all dots for the authenticated user - CLEAN VERSION
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  const userId = req.userId;
  const { filterType, filterCount } = req.query;
  
  console.log(`🔍 Fetching dots for user ${userId}`);
  console.log(`🎯 Filter params:`, { filterType, filterCount });
  
  try {
    // Build query options for dots table
    let queryOptions: any = {
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt)
    };

    // Apply filtering if specified
    if (filterType && filterCount) {
      const count = parseInt(filterCount as string) || 4;
      
      if (filterType === 'dot') {
        queryOptions.limit = count;
        
      } else if (filterType === 'wheel' || filterType === 'chakra') {
        // Get filtered wheel IDs based on type
        let filteredWheelIds: number[] = [];
        
        if (filterType === 'wheel') {
          const recentWheels = await db.query.wheels.findMany({
            where: and(eq(wheels.userId, userId), sql`${wheels.chakraId} IS NOT NULL`),
            orderBy: desc(wheels.createdAt),
            limit: count
          });
          filteredWheelIds = recentWheels.map(w => w.id);
        } else {
          // chakra filter - get chakras from dedicated table
          const recentChakras = await db.query.chakras.findMany({
            where: eq(chakras.userId, userId),
            orderBy: desc(chakras.createdAt),
            limit: count
          });
          const chakraIds = recentChakras.map(c => c.id);
          
          if (chakraIds.length > 0) {
            const associatedWheels = await db.query.wheels.findMany({
              where: and(eq(wheels.userId, userId), inArray(wheels.chakraId, chakraIds)),
              orderBy: desc(wheels.createdAt)
            });
            filteredWheelIds = associatedWheels.map(w => w.id);
          }
        }
        
        if (filteredWheelIds.length > 0) {
          queryOptions.where = and(
            eq(dots.userId, userId),
            inArray(dots.wheelId, filteredWheelIds)
          );
        } else {
          queryOptions.where = sql`1 = 0`;
        }
      }
    }

    // Fetch from dots table first (NEW SYSTEM)
    let userDots = await db.query.dots.findMany(queryOptions);
    
    // If no dots in new system, fallback to entries table for existing users
    if (userDots.length === 0) {
      console.log(`📊 No dots in dots table, checking entries table for user ${userId}`);
      
      const userEntries = await db.query.entries.findMany({
        where: eq(entries.userId, userId),
        orderBy: desc(entries.createdAt)
      });
      
      const formattedFromEntries = userEntries.map(entry => {
        try {
          const content = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
          return {
            id: `entry_${entry.id}`,
            oneWordSummary: content.oneWordSummary || entry.title || 'Untitled',
            summary: content.summary || entry.title || 'No summary',
            anchor: content.anchor || '',
            pulse: content.pulse || 'neutral',
            sourceType: content.sourceType || 'text',
            captureMode: content.captureMode || 'natural',
            wheelId: content.wheelId || '',
            timestamp: entry.createdAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          };
        } catch (parseError) {
          return {
            id: `entry_${entry.id}`,
            oneWordSummary: entry.title || 'Untitled',
            summary: entry.title || 'No summary',
            anchor: '',
            pulse: 'neutral',
            sourceType: 'text',
            captureMode: 'natural',
            wheelId: '',
            timestamp: entry.createdAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          };
        }
      });
      
      console.log(`✅ Returning ${formattedFromEntries.length} formatted dots from entries table (fallback)`);
      return res.json(formattedFromEntries);
    }

    // NEW SYSTEM: Transform dots table data to frontend format
    const formattedDots = userDots.map(dot => ({
      id: `dot_${dot.id}`,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      sourceType: dot.sourceType || 'text',
      captureMode: dot.captureMode || 'natural',
      wheelId: dot.wheelId ? dot.wheelId.toString() : '',
      timestamp: dot.createdAt,
      createdAt: dot.createdAt,
      updatedAt: dot.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedDots.length} formatted dots from dots table`);
    res.json(formattedDots);
    
  } catch (error) {
    console.error('❌ Error fetching user dots:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;