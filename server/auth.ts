import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "@db";
import { users } from "@shared/schema";
import { and, eq, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

// Add session data type definition
declare module "express-session" {
  interface SessionData {
    userId?: number;
    firebaseUid?: string;
    lastActivity?: number;
    persistent?: boolean;
  }
}

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Define the User interface for Express
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      firebaseUid?: string | null;
      fullName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      createdAt: Date;
      updatedAt: Date;
      isNewUser?: boolean;
    }
    
    interface Session {
      userId?: number;
      firebaseUid?: string;
      lastActivity?: number;
    }
  }
}

// Export the hashPassword function so it can be used in other modules
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function getUserByUsername(username: string) {
  return await db.query.users.findFirst({
    where: eq(users.username, username)
  });
}

async function getUserByEmail(email: string) {
  return await db.query.users.findFirst({
    where: eq(users.email, email)
  });
}

async function getUserByFirebaseUid(uid: string) {
  return await db.query.users.findFirst({
    where: eq(users.firebaseUid, uid)
  });
}

async function getUser(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id)
  });
}

// Generate a unique username based on display name or email
async function generateUniqueUsername(displayName: string | null, email: string | null): Promise<string> {
  let baseUsername = '';
  
  // Try to create a username from displayName
  if (displayName) {
    baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  } 
  // Fall back to email prefix if no display name
  else if (email) {
    baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  } 
  // Last resort
  else {
    baseUsername = 'user';
  }
  
  // Ensure username is at least 3 characters
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, '0');
  }
  
  // Check if username exists
  let username = baseUsername;
  let user = await getUserByUsername(username);
  let counter = 1;
  
  // If username exists, append numbers until we find a unique one
  while (user) {
    username = `${baseUsername}${counter}`;
    user = await getUserByUsername(username);
    counter++;
  }
  
  return username;
}

