import express from "express";
import { createServer } from "http";

const app = express();

const ALLOWED_ORIGINS = [
  'https://www.thinqers.in',
  'https://thinqers.in',
  'http://localhost:5000',
  'http://localhost:3000'
];

// Built-in CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check endpoints - must respond quickly
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'DotSpark API Server',
    status: 'running',
    version: '1.0.0'
  });
});

// Start server immediately, then load routes
const port = parseInt(process.env.PORT || '8080', 10);
const httpServer = createServer(app);

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Load full routes asynchronously after server starts
  loadRoutes();
});

async function loadRoutes() {
  try {
    console.log('Loading routes...');
    const { registerRoutes } = await import("./routes");
    await registerRoutes(app);
    console.log('Routes loaded successfully');
  } catch (error) {
    console.error('Failed to load routes:', error);
    // Server still running with basic health endpoints
  }
}
