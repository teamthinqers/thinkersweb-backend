import express from 'express';
import { db } from '@db';
import { entries, users, dots, wheels, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// Define schema for dots since it's used in the routes
const insertDotSchema = z.object({
  oneWordSummary: z.string(),
  summary: z.string(),
  anchor: z.string().optional(),
  pulse: z.string(),
  sourceType: z.enum(['voice', 'text']),
  captureMode: z.enum(['natural', 'ai']),
  wheelId: z.string().optional(),
  userId: z.number(),
  voiceData: z.any().optional()
});

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

// Optimized check - use cached activation status from session
const checkDotSparkActivation = async (req: any, res: any, next: any) => {
  try {
    if (!req.user?.id) {
      console.log('❌ No user ID in request');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if activation status is already cached in session
    if (req.session?.dotSparkActivated === true) {
      console.log('✅ Using cached DotSpark activation status');
      next();
      return;
    }
    
    // If not cached, check database and cache the result
    console.log(`🔍 Checking DotSpark activation for user:`, req.user.id);
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });
    
    if (!user || !user.dotSparkActivated) {
      console.log('❌ User not found or not activated');
      return res.status(403).json({
        error: 'DotSpark activation required',
        message: 'You need to activate DotSpark to access this content',
        code: 'DOTSPARK_NOT_ACTIVATED'
      });
    }
    
    // Cache activation status in session for future requests
    req.session.dotSparkActivated = true;
    console.log('✅ User activated - cached in session for future requests');
    next();
  } catch (error) {
    console.error('Error checking DotSpark activation:', error);
    res.status(500).json({ error: 'Failed to verify activation status' });
  }
};

// Create a new dot with Pinecone storage
router.post('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate input data
    const dotData = insertDotSchema.parse({
      ...req.body,
      userId
    });
    
    // Create dot in database  
    const [newDot] = await db.insert(dots).values([dotData]).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `dot_${userId}_${newDot.id}_${Date.now()}`;
      const content = `${newDot.summary} ${newDot.anchor} ${newDot.pulse}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'dot',
        contentId: newDot.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          sourceType: newDot.sourceType,
          captureMode: newDot.captureMode,
          wheelId: newDot.wheelId,
          createdAt: newDot.createdAt
        })
      });
      
      console.log(`Stored dot ${newDot.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - dot is still created
    }
    
    res.status(201).json({
      success: true,
      dot: newDot,
      message: 'Dot created successfully'
    });
    
  } catch (error) {
    console.error('Error creating dot:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create dot' });
  }
});

// Create a new wheel with Pinecone storage
router.post('/wheels', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Validate input data
    const wheelData = insertWheelSchema.parse({
      ...req.body,
      userId
    });
    
    // Create wheel in database
    const [newWheel] = await db.insert(wheels).values([wheelData]).returning();
    
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

// Get user's dots from the actual dots table  
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching dots for user ID: ${userId}`);
    
    // Query actual dots table, not entries table
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt)
    });
    
    console.log(`📊 Found ${userDots.length} dots for user ${userId}`);
    
    // Return dots with proper formatting
    const formattedDots = userDots.map(dot => ({
      id: dot.id,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor || '',
      pulse: dot.pulse,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      wheelId: dot.wheelId,
      userId: dot.userId,
      createdAt: dot.createdAt,
      updatedAt: dot.updatedAt,
      voiceData: dot.voiceData
    }));
    
    console.log(`✅ Returning ${formattedDots.length} formatted dots`);
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
    
    // Return wheels with proper formatting
    const formattedWheels = userWheels.map(wheel => ({
      id: wheel.id,
      heading: wheel.heading,
      goals: wheel.goals,
      timeline: wheel.timeline,
      category: wheel.category,
      color: wheel.color,
      chakraId: wheel.chakraId,
      userId: wheel.userId,
      sourceType: wheel.sourceType,
      positionX: wheel.positionX,
      positionY: wheel.positionY,
      radius: wheel.radius,
      createdAt: wheel.createdAt,
      updatedAt: wheel.updatedAt,
      voiceData: wheel.voiceData
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

// Get user's content statistics
router.get('/stats', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Count dots for this user
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId)
    });
    
    // Count wheels for this user
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    });
    
    res.json({
      totalDots: userDots.length,
      totalWheels: userWheels.length,
      totalChakras: userWheels.filter(w => !w.chakraId).length, // Wheels without a parent chakra are chakras themselves
      lastActivity: userDots.length > 0 ? userDots[0]?.createdAt : (userWheels.length > 0 ? userWheels[0]?.createdAt : null)
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