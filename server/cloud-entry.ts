import express from 'express';
import { createServer } from 'http';

// Catch any uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

console.log('Starting server...');
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

// Health endpoints (respond before routes load)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start listening first
const httpServer = createServer(app);

httpServer.listen(port, '0.0.0.0', async () => {
  console.log(`Server listening on port ${port}`);
  
  // Now load routes
  try {
    console.log('Loading cloud routes...');
    const { registerCloudRoutes } = await import('./cloud-routes');
    await registerCloudRoutes(app);
    console.log('Routes loaded successfully');
  } catch (error: any) {
    console.error('Failed to load routes:', error.message);
    console.error(error.stack);
    
    // Fallback route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'DotSpark API',
        status: 'running',
        routesLoaded: false,
        error: error.message
      });
    });
  }
});
