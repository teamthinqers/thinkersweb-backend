const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

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

// Health endpoints - respond immediately
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
    version: '1.0.0'
  });
});

// Start server immediately
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
  
  // Load full routes after server is listening
  loadFullRoutes();
});

async function loadFullRoutes() {
  try {
    console.log('Loading full routes...');
    
    // Dynamically import the compiled routes
    const { registerRoutes } = require('./dist/routes.js');
    await registerRoutes(app);
    
    console.log('Full routes loaded successfully');
  } catch (error) {
    console.error('Failed to load full routes:', error.message);
    console.log('Server running with basic health endpoints only');
  }
}
