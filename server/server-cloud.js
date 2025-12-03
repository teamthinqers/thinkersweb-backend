const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

// Check required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.log('Missing environment variables:', missingVars.join(', '));
  console.log('Starting minimal server without full routes');
}

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

// Health endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'DotSpark API Server',
    status: 'running',
    envCheck: missingVars.length === 0 ? 'all set' : `missing: ${missingVars.join(', ')}`
  });
});

// Start server immediately for health checks
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
  
  // Only load routes if all env vars are present
  if (missingVars.length === 0) {
    setTimeout(() => {
      try {
        console.log('Loading full routes...');
        const routes = require('./dist/routes.js');
        if (routes.registerRoutes) {
          routes.registerRoutes(app).then(() => {
            console.log('Routes loaded successfully');
          }).catch(err => {
            console.error('Error registering routes:', err.message);
          });
        }
      } catch (err) {
        console.error('Failed to load routes:', err.message);
      }
    }, 100);
  }
});
