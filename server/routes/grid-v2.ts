/**
 * Grid V2 API Routes - Complete Rebuild
 * 
 * Clean, robust API endpoints for the new grid system with:
 * - Separate data queries (no mixing)
 * - Built-in validation and deduplication
 * - Safe mapping/unmapping operations
 * - Real-time updates via Server-Sent Events
 * - Comprehensive error handling
 */

import type { Express, Request, Response } from "express";
import { db } from "@db";
import { 
  dots, 
  wheels, 
  chakras, 
  users,
  insertDotSchema,
  insertWheelSchema,
  insertChakraSchema
} from "@shared/schema";
import { eq, and, isNull, inArray, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { isAuthenticated } from "../auth";

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: { id: number; email?: string };
}

// Validation schemas for API requests
const mapDotToWheelSchema = z.object({
  dotId: z.number().positive(),
  wheelId: z.number().positive().optional(), // Optional for unmapping
});

const mapWheelToChakraSchema = z.object({
  wheelId: z.number().positive(),
  chakraId: z.number().positive().optional(), // Optional for unmapping
});

const mapDotToChakraSchema = z.object({
  dotId: z.number().positive(),
  chakraId: z.number().positive().optional(), // Optional for unmapping
});

const savePositionSchema = z.object({
  elementType: z.enum(['dot', 'wheel', 'chakra']),
  elementId: z.number().positive(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  validateCollision: z.boolean().default(true)
});

const batchSavePositionsSchema = z.object({
  positions: z.array(z.object({
    elementType: z.enum(['dot', 'wheel', 'chakra']),
    elementId: z.number().positive(),
    position: z.object({
      x: z.number(),
      y: z.number()
    })
  })),
  validateCollisions: z.boolean().default(true)
});

// Helper function to validate user ownership and element existence
async function validateElementOwnership(
  userId: number, 
  elementType: 'dot' | 'wheel' | 'chakra', 
  elementId: number
) {
  let element;
  
  switch (elementType) {
    case 'dot':
      element = await db.query.dots.findFirst({
        where: and(eq(dots.id, elementId), eq(dots.userId, userId))
      });
      break;
    case 'wheel':
      element = await db.query.wheels.findFirst({
        where: and(eq(wheels.id, elementId), eq(wheels.userId, userId))
      });
      break;
    case 'chakra':
      element = await db.query.chakras.findFirst({
        where: and(eq(chakras.id, elementId), eq(chakras.userId, userId))
      });
      break;
  }
  
  return element;
}

// Helper function for collision detection
function checkCollision(
  pos1: { x: number; y: number; radius: number },
  pos2: { x: number; y: number; radius: number },
  minDistance: number = 20
): boolean {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < (pos1.radius + pos2.radius + minDistance);
}

// Store for Server-Sent Events connections
const sseConnections = new Map<number, Response[]>();

// Helper to broadcast updates to user's SSE connections
function broadcastToUser(userId: number, event: string, data: any) {
  const userConnections = sseConnections.get(userId) || [];
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  
  userConnections.forEach((res, index) => {
    try {
      res.write(message);
    } catch (error) {
      // Remove dead connection
      userConnections.splice(index, 1);
    }
  });
  
  if (userConnections.length === 0) {
    sseConnections.delete(userId);
  } else {
    sseConnections.set(userId, userConnections);
  }
}

export function setupGridV2Routes(app: Express) {
  const prefix = "/api/grid-v2";

  // ==== DATA FETCHING ENDPOINTS ====

  // GET /api/grid-v2/dots - Fetch user's dots with filtering
  app.get(`${prefix}/dots`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        wheelId, 
        chakraId, 
        unlinked, 
        limit = "50", 
        offset = "0" 
      } = req.query;

      let whereConditions = [eq(dots.userId, userId)];
      
      // Filter by wheel
      if (wheelId === 'null' || unlinked === 'true') {
        whereConditions.push(isNull(dots.wheelId));
        whereConditions.push(isNull(dots.chakraId));
      } else if (wheelId) {
        whereConditions.push(eq(dots.wheelId, parseInt(wheelId as string)));
      }
      
      // Filter by chakra (direct mapping)
      if (chakraId) {
        whereConditions.push(eq(dots.chakraId, parseInt(chakraId as string)));
      }

      const userDots = await db.query.dots.findMany({
        where: and(...whereConditions),
        orderBy: desc(dots.createdAt),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      // Clean the data - ensure no duplicates by ID
      const uniqueDots = userDots.reduce((acc, dot) => {
        if (!acc.find(d => d.id === dot.id)) {
          acc.push(dot);
        }
        return acc;
      }, [] as typeof userDots);

      res.json({
        success: true,
        data: uniqueDots,
        count: uniqueDots.length,
        filters: { wheelId, chakraId, unlinked }
      });

    } catch (error) {
      console.error('Error fetching dots:', error);
      res.status(500).json({ error: 'Failed to fetch dots' });
    }
  });

  // GET /api/grid-v2/wheels - Fetch user's wheels with filtering
  app.get(`${prefix}/wheels`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        chakraId, 
        unlinked, 
        includeDots = "false",
        limit = "50", 
        offset = "0" 
      } = req.query;

      let whereConditions = [eq(wheels.userId, userId)];
      
      // Filter by chakra
      if (chakraId === 'null' || unlinked === 'true') {
        whereConditions.push(isNull(wheels.chakraId));
      } else if (chakraId) {
        whereConditions.push(eq(wheels.chakraId, parseInt(chakraId as string)));
      }

      const queryOptions: any = {
        where: and(...whereConditions),
        orderBy: desc(wheels.createdAt),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // Include dots if requested
      if (includeDots === "true") {
        queryOptions.with = { dots: true };
      }

      const userWheels = await db.query.wheels.findMany(queryOptions);

      // Clean the data - ensure no duplicates by ID
      const uniqueWheels = userWheels.reduce((acc, wheel) => {
        if (!acc.find(w => w.id === wheel.id)) {
          acc.push(wheel);
        }
        return acc;
      }, [] as typeof userWheels);

      res.json({
        success: true,
        data: uniqueWheels,
        count: uniqueWheels.length,
        filters: { chakraId, unlinked, includeDots }
      });

    } catch (error) {
      console.error('Error fetching wheels:', error);
      res.status(500).json({ error: 'Failed to fetch wheels' });
    }
  });

  // GET /api/grid-v2/chakras - Fetch user's chakras with filtering
  app.get(`${prefix}/chakras`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { 
        includeWheels = "false",
        includeDots = "false", 
        limit = "50", 
        offset = "0" 
      } = req.query;

      const queryOptions: any = {
        where: eq(chakras.userId, userId),
        orderBy: desc(chakras.createdAt),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      // Include wheels and/or dots if requested
      if (includeWheels === "true" || includeDots === "true") {
        queryOptions.with = {};
        if (includeWheels === "true") {
          queryOptions.with.wheels = includeDots === "true" ? { with: { dots: true } } : true;
        }
      }

      const userChakras = await db.query.chakras.findMany(queryOptions);

      // Clean the data - ensure no duplicates by ID
      const uniqueChakras = userChakras.reduce((acc, chakra) => {
        if (!acc.find(c => c.id === chakra.id)) {
          acc.push(chakra);
        }
        return acc;
      }, [] as typeof userChakras);

      res.json({
        success: true,
        data: uniqueChakras,
        count: uniqueChakras.length,
        filters: { includeWheels, includeDots }
      });

    } catch (error) {
      console.error('Error fetching chakras:', error);
      res.status(500).json({ error: 'Failed to fetch chakras' });
    }
  });

  // ==== MAPPING ENDPOINTS ====

  // POST /api/grid-v2/map/dot-to-wheel - Map or unmap dot to wheel
  app.post(`${prefix}/map/dot-to-wheel`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = mapDotToWheelSchema.parse(req.body);
      const { dotId, wheelId } = validatedData;

      // Validate dot ownership
      const dot = await validateElementOwnership(userId, 'dot', dotId);
      if (!dot) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }

      // Validate wheel ownership if mapping (not unmapping)
      if (wheelId) {
        const wheel = await validateElementOwnership(userId, 'wheel', wheelId);
        if (!wheel) {
          return res.status(404).json({ error: 'Wheel not found or unauthorized' });
        }
      }

      // Prevent duplicate mapping
      if (wheelId && dot.wheelId === wheelId) {
        return res.json({
          success: true,
          message: 'Dot is already mapped to this wheel',
          data: dot
        });
      }

      // Update dot mapping
      const updatedDot = await db.update(dots)
        .set({ 
          wheelId: wheelId || null,
          chakraId: wheelId ? null : dot.chakraId, // Clear direct chakra mapping when mapping to wheel
          updatedAt: new Date()
        })
        .where(eq(dots.id, dotId))
        .returning();

      // Broadcast update to user's SSE connections
      broadcastToUser(userId, 'dot-mapped', {
        action: wheelId ? 'mapped' : 'unmapped',
        dot: updatedDot[0],
        wheelId,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: wheelId ? 'Dot mapped to wheel successfully' : 'Dot unmapped successfully',
        data: updatedDot[0]
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error mapping dot to wheel:', error);
      res.status(500).json({ error: 'Failed to map dot to wheel' });
    }
  });

  // POST /api/grid-v2/map/wheel-to-chakra - Map or unmap wheel to chakra
  app.post(`${prefix}/map/wheel-to-chakra`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = mapWheelToChakraSchema.parse(req.body);
      const { wheelId, chakraId } = validatedData;

      // Validate wheel ownership
      const wheel = await validateElementOwnership(userId, 'wheel', wheelId);
      if (!wheel) {
        return res.status(404).json({ error: 'Wheel not found or unauthorized' });
      }

      // Validate chakra ownership if mapping (not unmapping)
      if (chakraId) {
        const chakra = await validateElementOwnership(userId, 'chakra', chakraId);
        if (!chakra) {
          return res.status(404).json({ error: 'Chakra not found or unauthorized' });
        }
      }

      // Prevent duplicate mapping
      if (chakraId && wheel.chakraId === chakraId) {
        return res.json({
          success: true,
          message: 'Wheel is already mapped to this chakra',
          data: wheel
        });
      }

      // Update wheel mapping
      const updatedWheel = await db.update(wheels)
        .set({ 
          chakraId: chakraId || null,
          updatedAt: new Date()
        })
        .where(eq(wheels.id, wheelId))
        .returning();

      // Broadcast update to user's SSE connections
      broadcastToUser(userId, 'wheel-mapped', {
        action: chakraId ? 'mapped' : 'unmapped',
        wheel: updatedWheel[0],
        chakraId,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: chakraId ? 'Wheel mapped to chakra successfully' : 'Wheel unmapped successfully',
        data: updatedWheel[0]
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error mapping wheel to chakra:', error);
      res.status(500).json({ error: 'Failed to map wheel to chakra' });
    }
  });

  // POST /api/grid-v2/map/dot-to-chakra - Map or unmap dot directly to chakra
  app.post(`${prefix}/map/dot-to-chakra`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = mapDotToChakraSchema.parse(req.body);
      const { dotId, chakraId } = validatedData;

      // Validate dot ownership
      const dot = await validateElementOwnership(userId, 'dot', dotId);
      if (!dot) {
        return res.status(404).json({ error: 'Dot not found or unauthorized' });
      }

      // Validate chakra ownership if mapping (not unmapping)
      if (chakraId) {
        const chakra = await validateElementOwnership(userId, 'chakra', chakraId);
        if (!chakra) {
          return res.status(404).json({ error: 'Chakra not found or unauthorized' });
        }
      }

      // Prevent duplicate mapping
      if (chakraId && dot.chakraId === chakraId) {
        return res.json({
          success: true,
          message: 'Dot is already mapped to this chakra',
          data: dot
        });
      }

      // Update dot mapping (clear wheel mapping when mapping directly to chakra)
      const updatedDot = await db.update(dots)
        .set({ 
          chakraId: chakraId || null,
          wheelId: chakraId ? null : dot.wheelId, // Clear wheel mapping when mapping to chakra
          updatedAt: new Date()
        })
        .where(eq(dots.id, dotId))
        .returning();

      // Broadcast update to user's SSE connections
      broadcastToUser(userId, 'dot-mapped-chakra', {
        action: chakraId ? 'mapped' : 'unmapped',
        dot: updatedDot[0],
        chakraId,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: chakraId ? 'Dot mapped directly to chakra successfully' : 'Dot unmapped from chakra successfully',
        data: updatedDot[0]
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error mapping dot to chakra:', error);
      res.status(500).json({ error: 'Failed to map dot to chakra' });
    }
  });

  // ==== POSITIONING ENDPOINTS ====

  // POST /api/grid-v2/position/save - Save single element position
  app.post(`${prefix}/position/save`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = savePositionSchema.parse(req.body);
      const { elementType, elementId, position, validateCollision } = validatedData;

      // Validate element ownership
      const element = await validateElementOwnership(userId, elementType, elementId);
      if (!element) {
        return res.status(404).json({ error: `${elementType} not found or unauthorized` });
      }

      // Collision detection if requested
      if (validateCollision) {
        // Fetch nearby elements to check collisions
        // This is a simplified version - you could expand this
        const elementRadius = elementType === 'dot' ? 35 : elementType === 'wheel' ? 90 : 210;
        
        // For production, implement proper collision detection here
        // For now, we'll just save the position
      }

      // Update position based on element type
      let updatedElement;
      switch (elementType) {
        case 'dot':
          updatedElement = await db.update(dots)
            .set({ 
              positionX: Math.round(position.x),
              positionY: Math.round(position.y),
              updatedAt: new Date()
            })
            .where(eq(dots.id, elementId))
            .returning();
          break;
        case 'wheel':
          updatedElement = await db.update(wheels)
            .set({ 
              positionX: Math.round(position.x),
              positionY: Math.round(position.y),
              updatedAt: new Date()
            })
            .where(eq(wheels.id, elementId))
            .returning();
          break;
        case 'chakra':
          updatedElement = await db.update(chakras)
            .set({ 
              positionX: Math.round(position.x),
              positionY: Math.round(position.y),
              updatedAt: new Date()
            })
            .where(eq(chakras.id, elementId))
            .returning();
          break;
      }

      // Broadcast position update to user's SSE connections
      broadcastToUser(userId, 'position-updated', {
        elementType,
        elementId,
        position: { x: Math.round(position.x), y: Math.round(position.y) },
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Position saved successfully',
        data: updatedElement?.[0]
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error saving position:', error);
      res.status(500).json({ error: 'Failed to save position' });
    }
  });

  // POST /api/grid-v2/position/batch-save - Save multiple positions at once
  app.post(`${prefix}/position/batch-save`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = batchSavePositionsSchema.parse(req.body);
      const { positions, validateCollisions } = validatedData;

      const results = [];

      // Process each position update
      for (const pos of positions) {
        const { elementType, elementId, position } = pos;

        // Validate element ownership
        const element = await validateElementOwnership(userId, elementType, elementId);
        if (!element) {
          continue; // Skip invalid elements
        }

        // Update position based on element type
        let updatedElement;
        switch (elementType) {
          case 'dot':
            updatedElement = await db.update(dots)
              .set({ 
                positionX: Math.round(position.x),
                positionY: Math.round(position.y),
                updatedAt: new Date()
              })
              .where(eq(dots.id, elementId))
              .returning();
            break;
          case 'wheel':
            updatedElement = await db.update(wheels)
              .set({ 
                positionX: Math.round(position.x),
                positionY: Math.round(position.y),
                updatedAt: new Date()
              })
              .where(eq(wheels.id, elementId))
              .returning();
            break;
          case 'chakra':
            updatedElement = await db.update(chakras)
              .set({ 
                positionX: Math.round(position.x),
                positionY: Math.round(position.y),
                updatedAt: new Date()
              })
              .where(eq(chakras.id, elementId))
              .returning();
            break;
        }

        if (updatedElement?.[0]) {
          results.push({
            elementType,
            elementId,
            position: { x: Math.round(position.x), y: Math.round(position.y) },
            success: true
          });
        }
      }

      // Broadcast batch position update to user's SSE connections
      broadcastToUser(userId, 'positions-batch-updated', {
        positions: results,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: `${results.length} positions saved successfully`,
        data: results
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error batch saving positions:', error);
      res.status(500).json({ error: 'Failed to batch save positions' });
    }
  });

  // ==== REAL-TIME UPDATES ====

  // GET /api/grid-v2/events - Server-Sent Events for real-time updates
  app.get(`${prefix}/events`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Set up SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to grid updates', userId })}\n\n`);

    // Add connection to user's SSE connections
    if (!sseConnections.has(userId)) {
      sseConnections.set(userId, []);
    }
    sseConnections.get(userId)!.push(res);

    // Handle client disconnect
    req.on('close', () => {
      const userConnections = sseConnections.get(userId) || [];
      const index = userConnections.indexOf(res);
      if (index !== -1) {
        userConnections.splice(index, 1);
      }
      if (userConnections.length === 0) {
        sseConnections.delete(userId);
      } else {
        sseConnections.set(userId, userConnections);
      }
    });

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
      } catch (error) {
        clearInterval(heartbeat);
      }
    }, 30000); // Every 30 seconds

    req.on('close', () => {
      clearInterval(heartbeat);
    });
  });

  // ==== STATISTICS & OVERVIEW ====

  // GET /api/grid-v2/stats - Get user's grid statistics
  app.get(`${prefix}/stats`, isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Fetch counts for all elements
      const [dotsCount, wheelsCount, chakrasCount] = await Promise.all([
        db.query.dots.findMany({ where: eq(dots.userId, userId) }),
        db.query.wheels.findMany({ where: eq(wheels.userId, userId) }),
        db.query.chakras.findMany({ where: eq(chakras.userId, userId) })
      ]);

      // Calculate mapping statistics
      const mappedDots = dotsCount.filter(d => d.wheelId || d.chakraId).length;
      const unmappedDots = dotsCount.length - mappedDots;
      const mappedWheels = wheelsCount.filter(w => w.chakraId).length;
      const unmappedWheels = wheelsCount.length - mappedWheels;

      res.json({
        success: true,
        data: {
          totals: {
            dots: dotsCount.length,
            wheels: wheelsCount.length,
            chakras: chakrasCount.length
          },
          mappings: {
            mappedDots,
            unmappedDots,
            mappedWheels,
            unmappedWheels
          },
          percentages: {
            dotsMapped: dotsCount.length > 0 ? Math.round((mappedDots / dotsCount.length) * 100) : 0,
            wheelsMapped: wheelsCount.length > 0 ? Math.round((mappedWheels / wheelsCount.length) * 100) : 0
          }
        }
      });

    } catch (error) {
      console.error('Error fetching grid stats:', error);
      res.status(500).json({ error: 'Failed to fetch grid statistics' });
    }
  });

  console.log('Grid V2 routes initialized successfully');
}