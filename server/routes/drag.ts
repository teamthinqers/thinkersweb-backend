/**
 * API Routes for Draggable Grid System
 */

import { Router } from 'express';
import { db } from '@db';
import { dots, wheels } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { 
  DRAG_CONFIG, 
  validateParentConstraints, 
  checkAllCollisions, 
  snapToGrid,
  findNearestValidPosition,
  calculateInitialPosition,
  DragPosition,
  DragConstraints 
} from '../drag-grid-system';

const router = Router();

/**
 * GET /api/drag/positions - Get all element positions for draggable grid
 */
router.get('/positions', async (req, res) => {
  try {
    const userId = req.session?.userId || 1;
    const isPreview = req.query.preview === 'true';
    
    if (isPreview) {
      // Return preview data for demonstration
      return res.json({
        success: true,
        data: {
          elements: await generatePreviewPositions(),
          canvasConfig: {
            width: DRAG_CONFIG.CANVAS_WIDTH,
            height: DRAG_CONFIG.CANVAS_HEIGHT,
            marginX: DRAG_CONFIG.MARGIN_X,
            marginY: DRAG_CONFIG.MARGIN_Y
          }
        }
      });
    }
    
    // Fetch user data with positions
    const [userDots, userWheels] = await Promise.all([
      db.query.dots.findMany({
        where: eq(dots.userId, userId)
      }),
      db.query.wheels.findMany({
        where: eq(wheels.userId, userId)
      })
    ]);
    
    // Convert to DragPosition format
    const elements: DragPosition[] = [];
    
    // Process dots
    for (const dot of userDots) {
      elements.push({
        id: dot.id.toString(),
        x: dot.positionX || 0,
        y: dot.positionY || 0,
        type: 'dot',
        radius: 35, // Standard dot radius
        lastModified: dot.updatedAt || dot.createdAt || new Date()
      });
    }
    
    // Process wheels and chakras
    for (const wheel of userWheels) {
      const isChakra = !wheel.chakraId;
      elements.push({
        id: wheel.id.toString(),
        x: wheel.positionX || 0,
        y: wheel.positionY || 0,
        type: isChakra ? 'chakra' : 'wheel',
        radius: isChakra ? 400 : 160, // Standard radii
        lastModified: wheel.updatedAt || wheel.createdAt || new Date()
      });
    }
    
    return res.json({
      success: true,
      data: {
        elements,
        canvasConfig: {
          width: DRAG_CONFIG.CANVAS_WIDTH,
          height: DRAG_CONFIG.CANVAS_HEIGHT,
          marginX: DRAG_CONFIG.MARGIN_X,
          marginY: DRAG_CONFIG.MARGIN_Y
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to get drag positions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve positions'
    });
  }
});

/**
 * POST /api/drag/validate - Validate a drag position before committing
 */
router.post('/validate', async (req, res) => {
  try {
    const { elementId, position, elementType, radius, parentId } = req.body;
    
    if (!elementId || !position || !elementType || !radius) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const userId = req.session?.userId || 1;
    
    // Get all current positions
    const elements = await getCurrentPositions(userId);
    
    // Build constraints
    const constraints: DragConstraints = {
      canvasWidth: DRAG_CONFIG.CANVAS_WIDTH,
      canvasHeight: DRAG_CONFIG.CANVAS_HEIGHT,
      marginX: DRAG_CONFIG.MARGIN_X,
      marginY: DRAG_CONFIG.MARGIN_Y
    };
    
    if (parentId) {
      const parent = elements.find(el => el.id === parentId);
      if (parent) {
        constraints.parentId = parentId;
        constraints.parentType = parent.type === 'chakra' ? 'chakra' : 'wheel';
        constraints.parentPosition = { x: parent.x, y: parent.y };
        constraints.parentRadius = parent.radius;
      }
    }
    
    // Snap to grid
    const snappedPosition = snapToGrid(position);
    
    // Validate constraints
    const isValidPosition = validateParentConstraints(snappedPosition, radius, constraints);
    
    if (!isValidPosition) {
      // Try to find a nearby valid position
      const nearestValid = findNearestValidPosition(
        snappedPosition,
        elementId,
        radius,
        constraints,
        elements.filter(el => el.id !== elementId)
      );
      
      if (nearestValid) {
        return res.json({
          success: true,
          position: nearestValid,
          snapped: true,
          corrected: true
        });
      } else {
        return res.json({
          success: false,
          error: 'No valid position found',
          invalid: true
        });
      }
    }
    
    // Check collisions
    const collisionResult = checkAllCollisions(
      snappedPosition,
      elementId,
      radius,
      elements.filter(el => el.id !== elementId)
    );
    
    if (collisionResult.hasCollision) {
      // Try to find a nearby position without collisions
      const nearestValid = findNearestValidPosition(
        snappedPosition,
        elementId,
        radius,
        constraints,
        elements.filter(el => el.id !== elementId)
      );
      
      if (nearestValid) {
        return res.json({
          success: true,
          position: nearestValid,
          snapped: true,
          corrected: true,
          originalCollisions: collisionResult.collidingWith
        });
      } else {
        return res.json({
          success: false,
          error: 'Position would cause collisions',
          collision: true,
          collidingWith: collisionResult.collidingWith
        });
      }
    }
    
    return res.json({
      success: true,
      position: snappedPosition,
      snapped: position.x !== snappedPosition.x || position.y !== snappedPosition.y
    });
    
  } catch (error) {
    console.error('Position validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
});

/**
 * PUT /api/drag/position - Update element position
 */
router.put('/position', async (req, res) => {
  try {
    const { elementId, position, elementType } = req.body;
    
    if (!elementId || !position || !elementType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const userId = req.session?.userId || 1;
    
    // Update position in database
    if (elementType === 'dot') {
      await db.update(dots)
        .set({
          positionX: position.x,
          positionY: position.y,
          updatedAt: new Date()
        })
        .where(and(eq(dots.id, elementId), eq(dots.userId, userId)));
    } else {
      // wheel or chakra
      await db.update(wheels)
        .set({
          positionX: position.x,
          positionY: position.y,
          updatedAt: new Date()
        })
        .where(and(eq(wheels.id, elementId), eq(wheels.userId, userId)));
    }
    
    return res.json({
      success: true,
      message: 'Position updated successfully'
    });
    
  } catch (error) {
    console.error('Position update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update position'
    });
  }
});

/**
 * POST /api/drag/auto-arrange - Auto-arrange all elements optimally
 */
router.post('/auto-arrange', async (req, res) => {
  try {
    const userId = req.session?.userId || 1;
    
    // Get all elements
    const [userDots, userWheels] = await Promise.all([
      db.query.dots.findMany({
        where: eq(dots.userId, userId)
      }),
      db.query.wheels.findMany({
        where: eq(wheels.userId, userId)
      })
    ]);
    
    const constraints: DragConstraints = {
      canvasWidth: DRAG_CONFIG.CANVAS_WIDTH,
      canvasHeight: DRAG_CONFIG.CANVAS_HEIGHT,
      marginX: DRAG_CONFIG.MARGIN_X,
      marginY: DRAG_CONFIG.MARGIN_Y
    };
    
    const allElements: DragPosition[] = [];
    
    // Process chakras first
    const chakras = userWheels.filter(w => !w.chakraId);
    for (const chakra of chakras) {
      const position = calculateInitialPosition('chakra', 400, constraints, allElements);
      allElements.push({
        id: chakra.id,
        x: position.x,
        y: position.y,
        type: 'chakra',
        radius: 400,
        lastModified: new Date()
      });
      
      // Update in database
      await db.update(wheels)
        .set({
          positionX: position.x,
          positionY: position.y,
          updatedAt: new Date()
        })
        .where(and(eq(wheels.id, chakra.id), eq(wheels.userId, userId)));
    }
    
    // Process wheels
    const regularWheels = userWheels.filter(w => w.chakraId);
    for (const wheel of regularWheels) {
      const parent = allElements.find(el => el.id === wheel.chakraId?.toString());
      const wheelConstraints = { ...constraints };
      
      if (parent) {
        wheelConstraints.parentId = parent.id;
        wheelConstraints.parentType = 'chakra';
        wheelConstraints.parentPosition = { x: parent.x, y: parent.y };
        wheelConstraints.parentRadius = parent.radius;
      }
      
      const position = calculateInitialPosition('wheel', 160, wheelConstraints, allElements);
      allElements.push({
        id: wheel.id,
        x: position.x,
        y: position.y,
        type: 'wheel',
        radius: 160,
        lastModified: new Date()
      });
      
      await db.update(wheels)
        .set({
          positionX: position.x,
          positionY: position.y,
          updatedAt: new Date()
        })
        .where(and(eq(wheels.id, wheel.id), eq(wheels.userId, userId)));
    }
    
    // Process dots
    for (const dot of userDots) {
      const parent = dot.wheelId ? allElements.find(el => el.id === dot.wheelId.toString()) : null;
      const dotConstraints = { ...constraints };
      
      if (parent) {
        dotConstraints.parentId = parent.id;
        dotConstraints.parentType = 'wheel';
        dotConstraints.parentPosition = { x: parent.x, y: parent.y };
        dotConstraints.parentRadius = parent.radius;
      }
      
      const position = calculateInitialPosition('dot', 35, dotConstraints, allElements);
      allElements.push({
        id: dot.id,
        x: position.x,
        y: position.y,
        type: 'dot',
        radius: 35,
        lastModified: new Date()
      });
      
      await db.update(dots)
        .set({
          positionX: position.x,
          positionY: position.y,
          updatedAt: new Date()
        })
        .where(and(eq(dots.id, dot.id), eq(dots.userId, userId)));
    }
    
    return res.json({
      success: true,
      message: 'Elements auto-arranged successfully',
      arrangedCount: allElements.length
    });
    
  } catch (error) {
    console.error('Auto-arrange error:', error);
    return res.status(500).json({
      success: false,
      error: 'Auto-arrange failed'
    });
  }
});

// Helper functions
async function getCurrentPositions(userId: number): Promise<DragPosition[]> {
  const [userDots, userWheels] = await Promise.all([
    db.query.dots.findMany({
      where: eq(dots.userId, userId)
    }),
    db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    })
  ]);
  
  const elements: DragPosition[] = [];
  
  for (const dot of userDots) {
    elements.push({
      id: dot.id,
      x: dot.positionX || 0,
      y: dot.positionY || 0,
      type: 'dot',
      radius: 35,
      lastModified: dot.updatedAt || dot.createdAt || new Date()
    });
  }
  
  for (const wheel of userWheels) {
    const isChakra = !wheel.chakraId;
    elements.push({
      id: wheel.id,
      x: wheel.positionX || 0,
      y: wheel.positionY || 0,
      type: isChakra ? 'chakra' : 'wheel',
      radius: isChakra ? 400 : 160,
      lastModified: wheel.updatedAt || wheel.createdAt || new Date()
    });
  }
  
  return elements;
}

async function generatePreviewPositions(): Promise<DragPosition[]> {
  // Generate preview positions that demonstrate the draggable system
  const elements: DragPosition[] = [];
  
  // Sample chakra
  elements.push({
    id: 'preview-chakra-business',
    x: 700,
    y: 400,
    type: 'chakra',
    radius: 400,
    lastModified: new Date()
  });
  
  // Sample wheels within chakra
  elements.push({
    id: 'preview-wheel-0',
    x: 600,
    y: 320,
    type: 'wheel',
    radius: 160,
    lastModified: new Date()
  });
  
  elements.push({
    id: 'preview-wheel-1',
    x: 800,
    y: 320,
    type: 'wheel',
    radius: 160,
    lastModified: new Date()
  });
  
  elements.push({
    id: 'preview-wheel-2',
    x: 700,
    y: 480,
    type: 'wheel',
    radius: 160,
    lastModified: new Date()
  });
  
  // Sample dots within wheels
  const dotPositions = [
    { x: 580, y: 300 }, { x: 620, y: 300 }, { x: 580, y: 340 }, { x: 620, y: 340 }, { x: 600, y: 320 }, // wheel-0
    { x: 780, y: 300 }, { x: 820, y: 300 }, { x: 780, y: 340 }, { x: 820, y: 340 }, // wheel-1
    { x: 680, y: 460 }, { x: 720, y: 460 }, { x: 680, y: 500 }, { x: 720, y: 500 } // wheel-2
  ];
  
  dotPositions.forEach((pos, i) => {
    elements.push({
      id: `preview-dot-${i}`,
      x: pos.x,
      y: pos.y,
      type: 'dot',
      radius: 35,
      lastModified: new Date()
    });
  });
  
  return elements;
}

export default router;