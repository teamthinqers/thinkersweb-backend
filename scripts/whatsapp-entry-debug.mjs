// WhatsApp Entry Debug Script
// This script will:
// 1. Create a test entry directly in the database
// 2. Fetch all entries to see if the test entry shows up
// 3. Diagnose any issues with the entry loading system

import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function debugWhatsAppEntries() {
  console.log('===== WhatsApp Entry Debug Tool =====');
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set (obscured)' : 'Not Set'}`);
  
  try {
    // Check DB connection
    console.log('\n1. Checking database connection...');
    const client = await pool.connect();
    console.log('   ✅ Database connection successful!');
    
    // Get user count
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`   ℹ️ Total users in database: ${userCountResult.rows[0].count}`);
    
    // Get entries count
    const entryCountResult = await client.query('SELECT COUNT(*) FROM entries');
    console.log(`   ℹ️ Total entries in database: ${entryCountResult.rows[0].count}`);
    
    // Get WhatsApp users
    const whatsappUserResult = await client.query('SELECT * FROM whatsapp_users');
    console.log(`   ℹ️ WhatsApp users in database: ${whatsappUserResult.rows.length}`);
    
    // Display all WhatsApp users
    console.log('\n2. Current WhatsApp User Registrations:');
    if (whatsappUserResult.rows.length === 0) {
      console.log('   ⚠️ No WhatsApp users registered');
    } else {
      whatsappUserResult.rows.forEach(user => {
        console.log(`   👤 User ID: ${user.user_id}, Phone: ${user.phone_number}, Active: ${user.active}`);
      });
    }
    
    // Check if there are entries created by WhatsApp
    console.log('\n3. Looking for entries with "WhatsApp" in the title:');
    const whatsappEntries = await client.query(`
      SELECT e.id, e.title, e.user_id, e.created_at, u.username, u.email
      FROM entries e
      JOIN users u ON e.user_id = u.id
      WHERE e.title LIKE '%WhatsApp%'
      ORDER BY e.created_at DESC
      LIMIT 10
    `);
    
    if (whatsappEntries.rows.length === 0) {
      console.log('   ⚠️ No WhatsApp entries found in the database');
    } else {
      console.log(`   ✅ Found ${whatsappEntries.rows.length} entries with "WhatsApp" in the title`);
      whatsappEntries.rows.forEach(entry => {
        console.log(`   📝 Entry ID: ${entry.id}, Title: "${entry.title}", User: ${entry.email || entry.username} (ID: ${entry.user_id}), Created: ${entry.created_at}`);
      });
    }
    
    // Create a test entry
    console.log('\n4. Creating a test WhatsApp entry:');
    
    if (whatsappUserResult.rows.length === 0) {
      console.log('   ⚠️ Cannot create test entry - no WhatsApp users registered');
    } else {
      // Use the first WhatsApp user found
      const testUser = whatsappUserResult.rows[0];
      
      const testEntry = {
        userId: testUser.user_id,
        title: `WhatsApp Test Entry - Debug Script ${new Date().toISOString()}`,
        content: 'This entry was created by the WhatsApp debug script to test entry creation.',
        visibility: 'private',
        isFavorite: false
      };
      
      console.log(`   ℹ️ Creating test entry for user ID: ${testUser.user_id}`);
      
      try {
        const result = await client.query(`
          INSERT INTO entries (user_id, title, content, visibility, is_favorite)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, title
        `, [testUser.user_id, testEntry.title, testEntry.content, testEntry.visibility, testEntry.isFavorite]);
        
        console.log(`   ✅ Test entry created! ID: ${result.rows[0].id}, Title: "${result.rows[0].title}"`);
        
        console.log('\n5. Verifying the test entry is retrievable:');
        const verifyResult = await client.query(`
          SELECT e.id, e.title, e.user_id, e.created_at, u.username, u.email
          FROM entries e
          JOIN users u ON e.user_id = u.id
          WHERE e.id = $1
        `, [result.rows[0].id]);
        
        if (verifyResult.rows.length > 0) {
          console.log(`   ✅ Test entry retrieved! ID: ${verifyResult.rows[0].id}, Title: "${verifyResult.rows[0].title}"`);
        } else {
          console.log(`   ❌ Failed to retrieve test entry! This indicates a serious issue with the database.`);
        }
      } catch (entryError) {
        console.error(`   ❌ Error creating test entry: ${entryError.message}`);
      }
    }
    
    // Test the getAllEntries API functionality
    console.log('\n6. Testing the getAllEntries API functionality:');
    
    // This is a direct SQL equivalent of what the getAllEntries function does
    const apiEntriesResult = await client.query(`
      SELECT e.* 
      FROM entries e
      ORDER BY e.created_at DESC
      LIMIT 10
    `);
    
    console.log(`   ℹ️ Retrieved ${apiEntriesResult.rows.length} entries using API-like query`);
    apiEntriesResult.rows.forEach(entry => {
      console.log(`   📄 Entry ID: ${entry.id}, Title: "${entry.title}", User ID: ${entry.user_id}, Created: ${entry.created_at}`);
    });
    
    // Check if the userId filter works correctly
    console.log('\n7. Testing userId filtering in queries:');
    if (whatsappUserResult.rows.length > 0) {
      const testUserId = whatsappUserResult.rows[0].user_id;
      
      const userEntriesResult = await client.query(`
        SELECT e.* 
        FROM entries e
        WHERE e.user_id = $1
        ORDER BY e.created_at DESC
        LIMIT 10
      `, [testUserId]);
      
      console.log(`   ℹ️ Retrieved ${userEntriesResult.rows.length} entries for user ID ${testUserId}`);
      if (userEntriesResult.rows.length === 0) {
        console.log(`   ⚠️ No entries found for user ID ${testUserId} - this may be the issue!`);
      } else {
        userEntriesResult.rows.forEach(entry => {
          console.log(`   📄 Entry ID: ${entry.id}, Title: "${entry.title}", User ID: ${entry.user_id}, Created: ${entry.created_at}`);
        });
      }
    }
    
    client.release();
    console.log('\n===== Debug process completed =====');
    
  } catch (error) {
    console.error('Error in debug script:', error);
  } finally {
    process.exit(0);
  }
}

debugWhatsAppEntries();