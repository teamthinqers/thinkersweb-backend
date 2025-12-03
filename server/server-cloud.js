// Catch any uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

console.log('Starting server initialization...');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const express = require('express');
console.log('Express loaded');

const app = express();
const port = process.env.PORT || 8080;

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.json({ message: 'DotSpark API', status: 'running' });
});

console.log('Starting to listen on port', port);

app.listen(port, '0.0.0.0', () => {
  console.log('Server is now listening on port', port);
});

console.log('Listen call made');