export function setupAuth(app: Express) {
  // Generate a consistent but randomized secret if none provided in environment
  const sessionSecret = process.env.SESSION_SECRET || 
    `dotspark-secret-${Math.random().toString(36).substring(2, 15)}`;
  
  console.log("Setting up authentication with session support");
  
  // Temporarily use memory store to avoid database connection issues
  console.log("Using memory session store (temporary fix for database connectivity)");

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    // store: undefined, // Use default memory store
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Set to 365 days by default for persistent sessions
      maxAge: 365 * 24 * 60 * 60 * 1000, 
      httpOnly: true, // Prevent JavaScript access to the cookie
      sameSite: 'lax', // Allow cross-site navigation while protecting against CSRF
      path: '/',
    },
    // Reset cookie expiration on each response to maintain the session
    // This ensures that as long as the user is active, they stay logged in
    rolling: true,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await getUserByUsername(username);
        
        if (!user || !user.hashedPassword || !(await comparePasswords(password, user.hashedPassword))) {
          return done(null, false);
        } else {
          // Convert to Express User type
          const secureUser: Express.User = {
            id: user.id,
            username: user.username || '',
            email: user.email,
            firebaseUid: user.firebaseUid,
            fullName: user.username,
            bio: user.bio,
            avatarUrl: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          return done(null, secureUser);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Convert to Express User type
      const secureUser: Express.User = {
        id: user.id,
        username: user.username || '',
        email: user.email,
        firebaseUid: user.firebaseUid,
        fullName: user.username,
        bio: user.bio,
        avatarUrl: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      done(null, secureUser);
    } catch (error) {
      done(error);
    }
  });

  // Traditional registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user
      const [user] = await db.insert(users)
        .values({
          username: req.body.username,
          email: req.body.email,
          hashedPassword: hashedPassword,
        })
        .returning();

      // Convert to Express User type
      const secureUser: Express.User = {
        id: user.id,
        username: user.username || '',
        email: user.email,
        firebaseUid: user.firebaseUid,
        fullName: user.username,
        bio: user.bio,
        avatarUrl: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      // Log user in
      req.login(secureUser, (err) => {
        if (err) return next(err);
        res.status(201).json(secureUser);
      });
    } catch (error) {
      next(error);
    }
  });

  // Traditional login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // This section was removed to prevent duplication with the enhanced refresh endpoint below

  // Enhanced session recovery endpoint with improved error handling and session persistence
  app.post("/api/auth/recover", async (req, res, next) => {
    try {
      const { uid, email, persistent = false } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "Firebase UID is required for recovery" });
      }
      
      console.log(`Attempting session recovery for UID: ${uid}, Session ID: ${req.sessionID}, Persistent: ${persistent}`);
      
      // Check if already authenticated
      if (req.isAuthenticated() && req.user?.firebaseUid === uid) {
        console.log(`User already authenticated, session recovery not needed for ${req.user.id}`);
        
        // But still update session expiry for persistent sessions
        if (persistent && req.session?.cookie) {
          const oldExpiry = req.session.cookie.maxAge || 0;
          req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year for persistent sessions
          console.log(`Extended session expiry for persistent session from ${oldExpiry}ms to ${req.session.cookie.maxAge}ms`);
          
          // Force save the session
          await new Promise<void>((resolve) => {
            req.session.save(() => resolve());
          });
        }
        
        return res.status(200).json({ 
          message: "Already authenticated", 
          user: req.user 
        });
      }
      
      // Find user by Firebase UID
      const user = await getUserByFirebaseUid(uid);
      
      if (!user) {
        console.log('User not found for recovery attempt');
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...secureUser } = user;
      
      // Log user in with promisified login to handle errors properly
      await new Promise<void>((resolve, reject) => {
        req.login(secureUser, (err) => {
          if (err) {
            console.error("Failed to login during recovery:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // Set additional session properties for better persistence
      if (req.session) {
        req.session.lastActivity = Date.now();
        req.session.firebaseUid = uid;
        req.session.persistent = persistent; // Store persistence preference
        
        // Set cookie expiration based on persistence preference
        if (req.session.cookie) {
          if (persistent) {
            // 1 year for persistent "remember me" sessions
            req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
            console.log(`Setting persistent session with 1-year expiry for user ${user.id}`);
          } else {
            // 30 days for regular sessions
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            console.log(`Setting standard session with 30-day expiry for user ${user.id}`);
          }
        }
        
        // Save session explicitly to ensure changes are persisted
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session during recovery:", err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      
      console.log(`Session recovered successfully for user ${user.id} with session ID ${req.sessionID}`);
      res.status(200).json({
        message: "Session recovered successfully",
        user: secureUser,
        expires: req.session.cookie?.expires
      });
    } catch (error) {
      console.error("Recovery error:", error);
      res.status(500).json({ message: "Session recovery failed", error: (error as any)?.message || "Unknown error" });
    }
  });
  
  // Firebase auth login/registration endpoint
  app.post("/api/auth/firebase", async (req, res, next) => {
    try {
      console.log("Firebase auth attempt with body:", {
        ...req.body,
        uid: req.body.uid ? `${req.body.uid.substring(0, 5)}...` : undefined  // Only log partial UID for security
      });
      
      const { uid, email, displayName, photoURL } = req.body;
      
      if (!uid) {
        console.warn("Firebase auth rejected: Missing UID");
        return res.status(400).json({ message: "Firebase UID is required" });
      }
      
      // Check if user already exists by Firebase UID
      let user = await getUserByFirebaseUid(uid);
      let isNewUser = false;
      
      if (!user) {
        console.log(`User not found by UID, checking email: ${email ? 'provided' : 'missing'}`);
        
        // Check if user exists by email (for linking accounts)
        if (email) {
          user = await getUserByEmail(email);
          if (user) {
            console.log(`Found existing user by email: ${user.username}`);
          }
        }
        
        if (user) {
          // Update existing user with Firebase UID
          console.log(`Updating user ${user.id} with Firebase UID`);
          const [updatedUser] = await db.update(users)
            .set({ 
              firebaseUid: uid,
              avatar: photoURL || user.avatar
            })
            .where(eq(users.id, user.id))
            .returning();
            
          user = updatedUser;
        } else {
          // Create new user if none exists
          isNewUser = true;
          const username = await generateUniqueUsername(displayName, email);
          console.log(`Creating new user with username: ${username}`);
          
          // Generate a random password for Firebase users (they'll use Firebase to login)
          const randomPassword = randomBytes(16).toString('hex');
          const hashedPassword = await hashPassword(randomPassword);
          
          try {
            const [newUser] = await db.insert(users)
              .values({
                username,
                email: email || `${username}@firebase.user`,
                hashedPassword: hashedPassword,
                firebaseUid: uid,
                avatar: photoURL,
              })
              .returning();
              
            user = newUser;
            console.log(`New user created with ID: ${user.id}`);
          } catch (err) {
            console.error("Failed to create new user:", err);
            return res.status(500).json({
              message: "Failed to create user account",
              details: err instanceof Error ? err.message : String(err)
            });
          }
        }
      } else {
        console.log(`Found existing user by UID: ${user.username || user.email}`);
      }
      
      // Convert to Express User type and add new user flag
      const secureUser: Express.User & { isNewUser?: boolean } = {
        id: user.id,
        username: user.username || '',
        email: user.email,
        firebaseUid: user.firebaseUid,
        fullName: user.username,
        bio: user.bio,
        avatarUrl: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isNewUser
      };
      
      // Log user in
      req.login(secureUser, (err) => {
        if (err) {
          console.error("Failed to login user after authentication:", err);
          return next(err);
        }
        
        console.log(`User ${user.id} successfully logged in`);
        
        // Add session info for debugging
        const sessionInfo = {
          id: req.sessionID,
          cookie: req.session?.cookie ? {
            maxAge: req.session.cookie.maxAge,
            expires: req.session.cookie.expires
          } : null
        };
        console.log("Session info:", sessionInfo);
        
        res.status(isNewUser ? 201 : 200).json(secureUser);
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      res.status(500).json({
        message: "Authentication failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Logout endpoint with session destruction
  app.post("/api/logout", (req, res, next) => {
    // Log the session info before logout
    console.log(`Logging out user ${req.user?.id}, session ID: ${req.sessionID}`);
    
    // First logout the user
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return next(err);
      }
      
      // Then destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return next(err);
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: 'lax'
        });
        
        console.log("User successfully logged out and session destroyed");
        res.sendStatus(200);
      });
    });
  });

  // Enhanced session refresh endpoint with async/await for proper error handling
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const { uid, refreshToken } = req.body;
      
      // Enhanced logging for session debugging
      console.log(`Session refresh attempt - Authenticated: ${req.isAuthenticated()}, UID: ${uid}, Session ID: ${req.sessionID}`);
      
      // Check if the user is authenticated
      if (req.isAuthenticated()) {
        // Touch the session to update its expiration time
        if (req.session) {
          req.session.touch();
          
          // Update last activity timestamp
          req.session.lastActivity = Date.now();
          
          // Extend cookie maxAge to 30 days on every refresh
          if (req.session.cookie) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          }
          
          // Save session explicitly to ensure changes are persisted
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error("Error saving session:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
        
        // Log session activity for debugging
        console.log(`Session refreshed successfully for user ${req.user?.id} at ${new Date().toISOString()}`);
        return res.status(200).json({ 
          success: true,
          message: "Session refreshed successfully",
          user: req.user,
          expires: req.session.cookie?.expires
        });
      } 
      
      // If there's no active session but UID is provided, try to recover
      if (uid) {
        // Check if we need to create a new session
        try {
          const user = await getUserByFirebaseUid(uid);
          
          if (!user) {
            console.warn(`Attempt to refresh session for unknown UID: ${uid}`);
            return res.status(404).json({ message: "User not found" });
          }
          
          // Convert to Express User type
          const secureUser: Express.User = {
            id: user.id,
            username: user.username || '',
            email: user.email,
            firebaseUid: user.firebaseUid,
            fullName: user.username,
            bio: user.bio,
            avatarUrl: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          
          // Use promisified login 
          await new Promise<void>((resolve, reject) => {
            req.login(secureUser, (err) => {
              if (err) {
                console.error("Failed to restore session during refresh:", err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
          
          // Set session properties
          if (req.session) {
            req.session.lastActivity = Date.now();
            req.session.firebaseUid = uid;
            
            // Extend cookie expiration (30 days)
            if (req.session.cookie) {
              req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            }
            
            // Save session explicitly
            await new Promise<void>((resolve, reject) => {
              req.session.save((err) => {
                if (err) {
                  console.error("Error saving recovered session:", err);
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          }
          
          console.log(`Session restored for user ${user.id} during refresh`);
          return res.status(200).json({ 
            success: true,
            message: "Session restored successfully", 
            user: secureUser,
            expires: req.session.cookie?.expires
          });
        } catch (error) {
          console.error("Error during session refresh recovery:", error);
          return res.status(500).json({ message: "Failed to restore session" });
        }
      } else {
        return res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Session refresh error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}