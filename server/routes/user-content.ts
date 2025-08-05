import express from 'express';
import { db } from '@db';
import { entries, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// Check if user has DotSpark activated
const checkDotSparkActivation = async (req: any, res: any, next: any) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });
    
    if (!user || !user.dotSparkActivated) {
      return res.status(403).json({
        error: 'DotSpark activation required',
        message: 'You need to activate DotSpark to access this content',
        code: 'DOTSPARK_NOT_ACTIVATED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking DotSpark activation:', error);
    res.status(500).json({ error: 'Failed to verify activation status' });
  }
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

// Get user's dots from entries table (where /api/dots saves them)
router.get('/dots', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userEntries = await db.select().from(entries).where(eq(entries.userId, userId)).orderBy(desc(entries.createdAt));
    
    // Transform entries to dots format for frontend compatibility
    const userDots = userEntries.map(entry => {
      let parsedContent: any = {};
      try {
        parsedContent = JSON.parse(entry.content || '{}');
      } catch {
        parsedContent = { summary: entry.title || 'Untitled' };
      }
      
      return {
        id: entry.id,
        oneWordSummary: parsedContent.oneWordSummary || 'Note',
        summary: parsedContent.summary || entry.title || 'Untitled',
        anchor: parsedContent.anchor || '',
        pulse: parsedContent.pulse || 'neutral',
        sourceType: parsedContent.sourceType || 'text',
        captureMode: parsedContent.captureMode || 'natural',
        wheelId: 'general',
        timestamp: entry.createdAt,
        voiceData: parsedContent.voiceData || null
      };
    });
    
    res.json(userDots);
    
  } catch (error) {
    console.error('Error fetching user dots:', error);
    res.status(500).json({ error: 'Failed to fetch dots' });
  }
});

// Get user's wheels (placeholder - wheels system not implemented yet)
router.get('/wheels', checkDotSparkActivation, async (req, res) => {
  try {
    // Return empty array for now since wheels are not fully implemented
    res.json([]);
    
  } catch (error) {
    console.error('Error fetching user wheels:', error);
    res.status(500).json({ error: 'Failed to fetch wheels' });
  }
});

// Get user's content statistics
router.get('/stats', checkDotSparkActivation, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count entries (dots) for this user
    const userEntries = await db.select().from(entries).where(eq(entries.userId, userId));
    
    res.json({
      totalDots: userEntries.length,
      totalWheels: 0, // Wheels not implemented yet
      totalChakras: 0, // Chakras not implemented yet
      lastActivity: userEntries.length > 0 ? userEntries[0]?.createdAt : null
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