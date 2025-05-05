// This script can be used to set the application to production mode
// Run with: node scripts/set-production-mode.js

console.log('Setting DotSpark application to production mode...');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Update routes.ts file to remove development mode
const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
let routesContent = fs.readFileSync(routesPath, 'utf8');

// Replace development mode forced setting
routesContent = routesContent.replace(
  /\/\/ In production, this line should be removed or commented out[\s\S]*?process\.env\.NODE_ENV = 'development';/,
  '// Production mode enabled\n      // process.env.NODE_ENV = \'development\'; // Commented out for production'
);

fs.writeFileSync(routesPath, routesContent);

// Create/update .env file with production settings
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
} catch (err) {
  console.log('No existing .env file found. Creating new one.');
}

// Set NODE_ENV to production in .env file
if (envContent.includes('NODE_ENV=')) {
  // Replace existing NODE_ENV value
  envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=production');
} else {
  // Add NODE_ENV=production to the file
  envContent += '\nNODE_ENV=production';
}

fs.writeFileSync(envPath, envContent);

console.log('Production mode set successfully!');
console.log('\nReminder:');
console.log('1. Ensure your Twilio credentials are properly configured');
console.log('2. Test your WhatsApp integration with real messages');
console.log('3. Restart your application for changes to take effect');