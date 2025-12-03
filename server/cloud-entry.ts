import express from 'express';
import { createServer } from 'http';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'dotspark-4846b',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

// Catch any uncaught errors FIRST
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED:', reason);
});

console.log('=== Server Starting ===');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

// CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://www.thinqers.in',
    'https://thinqers.in',
    'http://localhost:5000',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health endpoints
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Start listening first, then load routes
const httpServer = createServer(app);

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`=== Listening on port ${port} ===`);
  
  // Load routes with timeout protection
  const loadRoutes = async () => {
    console.log('Step 1: Starting route load...');
    
    try {
      console.log('Step 2: Importing db...');
      const { db } = await import('@db');
      console.log('Step 3: DB imported');
      
      console.log('Step 4: Importing schema...');
      const schema = await import('@shared/schema');
      console.log('Step 5: Schema imported');
      
      const { eq, desc, count } = await import('drizzle-orm');
      console.log('Step 6: Drizzle operators imported');
      
      // Helper to get user from Bearer token
      const getUserFromToken = async (req: any): Promise<any | null> => {
        try {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
          }
          const idToken = authHeader.substring(7);
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          const user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, decodedToken.uid)
          });
          return user;
        } catch (e) {
          return null;
        }
      };
      
      // Register routes inline
      app.get('/', (req, res) => {
        res.json({ message: 'DotSpark API', status: 'running' });
      });
      
      // Get thoughts
      app.get('/api/thoughts', async (req, res) => {
        try {
          const thoughts = await db.query.thoughts.findMany({
            orderBy: desc(schema.thoughts.createdAt),
            with: { user: true }
          });
          res.json({ thoughts });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get dots
      app.get('/api/dots', async (req, res) => {
        try {
          let userId = req.query.userId as string;
          if (!userId) {
            const user = await getUserFromToken(req);
            if (user) userId = String(user.id);
          }
          if (!userId) return res.json([]);
          const dots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, parseInt(userId)),
            orderBy: desc(schema.dots.createdAt)
          });
          res.json(dots);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get wheels
      app.get('/api/wheels', async (req, res) => {
        try {
          let userId = req.query.userId as string;
          if (!userId) {
            const user = await getUserFromToken(req);
            if (user) userId = String(user.id);
          }
          if (!userId) return res.json([]);
          const wheels = await db.query.wheels.findMany({
            where: eq(schema.wheels.userId, parseInt(userId)),
            orderBy: desc(schema.wheels.createdAt)
          });
          res.json(wheels);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get chakras
      app.get('/api/chakras', async (req, res) => {
        try {
          let userId = req.query.userId as string;
          if (!userId) {
            const user = await getUserFromToken(req);
            if (user) userId = String(user.id);
          }
          if (!userId) return res.json([]);
          const chakras = await db.query.chakras.findMany({
            where: eq(schema.chakras.userId, parseInt(userId)),
            orderBy: desc(schema.chakras.createdAt)
          });
          res.json(chakras);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get sparks
      app.get('/api/sparks', async (req, res) => {
        try {
          let userId = req.query.userId as string;
          if (!userId) {
            const user = await getUserFromToken(req);
            if (user) userId = String(user.id);
          }
          if (!userId) return res.json([]);
          const sparks = await db.query.sparks.findMany({
            where: eq(schema.sparks.userId, parseInt(userId)),
            orderBy: desc(schema.sparks.createdAt)
          });
          res.json(sparks);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user-content dots (for Dashboard and UserGrid)
      app.get('/api/user-content/dots', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json([]);
          const dots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, user.id),
            orderBy: desc(schema.dots.createdAt)
          });
          res.json(dots);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user-content wheels
      app.get('/api/user-content/wheels', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json([]);
          const wheels = await db.query.wheels.findMany({
            where: eq(schema.wheels.userId, user.id),
            orderBy: desc(schema.wheels.createdAt)
          });
          res.json(wheels);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user-content chakras
      app.get('/api/user-content/chakras', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json([]);
          const chakras = await db.query.chakras.findMany({
            where: eq(schema.chakras.userId, user.id),
            orderBy: desc(schema.chakras.createdAt)
          });
          res.json(chakras);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get social dots (public dots for social feed)
      app.get('/api/social/dots', async (req, res) => {
        try {
          const dots = await db.query.dots.findMany({
            orderBy: desc(schema.dots.createdAt),
            limit: 50,
            with: { user: true }
          });
          res.json(dots);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get grid positions
      app.get('/api/grid/positions', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) {
            return res.json({ 
              data: { 
                dotPositions: {}, 
                wheelPositions: {}, 
                chakraPositions: {}, 
                statistics: { totalDots: 0, totalWheels: 0, totalChakras: 0, freeDots: 0 } 
              } 
            });
          }
          
          // Return positions for user's content
          const dots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, user.id)
          });
          const wheels = await db.query.wheels.findMany({
            where: eq(schema.wheels.userId, user.id)
          });
          const chakras = await db.query.chakras.findMany({
            where: eq(schema.chakras.userId, user.id)
          });
          
          const dotPositions: Record<string, any> = {};
          const wheelPositions: Record<string, any> = {};
          const chakraPositions: Record<string, any> = {};
          
          dots.forEach((dot, i) => {
            dotPositions[dot.id] = { x: (i % 5) * 100, y: Math.floor(i / 5) * 100 };
          });
          wheels.forEach((wheel, i) => {
            wheelPositions[wheel.id] = { x: (i % 3) * 150, y: Math.floor(i / 3) * 150 };
          });
          chakras.forEach((chakra, i) => {
            chakraPositions[chakra.id] = { x: (i % 2) * 200, y: Math.floor(i / 2) * 200 };
          });
          
          res.json({
            data: {
              dotPositions,
              wheelPositions,
              chakraPositions,
              statistics: { 
                totalDots: dots.length, 
                totalWheels: wheels.length, 
                totalChakras: chakras.length, 
                freeDots: dots.length 
              }
            }
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circle by ID
      app.get('/api/thinq-circles/:circleId', async (req, res) => {
        try {
          const circleId = parseInt(req.params.circleId);
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, circleId)
          });
          if (!circle) {
            return res.json({ success: false, circle: null });
          }
          res.json({ success: true, circle });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circle thoughts
      app.get('/api/thinq-circles/:circleId/thoughts', async (req, res) => {
        try {
          res.json({ thoughts: [] });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Thoughts sparks
      app.get('/api/thoughts/:thoughtId/sparks', async (req, res) => {
        try {
          res.json({ success: true, sparks: [] });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Thoughts perspectives
      app.get('/api/thoughts/:thoughtId/perspectives/personal', async (req, res) => {
        try {
          res.json({ perspectives: [] });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // DotSpark status
      app.get('/api/dotspark/status', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          res.json({
            isActive: !!user,
            features: {
              cogniShield: true,
              neuralProcessing: true
            }
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // User sparks count
      app.get('/api/thoughts/user/sparks-count', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ count: 0 });
          const sparksCount = await db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, user.id));
          res.json({ count: sparksCount[0]?.count || 0 });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user by Firebase UID
      app.get('/api/users/firebase/:firebaseUid', async (req, res) => {
        try {
          const user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, req.params.firebaseUid)
          });
          if (!user) return res.status(404).json({ error: 'User not found' });
          res.json(user);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Create/update user
      app.post('/api/users/firebase', async (req, res) => {
        try {
          const { firebaseUid, email, displayName, photoURL } = req.body;
          let user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, firebaseUid)
          });
          
          if (user) {
            const [updated] = await db.update(schema.users)
              .set({ 
                email: email || user.email,
                fullName: displayName || user.fullName,
                avatar: photoURL || user.avatar,
                updatedAt: new Date()
              })
              .where(eq(schema.users.id, user.id))
              .returning();
            return res.json(updated);
          }
          
          const [newUser] = await db.insert(schema.users)
            .values({
              firebaseUid,
              email,
              fullName: displayName,
              avatar: photoURL,
              username: email?.split('@')[0] || `user_${Date.now()}`
            })
            .returning();
          
          res.status(201).json(newUser);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circles
      app.get('/api/thinq-circles', async (req, res) => {
        try {
          const circles = await db.query.thinqCircles.findMany({
            orderBy: desc(schema.thinqCircles.createdAt)
          });
          res.json(circles);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circles - My Circles (returns all circles for now)
      app.get('/api/thinq-circles/my-circles', async (req, res) => {
        try {
          const circles = await db.query.thinqCircles.findMany({
            orderBy: desc(schema.thinqCircles.createdAt),
            limit: 10
          });
          res.json(circles);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circles - Pending Invites
      app.get('/api/thinq-circles/pending-invites', (req, res) => {
        res.json([]);
      });
      
      // Badges - Pending
      app.get('/api/badges/pending', (req, res) => {
        res.json([]);
      });
      
      // Notifications - Simple
      app.get('/api/notifications-simple', (req, res) => {
        res.json({ notifications: [], unreadCount: 0 });
      });
      
      // Notifications
      app.get('/api/notifications', (req, res) => {
        res.json({ success: true, notifications: [], unreadCount: 0 });
      });
      
      // Dashboard
      app.get('/api/dashboard', async (req, res) => {
        try {
          let userId = req.query.userId as string;
          if (!userId) {
            const user = await getUserFromToken(req);
            if (user) userId = String(user.id);
          }
          if (!userId) return res.json({ dots: 0, wheels: 0, chakras: 0, sparks: 0 });
          
          const dotsCount = await db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, parseInt(userId)));
          const wheelsCount = await db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, parseInt(userId)));
          const chakrasCount = await db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, parseInt(userId)));
          const sparksCount = await db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, parseInt(userId)));
          
          res.json({
            dots: dotsCount[0]?.count || 0,
            wheels: wheelsCount[0]?.count || 0,
            chakras: chakrasCount[0]?.count || 0,
            sparks: sparksCount[0]?.count || 0
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Cognitive Identity Config
      app.get('/api/cognitive-identity/config', (req, res) => {
        res.json({ 
          sections: [],
          progress: 0,
          isComplete: false
        });
      });
      
      // Thoughts Stats
      app.get('/api/thoughts/stats', async (req, res) => {
        try {
          const thoughtsCount = await db.select({ count: count() }).from(schema.thoughts);
          res.json({ total: thoughtsCount[0]?.count || 0 });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Auth login - Firebase token verification
      app.post('/api/auth/login', async (req, res) => {
        try {
          const { idToken, email, displayName, photoURL } = req.body;
          
          if (!idToken) {
            return res.status(400).json({ error: 'ID token required' });
          }
          
          // Verify Firebase token
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          const firebaseUid = decodedToken.uid;
          const userEmail = decodedToken.email || email;
          
          // Find or create user
          let user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, firebaseUid)
          });
          
          if (!user && userEmail) {
            // Try to find by email
            user = await db.query.users.findFirst({
              where: eq(schema.users.email, userEmail)
            });
            
            if (user) {
              // Link existing user to Firebase
              const [updated] = await db.update(schema.users)
                .set({ firebaseUid, updatedAt: new Date() })
                .where(eq(schema.users.id, user.id))
                .returning();
              user = updated;
            }
          }
          
          if (!user) {
            // Create new user
            const username = userEmail?.split('@')[0] || `user_${Date.now()}`;
            const [newUser] = await db.insert(schema.users)
              .values({
                firebaseUid,
                email: userEmail,
                fullName: displayName || decodedToken.name,
                avatar: photoURL || decodedToken.picture,
                username
              })
              .returning();
            user = newUser;
          }
          
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              avatar: user.avatar,
              avatarUrl: user.avatar, // Frontend expects avatarUrl
              firebaseUid: user.firebaseUid,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        } catch (e: any) {
          console.error('Auth login error:', e);
          res.status(401).json({ error: 'Authentication failed: ' + e.message });
        }
      });
      
      // Auth me - get current user from Bearer token
      app.get('/api/auth/me', async (req, res) => {
        try {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ user: null });
          }
          
          const idToken = authHeader.substring(7);
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          const firebaseUid = decodedToken.uid;
          
          const user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, firebaseUid)
          });
          
          if (!user) {
            return res.json({ user: null });
          }
          
          res.json({
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              avatar: user.avatar,
              avatarUrl: user.avatar,
              firebaseUid: user.firebaseUid,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        } catch (e: any) {
          console.error('Auth me error:', e);
          res.json({ user: null });
        }
      });
      
      // Auth logout
      app.post('/api/auth/logout', (req, res) => {
        res.json({ success: true });
      });
      
      console.log('=== All routes registered ===');
      
    } catch (error: any) {
      console.error('ROUTE LOAD ERROR:', error.message);
      console.error('Stack:', error.stack);
      
      app.get('/', (req, res) => {
        res.json({ 
          message: 'DotSpark API',
          status: 'error',
          error: error.message
        });
      });
    }
  };
  
  // Start loading routes
  loadRoutes();
});
