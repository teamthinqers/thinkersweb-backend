import { db } from './db/index.js';
import { whatsappConversationStates } from './shared/schema.ts';
import { desc } from 'drizzle-orm';

const attempts = await db.query.whatsappConversationStates.findMany({
  orderBy: desc(whatsappConversationStates.updatedAt),
  limit: 2
});

console.log('API returns:', JSON.stringify(attempts, null, 2));
