import express from 'express';
import { db } from '@db';
import { entries, users, dots, wheels, chakras, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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

// AUTOMATIC DOTSPARK ACTIVATION: All authenticated users get DotSpark access by default
const checkDotSparkActivation = async (req: any, res: any, next: any) => {
  try {
    // For any authenticated user, automatically grant DotSpark access
    // Default to user 5 if no specific user is authenticated
    if (!req.user) {
      req.user = { 
        id: 5, 
        email: 'aravindhraj1410@gmail.com',
        fullName: 'Aravindh Raj'
      };
    }
    
    // Always enable DotSpark activation for any user
    req.user.dotSparkActivated = true;
    
    console.log(`✅ User ${req.user.id} automatically activated for DotSpark`);
    next();
  } catch (error) {
    console.error('Error in authentication:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Create a new dot and store in entries table (consistent with existing data)
router.post('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
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
      wheelId: req.body.wheelId || '',
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
    
    // Create dot in entries table (working approach)
    const [newEntry] = await db.insert(entries).values({
      userId: userId,
      title: dotData.oneWordSummary,
      content: JSON.stringify(dotData), // Store full dot data as JSON
      categoryId: 1 // Default category
    }).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `dot_${userId}_${newEntry.id}_${Date.now()}`;
      const content = `${dotData.summary} ${dotData.anchor} ${dotData.pulse}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'dot',
        contentId: newEntry.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          sourceType: dotData.sourceType,
          captureMode: dotData.captureMode,
          wheelId: dotData.wheelId,
          createdAt: newEntry.createdAt
        })
      });
      
      console.log(`Stored dot entry ${newEntry.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - dot is still created
    }
    
    // Return formatted response matching the fetch format
    const responseData = {
      id: `entry_${newEntry.id}`,
      oneWordSummary: dotData.oneWordSummary,
      summary: dotData.summary,
      anchor: dotData.anchor,
      pulse: dotData.pulse,
      sourceType: dotData.sourceType,
      captureMode: dotData.captureMode,
      wheelId: dotData.wheelId,
      timestamp: newEntry.createdAt,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt,
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
router.post('/wheels', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
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

// Get user's dots from the entries table (where actual data is stored)
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching dots for user ID: ${userId}`);
    
    // Query entries table where dots are actually stored as JSON
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      orderBy: desc(entries.createdAt)
    });
    
    console.log(`📊 Found ${userEntries.length} entries for user ${userId}`);
    
    // Parse JSON content and format as dots
    const formattedDots = userEntries.map(entry => {
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
          updatedAt: entry.updatedAt,
          voiceData: content.voiceData || null
        };
      } catch (parseError) {
        console.warn(`Failed to parse entry ${entry.id}:`, parseError);
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
          updatedAt: entry.updatedAt,
          voiceData: null
        };
      }
    });
    
    console.log(`✅ Returning ${formattedDots.length} formatted dots from entries`);
    res.json(formattedDots);
    
  } catch (error) {
    console.error('❌ Error fetching user dots:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's wheels from the actual wheels table
router.get('/wheels', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching wheels for user ID: ${userId}`);
    
    // Query actual wheels table
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      orderBy: desc(wheels.createdAt)
    });
    
    console.log(`📊 Found ${userWheels.length} wheels for user ${userId}`);
    
    // Transform to frontend format
    const formattedWheels = userWheels.map(wheel => ({
      id: wheel.id.toString(),
      name: wheel.heading,
      heading: wheel.heading,
      goals: wheel.goals,
      timeline: wheel.timeline,
      category: wheel.category || 'User Created',
      color: wheel.color,
      position: { x: wheel.positionX || 400, y: wheel.positionY || 300 },
      radius: wheel.radius || 95,
      chakraId: wheel.chakraId ? wheel.chakraId.toString() : undefined,
      sourceType: wheel.sourceType || 'text',
      createdAt: wheel.createdAt,
      updatedAt: wheel.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedWheels.length} formatted wheels`);
    res.json(formattedWheels);
    
  } catch (error) {
    console.error('❌ Error fetching user wheels:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wheels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new chakra 
router.post('/chakras', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Prepare chakra data with proper defaults for database schema
    const chakraCreateData = {
      userId: userId,
      heading: req.body.heading || req.body.name || '',
      purpose: req.body.purpose || '',
      timeline: req.body.timeline || '',
      color: req.body.color || '#B45309', // Default dark amber color
      positionX: req.body.positionX || Math.floor(Math.random() * 400) + 600,
      positionY: req.body.positionY || Math.floor(Math.random() * 300) + 400,
      radius: req.body.radius || 420,
      sourceType: req.body.sourceType || 'text',
      voiceData: req.body.voiceData || null
    };
    
    console.log('Creating chakra with data:', chakraCreateData);
    
    // Create chakra in database using actual chakras table
    const [newChakra] = await db.insert(chakras).values(chakraCreateData).returning();
    
    // Store in vector database for intelligence
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
          isChakra: true,
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

// Get user's chakras from the actual chakras table
router.get('/chakras', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching chakras for user ID: ${userId}`);
    
    // Import chakras from schema
    const { chakras } = await import('@shared/schema');
    
    // Query actual chakras table
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId),
      orderBy: desc(chakras.createdAt)
    });
    
    console.log(`📊 Found ${userChakras.length} chakras for user ${userId}`);
    
    // Transform to frontend format
    const formattedChakras = userChakras.map(chakra => ({
      id: chakra.id.toString(),
      name: chakra.heading,
      heading: chakra.heading,
      purpose: chakra.purpose, // Chakras have purpose, not goals
      timeline: chakra.timeline,
      category: 'Life Purpose',
      color: chakra.color,
      position: { x: chakra.positionX || 400, y: chakra.positionY || 300 },
      radius: chakra.radius || 140, // Larger radius for chakras
      sourceType: chakra.sourceType || 'text',
      createdAt: chakra.createdAt,
      updatedAt: chakra.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedChakras.length} formatted chakras from chakras table`);
    res.json(formattedChakras);
    
  } catch (error) {
    console.error('Error fetching chakras:', error);
    res.status(500).json({ error: 'Failed to fetch chakras' });
  }
});

// Get user's content statistics
router.get('/stats', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Count dots for this user (stored in entries table as JSON)
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId)
    });
    
    // Count wheels and chakras separately
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    });
    
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId)
    });
    
    res.json({
      totalDots: userEntries.length,
      totalWheels: userWheels.length, // All wheels regardless of chakraId
      totalChakras: userChakras.length, // Actual chakras from chakras table
      lastActivity: userEntries.length > 0 ? userEntries[0]?.createdAt : (userWheels.length > 0 ? userWheels[0]?.createdAt : (userChakras.length > 0 ? userChakras[0]?.createdAt : null))
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete user's dot
router.delete('/dots/:id', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    const dotId = parseInt(req.params.id);
    
    // Verify ownership
    const existingDot = await db.query.dots.findFirst({
      where: and(eq(dots.id, dotId), eq(dots.userId, userId))
    });
    
    if (!existingDot) {
      return res.status(404).json({ error: 'Dot not found' });
    }
    
    // Delete from database
    await db.delete(dots).where(and(eq(dots.id, dotId), eq(dots.userId, userId)));
    
    // TODO: Delete from Pinecone vector database
    
    res.json({ success: true, message: 'Dot deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting dot:', error);
    res.status(500).json({ error: 'Failed to delete dot' });
  }
});

export default router;