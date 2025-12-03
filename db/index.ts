import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect Cloud Run/production environment using multiple signals
// K_SERVICE is set by Cloud Run, NODE_ENV=production for prod builds
// PORT=8080 is the default Cloud Run port
const isProduction = process.env.NODE_ENV === 'production';
const isCloudRun = process.env.K_SERVICE !== undefined;
const isPort8080 = process.env.PORT === '8080';
const useHttpDriver = isProduction || isCloudRun || isPort8080;

console.log('=== Database Driver Selection ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('K_SERVICE:', process.env.K_SERVICE);
console.log('PORT:', process.env.PORT);
console.log('useHttpDriver:', useHttpDriver);

let db: ReturnType<typeof drizzleHttp> | ReturnType<typeof drizzleServerless>;
let pool: Pool | null = null;

if (useHttpDriver) {
  // Production/Cloud Run: Use HTTP driver (no WebSocket needed, more reliable in containers)
  console.log('>>> Using Neon HTTP driver for production/Cloud Run');
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleHttp(sql, { schema });
  console.log('>>> HTTP driver initialized successfully');
} else {
  // Local development: Use WebSocket driver (supports transactions better)
  console.log('>>> Using Neon WebSocket driver for local development');
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleServerless({ client: pool, schema });
  console.log('>>> WebSocket driver initialized successfully');
}

export { db, pool };