import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { db, pool } from "@db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { randomBytes } from "crypto";
import admin from "firebase-admin";

// Session data type
declare module "express-session" {
  interface SessionData {
    userId?: number;
    firebaseUid?: string;
  }
}

// User type for session
export interface SessionUser {
  id: number;
  username: string;
  email: string;
  firebaseUid?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PostgresSessionStore = connectPg(session);

// Helper functions
async function getUserByFirebaseUid(uid: string): Promise<any | null> {
  try {
    const result = await db.execute(sql`SELECT * FROM users WHERE firebase_uid = ${uid}`);
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("getUserByFirebaseUid error:", error);
    return null;
  }
}

async function getUserByEmail(email: string): Promise<any | null> {
  try {
    const result = await db.execute(sql`SELECT * FROM users WHERE email = ${email}`);
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("getUserByEmail error:", error);
    return null;
  }
}

async function generateUniqueUsername(displayName: string | null, email: string | null): Promise<string> {
  let baseUsername = '';
  
  if (displayName) {
    baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  } else if (email) {
    baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  } else {
    baseUsername = 'user';
  }
  
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, '0');
  }
  
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const result = await db.execute(sql`SELECT id FROM users WHERE username = ${username}`);
    if (!result.rows || result.rows.length === 0) break;
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
}

// Middleware to check authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    console.log("❌ Authentication required");
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Load user into request from session
async function loadUserFromSession(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    try {
      const result = await db.execute(sql`SELECT id, username, email, firebase_uid, full_name_old as "fullName", avatar as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = ${req.session.userId}`);
      if (result.rows && result.rows.length > 0) {
        const row: any = result.rows[0];
        req.user = {
          id: row.id,
          username: row.username,
          email: row.email,
          firebaseUid: row.firebase_uid,
          fullName: row.fullName,
          avatarUrl: row.avatarUrl,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        };
      }
    } catch (error) {
      console.error("Error loading user from session:", error);
    }
  }
  next();
}

export function setupNewAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || `dotspark-${randomBytes(16).toString('hex')}`;
  
  console.log("Setting up new authentication system");

  // Initialize Firebase Admin if not already initialized
  if (!admin.apps.length) {
    try {
      // Handle the private key - it may have escaped newlines or be base64 encoded
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY not found in environment");
      }
      
      // Try to decode if it looks like base64
      if (!privateKey.includes('BEGIN PRIVATE KEY')) {
        try {
          privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
        } catch (e) {
          // Not base64, continue
        }
      }
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("✅ Firebase Admin initialized for token verification");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin:", error);
      console.error("Please ensure FIREBASE_PRIVATE_KEY is set correctly");
    }
  }
  
  // Session configuration
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'session',
      pruneSessionInterval: 15 * 60,
    }),
    cookie: {
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
    rolling: true,
  }));

  // Load user from session on every request
  app.use(loadUserFromSession);

  // GET /api/auth/me - Get current user from session
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ user: null });
    }
  });

  // POST /api/auth/login - Exchange Firebase ID token for session
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: "Firebase ID token is required" });
      }

      console.log(`🔐 Verifying Firebase ID token...`);

      // Verify the Firebase ID token using Firebase Admin
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        console.error("❌ Token verification failed:", error);
        return res.status(401).json({ error: "Invalid or expired Firebase token" });
      }

      const { uid, email, name: displayName, picture: photoURL } = decodedToken;
      
      if (!uid || !email) {
        return res.status(400).json({ error: "Invalid token data" });
      }

      console.log(`✅ Token verified for Firebase UID: ${uid.substring(0, 8)}...`);

      // Find or create user
      let user = await getUserByFirebaseUid(uid);
      let isNewUser = false;

      if (!user) {
        user = await getUserByEmail(email);
        
        if (user) {
          // Link Firebase UID to existing user
          await db.execute(sql`
            UPDATE users 
            SET firebase_uid = ${uid}, 
                full_name_old = ${displayName || user.full_name_old},
                avatar = ${photoURL || user.avatar},
                updated_at = NOW()
            WHERE id = ${user.id}
            RETURNING *
          `);
          console.log(`✅ Linked Firebase UID to existing user: ${user.username}`);
        } else {
          // Create new user
          isNewUser = true;
          const username = await generateUniqueUsername(displayName, email);
          const randomPassword = randomBytes(16).toString('hex') + '.' + randomBytes(16).toString('hex');
          
          const result = await db.execute(sql`
            INSERT INTO users (username, email, hashed_password, firebase_uid, full_name_old, avatar, dot_spark_activated)
            VALUES (${username}, ${email}, ${randomPassword}, ${uid}, ${displayName || username}, ${photoURL}, true)
            RETURNING *
          `);
          
          user = result.rows[0];
          console.log(`✅ Created new user: ${username}`);
        }
      } else {
        console.log(`✅ Found existing user: ${user.username}`);
      }

      // Create session
      req.session.userId = user.id;
      req.session.firebaseUid = uid;

      const sessionUser: SessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firebaseUid: user.firebase_uid,
        fullName: user.full_name_old || displayName || user.username,
        avatarUrl: user.avatar || photoURL,
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(user.updated_at || Date.now()),
      };

      req.user = sessionUser;

      // Save session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        console.log(`✅ Session created for user ${user.id}`);
        res.status(isNewUser ? 201 : 200).json({ user: sessionUser, isNewUser });
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/auth/logout - Clear session
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      res.clearCookie('connect.sid');
      console.log(`✅ User ${userId} logged out`);
      res.json({ success: true });
    });
  });
}
