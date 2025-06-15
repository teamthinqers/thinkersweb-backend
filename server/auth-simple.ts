import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

// Add session data type definition
declare module "express-session" {
  interface SessionData {
    firebaseUid?: string;
    lastActivity?: number;
  }
}

const PostgresSessionStore = connectPg(session);

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
    }
    
    interface Session {
      firebaseUid?: string;
      lastActivity?: number;
    }
  }
}

export function setupAuth(app: Express) {
  // Session configuration
  app.use(session({
    store: new PostgresSessionStore({
      pool: pool,
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    name: 'sessionId'
  }));

  // Firebase UID session route
  app.post('/api/auth/firebase-session', (req: Request, res: Response) => {
    const { firebaseUid } = req.body;
    
    if (!firebaseUid) {
      return res.status(400).json({ error: 'Firebase UID required' });
    }

    req.session.firebaseUid = firebaseUid;
    req.session.lastActivity = Date.now();
    
    res.json({ success: true });
  });

  // Logout route
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.clearCookie('sessionId');
      res.json({ success: true });
    });
  });

  // Session check route
  app.get('/api/auth/session', (req: Request, res: Response) => {
    if (req.session.firebaseUid) {
      res.json({ 
        authenticated: true, 
        firebaseUid: req.session.firebaseUid 
      });
    } else {
      res.json({ authenticated: false });
    }
  });
}

// Simplified authentication middleware (optional protection)
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For now, allow all requests to pass through
  // Firebase authentication will be handled on the frontend
  next();
}