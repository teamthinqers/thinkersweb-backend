import express from 'express';
import { db } from '@db';
import { dots, wheels, vectorEmbeddings, insertDotSchema, insertWheelSchema, insertVectorEmbeddingSchema } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// Check if user has DotSpark activated (placeholder for now)
const checkDotSparkActivation = (req: any, res: any, next: any) => {
  // TODO: Implement actual DotSpark activation check
  // For now, allow all authenticated users
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Create a new dot with Pinecone storage
router.post('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate input data
    const dotData = insertDotSchema.parse({
      ...req.body,
      userId
    });
    
    // Create dot in database
    const [newDot] = await db.insert(dots).values(dotData).returning();
    
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
    const userId = req.user.id;
    
    // Validate input data
    const wheelData = insertWheelSchema.parse({
      ...req.body,
      userId
    });
    
    // Create wheel in database
    const [newWheel] = await db.insert(wheels).values(wheelData).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `wheel_${userId}_${newWheel.id}_${Date.now()}`;
      const content = `${newWheel.name} ${newWheel.heading || ''} ${newWheel.goals || newWheel.purpose || ''} ${newWheel.timeline || ''}`;
      
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

// Get user's dots (excluding preview data)
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt),
      with: {
        wheel: true
      }
    });
    
    res.json(userDots);
    
  } catch (error) {
    console.error('Error fetching user dots:', error);
    res.status(500).json({ error: 'Failed to fetch dots' });
  }
});

// Get user's wheels and chakras (excluding preview data)
router.get('/wheels', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      orderBy: desc(wheels.createdAt),
      with: {
        dots: true,
        chakra: true,
        childWheels: true
      }
    });
    
    res.json(userWheels);
    
  } catch (error) {
    console.error('Error fetching user wheels:', error);
    res.status(500).json({ error: 'Failed to fetch wheels' });
  }
});

// Get user's content statistics
router.get('/stats', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get counts
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId)
    });
    
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    });
    
    const regularWheels = userWheels.filter(w => w.chakraId !== null);
    const chakras = userWheels.filter(w => w.chakraId === null);
    
    res.json({
      totalDots: userDots.length,
      totalWheels: regularWheels.length,
      totalChakras: chakras.length,
      freeDots: userDots.filter(d => !d.wheelId).length,
      lastActivity: userDots.length > 0 ? userDots[0]?.createdAt : null
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete user's dot
router.delete('/dots/:id', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
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