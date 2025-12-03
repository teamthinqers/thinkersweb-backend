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
      
      // Thoughts myneura - user's thoughts
      app.get('/api/thoughts/myneura', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ thoughts: [] });
          const thoughts = await db.query.thoughts.findMany({
            where: eq(schema.thoughts.userId, user.id),
            orderBy: desc(schema.thoughts.createdAt)
          });
          res.json({ thoughts });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Thoughts neural strength
      app.get('/api/thoughts/neural-strength', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ strength: 0 });
          const dotsCount = await db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, user.id));
          const strength = Math.min(100, (dotsCount[0]?.count || 0) * 5);
          res.json({ strength });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Social feed
      app.get('/api/social/feed', async (req, res) => {
        try {
          const thoughts = await db.query.thoughts.findMany({
            orderBy: desc(schema.thoughts.createdAt),
            limit: 20,
            with: { user: true }
          });
          res.json({ feed: thoughts });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Categories
      app.get('/api/categories', async (req, res) => {
        try {
          res.json([]);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Tags
      app.get('/api/tags', async (req, res) => {
        try {
          res.json([]);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Related tags
      app.get('/api/tags/:id/related', (req, res) => {
        res.json([]);
      });
      
      // Entries
      app.get('/api/entries', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json([]);
          res.json([]);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Entry by ID
      app.get('/api/entries/:id', (req, res) => {
        res.json(null);
      });
      
      // Auth refresh
      app.post('/api/auth/refresh', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ user: null });
          res.json({ user });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Validate invite code
      app.post('/api/validate-invite-code', (req, res) => {
        const { inviteCode } = req.body;
        if (inviteCode === 'DOTSPARK2024' || inviteCode === 'NEURAL') {
          res.json({ valid: true });
        } else {
          res.status(400).json({ message: 'Invalid invite code' });
        }
      });
      
      // WhatsApp endpoints
      app.get('/api/whatsapp/status', (req, res) => {
        res.json({ registered: false, phoneNumber: null });
      });
      
      app.get('/api/whatsapp/contact', (req, res) => {
        res.json({ number: '+1234567890', message: 'Hello from DotSpark!' });
      });
      
      app.post('/api/whatsapp/register-direct', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/whatsapp/unregister', (req, res) => {
        res.json({ success: true });
      });
      
      // Network insights
      app.get('/api/network/insights', (req, res) => {
        res.json({ insights: [], connections: 0 });
      });
      
      // Users search
      app.get('/api/users/search', async (req, res) => {
        try {
          const query = req.query.q as string;
          if (!query) return res.json([]);
          res.json([]);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // User stats
      app.get('/api/user/stats', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ dots: 0, wheels: 0, chakras: 0, sparks: 0, thoughts: 0 });
          
          const dotsCount = await db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, user.id));
          const wheelsCount = await db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, user.id));
          const chakrasCount = await db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, user.id));
          const sparksCount = await db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, user.id));
          const thoughtsCount = await db.select({ count: count() }).from(schema.thoughts).where(eq(schema.thoughts.userId, user.id));
          
          res.json({
            dots: dotsCount[0]?.count || 0,
            wheels: wheelsCount[0]?.count || 0,
            chakras: chakrasCount[0]?.count || 0,
            sparks: sparksCount[0]?.count || 0,
            thoughts: thoughtsCount[0]?.count || 0
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Cognitive identity
      app.get('/api/users/cognitive-identity', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          res.json({ configured: !!user, identity: null });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.post('/api/cognitive-identity/configure', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/cognishield/configure', (req, res) => {
        res.json({ success: true });
      });
      
      // Mapping endpoints
      app.get('/api/mapping/dot-to-wheel', (req, res) => {
        res.json([]);
      });
      
      app.get('/api/mapping/dot-to-chakra', (req, res) => {
        res.json([]);
      });
      
      app.get('/api/mapping/wheel-to-chakra', (req, res) => {
        res.json([]);
      });
      
      app.post('/api/mapping/dot-to-wheel', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/mapping/dot-to-chakra', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/mapping/wheel-to-chakra', (req, res) => {
        res.json({ success: true });
      });
      
      // Indexing endpoints
      app.get('/api/indexing/stats', (req, res) => {
        res.json({ indexed: 0, pending: 0 });
      });
      
      app.post('/api/indexing/semantic-search', (req, res) => {
        res.json({ results: [] });
      });
      
      app.post('/api/indexing/analyze-patterns', (req, res) => {
        res.json({ patterns: [] });
      });
      
      app.post('/api/indexing/detect-gaps', (req, res) => {
        res.json({ gaps: [] });
      });
      
      app.post('/api/indexing/full-reindex', (req, res) => {
        res.json({ success: true });
      });
      
      // Chat endpoints
      app.post('/api/chat/intelligent', (req, res) => {
        res.json({ response: 'Chat functionality is available in development mode.' });
      });
      
      app.post('/api/chat/continue-point', (req, res) => {
        res.json({ response: 'Continue point chat.' });
      });
      
      app.post('/api/chat/advanced', (req, res) => {
        res.json({ response: 'Advanced chat.' });
      });
      
      app.post('/api/transcribe-voice', (req, res) => {
        res.json({ text: '' });
      });
      
      // Cognitive analyze and query
      app.post('/api/cognitive/analyze', (req, res) => {
        res.json({ analysis: null });
      });
      
      app.post('/api/cognitive/query', (req, res) => {
        res.json({ result: null });
      });
      
      // DotSpark tuning
      app.post('/api/dotspark/tuning', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/dotspark/learning-focus', (req, res) => {
        res.json({ success: true });
      });
      
      // Thought by ID
      app.get('/api/thoughts/:thoughtId', async (req, res) => {
        try {
          const thoughtId = parseInt(req.params.thoughtId);
          const thought = await db.query.thoughts.findFirst({
            where: eq(schema.thoughts.id, thoughtId),
            with: { user: true }
          });
          if (!thought) return res.status(404).json({ error: 'Thought not found' });
          res.json(thought);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Update thought
      app.patch('/api/thoughts/:thoughtId', async (req, res) => {
        try {
          const thoughtId = parseInt(req.params.thoughtId);
          const { heading, summary } = req.body;
          const [updated] = await db.update(schema.thoughts)
            .set({ heading, summary, updatedAt: new Date() })
            .where(eq(schema.thoughts.id, thoughtId))
            .returning();
          res.json(updated);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Delete thought
      app.delete('/api/thoughts/:thoughtId', async (req, res) => {
        try {
          const thoughtId = parseInt(req.params.thoughtId);
          await db.delete(schema.thoughts).where(eq(schema.thoughts.id, thoughtId));
          res.json({ success: true });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Thought social thread status
      app.get('/api/thoughts/:thoughtId/social-thread-status', (req, res) => {
        res.json({ shared: false });
      });
      
      app.post('/api/thoughts/:thoughtId/social-thread-status', (req, res) => {
        res.json({ success: true });
      });
      
      // Thought perspectives
      app.get('/api/thoughts/:thoughtId/perspectives', (req, res) => {
        res.json({ perspectives: [] });
      });
      
      app.post('/api/thoughts/:thoughtId/perspectives', (req, res) => {
        res.json({ success: true });
      });
      
      // Social sparks
      app.get('/api/thoughts/:thoughtId/social-sparks', (req, res) => {
        res.json({ sparks: [] });
      });
      
      // Share thought to social
      app.post('/api/thoughts/:thoughtId/share-to-social', (req, res) => {
        res.json({ success: true });
      });
      
      // Save thought to myneura
      app.post('/api/thoughts/myneura/save/:thoughtId', (req, res) => {
        res.json({ success: true });
      });
      
      // Connections endpoints
      app.get('/api/connections', (req, res) => {
        res.json([]);
      });
      
      app.get('/api/connections/requests', (req, res) => {
        res.json([]);
      });
      
      app.post('/api/connections', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/connections/:connectionId/accept', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/connections/:connectionId/reject', (req, res) => {
        res.json({ success: true });
      });
      
      app.delete('/api/connections/:connectionId', (req, res) => {
        res.json({ success: true });
      });
      
      // Entries share
      app.post('/api/entries/share', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/entries/share-by-tags', (req, res) => {
        res.json({ success: true });
      });
      
      app.post('/api/entries/share-all', (req, res) => {
        res.json({ success: true });
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
      
      // User badges
      app.get('/api/users/:userId/badges', async (req, res) => {
        try {
          const userId = parseInt(req.params.userId);
          // Return sample badges for now
          res.json({
            badges: [
              { id: 1, name: 'First Dot', description: 'Created your first dot', earned: true, earnedAt: new Date() },
              { id: 2, name: 'Deep Thinker', description: 'Created 10 dots', earned: false },
              { id: 3, name: 'Connector', description: 'Linked 5 dots to wheels', earned: false }
            ]
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Notifications - Simple
      app.get('/api/notifications-simple', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) {
            return res.json({ notifications: [], unreadCount: 0 });
          }
          // Return recent activity as notifications
          const recentDots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, user.id),
            orderBy: desc(schema.dots.createdAt),
            limit: 5
          });
          const notifications = recentDots.map(dot => ({
            id: dot.id,
            type: 'dot_created',
            message: `You created a new dot: ${dot.oneWordSummary || 'Untitled'}`,
            createdAt: dot.createdAt,
            read: true
          }));
          res.json({ notifications, unreadCount: 0 });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Notifications - Full list
      app.get('/api/notifications', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) {
            return res.json({ success: true, notifications: [], unreadCount: 0 });
          }
          // Return recent activity as notifications
          const recentDots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, user.id),
            orderBy: desc(schema.dots.createdAt),
            limit: 10
          });
          const notifications = recentDots.map(dot => ({
            id: dot.id,
            type: 'dot_created',
            title: 'New Dot Created',
            message: `You created: ${dot.oneWordSummary || 'Untitled'}`,
            createdAt: dot.createdAt,
            read: true
          }));
          res.json({ success: true, notifications, unreadCount: 0 });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Recent activities
      app.get('/api/activities/recent', async (req, res) => {
        try {
          const user = await getUserFromToken(req);
          if (!user) return res.json({ activities: [] });
          
          const recentDots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, user.id),
            orderBy: desc(schema.dots.createdAt),
            limit: 10
          });
          
          const activities = recentDots.map(dot => ({
            id: dot.id,
            type: 'dot_created',
            description: `Created dot: ${dot.oneWordSummary || 'Untitled'}`,
            timestamp: dot.createdAt
          }));
          
          res.json({ activities });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
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
