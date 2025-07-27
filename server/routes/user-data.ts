import type { Express, Request, Response } from "express";
import { db } from "@db";
import { 
  dots, 
  wheels, 
  vectorEmbeddings,
  dotsparkActivations,
  insertDotSchema,
  insertWheelSchema,
  insertVectorEmbeddingSchema,
  type User,
  type Dot,
  type Wheel 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { initializeVectorDB } from '../vector-db';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

// Pinecone integration helper functions
class PineconeIntegration {
  private static vectorDB: any = null;
  
  static async initialize() {
    if (!this.vectorDB) {
      this.vectorDB = await initializeVectorDB();
    }
    return this.vectorDB;
  }

  // Generate embeddings for content
  static async generateEmbedding(content: string): Promise<number[]> {
    try {
      const openai = (await import('openai')).default;
      const client = new openai({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await client.embeddings.create({
        model: "text-embedding-ada-002",
        input: content,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  // Store vector in Pinecone
  static async storeVector(vectorId: string, embedding: number[], metadata: any, namespace: string = "default") {
    try {
      const vectorDB = await this.initialize();
      if (!vectorDB) return false;

      await vectorDB.upsert([{
        id: vectorId,
        values: embedding,
        metadata: metadata,
      }], { namespace });

      return true;
    } catch (error) {
      console.error('Error storing vector in Pinecone:', error);
      return false;
    }
  }

  // Search vectors in Pinecone
  static async searchVectors(queryEmbedding: number[], topK: number = 5, namespace: string = "default") {
    try {
      const vectorDB = await this.initialize();
      if (!vectorDB) return [];

      const results = await vectorDB.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        namespace
      });

      return results.matches || [];
    } catch (error) {
      console.error('Error searching vectors in Pinecone:', error);
      return [];
    }
  }

  // Delete vector from Pinecone
  static async deleteVector(vectorId: string, namespace: string = "default") {
    try {
      const vectorDB = await this.initialize();
      if (!vectorDB) return false;

      await vectorDB.deleteOne(vectorId, { namespace });
      return true;
    } catch (error) {
      console.error('Error deleting vector from Pinecone:', error);
      return false;
    }
  }
}

export function setupUserDataRoutes(app: Express, apiPrefix: string) {
  
  // Helper function to check if user has DotSpark activated
  const checkDotSparkActivation = async (userId: number): Promise<boolean> => {
    try {
      const activation = await db.query.dotsparkActivations.findFirst({
        where: eq(dotsparkActivations.userId, userId)
      });
      return activation?.isActivated || false;
    } catch (error) {
      console.error('Error checking DotSpark activation:', error);
      return false;
    }
  };

  // Create or update user activation
  const ensureUserActivation = async (userId: number): Promise<void> => {
    try {
      const existing = await db.query.dotsparkActivations.findFirst({
        where: eq(dotsparkActivations.userId, userId)
      });

      if (!existing) {
        await db.insert(dotsparkActivations).values({
          userId,
          isActivated: true,
          activatedAt: new Date()
        });
      } else if (!existing.isActivated) {
        await db.update(dotsparkActivations)
          .set({ 
            isActivated: true, 
            activatedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(dotsparkActivations.userId, userId));
      }
    } catch (error) {
      console.error('Error ensuring user activation:', error);
    }
  };

  // Get user's dots
  app.get(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has DotSpark activated
      const isActivated = await checkDotSparkActivation(userId);
      if (!isActivated) {
        return res.status(403).json({ 
          error: 'DotSpark activation required',
          message: 'Please activate DotSpark to access your personal data'
        });
      }

      const userDots = await db.query.dots.findMany({
        where: eq(dots.userId, userId),
        orderBy: desc(dots.createdAt),
        with: {
          wheel: true
        }
      });

      // Transform for frontend compatibility
      const transformedDots = userDots.map((dot: any) => ({
        id: dot.id.toString(),
        oneWordSummary: dot.summary.split(' ')[0] || 'Untitled',
        summary: dot.summary,
        anchor: dot.anchor,
        pulse: dot.pulse,
        wheelId: dot.wheelId?.toString(),
        timestamp: dot.createdAt,
        sourceType: dot.sourceType as 'voice' | 'text' | 'hybrid',
        captureMode: dot.captureMode as 'natural' | 'ai',
        position: { x: dot.positionX, y: dot.positionY }
      }));

      res.json(transformedDots);
    } catch (error) {
      console.error('Error fetching user dots:', error);
      res.status(500).json({ error: 'Failed to fetch dots' });
    }
  });

  // Create a new dot
  app.post(`${apiPrefix}/dots`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Ensure user has DotSpark activated
      await ensureUserActivation(userId);

      // Validate request body
      const dotData = insertDotSchema.parse({
        ...req.body,
        userId,
        wheelId: req.body.wheelId ? parseInt(req.body.wheelId) : null
      });

      // Create dot in database
      const [newDot] = await db.insert(dots).values(dotData).returning();

      // Generate content for vector embedding
      const content = `${newDot.summary} ${newDot.anchor} ${newDot.pulse}`;
      const embedding = await PineconeIntegration.generateEmbedding(content);

      if (embedding.length > 0) {
        // Store in Pinecone
        const vectorId = `dot_${newDot.id}_${userId}`;
        const metadata = {
          userId,
          contentType: 'dot',
          contentId: newDot.id.toString(),
          summary: newDot.summary,
          anchor: newDot.anchor,
          pulse: newDot.pulse,
          wheelId: newDot.wheelId?.toString() || null,
          createdAt: newDot.createdAt.toISOString()
        };

        const stored = await PineconeIntegration.storeVector(vectorId, embedding, metadata, `user_${userId}`);

        if (stored) {
          // Store vector metadata in database
          try {
            await db.insert(vectorEmbeddings).values({
              userId,
              contentType: 'dot',
              contentId: newDot.id,
              vectorId,
              content,
              metadata: JSON.stringify(metadata)
            });
          } catch (vecError) {
            console.error('Error storing vector metadata:', vecError);
          }
        }
      }

      // Transform for frontend
      const transformedDot = {
        id: newDot.id.toString(),
        oneWordSummary: newDot.summary.split(' ')[0] || 'Untitled',
        summary: newDot.summary,
        anchor: newDot.anchor,
        pulse: newDot.pulse,
        wheelId: newDot.wheelId?.toString(),
        timestamp: newDot.createdAt,
        sourceType: newDot.sourceType as 'voice' | 'text' | 'hybrid',
        captureMode: newDot.captureMode as 'natural' | 'ai',
        position: { x: newDot.positionX, y: newDot.positionY }
      };

      res.status(201).json(transformedDot);
    } catch (error) {
      console.error('Error creating dot:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create dot' });
    }
  });

  // Get user's wheels (including chakras)
  app.get(`${apiPrefix}/wheels`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has DotSpark activated
      const isActivated = await checkDotSparkActivation(userId);
      if (!isActivated) {
        return res.status(403).json({ 
          error: 'DotSpark activation required',
          message: 'Please activate DotSpark to access your personal data'
        });
      }

      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, userId),
        orderBy: desc(wheels.createdAt),
        with: {
          dots: true
        }
      });

      // Transform for frontend compatibility
      const transformedWheels = userWheels.map(wheel => ({
        id: wheel.id.toString(),
        name: wheel.name,
        heading: wheel.heading || wheel.name,
        goals: wheel.goals,
        purpose: wheel.purpose,
        timeline: wheel.timeline,
        category: wheel.category,
        color: wheel.color,
        dots: wheel.dots.map(dot => ({
          id: dot.id.toString(),
          oneWordSummary: dot.summary.split(' ')[0] || 'Untitled',
          summary: dot.summary,
          anchor: dot.anchor,
          pulse: dot.pulse,
          wheelId: dot.wheelId?.toString(),
          timestamp: dot.createdAt,
          sourceType: dot.sourceType as 'voice' | 'text' | 'hybrid',
          captureMode: dot.captureMode as 'natural' | 'ai',
          position: { x: dot.positionX, y: dot.positionY }
        })),
        connections: [], // TODO: Implement wheel connections
        position: { x: wheel.positionX, y: wheel.positionY },
        chakraId: wheel.chakraId?.toString(),
        createdAt: wheel.createdAt
      }));

      res.json(transformedWheels);
    } catch (error) {
      console.error('Error fetching user wheels:', error);
      res.status(500).json({ error: 'Failed to fetch wheels' });
    }
  });

  // Create a new wheel
  app.post(`${apiPrefix}/wheels`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Ensure user has DotSpark activated
      await ensureUserActivation(userId);

      // Validate request body
      const wheelData = insertWheelSchema.parse({
        ...req.body,
        userId,
        chakraId: req.body.chakraId ? parseInt(req.body.chakraId) : null
      });

      // Create wheel in database
      const [newWheel] = await db.insert(wheels).values(wheelData).returning();

      // Generate content for vector embedding
      const content = `${newWheel.name} ${newWheel.heading || ''} ${newWheel.goals || ''} ${newWheel.purpose || ''} ${newWheel.timeline || ''}`;
      const embedding = await PineconeIntegration.generateEmbedding(content);

      if (embedding.length > 0) {
        // Store in Pinecone
        const vectorId = `wheel_${newWheel.id}_${userId}`;
        const metadata = {
          userId,
          contentType: newWheel.chakraId ? 'wheel' : 'chakra',
          contentId: newWheel.id.toString(),
          name: newWheel.name,
          heading: newWheel.heading,
          goals: newWheel.goals,
          purpose: newWheel.purpose,
          timeline: newWheel.timeline,
          category: newWheel.category,
          chakraId: newWheel.chakraId?.toString() || null,
          createdAt: newWheel.createdAt.toISOString()
        };

        const stored = await PineconeIntegration.storeVector(vectorId, embedding, metadata, `user_${userId}`);

        if (stored) {
          // Store vector metadata in database
          try {
            await db.insert(vectorEmbeddings).values({
              userId,
              contentType: newWheel.chakraId ? 'wheel' : 'chakra',
              contentId: newWheel.id,
              vectorId,
              content,
              metadata: JSON.stringify(metadata)
            });
          } catch (vecError) {
            console.error('Error storing vector metadata:', vecError);
          }
        }
      }

      // Transform for frontend
      const transformedWheel = {
        id: newWheel.id.toString(),
        name: newWheel.name,
        heading: newWheel.heading || newWheel.name,
        goals: newWheel.goals,
        purpose: newWheel.purpose,
        timeline: newWheel.timeline,
        category: newWheel.category,
        color: newWheel.color,
        dots: [],
        connections: [],
        position: { x: newWheel.positionX, y: newWheel.positionY },
        chakraId: newWheel.chakraId?.toString(),
        createdAt: newWheel.createdAt
      };

      res.status(201).json(transformedWheel);
    } catch (error) {
      console.error('Error creating wheel:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create wheel' });
    }
  });

  // Delete a dot
  app.delete(`${apiPrefix}/dots/:id`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const dotId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Find the dot to ensure it belongs to the user
      const dot = await db.query.dots.findFirst({
        where: and(eq(dots.id, dotId), eq(dots.userId, userId))
      });

      if (!dot) {
        return res.status(404).json({ error: 'Dot not found' });
      }

      // Delete from Pinecone
      const vectorId = `dot_${dotId}_${userId}`;
      await PineconeIntegration.deleteVector(vectorId, `user_${userId}`);

      // Delete vector metadata from database
      try {
        await db.delete(vectorEmbeddings).where(
          and(
            eq(vectorEmbeddings.userId, userId),
            eq(vectorEmbeddings.contentId, dotId),
            eq(vectorEmbeddings.contentType, 'dot')
          )
        );
      } catch (vecError) {
        console.error('Error deleting vector metadata:', vecError);
      }

      // Delete the dot
      await db.delete(dots).where(and(eq(dots.id, dotId), eq(dots.userId, userId)));

      res.json({ message: 'Dot deleted successfully' });
    } catch (error) {
      console.error('Error deleting dot:', error);
      res.status(500).json({ error: 'Failed to delete dot' });
    }
  });

  // Delete a wheel
  app.delete(`${apiPrefix}/wheels/:id`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const wheelId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Find the wheel to ensure it belongs to the user
      const wheel = await db.query.wheels.findFirst({
        where: and(eq(wheels.id, wheelId), eq(wheels.userId, userId))
      });

      if (!wheel) {
        return res.status(404).json({ error: 'Wheel not found' });
      }

      // Delete from Pinecone
      const vectorId = `wheel_${wheelId}_${userId}`;
      await PineconeIntegration.deleteVector(vectorId, `user_${userId}`);

      // Delete vector metadata from database
      try {
        await db.delete(vectorEmbeddings).where(
          and(
            eq(vectorEmbeddings.userId, userId),
            eq(vectorEmbeddings.contentId, wheelId),
            eq(vectorEmbeddings.contentType, wheel.chakraId ? 'wheel' : 'chakra')
          )
        );
      } catch (vecError) {
        console.error('Error deleting vector metadata:', vecError);
      }

      // Delete the wheel
      await db.delete(wheels).where(and(eq(wheels.id, wheelId), eq(wheels.userId, userId)));

      res.json({ message: 'Wheel deleted successfully' });
    } catch (error) {
      console.error('Error deleting wheel:', error);
      res.status(500).json({ error: 'Failed to delete wheel' });
    }
  });

  // Get user's grid positions
  app.get(`${apiPrefix}/grid/positions`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has DotSpark activated
      const isActivated = await checkDotSparkActivation(userId);
      if (!isActivated) {
        return res.status(403).json({ 
          error: 'DotSpark activation required',
          message: 'Please activate DotSpark to access your personal data'
        });
      }

      // Get user's dots and wheels
      const [userDots, userWheels] = await Promise.all([
        db.query.dots.findMany({
          where: eq(dots.userId, userId)
        }),
        db.query.wheels.findMany({
          where: eq(wheels.userId, userId)
        })
      ]);

      // Calculate grid positions (simple implementation)
      const dotPositions: Record<string, { x: number; y: number }> = {};
      const wheelPositions: Record<string, { x: number; y: number }> = {};
      const chakraPositions: Record<string, { x: number; y: number }> = {};

      userDots.forEach(dot => {
        dotPositions[dot.id.toString()] = { x: dot.positionX, y: dot.positionY };
      });

      userWheels.forEach(wheel => {
        if (wheel.chakraId) {
          wheelPositions[wheel.id.toString()] = { x: wheel.positionX, y: wheel.positionY };
        } else {
          chakraPositions[wheel.id.toString()] = { x: wheel.positionX, y: wheel.positionY };
        }
      });

      const statistics = {
        totalDots: userDots.length,
        totalWheels: userWheels.filter(w => w.chakraId).length,
        totalChakras: userWheels.filter(w => !w.chakraId).length,
        freeDots: userDots.filter(d => !d.wheelId).length
      };

      res.json({
        data: {
          dotPositions,
          wheelPositions,
          chakraPositions,
          statistics
        }
      });
    } catch (error) {
      console.error('Error fetching grid positions:', error);
      res.status(500).json({ error: 'Failed to fetch grid positions' });
    }
  });

  // Search user's content using vector similarity
  app.post(`${apiPrefix}/search/semantic`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { query, limit = 10 } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      // Generate embedding for search query
      const queryEmbedding = await PineconeIntegration.generateEmbedding(query);
      
      if (queryEmbedding.length === 0) {
        return res.status(500).json({ error: 'Failed to generate search embedding' });
      }

      // Search in user's namespace
      const results = await PineconeIntegration.searchVectors(
        queryEmbedding, 
        limit, 
        `user_${userId}`
      );

      res.json({
        query,
        results: results.map((result: any) => ({
          id: result.id,
          score: result.score,
          metadata: result.metadata
        }))
      });
    } catch (error) {
      console.error('Error performing semantic search:', error);
      res.status(500).json({ error: 'Failed to perform semantic search' });
    }
  });

  // Get user's DotSpark activation status
  app.get(`${apiPrefix}/activation/status`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activation = await db.query.dotsparkActivations.findFirst({
        where: eq(dotsparkActivations.userId, userId)
      });

      res.json({
        isActivated: activation?.isActivated || false,
        activatedAt: activation?.activatedAt,
        activationCode: activation?.activationCode
      });
    } catch (error) {
      console.error('Error checking activation status:', error);
      res.status(500).json({ error: 'Failed to check activation status' });
    }
  });

  // Activate DotSpark for user
  app.post(`${apiPrefix}/activation/activate`, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await ensureUserActivation(userId);

      res.json({
        message: 'DotSpark activated successfully',
        isActivated: true,
        activatedAt: new Date()
      });
    } catch (error) {
      console.error('Error activating DotSpark:', error);
      res.status(500).json({ error: 'Failed to activate DotSpark' });
    }
  });
}