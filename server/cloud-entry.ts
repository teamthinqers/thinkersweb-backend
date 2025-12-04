import express from 'express';
import { createServer } from 'http';
import admin from 'firebase-admin';
import crypto from 'crypto';
import { db } from '../db';
import * as schema from '../shared/schema';
import { eq, desc, count, or, and, sql } from 'drizzle-orm';

console.log('=== Top-level imports completed ===');

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
      console.log('Loading routes with pre-imported database...');
      
      // Test database connection with a simple query
      console.log('Testing database connection...');
      try {
        const testResult = await db.query.users.findFirst();
        console.log('Database connection verified - found user:', testResult?.email || 'no users yet');
      } catch (dbError: any) {
        console.error('Database connection test failed:', dbError.message);
        throw dbError; // Fail fast instead of continuing with broken DB
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
              aboutMe: user.aboutMe,
              cognitiveIdentityPublic: user.cognitiveIdentityPublic,
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
      
      // ============================================
      // LINKEDIN OAUTH ENDPOINTS
      // ============================================
      const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
      const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
      const LINKEDIN_REDIRECT_URI = 'https://thinkersweb-backend-908196010054.europe-west1.run.app/api/auth/linkedin/callback';
      
      // In-memory state store for CSRF protection (simple for Cloud Run)
      const oauthStates = new Map<string, { createdAt: number }>();
      
      // Clean up old states periodically
      setInterval(() => {
        const now = Date.now();
        for (const [state, data] of oauthStates.entries()) {
          if (now - data.createdAt > 10 * 60 * 1000) { // 10 minutes
            oauthStates.delete(state);
          }
        }
      }, 60 * 1000);
      
      // GET /api/auth/linkedin - Initiate LinkedIn OAuth flow
      app.get('/api/auth/linkedin', (req, res) => {
        console.log('📱 LinkedIn OAuth initiation requested');
        
        if (!LINKEDIN_CLIENT_ID) {
          console.error('❌ LinkedIn Client ID not configured');
          return res.status(500).json({ error: 'LinkedIn OAuth not configured' });
        }
        
        const state = crypto.randomBytes(32).toString('hex');
        oauthStates.set(state, { createdAt: Date.now() });
        
        const scope = 'openid profile email';
        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code&` +
          `client_id=${LINKEDIN_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
          `state=${state}&` +
          `scope=${encodeURIComponent(scope)}`;
        
        console.log('🔗 Redirecting to LinkedIn OAuth');
        res.redirect(authUrl);
      });
      
      // GET /api/auth/linkedin/callback - Handle LinkedIn OAuth callback
      app.get('/api/auth/linkedin/callback', async (req, res) => {
        try {
          const { code, state } = req.query;
          
          // Verify state
          if (!state || !oauthStates.has(state as string)) {
            console.error('❌ Invalid OAuth state');
            return res.redirect('https://www.thinqers.in/?error=invalid_state');
          }
          oauthStates.delete(state as string);
          
          if (!code) {
            console.error('❌ No authorization code received');
            return res.redirect('https://www.thinqers.in/?error=no_code');
          }
          
          console.log('🔐 Exchanging code for LinkedIn access token...');
          
          // Exchange code for access token
          const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code as string,
              redirect_uri: LINKEDIN_REDIRECT_URI,
              client_id: LINKEDIN_CLIENT_ID!,
              client_secret: LINKEDIN_CLIENT_SECRET!,
            }),
          });
          
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('❌ Token exchange failed:', errorText);
            return res.redirect('https://www.thinqers.in/?error=token_exchange_failed');
          }
          
          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;
          console.log('✅ Access token obtained');
          
          // Get user profile
          const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          
          if (!profileResponse.ok) {
            console.error('❌ Profile fetch failed');
            return res.redirect('https://www.thinqers.in/?error=profile_fetch_failed');
          }
          
          const profile = await profileResponse.json();
          console.log('✅ LinkedIn profile obtained:', profile.email);
          
          const { sub: linkedinId, email, name, picture } = profile;
          
          if (!linkedinId || !email) {
            console.error('❌ Missing required profile data');
            return res.redirect('https://www.thinqers.in/?error=missing_profile_data');
          }
          
          // Find or create user
          let user = await db.query.users.findFirst({
            where: eq(schema.users.linkedinId, linkedinId)
          });
          
          if (!user) {
            user = await db.query.users.findFirst({
              where: eq(schema.users.email, email)
            });
            
            if (user) {
              // Link LinkedIn to existing user
              const [updated] = await db.update(schema.users)
                .set({
                  linkedinId,
                  fullName: name || user.fullName,
                  linkedinPhotoUrl: picture,
                  avatar: picture || user.avatar,
                  updatedAt: new Date()
                })
                .where(eq(schema.users.id, user.id))
                .returning();
              user = updated;
              console.log('✅ Linked LinkedIn to existing user:', user.email);
            } else {
              // Create new user
              const username = email.split('@')[0] + '_' + Date.now().toString(36);
              const [newUser] = await db.insert(schema.users)
                .values({
                  username,
                  email,
                  linkedinId,
                  fullName: name || username,
                  linkedinPhotoUrl: picture,
                  avatar: picture,
                  dotSparkActivated: true
                })
                .returning();
              user = newUser;
              console.log('✅ Created new user from LinkedIn:', user.email);
            }
          }
          
          // Create Firebase Custom Token for the user
          // Use a unique identifier that Firebase can recognize
          const customTokenUid = user.firebaseUid || `linkedin_${user.id}`;
          
          // If user doesn't have a firebaseUid, update them with one
          if (!user.firebaseUid) {
            const [updated] = await db.update(schema.users)
              .set({ firebaseUid: customTokenUid, updatedAt: new Date() })
              .where(eq(schema.users.id, user.id))
              .returning();
            user = updated;
          }
          
          // Create Firebase custom token
          const customToken = await admin.auth().createCustomToken(customTokenUid, {
            userId: user.id,
            email: user.email,
            provider: 'linkedin'
          });
          
          console.log('✅ LinkedIn auth successful, created custom token for user:', user.id);
          
          // Redirect to frontend with token in hash fragment (more secure than query params)
          res.redirect(`https://www.thinqers.in/linkedin-callback#token=${customToken}`);
          
        } catch (error: any) {
          console.error('❌ LinkedIn OAuth error:', error);
          res.redirect('https://www.thinqers.in/?error=oauth_failed');
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
      // IMPORTANT: my-circles must come BEFORE :circleId to prevent "my-circles" matching as a circleId
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
      
      // List all circles for user
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
      
      // Create new circle
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
      
      // Get specific circle by ID with members and stats (must come AFTER literal routes like /my-circles)
      app.get('/api/thinq-circles/:circleId', async (req: any, res) => {
        try {
          const circleId = parseInt(req.params.circleId);
          if (isNaN(circleId)) {
            return res.status(400).json({ error: 'Invalid circle ID' });
          }
          
          // Fetch circle with members
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, circleId),
            with: {
              members: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      fullName: true,
                      email: true,
                      avatar: true,
                      linkedinPhotoUrl: true,
                    }
                  }
                }
              }
            }
          });
          
          if (!circle) {
            return res.json({ success: false, circle: null });
          }
          
          // Get circle stats
          const [dotsCount] = await db.select({ count: count() })
            .from(schema.circleDots)
            .where(eq(schema.circleDots.circleId, circleId));
          
          const [sparksCount] = await db.select({ count: count() })
            .from(schema.circleSparks)
            .where(eq(schema.circleSparks.circleId, circleId));
          
          res.json({ 
            success: true, 
            circle: {
              ...circle,
              stats: {
                dots: dotsCount?.count || 0,
                sparks: sparksCount?.count || 0,
                members: circle.members?.length || 0,
              }
            }
          });
        } catch (e: any) {
          console.error('Get circle error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Get thoughts for specific circle
      app.get('/api/thinq-circles/:circleId/thoughts', async (req: any, res) => {
        try {
          const circleId = parseInt(req.params.circleId);
          if (isNaN(circleId)) {
            return res.status(400).json({ error: 'Invalid circle ID' });
          }
          const circleDotsData = await db.query.circleDots.findMany({
            where: eq(schema.circleDots.circleId, circleId),
            with: { 
              thought: { 
                with: { user: true } 
              },
              sharedByUser: {
                columns: {
                  id: true,
                  fullName: true,
                  avatar: true,
                  linkedinPhotoUrl: true,
                }
              }
            },
            orderBy: desc(schema.circleDots.sharedAt),
          });
          const thoughts = circleDotsData.map(cd => ({
            ...cd.thought,
            sharedBy: cd.sharedByUser,
            sharedAt: cd.sharedAt,
          })).filter(t => t.id);
          res.json({ thoughts });
        } catch (e: any) {
          console.error('Get circle thoughts error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Invite users to circle
      app.post('/api/thinq-circles/:circleId/invite', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const circleId = parseInt(req.params.circleId);
          const { existingUserIds, emailInvites } = req.body;
          
          // Verify user is circle member
          const membership = await db.query.thinqCircleMembers.findFirst({
            where: and(
              eq(schema.thinqCircleMembers.circleId, circleId),
              eq(schema.thinqCircleMembers.userId, req.user.id)
            ),
          });
          
          if (!membership) {
            return res.status(403).json({ error: 'You are not a member of this circle' });
          }
          
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, circleId),
          });
          
          if (!circle) {
            return res.status(404).json({ error: 'Circle not found' });
          }
          
          const results = { existingUsers: [] as any[], emailInvites: [] as any[] };
          
          // Invite existing users
          if (existingUserIds && existingUserIds.length > 0) {
            for (const inviteeUserId of existingUserIds) {
              const existingMember = await db.query.thinqCircleMembers.findFirst({
                where: and(
                  eq(schema.thinqCircleMembers.circleId, circleId),
                  eq(schema.thinqCircleMembers.userId, inviteeUserId)
                ),
              });
              
              if (existingMember) {
                results.existingUsers.push({ userId: inviteeUserId, status: 'already_member' });
                continue;
              }
              
              const token = `circle_${circleId}_${inviteeUserId}_${Date.now()}`;
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              const [invite] = await db.insert(schema.thinqCircleInvites).values({
                circleId,
                inviterUserId: req.user.id,
                inviteeEmail: '',
                inviteeUserId: inviteeUserId,
                token,
                expiresAt,
              }).returning();
              
              await db.insert(schema.notifications).values({
                recipientId: inviteeUserId,
                actorIds: JSON.stringify([req.user.id]),
                notificationType: 'circle_invite',
                circleInviteId: invite.id,
                circleName: circle.name,
              });
              
              results.existingUsers.push({ userId: inviteeUserId, status: 'invited', inviteId: invite.id });
            }
          }
          
          // Email invites
          if (emailInvites && emailInvites.length > 0) {
            for (const email of emailInvites) {
              const existingUser = await db.query.users.findFirst({
                where: eq(schema.users.email, email),
              });
              
              if (existingUser) {
                const existingMember = await db.query.thinqCircleMembers.findFirst({
                  where: and(
                    eq(schema.thinqCircleMembers.circleId, circleId),
                    eq(schema.thinqCircleMembers.userId, existingUser.id)
                  ),
                });
                
                if (existingMember) {
                  results.emailInvites.push({ email, status: 'already_member', userId: existingUser.id });
                  continue;
                }
                
                const token = `circle_${circleId}_${existingUser.id}_${Date.now()}`;
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                const [invite] = await db.insert(schema.thinqCircleInvites).values({
                  circleId,
                  inviterUserId: req.user.id,
                  inviteeEmail: email,
                  inviteeUserId: existingUser.id,
                  token,
                  expiresAt,
                }).returning();
                
                await db.insert(schema.notifications).values({
                  recipientId: existingUser.id,
                  actorIds: JSON.stringify([req.user.id]),
                  notificationType: 'circle_invite',
                  circleInviteId: invite.id,
                  circleName: circle.name,
                });
                
                results.emailInvites.push({ email, status: 'invited', userId: existingUser.id, inviteId: invite.id });
                continue;
              }
              
              const crypto = await import('crypto');
              const token = crypto.randomBytes(32).toString('hex');
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              const [invite] = await db.insert(schema.thinqCircleInvites).values({
                circleId,
                inviterUserId: req.user.id,
                inviteeEmail: email,
                token,
                expiresAt,
              }).returning();
              
              results.emailInvites.push({ email, status: 'invited', inviteId: invite.id });
            }
          }
          
          res.json({ success: true, results });
        } catch (e: any) {
          console.error('Invite to circle error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Accept circle invite
      app.post('/api/thinq-circles/invites/:inviteId/accept', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const inviteId = parseInt(req.params.inviteId);
          
          const invite = await db.query.thinqCircleInvites.findFirst({
            where: eq(schema.thinqCircleInvites.id, inviteId),
          });
          
          if (!invite) return res.status(404).json({ error: 'Invite not found' });
          if (invite.inviteeUserId !== req.user.id) return res.status(403).json({ error: 'This invite is not for you' });
          if (invite.status !== 'pending') return res.status(400).json({ error: 'Invite already processed' });
          
          if (new Date() > invite.expiresAt) {
            await db.update(schema.thinqCircleInvites)
              .set({ status: 'expired' })
              .where(eq(schema.thinqCircleInvites.id, inviteId));
            return res.status(400).json({ error: 'Invite expired' });
          }
          
          await db.insert(schema.thinqCircleMembers).values({
            circleId: invite.circleId,
            userId: req.user.id,
            role: 'member',
          });
          
          await db.update(schema.thinqCircleInvites)
            .set({ status: 'accepted', claimedAt: new Date() })
            .where(eq(schema.thinqCircleInvites.id, inviteId));
          
          await db.update(schema.notifications)
            .set({ isRead: true })
            .where(eq(schema.notifications.circleInviteId, inviteId));
          
          res.json({ success: true, circleId: invite.circleId });
        } catch (e: any) {
          console.error('Accept invite error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Reject circle invite
      app.post('/api/thinq-circles/invites/:inviteId/reject', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const inviteId = parseInt(req.params.inviteId);
          
          const invite = await db.query.thinqCircleInvites.findFirst({
            where: eq(schema.thinqCircleInvites.id, inviteId),
          });
          
          if (!invite) return res.status(404).json({ error: 'Invite not found' });
          if (invite.inviteeUserId !== req.user.id) return res.status(403).json({ error: 'This invite is not for you' });
          
          await db.update(schema.thinqCircleInvites)
            .set({ status: 'rejected' })
            .where(eq(schema.thinqCircleInvites.id, inviteId));
          
          await db.update(schema.notifications)
            .set({ isRead: true })
            .where(eq(schema.notifications.circleInviteId, inviteId));
          
          res.json({ success: true });
        } catch (e: any) {
          console.error('Reject invite error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Validate invite token (public)
      app.get('/api/thinq-circles/invites/validate/:token', async (req: any, res) => {
        try {
          const token = req.params.token;
          
          const invite = await db.query.thinqCircleInvites.findFirst({
            where: eq(schema.thinqCircleInvites.token, token),
          });
          
          if (!invite) return res.status(404).json({ error: 'Invite not found' });
          
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, invite.circleId),
          });
          
          const inviter = await db.query.users.findFirst({
            where: eq(schema.users.id, invite.inviterUserId),
          });
          
          res.json({
            success: true,
            invite: {
              id: invite.id,
              circleId: invite.circleId,
              circleName: circle?.name || 'Unknown Circle',
              inviterName: inviter?.fullName || 'Someone',
              inviteeEmail: invite.inviteeEmail,
              status: invite.status,
              expiresAt: invite.expiresAt,
            },
          });
        } catch (e: any) {
          console.error('Validate invite error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Create thought in circle
      app.post('/api/thinq-circles/:circleId/create-thought', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const circleId = parseInt(req.params.circleId);
          const { heading, summary, emotions, anchor } = req.body;
          
          const membership = await db.query.thinqCircleMembers.findFirst({
            where: and(
              eq(schema.thinqCircleMembers.circleId, circleId),
              eq(schema.thinqCircleMembers.userId, req.user.id)
            ),
          });
          
          if (!membership) return res.status(403).json({ error: 'You are not a member of this circle' });
          if (!heading || !summary) return res.status(400).json({ error: 'Heading and summary are required' });
          
          const [thought] = await db.insert(schema.thoughts).values({
            userId: req.user.id,
            heading: heading.trim(),
            summary: summary.trim(),
            emotions: emotions?.trim() || null,
            anchor: anchor?.trim() || null,
            visibility: 'personal',
            channel: 'circle',
            sharedToSocial: false,
          }).returning();
          
          await db.insert(schema.circleDots).values({
            circleId,
            thoughtId: thought.id,
            sharedBy: req.user.id,
          });
          
          res.json({ success: true, thought });
        } catch (e: any) {
          console.error('Create circle thought error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Share existing thought to circle
      app.post('/api/thinq-circles/:circleId/share-thought', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const circleId = parseInt(req.params.circleId);
          const { thoughtId } = req.body;
          
          if (!thoughtId) return res.status(400).json({ error: 'Thought ID is required' });
          
          const membership = await db.query.thinqCircleMembers.findFirst({
            where: and(
              eq(schema.thinqCircleMembers.circleId, circleId),
              eq(schema.thinqCircleMembers.userId, req.user.id)
            ),
          });
          
          if (!membership) return res.status(403).json({ error: 'You are not a member of this circle' });
          
          const thought = await db.query.thoughts.findFirst({
            where: eq(schema.thoughts.id, thoughtId),
          });
          
          if (!thought) return res.status(404).json({ error: 'Thought not found' });
          if (thought.userId !== req.user.id) return res.status(403).json({ error: 'You can only share your own thoughts' });
          
          const existingShare = await db.query.circleDots.findFirst({
            where: and(
              eq(schema.circleDots.circleId, circleId),
              eq(schema.circleDots.thoughtId, thoughtId)
            ),
          });
          
          if (existingShare) return res.status(400).json({ error: 'Thought already shared to this circle' });
          
          await db.insert(schema.circleDots).values({
            circleId,
            thoughtId,
            sharedBy: req.user.id,
          });
          
          res.json({ success: true, message: 'Thought shared to circle successfully' });
        } catch (e: any) {
          console.error('Share thought to circle error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Create spark in circle
      app.post('/api/thinq-circles/:circleId/thoughts/:thoughtId/sparks', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const circleId = parseInt(req.params.circleId);
          const thoughtId = parseInt(req.params.thoughtId);
          const { content } = req.body;
          
          if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
          
          const membership = await db.query.thinqCircleMembers.findFirst({
            where: and(
              eq(schema.thinqCircleMembers.circleId, circleId),
              eq(schema.thinqCircleMembers.userId, req.user.id)
            ),
          });
          
          if (!membership) return res.status(403).json({ error: 'You are not a member of this circle' });
          
          const [newSpark] = await db.insert(schema.sparks).values({
            thoughtId,
            userId: req.user.id,
            content: content.trim(),
          }).returning();
          
          await db.insert(schema.circleSparks).values({
            circleId,
            sparkId: newSpark.id,
            sharedBy: req.user.id,
          });
          
          res.json({ success: true, spark: newSpark });
        } catch (e: any) {
          console.error('Create circle spark error:', e);
          res.status(500).json({ error: e.message });
        }
      });
      
      // Delete circle
      app.delete('/api/thinq-circles/:circleId', async (req: any, res) => {
        try {
          if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
          
          const circleId = parseInt(req.params.circleId);
          if (isNaN(circleId)) return res.status(400).json({ error: 'Invalid circle ID' });
          
          const circle = await db.query.thinqCircles.findFirst({
            where: eq(schema.thinqCircles.id, circleId),
          });
          
          if (!circle) return res.status(404).json({ error: 'Circle not found' });
          if (circle.createdBy !== req.user.id) return res.status(403).json({ error: 'Only the circle owner can delete the circle' });
          
          await db.transaction(async (tx: any) => {
            await tx.delete(schema.thinqCircleInvites).where(eq(schema.thinqCircleInvites.circleId, circleId));
            await tx.delete(schema.circlePerspectives).where(eq(schema.circlePerspectives.circleId, circleId));
            await tx.delete(schema.circleSparks).where(eq(schema.circleSparks.circleId, circleId));
            await tx.delete(schema.circleDots).where(eq(schema.circleDots.circleId, circleId));
            await tx.delete(schema.thinqCircleMembers).where(eq(schema.thinqCircleMembers.circleId, circleId));
            await tx.delete(schema.thinqCircles).where(eq(schema.thinqCircles.id, circleId));
          });
          
          res.status(204).send();
        } catch (e: any) {
          console.error('Delete circle error:', e);
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
      
      // Users search - MUST be before /api/users/:userId to avoid :userId catching "search"
      app.get('/api/users/search', async (req: any, res) => {
        try {
          if (!req.user) {
            return res.status(401).json({ error: 'Authentication required', success: false, users: [] });
          }
          
          const query = req.query.q as string;
          if (!query || query.trim().length < 2) {
            return res.json({ success: true, users: [] });
          }
          
          const searchTerm = `%${query.trim()}%`;
          
          // Use SQL template for ILIKE (case-insensitive search)
          const foundUsers = await db.query.users.findMany({
            where: or(
              sql`${schema.users.fullName} ILIKE ${searchTerm}`,
              sql`${schema.users.email} ILIKE ${searchTerm}`
            ),
            columns: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              linkedinPhotoUrl: true,
              linkedinHeadline: true,
            },
            limit: 10,
          });
          
          res.json({ success: true, users: foundUsers });
        } catch (e: any) {
          console.error('User search error:', e);
          res.status(500).json({ success: false, error: e.message, users: [] });
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
          
          // Get user's public stats including savedSparks and perspectives
          const [dotsCount, wheelsCount, chakrasCount, thoughtsCount, sparksCount, perspectivesCount] = await Promise.all([
            db.select({ count: count() }).from(schema.dots).where(eq(schema.dots.userId, userId)),
            db.select({ count: count() }).from(schema.wheels).where(eq(schema.wheels.userId, userId)),
            db.select({ count: count() }).from(schema.chakras).where(eq(schema.chakras.userId, userId)),
            db.select({ count: count() }).from(schema.thoughts).where(eq(schema.thoughts.userId, userId)),
            db.select({ count: count() }).from(schema.sparks).where(eq(schema.sparks.userId, userId)),
            db.select({ count: count() }).from(schema.perspectivesMessages).where(eq(schema.perspectivesMessages.userId, userId)),
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
