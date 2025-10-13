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
    oauthState?: string;
  }
}

// Extend Express User type
declare global {
  namespace Express {
    interface User extends SessionUser {}
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
  avatar?: string | null;
  linkedinPhotoUrl?: string | null;
  linkedinId?: string | null;
  linkedinHeadline?: string | null;
  linkedinProfileUrl?: string | null;
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
  // Check both new auth system (session.userId) and legacy Passport.js (session.passport.user)
  const userId = req.session?.userId || (req.session as any)?.passport?.user;
  
  if (!userId) {
    console.log("❌ Authentication required");
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Load user into request from session
async function loadUserFromSession(req: Request, res: Response, next: NextFunction) {
  // Check both new auth system (session.userId) and legacy Passport.js (session.passport.user)
  const userId = req.session?.userId || (req.session as any)?.passport?.user;
  
  console.log('🔍 Session check:', {
    hasSession: !!req.session,
    sessionId: (req.session as any)?.id,
    userId: req.session?.userId,
    passportUser: (req.session as any)?.passport?.user,
    resolvedUserId: userId
  });
  
  if (userId) {
    try {
      const result = await db.execute(sql`
        SELECT 
          id, 
          username, 
          email, 
          firebase_uid, 
          full_name as "fullName", 
          avatar, 
          linkedin_id as "linkedinId",
          linkedin_headline as "linkedinHeadline",
          linkedin_profile_url as "linkedinProfileUrl",
          linkedin_photo_url as "linkedinPhotoUrl",
          created_at as "createdAt", 
          updated_at as "updatedAt" 
        FROM users 
        WHERE id = ${userId}
      `);
      if (result.rows && result.rows.length > 0) {
        const row: any = result.rows[0];
        console.log('✅ User loaded from session:', row.email);
        req.user = {
          id: row.id,
          username: row.username,
          email: row.email,
          firebaseUid: row.firebase_uid,
          fullName: row.fullName,
          avatarUrl: row.avatar,
          avatar: row.avatar,
          linkedinId: row.linkedinId,
          linkedinHeadline: row.linkedinHeadline,
          linkedinProfileUrl: row.linkedinProfileUrl,
          linkedinPhotoUrl: row.linkedinPhotoUrl,
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
      // Handle the private key - it may have escaped newlines, be on one line, or be base64 encoded
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
      
      // If the key is all on one line (spaces between parts), fix the formatting
      if (!privateKey.includes('\n') || privateKey.split('\n').length < 5) {
        // Split at BEGIN/END markers and reconstruct with proper newlines
        const beginMarker = '-----BEGIN PRIVATE KEY-----';
        const endMarker = '-----END PRIVATE KEY-----';
        
        if (privateKey.includes(beginMarker) && privateKey.includes(endMarker)) {
          // Extract the key content between markers
          const keyContent = privateKey
            .replace(beginMarker, '')
            .replace(endMarker, '')
            .replace(/\s+/g, ''); // Remove all whitespace
          
          // Reconstruct with proper line breaks (64 chars per line is PEM standard)
          const lines = [beginMarker];
          for (let i = 0; i < keyContent.length; i += 64) {
            lines.push(keyContent.substring(i, i + 64));
          }
          lines.push(endMarker);
          privateKey = lines.join('\n');
        }
      }
      
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

  // Debug endpoint to check session
  app.get("/api/auth/debug", (req: Request, res: Response) => {
    res.json({
      hasSession: !!req.session,
      sessionId: (req.session as any)?.id,
      userId: req.session?.userId,
      passportUser: (req.session as any)?.passport?.user,
      hasUser: !!req.user,
      user: req.user ? { id: req.user.id, email: req.user.email } : null,
      cookies: req.headers.cookie
    });
  });

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
      console.log(`🔐 Login attempt received`);
      const { idToken } = req.body;
      
      if (!idToken) {
        console.error("❌ No idToken in request body");
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
        avatar: user.avatar,
        linkedinPhotoUrl: user.linkedin_photo_url,
        linkedinId: user.linkedin_id,
        linkedinHeadline: user.linkedin_headline,
        linkedinProfileUrl: user.linkedin_profile_url,
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(user.updated_at || Date.now()),
      };

      req.user = sessionUser;

      // Save session
      req.session.save(async (err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        console.log(`✅ Session created for user ${user.id}`);
        
        // Award Explorer badge to new users
        if (isNewUser && (app as any).awardBadge) {
          try {
            await (app as any).awardBadge(user.id, 'explorer');
            console.log(`🏆 Explorer badge awarded to new user ${user.id}`);
          } catch (error) {
            console.error('Error awarding Explorer badge:', error);
          }
        }
        
        console.log(`✅ Sending response with user:`, { userId: sessionUser.id, isNewUser });
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

  // LinkedIn OAuth endpoints
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  
  // Determine the correct redirect URI based on environment
  // For production, use the custom domain; for dev, use Replit dev domain
  const getRedirectUri = () => {
    // Check if we have a custom production domain
    const productionDomain = 'www.dotspark.in';
    
    // If in production (NODE_ENV=production or has published domain), use production domain
    if (process.env.NODE_ENV === 'production' || process.env.REPL_DEPLOYMENT === '1') {
      return `https://${productionDomain}/api/auth/linkedin/callback`;
    }
    
    // Otherwise use dev domain
    if (process.env.REPLIT_DEV_DOMAIN) {
      return `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/linkedin/callback`;
    }
    
    return 'http://localhost:5000/api/auth/linkedin/callback';
  };
  
  const LINKEDIN_REDIRECT_URI = getRedirectUri();

  // GET /api/auth/linkedin - Initiate LinkedIn OAuth flow
  app.get("/api/auth/linkedin", (req: Request, res: Response) => {
    console.log(`📱 LinkedIn OAuth initiation requested`);
    console.log(`📍 Redirect URI configured as: ${LINKEDIN_REDIRECT_URI}`);
    
    if (!LINKEDIN_CLIENT_ID) {
      console.error("❌ LinkedIn Client ID not configured");
      return res.status(500).json({ error: "LinkedIn OAuth not configured" });
    }

    const state = randomBytes(32).toString('hex');
    req.session.oauthState = state;
    
    const scope = 'openid profile email';
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`;
    
    console.log(`🔗 Redirecting to LinkedIn OAuth`);
    console.log(`   Encoded redirect_uri: ${encodeURIComponent(LINKEDIN_REDIRECT_URI)}`);
    res.redirect(authUrl);
  });

  // GET /api/auth/linkedin/callback - Handle LinkedIn OAuth callback
  app.get("/api/auth/linkedin/callback", async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;

      // Verify state to prevent CSRF
      if (!state || state !== req.session.oauthState) {
        console.error("❌ Invalid OAuth state");
        return res.redirect('/?error=invalid_state');
      }

      if (!code) {
        console.error("❌ No authorization code received");
        return res.redirect('/?error=no_code');
      }

      console.log(`🔐 Exchanging code for LinkedIn access token...`);

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
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
        console.error("❌ Token exchange failed:", errorText);
        return res.redirect('/?error=token_exchange_failed');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      console.log(`✅ Access token obtained`);

      // Get user profile using OpenID Connect userinfo endpoint
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("❌ Profile fetch failed:", errorText);
        return res.redirect('/?error=profile_fetch_failed');
      }

      const profile = await profileResponse.json();
      console.log(`✅ LinkedIn profile obtained:`, profile);

      const { sub: linkedinId, email, name, picture } = profile;
      
      // Try to get additional profile details from LinkedIn v2 API
      let headline = null;
      let profileUrl = null;
      
      try {
        const detailedProfileResponse = await fetch('https://api.linkedin.com/v2/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (detailedProfileResponse.ok) {
          const detailedProfile = await detailedProfileResponse.json();
          console.log(`✅ LinkedIn detailed profile:`, detailedProfile);
          
          // Extract headline if available
          headline = detailedProfile.headline || null;
          
          // Construct profile URL from vanityName or id
          if (detailedProfile.vanityName) {
            profileUrl = `https://www.linkedin.com/in/${detailedProfile.vanityName}`;
          } else if (linkedinId) {
            // Fallback: use the sub/id to construct URL
            profileUrl = `https://www.linkedin.com/profile/view?id=${linkedinId}`;
          }
        }
      } catch (detailError) {
        console.log(`⚠️ Could not fetch detailed LinkedIn profile:`, detailError);
        // Continue without detailed profile - not critical
      }

      if (!linkedinId || !email) {
        console.error("❌ Missing required profile data");
        return res.redirect('/?error=missing_profile_data');
      }

      // Find or create user
      let user = await db.execute(sql`SELECT * FROM users WHERE linkedin_id = ${linkedinId}`);
      let dbUser = user.rows && user.rows.length > 0 ? user.rows[0] : null;
      let isNewUser = false;

      if (!dbUser) {
        // Check if user exists by email
        user = await db.execute(sql`SELECT * FROM users WHERE email = ${email}`);
        dbUser = user.rows && user.rows.length > 0 ? user.rows[0] : null;

        if (dbUser) {
          // Link LinkedIn to existing user
          await db.execute(sql`
            UPDATE users 
            SET linkedin_id = ${linkedinId},
                full_name = ${name || dbUser.full_name},
                linkedin_headline = ${headline || dbUser.linkedin_headline},
                linkedin_profile_url = ${profileUrl || dbUser.linkedin_profile_url},
                linkedin_photo_url = ${picture || dbUser.linkedin_photo_url},
                avatar = ${picture || dbUser.avatar},
                updated_at = NOW()
            WHERE id = ${dbUser.id}
          `);
          console.log(`✅ Linked LinkedIn to existing user: ${dbUser.username}`);
        } else {
          // Create new user
          isNewUser = true;
          const username = await generateUniqueUsername(name, email);
          const randomPassword = randomBytes(16).toString('hex') + '.' + randomBytes(16).toString('hex');

          const result = await db.execute(sql`
            INSERT INTO users (
              username, 
              email, 
              hashed_password, 
              linkedin_id, 
              full_name, 
              linkedin_headline,
              linkedin_profile_url,
              linkedin_photo_url,
              avatar,
              dot_spark_activated
            )
            VALUES (
              ${username}, 
              ${email}, 
              ${randomPassword}, 
              ${linkedinId}, 
              ${name || username}, 
              ${headline},
              ${profileUrl},
              ${picture},
              ${picture},
              true
            )
            RETURNING *
          `);

          dbUser = result.rows[0];
          console.log(`✅ Created new user from LinkedIn: ${username}`);
        }

        // Refresh user data
        user = await db.execute(sql`SELECT * FROM users WHERE linkedin_id = ${linkedinId}`);
        dbUser = user.rows[0];
      } else {
        console.log(`✅ Found existing LinkedIn user: ${dbUser.username}`);
      }

      // Create session
      req.session.userId = Number(dbUser.id);
      req.session.oauthState = undefined; // Clear state

      const sessionUser: SessionUser = {
        id: Number(dbUser.id),
        username: String(dbUser.username),
        email: String(dbUser.email),
        firebaseUid: dbUser.firebase_uid ? String(dbUser.firebase_uid) : null,
        fullName: dbUser.full_name ? String(dbUser.full_name) : (name || String(dbUser.username)),
        avatarUrl: dbUser.avatar ? String(dbUser.avatar) : picture,
        avatar: dbUser.avatar ? String(dbUser.avatar) : null,
        linkedinPhotoUrl: dbUser.linkedin_photo_url ? String(dbUser.linkedin_photo_url) : null,
        linkedinId: dbUser.linkedin_id ? String(dbUser.linkedin_id) : null,
        linkedinHeadline: dbUser.linkedin_headline ? String(dbUser.linkedin_headline) : null,
        linkedinProfileUrl: dbUser.linkedin_profile_url ? String(dbUser.linkedin_profile_url) : null,
        createdAt: dbUser.created_at ? new Date(String(dbUser.created_at)) : new Date(),
        updatedAt: dbUser.updated_at ? new Date(String(dbUser.updated_at)) : new Date(),
      };

      req.user = sessionUser;

      // Save session and redirect
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.redirect('/?error=session_failed');
        }

        console.log(`✅ Session created for LinkedIn user ${dbUser.id}`);
        // Redirect to MyDotSpark page after successful login (landing page)
        res.redirect('/mydotspark');
      });

    } catch (error) {
      console.error("❌ LinkedIn OAuth error:", error);
      res.redirect('/?error=oauth_failed');
    }
  });
}
