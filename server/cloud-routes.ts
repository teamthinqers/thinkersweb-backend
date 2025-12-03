import type { Express } from "express";
import { db } from "@db";
import { 
  users, 
  wheels,
  dots,
  chakras,
  thoughts,
  sparks,
  cognitiveIdentity,
  thinqCircles
} from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";

export async function registerCloudRoutes(app: Express) {
  console.log('Registering cloud routes...');

  // Get user by Firebase UID
  app.get('/api/users/firebase/:firebaseUid', async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await db.query.users.findFirst({
        where: eq(users.firebaseUid, firebaseUid)
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create/update user from Firebase
  app.post('/api/users/firebase', async (req, res) => {
    try {
      const { firebaseUid, email, displayName, photoURL } = req.body;
      
      let user = await db.query.users.findFirst({
        where: eq(users.firebaseUid, firebaseUid)
      });
      
      if (user) {
        // Update existing user
        const [updated] = await db.update(users)
          .set({ 
            email: email || user.email,
            fullName: displayName || user.fullName,
            avatar: photoURL || user.avatar,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id))
          .returning();
        return res.json(updated);
      }
      
      // Create new user
      const [newUser] = await db.insert(users)
        .values({
          firebaseUid,
          email,
          fullName: displayName,
          avatar: photoURL,
          username: email?.split('@')[0] || `user_${Date.now()}`
        })
        .returning();
      
      res.status(201).json(newUser);
    } catch (error: any) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all dots for a user
  app.get('/api/dots', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      const userDots = await db.query.dots.findMany({
        where: eq(dots.userId, parseInt(userId)),
        orderBy: desc(dots.createdAt)
      });
      res.json(userDots);
    } catch (error: any) {
      console.error('Error fetching dots:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a dot
  app.post('/api/dots', async (req, res) => {
    try {
      const [newDot] = await db.insert(dots).values(req.body).returning();
      res.status(201).json(newDot);
    } catch (error: any) {
      console.error('Error creating dot:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all wheels for a user
  app.get('/api/wheels', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      const userWheels = await db.query.wheels.findMany({
        where: eq(wheels.userId, parseInt(userId)),
        orderBy: desc(wheels.createdAt)
      });
      res.json(userWheels);
    } catch (error: any) {
      console.error('Error fetching wheels:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a wheel
  app.post('/api/wheels', async (req, res) => {
    try {
      const [newWheel] = await db.insert(wheels).values(req.body).returning();
      res.status(201).json(newWheel);
    } catch (error: any) {
      console.error('Error creating wheel:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all chakras for a user
  app.get('/api/chakras', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      const userChakras = await db.query.chakras.findMany({
        where: eq(chakras.userId, parseInt(userId)),
        orderBy: desc(chakras.createdAt)
      });
      res.json(userChakras);
    } catch (error: any) {
      console.error('Error fetching chakras:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a chakra
  app.post('/api/chakras', async (req, res) => {
    try {
      const [newChakra] = await db.insert(chakras).values(req.body).returning();
      res.status(201).json(newChakra);
    } catch (error: any) {
      console.error('Error creating chakra:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get thoughts (Social Neura)
  app.get('/api/thoughts', async (req, res) => {
    try {
      const allThoughts = await db.query.thoughts.findMany({
        orderBy: desc(thoughts.createdAt),
        with: {
          user: true
        }
      });
      res.json(allThoughts);
    } catch (error: any) {
      console.error('Error fetching thoughts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a thought
  app.post('/api/thoughts', async (req, res) => {
    try {
      const [newThought] = await db.insert(thoughts).values(req.body).returning();
      res.status(201).json(newThought);
    } catch (error: any) {
      console.error('Error creating thought:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get sparks for a user
  app.get('/api/sparks', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'userId required' });
      }
      const userSparks = await db.query.sparks.findMany({
        where: eq(sparks.userId, parseInt(userId)),
        orderBy: desc(sparks.createdAt)
      });
      res.json(userSparks);
    } catch (error: any) {
      console.error('Error fetching sparks:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get ThinQ Circles
  app.get('/api/thinq-circles', async (req, res) => {
    try {
      const circles = await db.query.thinqCircles.findMany({
        orderBy: desc(thinqCircles.createdAt)
      });
      res.json(circles);
    } catch (error: any) {
      console.error('Error fetching circles:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get cognitive identity for a user
  app.get('/api/cognitive-identity/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const identity = await db.query.cognitiveIdentity.findFirst({
        where: eq(cognitiveIdentity.userId, userId)
      });
      res.json(identity || {});
    } catch (error: any) {
      console.error('Error fetching cognitive identity:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stats endpoint
  app.get('/api/stats/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const [dotsCount] = await db.select({ count: count() })
        .from(dots)
        .where(eq(dots.userId, userId));
      
      const [wheelsCount] = await db.select({ count: count() })
        .from(wheels)
        .where(eq(wheels.userId, userId));
      
      const [chakrasCount] = await db.select({ count: count() })
        .from(chakras)
        .where(eq(chakras.userId, userId));
      
      const [sparksCount] = await db.select({ count: count() })
        .from(sparks)
        .where(eq(sparks.userId, userId));
      
      const [thoughtsCount] = await db.select({ count: count() })
        .from(thoughts)
        .where(eq(thoughts.userId, userId));

      res.json({
        dots: dotsCount?.count || 0,
        wheels: wheelsCount?.count || 0,
        chakras: chakrasCount?.count || 0,
        sparks: sparksCount?.count || 0,
        thoughts: thoughtsCount?.count || 0
      });
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'DotSpark API',
      status: 'running',
      version: '1.0.0'
    });
  });

  console.log('Cloud routes registered successfully');
}
