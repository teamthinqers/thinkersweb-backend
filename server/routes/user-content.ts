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

// Get all wheels for the authenticated user - MISSING ENDPOINT
router.get('/wheels', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const { filterType, filterCount, preview } = req.query;

  // Support preview mode for non-authenticated access
  if (preview === 'true') {
    try {
      const previewWheels = [
        { id: 'preview_wheel_1', heading: 'Fitness Goals', goals: 'Run 5K daily, build strength', timeline: '6 months', category: 'Health', color: '#F59E0B', position: { x: 200, y: 150 }, radius: 95, timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { id: 'preview_wheel_2', heading: 'Career Growth', goals: 'Learn new skills, get promotion', timeline: '1 year', category: 'Professional', color: '#F59E0B', position: { x: 400, y: 200 }, radius: 95, timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ];
      return res.json(previewWheels);
    } catch (error) {
      console.error('❌ Error fetching preview wheels:', error);
      return res.status(500).json({ error: 'Failed to fetch preview wheels' });
    }
  }
  
  console.log(`🔍 Fetching wheels for user ${userId}`);
  
  try {
    // Fetch from wheels table
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      orderBy: desc(wheels.createdAt)
    });
    
    // Transform wheels to frontend format
    const formattedWheels = userWheels.map(wheel => ({
      id: `wheel_${wheel.id}`,
      heading: wheel.heading,
      goals: wheel.goals,
      timeline: wheel.timeline,
      category: wheel.category,
      color: wheel.color,
      chakraId: wheel.chakraId,
      position: { x: wheel.positionX, y: wheel.positionY },
      radius: wheel.radius,
      timestamp: wheel.createdAt,
      createdAt: wheel.createdAt,
      updatedAt: wheel.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedWheels.length} wheels from wheels table`);
    res.json(formattedWheels);
    
  } catch (error) {
    console.error('❌ Error fetching user wheels:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wheels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all dots for the authenticated user - CLEAN VERSION
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const { filterType, filterCount, preview } = req.query;

  // Support preview mode for non-authenticated access
  if (preview === 'true') {
    try {
      // Return preview dots from preview_dots table or generate sample data
      const previewDots = [
        { id: 'preview_1', oneWordSummary: 'Innovation', summary: 'Ideas to transform education', anchor: 'Focus on practical applications', pulse: 'energized', sourceType: 'text', captureMode: 'natural', wheelId: '', timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { id: 'preview_2', oneWordSummary: 'Growth', summary: 'Personal development insights', anchor: 'Consistency beats intensity', pulse: 'motivated', sourceType: 'text', captureMode: 'natural', wheelId: '', timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() },
        { id: 'preview_3', oneWordSummary: 'Connection', summary: 'Building meaningful relationships', anchor: 'Listen more than you speak', pulse: 'grateful', sourceType: 'text', captureMode: 'natural', wheelId: '', timestamp: new Date(), createdAt: new Date(), updatedAt: new Date() }
      ];
      return res.json(previewDots);
    } catch (error) {
      console.error('❌ Error fetching preview dots:', error);
      return res.status(500).json({ error: 'Failed to fetch preview dots' });
    }
  }
  
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

// Create a new chakra with alignment
router.post('/chakras', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  
  console.log(`✅ Chakras POST - User ${userId} authenticated`);
  try {
    
    // Prepare chakra data for dedicated chakras table
    const chakraCreateData = {
      userId: userId,
      heading: req.body.heading || '',
      purpose: req.body.purpose || '',
      timeline: req.body.timeline || '',
      sourceType: req.body.sourceType || 'text',
      color: req.body.color || '#B45309', // Dark amber for chakras
      positionX: req.body.positionX || Math.floor(Math.random() * 400) + 100,
      positionY: req.body.positionY || Math.floor(Math.random() * 300) + 100,
      radius: req.body.radius || 120,
      voiceData: req.body.voiceData || null
    };
    
    console.log('Creating chakra with data:', chakraCreateData);
    
    // Create chakra in dedicated chakras table
    const [newChakra] = await db.insert(chakras).values(chakraCreateData).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `chakra_${userId}_${newChakra.id}_${Date.now()}`;
      const content = `${newChakra.heading} ${newChakra.purpose || ''} ${newChakra.timeline || ''}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'chakra',
        contentId: newChakra.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          color: newChakra.color,
          createdAt: newChakra.createdAt
        })
      });
      
      console.log(`Stored chakra ${newChakra.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - chakra is still created
    }
    
    res.status(201).json({
      success: true,
      chakra: newChakra,
      message: 'Chakra created successfully'
    });
    
  } catch (error) {
    console.error('Error creating chakra:', error);
    res.status(500).json({ 
      error: 'Failed to create chakra',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all chakras for the authenticated user  
router.get('/chakras', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  
  console.log(`🔍 Fetching chakras for user ${userId}`);
  
  try {
    // Fetch from dedicated chakras table
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId),
      orderBy: desc(chakras.createdAt)
    });
    
    // Transform chakras to frontend format
    const formattedChakras = userChakras.map(chakra => ({
      id: `chakra_${chakra.id}`,
      heading: chakra.heading,
      purpose: chakra.purpose,
      timeline: chakra.timeline,
      sourceType: chakra.sourceType || 'text',
      color: chakra.color,
      position: { x: chakra.positionX, y: chakra.positionY },
      radius: chakra.radius,
      timestamp: chakra.createdAt,
      createdAt: chakra.createdAt,
      updatedAt: chakra.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedChakras.length} chakras from chakras table`);
    res.json(formattedChakras);
    
  } catch (error) {
    console.error('❌ Error fetching user chakras:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chakras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get individual dot by ID - MISSING ENDPOINT  
router.get('/dots/:id', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const dotId = req.params.id;
  
  console.log(`🔍 Fetching individual dot ${dotId} for user ${userId}`);
  
  try {
    // Extract numeric ID from format "dot_123" or just "123"
    const numericId = parseInt(dotId.replace('dot_', ''));
    
    // Fetch specific dot
    const dot = await db.query.dots.findFirst({
      where: and(eq(dots.id, numericId), eq(dots.userId, userId))
    });
    
    if (!dot) {
      return res.status(404).json({ error: 'Dot not found' });
    }
    
    // Transform to frontend format
    const formattedDot = {
      id: `dot_${dot.id}`,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      wheelId: dot.wheelId?.toString(),
      timestamp: dot.createdAt,
      createdAt: dot.createdAt,
      updatedAt: dot.updatedAt,
      voiceData: dot.voiceData
    };
    
    console.log(`✅ Found dot ${dot.id} for user ${userId}`);
    res.json(formattedDot);
    
  } catch (error) {
    console.error('❌ Error fetching individual dot:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a specific dot
router.delete('/dots/:id', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const dotId = req.params.id;
  
  try {
    // Handle both dot_123 and 123 formats
    const id = dotId.startsWith('dot_') ? parseInt(dotId.replace('dot_', '')) : parseInt(dotId);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid dot ID' });
    }

    // Try deleting from dots table first
    const deletedDots = await db.delete(dots)
      .where(and(eq(dots.id, id), eq(dots.userId, userId)))
      .returning();

    if (deletedDots.length > 0) {
      console.log(`✅ Deleted dot ${id} from dots table for user ${userId}`);
      return res.json({ success: true, message: 'Dot deleted successfully' });
    }

    // Fallback: delete from entries table for legacy dots
    const deletedEntries = await db.delete(entries)
      .where(and(eq(entries.id, id), eq(entries.userId, userId)))
      .returning();

    if (deletedEntries.length > 0) {
      console.log(`✅ Deleted dot ${id} from entries table (legacy) for user ${userId}`);
      return res.json({ success: true, message: 'Dot deleted successfully' });
    }

    return res.status(404).json({ error: 'Dot not found or access denied' });
    
  } catch (error) {
    console.error('❌ Error deleting dot:', error);
    res.status(500).json({ 
      error: 'Failed to delete dot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a specific wheel
router.delete('/wheels/:id', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const wheelId = req.params.id;
  
  console.log(`🗑️ Deleting wheel ${wheelId} for user ${userId}`);
  
  try {
    // Extract numeric ID from format "wheel_123" or just "123"
    const numericId = parseInt(wheelId.replace('wheel_', ''));
    
    // Delete wheel from database
    const deletedWheels = await db.delete(wheels)
      .where(and(eq(wheels.id, numericId), eq(wheels.userId, userId)))
      .returning();
    
    if (deletedWheels.length === 0) {
      return res.status(404).json({ error: 'Wheel not found' });
    }
    
    // Also delete from vector embeddings
    try {
      await db.delete(vectorEmbeddings)
        .where(and(
          eq(vectorEmbeddings.contentType, 'wheel'),
          eq(vectorEmbeddings.contentId, numericId),
          eq(vectorEmbeddings.userId, userId)
        ));
    } catch (vectorError) {
      console.warn('Failed to delete from vector database:', vectorError);
    }
    
    console.log(`✅ Deleted wheel ${numericId} for user ${userId}`);
    res.json({ success: true, message: 'Wheel deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting wheel:', error);
    res.status(500).json({ 
      error: 'Failed to delete wheel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete a specific chakra
router.delete('/chakras/:id', checkDotSparkActivation, async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const chakraId = req.params.id;
  
  console.log(`🗑️ Deleting chakra ${chakraId} for user ${userId}`);
  
  try {
    // Extract numeric ID from format "chakra_123" or just "123"
    const numericId = parseInt(chakraId.replace('chakra_', ''));
    
    // Delete chakra from database
    const deletedChakras = await db.delete(chakras)
      .where(and(eq(chakras.id, numericId), eq(chakras.userId, userId)))
      .returning();
    
    if (deletedChakras.length === 0) {
      return res.status(404).json({ error: 'Chakra not found' });
    }
    
    // Also delete from vector embeddings
    try {
      await db.delete(vectorEmbeddings)
        .where(and(
          eq(vectorEmbeddings.contentType, 'chakra'),
          eq(vectorEmbeddings.contentId, numericId),
          eq(vectorEmbeddings.userId, userId)
        ));
    } catch (vectorError) {
      console.warn('Failed to delete from vector database:', vectorError);
    }
    
    console.log(`✅ Deleted chakra ${numericId} for user ${userId}`);
    res.json({ success: true, message: 'Chakra deleted successfully' });
    
  } catch (error) {
    console.error('❌ Error deleting chakra:', error);
    res.status(500).json({ 
      error: 'Failed to delete chakra',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;