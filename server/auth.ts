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

const PostgresSessionStore = connectPg(session);
const scryptAsync = promisify(scrypt);

// Define the User interface for Express
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      firebaseUid?: string;
      fullName?: string | null;
      bio?: string | null;
      avatarUrl?: string | null;
      createdAt: Date;
      updatedAt: Date;
      isNewUser?: boolean;
    }
  }
}

async function hashPassword(password: string) {
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
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dotspark-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await getUserByUsername(username);
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Remove password from the user object before returning
          const { password: _, ...secureUser } = user;
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
      
      // Remove password from the user object
      const { password: _, ...secureUser } = user;
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
          ...req.body,
          password: hashedPassword,
        })
        .returning();

      // Remove password from response
      const { password: _, ...secureUser } = user;

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

  // Firebase auth login/registration endpoint
  app.post("/api/auth/firebase", async (req, res, next) => {
    try {
      const { uid, email, displayName, photoURL } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "Firebase UID is required" });
      }
      
      // Check if user already exists by Firebase UID
      let user = await getUserByFirebaseUid(uid);
      let isNewUser = false;
      
      if (!user) {
        // Check if user exists by email (for linking accounts)
        if (email) {
          user = await getUserByEmail(email);
        }
        
        if (user) {
          // Update existing user with Firebase UID
          const [updatedUser] = await db.update(users)
            .set({ 
              firebaseUid: uid,
              avatarUrl: photoURL || user.avatarUrl,
              fullName: displayName || user.fullName
            })
            .where(eq(users.id, user.id))
            .returning();
            
          user = updatedUser;
        } else {
          // Create new user if none exists
          isNewUser = true;
          const username = await generateUniqueUsername(displayName, email);
          
          // Generate a random password for Firebase users (they'll use Firebase to login)
          const randomPassword = randomBytes(16).toString('hex');
          const hashedPassword = await hashPassword(randomPassword);
          
          const [newUser] = await db.insert(users)
            .values({
              username,
              email: email || `${username}@firebase.user`,
              password: hashedPassword,
              firebaseUid: uid,
              fullName: displayName,
              avatarUrl: photoURL,
            })
            .returning();
            
          user = newUser;
        }
      }
      
      // Remove password from response
      const { password: _, ...secureUser } = user;
      
      // Add flag to indicate if this is a new user
      const userWithNewFlag = { ...secureUser, isNewUser };
      
      // Log user in
      req.login(userWithNewFlag, (err) => {
        if (err) return next(err);
        res.status(isNewUser ? 201 : 200).json(userWithNewFlag);
      });
    } catch (error) {
      console.error("Firebase auth error:", error);
      next(error);
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
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