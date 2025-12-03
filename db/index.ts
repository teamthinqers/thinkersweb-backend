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

// Use HTTP driver for Cloud Run (more reliable in containers)
// Use WebSocket driver for local development (supports transactions better)
const isCloudRun = process.env.K_SERVICE !== undefined;

let db: ReturnType<typeof drizzleHttp> | ReturnType<typeof drizzleServerless>;
let pool: Pool | null = null;

if (isCloudRun) {
  // Cloud Run: Use HTTP driver (no WebSocket needed)
  console.log('Using Neon HTTP driver for Cloud Run');
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleHttp(sql, { schema });
} else {
  // Local: Use WebSocket driver
  console.log('Using Neon WebSocket driver for local development');
  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleServerless({ client: pool, schema });
}

export { db, pool };