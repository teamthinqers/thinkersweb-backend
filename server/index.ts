import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Test API connections
console.log('OpenAI API key is configured and available');
if (process.env.OPENAI_API_KEY) {
  console.log('Testing OpenAI API connection...');
  // OpenAI connection test will be done in openai.ts module load
}

if (process.env.DEEPSEEK_API_KEY) {
  console.log('DeepSeek API key is configured and available');
  console.log('Testing DeepSeek API connection...');
  // DeepSeek connection test will be done in deepseek.ts module load
} else {
  console.log('DeepSeek API key not found - DeepSeek integration disabled');
}

// ES module replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDirExists = fs.existsSync(path.join(__dirname, 'public'));

// Force development mode if build directory doesn't exist
if (!buildDirExists) {
  process.env.NODE_ENV = 'development';
  console.log('Running in DEVELOPMENT mode (build directory not found)');
} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production';
  console.log('Running in PRODUCTION mode');
} else {
  console.log('Running in DEVELOPMENT mode');
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add static file serving for public directory in development mode
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
