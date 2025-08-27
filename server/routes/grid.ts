import express from 'express';
import { db } from '@db';
import { dots, wheels } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { calculateGridPositions } from '../grid-positioning';

const router = express.Router();

/**
 * GET /api/grid/positions
 * Calculate optimized positions for all dots, wheels, and chakras
 */
router.get('/positions', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const isPreview = req.query.preview === 'true';
    
    // Fetch all dots and wheels for the user
    const userDots = await db.query.dots.findMany({
      where: eq(dots.userId, userId),
      with: {
        wheel: true
      }
    });
    
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId),
      with: {
        dots: true,
        childWheels: true
      }
    });
    
    // Separate chakras (wheels with no parent) from regular wheels
    const chakras = userWheels.filter(wheel => !wheel.chakraId);
    const regularWheels = userWheels.filter(wheel => wheel.chakraId);
    
    // Calculate optimized positions using the algorithm
    const positions = calculateGridPositions(userDots, userWheels, chakras, isPreview);
    
    return res.json({
      success: true,
      data: {
        dotPositions: Object.fromEntries(positions.dotPositions),
        wheelPositions: Object.fromEntries(positions.wheelPositions),
        chakraPositions: Object.fromEntries(positions.chakraPositions),
        statistics: {
          totalDots: userDots.length,
          totalWheels: regularWheels.length,
          totalChakras: chakras.length,
          freeDots: userDots.filter(dot => !dot.wheelId).length
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

/**
 * POST /api/grid/update-positions
 * Update positions for specific elements after user interactions
 */
router.post('/update-positions', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const { dotPositions, wheelPositions, chakraPositions } = req.body;
    
    // Update dot positions
    if (dotPositions) {
      for (const [dotId, position] of Object.entries(dotPositions)) {
        await db.update(dots)
          .set({ 
            positionX: Math.round((position as any).x), 
            positionY: Math.round((position as any).y) 
          })
          .where(and(
            eq(dots.id, parseInt(dotId)),
            eq(dots.userId, userId)
          ));
      }
    }
    
    // Update wheel positions
    if (wheelPositions) {
      for (const [wheelId, position] of Object.entries(wheelPositions)) {
        await db.update(wheels)
          .set({ 
            positionX: Math.round((position as any).x), 
            positionY: Math.round((position as any).y) 
          })
          .where(and(
            eq(wheels.id, parseInt(wheelId)),
            eq(wheels.userId, userId)
          ));
      }
    }
    
    // Update chakra positions
    if (chakraPositions) {
      for (const [chakraId, position] of Object.entries(chakraPositions)) {
        await db.update(wheels)
          .set({ 
            positionX: Math.round((position as any).x), 
            positionY: Math.round((position as any).y) 
          })
          .where(and(
            eq(wheels.id, parseInt(chakraId)),
            eq(wheels.userId, userId)
          ));
      }
    }
    
    return res.json({
      success: true,
      message: 'Positions updated successfully'
    });
    
  } catch (error) {
    console.error('Position update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update positions'
    });
  }
});

export default router;