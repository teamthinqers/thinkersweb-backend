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
          res.json(thoughts);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get dots
      app.get('/api/dots', async (req, res) => {
        try {
          const userId = req.query.userId as string;
          if (!userId) return res.status(400).json({ error: 'userId required' });
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
          const userId = req.query.userId as string;
          if (!userId) return res.status(400).json({ error: 'userId required' });
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
          const userId = req.query.userId as string;
          if (!userId) return res.status(400).json({ error: 'userId required' });
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
          const userId = req.query.userId as string;
          if (!userId) return res.status(400).json({ error: 'userId required' });
          const sparks = await db.query.sparks.findMany({
            where: eq(schema.sparks.userId, parseInt(userId)),
            orderBy: desc(schema.sparks.createdAt)
          });
          res.json(sparks);
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
              firebaseUid: user.firebaseUid
            }
          });
        } catch (e: any) {
          console.error('Auth login error:', e);
          res.status(401).json({ error: 'Authentication failed: ' + e.message });
        }
      });
      
      // Auth me - get current user (stateless for now)
      app.get('/api/auth/me', (req, res) => {
        res.json(null);
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
