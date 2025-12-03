import express from "express";

const app = express();

const ALLOWED_ORIGINS = [
  'https://www.thinqers.in',
  'https://thinqers.in',
  'http://localhost:5000',
  'http://localhost:3000'
];

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
    version: '1.0.0',
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

const port = parseInt(process.env.PORT || '8080', 10);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
