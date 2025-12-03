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
  console.log('✅ Firebase Admin initialized');
}

// Catch any uncaught errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED:', reason);
});

console.log('=== Cloud Run Server Starting ===');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

// CORS middleware
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

// Health endpoints (before auth middleware)
app.get('/health', (req, res) => res.json({ status: 'healthy' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Start listening first, then load routes
const httpServer = createServer(app);

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`=== Listening on port ${port} ===`);
  
  const loadRoutes = async () => {
    try {
      console.log('Loading database and schema...');
      
      // Add timeout wrapper for imports
      const importWithTimeout = async <T>(importFn: () => Promise<T>, name: string, timeoutMs = 10000): Promise<T> => {
        return Promise.race([
          importFn(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error(`Import of ${name} timed out after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };
      
      console.log('Importing db module...');
      const dbModule = await importWithTimeout(() => import('@db'), '@db');
      const db = dbModule.db;
      console.log('db module imported');
      
      console.log('Importing schema...');
      const schema = await importWithTimeout(() => import('@shared/schema'), '@shared/schema');
      console.log('schema imported');
      
      console.log('Importing drizzle-orm...');
      const { eq, desc, count, or, and, sql } = await import('drizzle-orm');
      console.log('drizzle-orm imported');
      
      // Test database connection with a simple query
      console.log('Testing database connection...');
      try {
        const testResult = await db.query.users.findFirst();
        console.log('Database connection verified - found user:', testResult?.email || 'no users yet');
      } catch (dbError: any) {
        console.error('Database connection test failed:', dbError.message);
      }
      
      console.log('Database connected successfully');
      
      // ============================================
      // BEARER TOKEN AUTH MIDDLEWARE
      // Populates req.user for all requests
      // ============================================
      app.use(async (req: any, res, next) => {
        try {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.substring(7);
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const user = await db.query.users.findFirst({
              where: eq(schema.users.firebaseUid, decodedToken.uid)
            });
            if (user) {
              req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                fullName: user.fullName,
                avatar: user.avatar,
                avatarUrl: user.avatar,
                firebaseUid: user.firebaseUid,
                linkedinHeadline: user.linkedinHeadline,
                linkedinProfileUrl: user.linkedinProfileUrl,
                linkedinPhotoUrl: user.linkedinPhotoUrl,
                aboutMe: user.aboutMe,
                cognitiveIdentityCompleted: user.cognitiveIdentityCompleted,
                learningEngineCompleted: user.learningEngineCompleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
              // Also set session-like properties for router compatibility
              req.session = { userId: user.id };
            }
          }
        } catch (e) {
          // Token invalid or expired - continue without user
        }
        next();
      });
      
      // ============================================
      // AUTH ENDPOINTS (Cloud Run specific)
      // ============================================
      
      // Login with Firebase token
      app.post('/api/auth/login', async (req, res) => {
        try {
          const { idToken, email, displayName, photoURL } = req.body;
          
          if (!idToken) {
            return res.status(400).json({ error: 'ID token required' });
          }
          
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          const firebaseUid = decodedToken.uid;
          const userEmail = decodedToken.email || email;
          
          let user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, firebaseUid)
          });
          
          let isNewUser = false;
          
          if (!user && userEmail) {
            user = await db.query.users.findFirst({
              where: eq(schema.users.email, userEmail)
            });
            
            if (user) {
              const [updated] = await db.update(schema.users)
                .set({ firebaseUid, updatedAt: new Date() })
                .where(eq(schema.users.id, user.id))
                .returning();
              user = updated;
            }
          }
          
          if (!user) {
            isNewUser = true;
            const username = userEmail?.split('@')[0] || `user_${Date.now()}`;
            const [newUser] = await db.insert(schema.users)
              .values({
                firebaseUid,
                email: userEmail || '',
                fullName: displayName || decodedToken.name,
                avatar: photoURL || decodedToken.picture,
                username,
                dotSparkActivated: true
              })
              .returning();
            user = newUser;
          }
          
          res.json({
            success: true,
            isNewUser,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              avatar: user.avatar,
              avatarUrl: user.avatar,
              firebaseUid: user.firebaseUid,
              linkedinHeadline: user.linkedinHeadline,
              linkedinProfileUrl: user.linkedinProfileUrl,
              linkedinPhotoUrl: user.linkedinPhotoUrl,
              cognitiveIdentityCompleted: user.cognitiveIdentityCompleted,
              learningEngineCompleted: user.learningEngineCompleted,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        } catch (e: any) {
          console.error('Auth login error:', e);
          res.status(401).json({ error: 'Authentication failed: ' + e.message });
        }
      });
      
      // Firebase endpoint (alias for login)
      app.post('/api/auth/firebase', async (req, res) => {
        try {
          const { idToken } = req.body;
          if (!idToken) {
            return res.status(400).json({ error: 'idToken required' });
          }
          
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          let user = await db.query.users.findFirst({
            where: eq(schema.users.firebaseUid, decodedToken.uid)
          });
          
          if (!user && decodedToken.email) {
            user = await db.query.users.findFirst({
              where: eq(schema.users.email, decodedToken.email)
            });
            if (user) {
              const [updated] = await db.update(schema.users)
                .set({ firebaseUid: decodedToken.uid })
                .where(eq(schema.users.id, user.id))
                .returning();
              user = updated;
            }
          }
          
          if (!user) {
            const username = decodedToken.email?.split('@')[0] || `user_${Date.now()}`;
            const [newUser] = await db.insert(schema.users)
              .values({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email || '',
                fullName: decodedToken.name,
                avatar: decodedToken.picture,
                username,
                dotSparkActivated: true
              })
              .returning();
            user = newUser;
          }
          
          res.json({ user, isNewUser: false });
        } catch (e: any) {
          res.status(401).json({ error: e.message });
        }
      });
      
      // Get current user
      app.get('/api/auth/me', (req: any, res) => {
        if (req.user) {
          res.json({ user: req.user });
        } else {
          res.json({ user: null });
        }
      });
      
      // Auth refresh
      app.post('/api/auth/refresh', (req: any, res) => {
        if (req.user) {
          res.json({ user: req.user });
        } else {
          res.json({ user: null });
        }
      });
      
      // Logout
      app.post('/api/auth/logout', (req, res) => {
        res.json({ success: true });
      });
      
      // ============================================
      // MOUNT MODULAR ROUTERS
      // These contain all the business logic
      // ============================================
      
      console.log('Loading modular routers...');
      
      // Thoughts router - handles /api/thoughts/*
      const thoughtsModule = await import('./routes/thoughts');
      app.use('/api/thoughts', thoughtsModule.default);
      console.log('✅ Thoughts router mounted');
      
      // Social router - handles /api/social/*
      const socialModule = await import('./routes/social');
      app.use('/api/social', socialModule.default);
      console.log('✅ Social router mounted');
      
      // User content router - handles /api/user-content/*
      const userContentModule = await import('./routes/user-content');
      app.use('/api/user-content', userContentModule.default);
      console.log('✅ User content router mounted');
      
      // Notifications router - handles /api/notifications/*
      const notificationsModule = await import('./routes/notifications');
      app.use('/api/notifications', notificationsModule.default);
      console.log('✅ Notifications router mounted');
      
      // Notifications simple router
      const notificationsSimpleModule = await import('./routes/notifications-simple');
      app.use('/api/notifications-simple', notificationsSimpleModule.default);
      console.log('✅ Notifications simple router mounted');
      
      // ============================================
      // ADDITIONAL ENDPOINTS NOT IN ROUTERS
      // ============================================
      
      // Root endpoint
      app.get('/', (req, res) => {
        res.json({ message: 'ThinQers API', status: 'running', version: '2.0' });
      });
      
      // Validate invite code
      app.post('/api/validate-invite-code', (req, res) => {
        const { inviteCode } = req.body;
        if (inviteCode === 'DOTSPARK2024' || inviteCode === 'NEURAL' || inviteCode === 'THINQERS') {
          res.json({ valid: true });
        } else {
          res.status(400).json({ message: 'Invalid invite code' });
        }
      });
      
      // DotSpark status
      app.get('/api/dotspark/status', (req: any, res) => {
        res.json({
          isActive: !!req.user,
          features: { cogniShield: true, neuralProcessing: true }
        });
      });
      
      // Get dots (direct endpoint)
      app.get('/api/dots', async (req: any, res) => {
        try {
          const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
          if (!userId) return res.json([]);
          const dots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, userId),
            orderBy: desc(schema.dots.createdAt)
          });
          res.json(dots);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get wheels (direct endpoint)
      app.get('/api/wheels', async (req: any, res) => {
        try {
          const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
          if (!userId) return res.json([]);
          const wheels = await db.query.wheels.findMany({
            where: eq(schema.wheels.userId, userId),
            orderBy: desc(schema.wheels.createdAt)
          });
          res.json(wheels);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get chakras (direct endpoint)
      app.get('/api/chakras', async (req: any, res) => {
        try {
          const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
          if (!userId) return res.json([]);
          const chakras = await db.query.chakras.findMany({
            where: eq(schema.chakras.userId, userId),
            orderBy: desc(schema.chakras.createdAt)
          });
          res.json(chakras);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get sparks (direct endpoint)
      app.get('/api/sparks', async (req: any, res) => {
        try {
          const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
          if (!userId) return res.json([]);
          const sparks = await db.query.sparks.findMany({
            where: eq(schema.sparks.userId, userId),
            orderBy: desc(schema.sparks.createdAt)
          });
          res.json(sparks);
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Grid positions
      app.get('/api/grid/positions', async (req: any, res) => {
        try {
          if (!req.user) {
            return res.json({ 
              data: { 
                dotPositions: {}, wheelPositions: {}, chakraPositions: {}, 
                statistics: { totalDots: 0, totalWheels: 0, totalChakras: 0, freeDots: 0 } 
              } 
            });
          }
          
          const [dots, wheels, chakras] = await Promise.all([
            db.query.dots.findMany({ where: eq(schema.dots.userId, req.user.id) }),
            db.query.wheels.findMany({ where: eq(schema.wheels.userId, req.user.id) }),
            db.query.chakras.findMany({ where: eq(schema.chakras.userId, req.user.id) })
          ]);
          
          const dotPositions: Record<string, any> = {};
          const wheelPositions: Record<string, any> = {};
          const chakraPositions: Record<string, any> = {};
          
          dots.forEach((dot, i) => {
            dotPositions[dot.id] = { x: dot.positionX ?? (i % 5) * 100, y: dot.positionY ?? Math.floor(i / 5) * 100 };
          });
          wheels.forEach((wheel, i) => {
            wheelPositions[wheel.id] = { x: wheel.positionX ?? (i % 3) * 150, y: wheel.positionY ?? Math.floor(i / 3) * 150 };
          });
          chakras.forEach((chakra, i) => {
            chakraPositions[chakra.id] = { x: chakra.positionX ?? (i % 2) * 200, y: chakra.positionY ?? Math.floor(i / 2) * 200 };
          });
          
          res.json({
            data: {
              dotPositions, wheelPositions, chakraPositions,
              statistics: { 
                totalDots: dots.length, 
                totalWheels: wheels.length, 
                totalChakras: chakras.length, 
                freeDots: dots.filter(d => !d.wheelId).length 
              }
            }
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // User stats
      app.get('/api/user/stats', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ dots: 0, wheels: 0, chakras: 0, sparks: 0, thoughts: 0 });
          
          const [dotsCount, wheelsCount, chakrasCount, sparksCount, thoughtsCount] = await Promise.all([
            db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, req.user.id)),
            db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, req.user.id)),
            db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, req.user.id)),
            db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, req.user.id)),
            db.select({ count: count() }).from(schema.thoughts).where(eq(schema.thoughts.userId, req.user.id))
          ]);
          
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
      
      // Dashboard - Complete implementation matching routes.ts
      app.get('/api/dashboard', async (req: any, res) => {
        try {
          const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user?.id;
          
          if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
          }
          
          // Get user data for cognitive identity status
          const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
          });
          
          // Get basic counts
          const [dotsCount, wheelsCount, chakrasCount] = await Promise.all([
            db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, userId)),
            db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, userId)),
            db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, userId))
          ]);
          
          // Get user's thoughts count
          const [userThoughtsCount] = await db.select({ count: count() })
            .from(schema.thoughts)
            .where(eq(schema.thoughts.userId, userId));
          
          // Get saved thoughts count (for MyNeura)
          const [savedThoughtsCount] = await db.select({ count: count() })
            .from(schema.savedThoughts)
            .where(eq(schema.savedThoughts.userId, userId));
          
          // Get user's sparks count
          const [userSparksCount] = await db.select({ count: count() })
            .from(schema.sparks)
            .where(eq(schema.sparks.userId, userId));
          
          // Get user's perspectives count
          const [userPerspectivesCount] = await db.select({ count: count() })
            .from(schema.perspectivesMessages)
            .where(and(
              eq(schema.perspectivesMessages.userId, userId),
              eq(schema.perspectivesMessages.isDeleted, false)
            ));
          
          // Count personal thoughts (for MyNeura)
          const [personalThoughtsCount] = await db.select({ count: count() })
            .from(schema.thoughts)
            .where(and(
              eq(schema.thoughts.userId, userId),
              eq(schema.thoughts.visibility, 'personal')
            ));
          
          // MyNeura thoughts = personal thoughts + saved social thoughts
          const myNeuraThoughtsCount = Number(personalThoughtsCount?.count || 0) + Number(savedThoughtsCount?.count || 0);
          
          // Get circle contributions
          const [circleDotsCount] = await db.select({ count: count() })
            .from(schema.circleDots)
            .where(eq(schema.circleDots.sharedBy, userId));
          
          const [circleSparksCount] = await db.select({ count: count() })
            .from(schema.circleSparks)
            .where(eq(schema.circleSparks.sharedBy, userId));
          
          const [circlePerspectivesCount] = await db.select({ count: count() })
            .from(schema.circlePerspectives)
            .where(eq(schema.circlePerspectives.sharedBy, userId));
          
          // Calculate collective growth (platform-wide social engagement)
          const [platformThoughtsCount] = await db.select({ count: count() })
            .from(schema.thoughts)
            .where(or(
              eq(schema.thoughts.visibility, 'social'),
              eq(schema.thoughts.sharedToSocial, true)
            ));
          
          // Count sparks where users saved sparks on OTHER people's social thoughts (social engagement metric)
          const platformSparksResult = await db
            .select({ count: count() })
            .from(schema.sparks)
            .innerJoin(schema.thoughts, eq(schema.sparks.thoughtId, schema.thoughts.id))
            .where(and(
              or(
                eq(schema.thoughts.visibility, 'social'),
                eq(schema.thoughts.sharedToSocial, true)
              ),
              sql`${schema.sparks.userId} != ${schema.thoughts.userId}`
            ));
          const platformSparksCount = platformSparksResult[0] || { count: 0 };
          
          // Count perspectives on social thoughts (excluding soft-deleted)
          const platformPerspectivesResult = await db
            .select({ count: count() })
            .from(schema.perspectivesMessages)
            .innerJoin(schema.perspectivesThreads, eq(schema.perspectivesMessages.threadId, schema.perspectivesThreads.id))
            .innerJoin(schema.thoughts, eq(schema.perspectivesThreads.thoughtId, schema.thoughts.id))
            .where(and(
              or(
                eq(schema.thoughts.visibility, 'social'),
                eq(schema.thoughts.sharedToSocial, true)
              ),
              eq(schema.perspectivesMessages.isDeleted, false)
            ));
          const platformPerspectivesCount = platformPerspectivesResult[0] || { count: 0 };
          
          const totalPlatformItems = Number(platformThoughtsCount?.count || 0) + 
                                      Number(platformSparksCount?.count || 0) + 
                                      Number(platformPerspectivesCount?.count || 0);
          const collectiveGrowthPercentage = Math.min(100, Math.round(totalPlatformItems * 0.5));
          
          // Get recent activity (last 5 items)
          const recentDots = await db.query.dots.findMany({
            where: eq(schema.dots.userId, userId),
            orderBy: desc(schema.dots.createdAt),
            limit: 5,
          });
          
          const recentWheels = await db.query.wheels.findMany({
            where: eq(schema.wheels.userId, userId),
            orderBy: desc(schema.wheels.createdAt),
            limit: 5,
          });
          
          const recentThoughts = await db.query.thoughts.findMany({
            where: and(
              eq(schema.thoughts.userId, userId),
              eq(schema.thoughts.visibility, 'social')
            ),
            orderBy: desc(schema.thoughts.createdAt),
            limit: 5,
          });
          
          // Combine and sort recent activity
          const recentActivity = [
            ...recentDots.map(d => ({ type: 'dot', data: d, timestamp: d.createdAt })),
            ...recentWheels.map(w => ({ type: 'wheel', data: w, timestamp: w.createdAt })),
            ...recentThoughts.map(t => ({ type: 'thought', data: t, timestamp: t.createdAt })),
          ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
          
          // Calculate neural strength (inline calculation)
          const thoughtsCount = Number(userThoughtsCount?.count || 0);
          const sparksCount = Number(userSparksCount?.count || 0);
          const perspectivesCount = Number(userPerspectivesCount?.count || 0);
          const savedSparksCount = Number(savedThoughtsCount?.count || 0);
          const hasFirstThought = thoughtsCount > 0;
          
          // Neural strength calculation
          let neuralStrengthPercentage = 0; // Base
          if (user?.cognitiveIdentityCompleted) neuralStrengthPercentage += 25;
          if (user?.learningEngineCompleted) neuralStrengthPercentage += 25;
          if (hasFirstThought) neuralStrengthPercentage += 10;
          
          // Activity-based growth
          const totalActivity = thoughtsCount + sparksCount + perspectivesCount;
          neuralStrengthPercentage += Math.min(30, (totalActivity / 3) * 2);
          neuralStrengthPercentage += Math.min(10, savedSparksCount * 1);
          neuralStrengthPercentage = Math.min(100, Math.round(neuralStrengthPercentage));
          
          res.json({
            success: true,
            data: {
              neuralStrength: {
                percentage: neuralStrengthPercentage,
                milestones: {
                  cognitiveIdentityCompleted: user?.cognitiveIdentityCompleted || false,
                  learningEngineCompleted: user?.learningEngineCompleted || false,
                  hasActivity: hasFirstThought,
                },
                stats: {
                  thoughtsCount,
                  savedSparksCount,
                  userSparksCount: sparksCount,
                  perspectivesCount,
                },
              },
              collectiveGrowth: {
                percentage: collectiveGrowthPercentage,
              },
              stats: {
                dots: Number(dotsCount[0]?.count || 0),
                wheels: Number(wheelsCount[0]?.count || 0),
                chakras: Number(chakrasCount[0]?.count || 0),
                thoughts: thoughtsCount + Number(circleDotsCount?.count || 0),
                savedSparks: sparksCount + Number(circleSparksCount?.count || 0),
                perspectives: perspectivesCount + Number(circlePerspectivesCount?.count || 0),
              },
              myNeuraStats: {
                thoughts: myNeuraThoughtsCount,
                sparks: sparksCount,
              },
              socialStats: {
                thoughts: Number(platformThoughtsCount?.count || 0),
                sparks: Number(platformSparksCount?.count || 0),
                perspectives: Number(platformPerspectivesCount?.count || 0),
              },
              recentActivity,
            }
          });
        } catch (e: any) {
          console.error('Dashboard error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Cognitive identity endpoints
      app.get('/api/users/cognitive-identity', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ configured: false, identity: null });
          
          const identity = await db.query.cognitiveIdentity.findFirst({
            where: eq(schema.cognitiveIdentity.userId, req.user.id)
          });
          
          res.json({ 
            configured: !!identity, 
            identity: identity || null,
            user: {
              cognitiveIdentityCompleted: req.user.cognitiveIdentityCompleted,
              learningEngineCompleted: req.user.learningEngineCompleted
            }
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.get('/api/cognitive-identity/config', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ success: false, configured: false, data: null });
          
          const identity = await db.query.cognitiveIdentity.findFirst({
            where: eq(schema.cognitiveIdentity.userId, req.user.id)
          });
          
          res.json({ 
            success: true,
            configured: req.user.cognitiveIdentityCompleted || !!identity,
            data: identity || null,
            sections: [],
            progress: identity ? 100 : 0,
            isComplete: req.user.cognitiveIdentityCompleted || false,
            identity: identity || null
          });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.post('/api/cognitive-identity/configure', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const { cognitivePace, signalFocus, impulseControl, mentalEnergyFlow } = req.body;
          
          const existing = await db.query.cognitiveIdentity.findFirst({
            where: eq(schema.cognitiveIdentity.userId, req.user.id)
          });
          
          if (existing) {
            const [updated] = await db.update(schema.cognitiveIdentity)
              .set({ cognitivePace, signalFocus, impulseControl, mentalEnergyFlow, updatedAt: new Date() })
              .where(eq(schema.cognitiveIdentity.userId, req.user.id))
              .returning();
            
            await db.update(schema.users)
              .set({ cognitiveIdentityCompleted: true })
              .where(eq(schema.users.id, req.user.id));
              
            res.json({ success: true, identity: updated });
          } else {
            const [created] = await db.insert(schema.cognitiveIdentity)
              .values({ userId: req.user.id, cognitivePace, signalFocus, impulseControl, mentalEnergyFlow })
              .returning();
            
            await db.update(schema.users)
              .set({ cognitiveIdentityCompleted: true })
              .where(eq(schema.users.id, req.user.id));
              
            res.json({ success: true, identity: created });
          }
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // ThinQ Circles endpoints
      app.get('/api/thinq-circles', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ circles: [] });
          
          const circles = await db.query.thinqCircles.findMany({
            where: or(
              eq(schema.thinqCircles.createdBy, req.user.id),
              sql`${req.user.id} IN (SELECT user_id FROM thinq_circle_members WHERE circle_id = ${schema.thinqCircles.id})`
            ),
            orderBy: desc(schema.thinqCircles.createdAt)
          });
          
          res.json({ circles });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.get('/api/thinq-circles/:circleId', async (req: any, res) => {
        try {
          const circleId = parseInt(req.params.circleId);
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, circleId)
          });
          res.json({ success: !!circle, circle: circle || null });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.get('/api/thinq-circles/:circleId/thoughts', async (req: any, res) => {
        try {
          const circleId = parseInt(req.params.circleId);
          const circleDots = await db.query.circleDots.findMany({
            where: eq(schema.circleDots.circleId, circleId),
            with: { thought: { with: { user: true } } }
          });
          const thoughts = circleDots.map(cd => cd.thought).filter(Boolean);
          res.json({ thoughts });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      app.post('/api/thinq-circles', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const { name, description } = req.body;
          
          const [circle] = await db.insert(schema.thinqCircles)
            .values({
              name,
              description,
              createdBy: req.user.id
            })
            .returning();
          
          res.json({ success: true, circle });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user's circles (my-circles)
      app.get('/api/thinq-circles/my-circles', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ success: true, circles: [] });
          
          const circles = await db.query.thinqCircleMembers.findMany({
            where: eq(schema.thinqCircleMembers.userId, req.user.id),
            with: {
              circle: {
                with: {
                  creator: {
                    columns: {
                      id: true,
                      fullName: true,
                      avatar: true,
                      linkedinPhotoUrl: true,
                    },
                  },
                  members: true,
                },
              },
            },
          });
          
          res.json({
            success: true,
            circles: circles.map(m => ({
              ...m.circle,
              ownerId: m.circle.createdBy,
              role: m.role,
              memberCount: m.circle.members?.length || 0,
            })),
          });
        } catch (e: any) {
          console.error('Get circles error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get user's pending circle invites
      app.get('/api/thinq-circles/pending-invites', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ success: true, invites: [] });
          
          const pendingInvites = await db.query.thinqCircleInvites.findMany({
            where: and(
              eq(schema.thinqCircleInvites.inviteeUserId, req.user.id),
              eq(schema.thinqCircleInvites.status, 'pending')
            ),
            with: {
              circle: {
                columns: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
              inviter: {
                columns: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  linkedinPhotoUrl: true,
                },
              },
            },
            orderBy: desc(schema.thinqCircleInvites.createdAt),
          });
          
          res.json({
            success: true,
            invites: pendingInvites,
          });
        } catch (e: any) {
          console.error('Get pending invites error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // User badges - returns ALL badges with earned/locked status for gamification
      app.get('/api/users/:userId/badges', async (req: any, res) => {
        try {
          const userId = parseInt(req.params.userId);
          
          // Get all badges
          const allBadges = await db.query.badges.findMany({
            orderBy: desc(schema.badges.createdAt),
          });
          
          // Get user's earned badges
          const earnedBadges = await db.query.userBadges.findMany({
            where: eq(schema.userBadges.userId, userId),
            with: { badge: true }
          });
          
          // Create a map of earned badge IDs
          const earnedBadgeIds = new Set(earnedBadges.map(ub => ub.badgeId));
          const earnedBadgeMap = new Map(earnedBadges.map(ub => [ub.badgeId, ub.earnedAt]));
          
          // Combine all badges with earned status
          const badgesWithStatus = allBadges.map(badge => ({
            ...badge,
            earned: earnedBadgeIds.has(badge.id),
            earnedAt: earnedBadgeMap.get(badge.id) || null,
          }));
          
          res.json({ success: true, badges: badgesWithStatus });
        } catch (e: any) {
          console.error('Error fetching user badges:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // User profile - returns { success, user } format for PublicProfile.tsx
      app.get('/api/users/:userId', async (req: any, res) => {
        try {
          const userId = parseInt(req.params.userId);
          const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
          });
          if (!user) return res.status(404).json({ success: false, error: 'User not found' });
          
          // Get cognitive identity for profile display
          const cognitiveIdentity = await db.query.cognitiveIdentity.findFirst({
            where: eq(schema.cognitiveIdentity.userId, userId)
          });
          
          res.json({
            success: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
              fullName: user.fullName,
              avatar: user.avatar,
              linkedinHeadline: user.linkedinHeadline,
              linkedinProfileUrl: user.linkedinProfileUrl,
              linkedinPhotoUrl: user.linkedinPhotoUrl,
              aboutMe: user.aboutMe,
              cognitiveIdentityPublic: user.cognitiveIdentityPublic,
              hasCognitiveIdentity: !!cognitiveIdentity,
            }
          });
        } catch (e: any) {
          res.status(500).json({ success: false, error: e.message });
        }
      });
      
      // Toggle cognitive identity privacy
      app.patch('/api/users/cognitive-identity-privacy', async (req: any, res) => {
        try {
          if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
          }
          
          const { isPublic } = req.body;
          
          await db.update(schema.users)
            .set({ 
              cognitiveIdentityPublic: isPublic,
              updatedAt: new Date()
            })
            .where(eq(schema.users.id, req.user.id));
          
          res.json({ success: true, isPublic });
        } catch (e: any) {
          console.error('Error updating privacy:', e);
          res.status(500).json({ success: false, error: e.message });
        }
      });
      
      // User cognitive identity for public profile (CognitiveIdentityCard)
      app.get('/api/users/:userId/cognitive-identity', async (req: any, res) => {
        try {
          const userId = parseInt(req.params.userId);
          
          // Get the user to check privacy settings
          const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
          });
          
          if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
          }
          
          // Get cognitive identity
          const cognitiveIdentity = await db.query.cognitiveIdentity.findFirst({
            where: eq(schema.cognitiveIdentity.userId, userId)
          });
          
          // Check if viewing own profile or if identity is public
          const isOwnProfile = req.user?.id === userId;
          const isPublic = user.cognitiveIdentityPublic;
          
          // If not own profile and not public, return limited data
          if (!isOwnProfile && !isPublic) {
            return res.json({
              success: true,
              configured: !!cognitiveIdentity,
              isPublic: false,
              data: null // Don't expose private data
            });
          }
          
          res.json({
            success: true,
            configured: !!cognitiveIdentity,
            isPublic: isPublic,
            data: cognitiveIdentity || null
          });
        } catch (e: any) {
          console.error('Error fetching user cognitive identity:', e);
          res.status(500).json({ success: false, error: e.message });
        }
      });
      
      // User public dashboard for PublicProfile.tsx
      app.get('/api/users/:userId/dashboard', async (req: any, res) => {
        try {
          const userId = parseInt(req.params.userId);
          
          // Get user's public stats including sparks and perspectives
          const [dotsCount, wheelsCount, chakrasCount, thoughtsCount, sparksCount, perspectivesCount] = await Promise.all([
            db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, userId)),
            db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, userId)),
            db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, userId)),
            db.select({ count: count() }).from(schema.thoughts).where(eq(schema.thoughts.userId, userId)),
            db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, userId)),
            db.select({ count: count() }).from(schema.perspectivesThreads).where(eq(schema.perspectivesThreads.userId, userId)),
          ]);
          
          res.json({
            success: true,
            data: {
              stats: {
                dots: dotsCount[0]?.count || 0,
                wheels: wheelsCount[0]?.count || 0,
                chakras: chakrasCount[0]?.count || 0,
                thoughts: thoughtsCount[0]?.count || 0,
                savedSparks: sparksCount[0]?.count || 0,
                perspectives: perspectivesCount[0]?.count || 0,
              }
            }
          });
        } catch (e: any) {
          res.status(500).json({ success: false, error: e.message });
        }
      });
      
      // Recent activities
      app.get('/api/activities/recent', async (req: any, res) => {
        try {
          if (!req.user) return res.json({ activities: [] });
          
          const [recentDots, recentWheels, recentChakras, recentThoughts] = await Promise.all([
            db.query.dots.findMany({
              where: eq(schema.dots.userId, req.user.id),
              orderBy: desc(schema.dots.createdAt),
              limit: 5
            }),
            db.query.wheels.findMany({
              where: eq(schema.wheels.userId, req.user.id),
              orderBy: desc(schema.wheels.createdAt),
              limit: 3
            }),
            db.query.chakras.findMany({
              where: eq(schema.chakras.userId, req.user.id),
              orderBy: desc(schema.chakras.createdAt),
              limit: 2
            }),
            db.query.thoughts.findMany({
              where: eq(schema.thoughts.userId, req.user.id),
              orderBy: desc(schema.thoughts.createdAt),
              limit: 3
            })
          ]);
          
          const activities: any[] = [];
          
          recentDots.forEach(dot => {
            activities.push({
              id: `dot-${dot.id}`,
              type: 'dot_created',
              description: `Created dot: ${dot.oneWordSummary || 'Untitled'}`,
              timestamp: dot.createdAt
            });
          });
          
          recentWheels.forEach(wheel => {
            activities.push({
              id: `wheel-${wheel.id}`,
              type: 'wheel_created',
              description: `Created wheel: ${wheel.heading || 'Untitled'}`,
              timestamp: wheel.createdAt
            });
          });
          
          recentChakras.forEach(chakra => {
            activities.push({
              id: `chakra-${chakra.id}`,
              type: 'chakra_created',
              description: `Created chakra: ${chakra.heading || 'Untitled'}`,
              timestamp: chakra.createdAt
            });
          });
          
          recentThoughts.forEach(thought => {
            activities.push({
              id: `thought-${thought.id}`,
              type: 'thought_created',
              description: `Created thought: ${thought.heading || 'Untitled'}`,
              timestamp: thought.createdAt
            });
          });
          
          activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          res.json({ activities: activities.slice(0, 15) });
        } catch (e: any) {
          res.status(500).json({ error: e.message });
        }
      });
      
      // Categories and tags (stubs)
      app.get('/api/categories', (req, res) => res.json([]));
      app.get('/api/tags', (req, res) => res.json([]));
      app.get('/api/tags/:id/related', (req, res) => res.json([]));
      
      // Entries (stubs)
      app.get('/api/entries', (req, res) => res.json([]));
      app.get('/api/entries/:id', (req, res) => res.json(null));
      
      // WhatsApp endpoints (stubs for Cloud Run)
      app.get('/api/whatsapp/status', (req, res) => res.json({ registered: false }));
      app.get('/api/whatsapp/contact', (req, res) => res.json({ number: null }));
      app.post('/api/whatsapp/register-direct', (req, res) => res.json({ success: false, message: 'Not available on Cloud Run' }));
      app.post('/api/whatsapp/unregister', (req, res) => res.json({ success: true }));
      
      // Network insights (stub)
      app.get('/api/network/insights', (req, res) => res.json({ insights: [], connections: 0 }));
      
      // Users search
      app.get('/api/users/search', async (req, res) => {
        try {
          const query = req.query.q as string;
          if (!query || query.length < 2) return res.json([]);
          
          const searchPattern = `%${query}%`;
          
          // Use proper Drizzle ORM syntax with ilike
          const { ilike } = await import('drizzle-orm');
          
          const users = await db.query.users.findMany({
            where: or(
              ilike(schema.users.fullName, searchPattern),
              ilike(schema.users.username, searchPattern),
              ilike(schema.users.email, searchPattern)
            ),
            limit: 10,
            columns: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              linkedinHeadline: true,
              linkedinPhotoUrl: true
            }
          });
          
          res.json(users);
        } catch (e: any) {
          console.error('User search error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      console.log('=== All routes registered successfully ===');
      
    } catch (error: any) {
      console.error('ROUTE LOAD ERROR:', error.message);
      console.error('Stack:', error.stack);
      
      app.get('/', (req, res) => {
        res.status(500).json({ 
          message: 'ThinQers API',
          status: 'error',
          error: error.message
        });
      });
    }
  };
  
  loadRoutes();
});
