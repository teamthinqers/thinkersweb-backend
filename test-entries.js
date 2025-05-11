// Script to test entries API
import axios from 'axios';

async function testEntriesAPI() {
  try {
    console.log('Checking entries API...');
    
    // Query the entries endpoint
    const response = await axios.get('http://localhost:5000/api/entries?limit=10');
    
    console.log(`Found ${response.data.total} total entries`);
    console.log('Recent entries:');
    
    if (response.data.entries && response.data.entries.length > 0) {
      response.data.entries.forEach((entry, i) => {
        console.log(`Entry ${i+1}:`);
        console.log(`- ID: ${entry.id}`);
        console.log(`- Title: ${entry.title}`);
        console.log(`- Content: ${entry.content.substring(0, 50)}${entry.content.length > 50 ? '...' : ''}`);
        console.log(`- Created: ${new Date(entry.createdAt).toLocaleString()}`);
        console.log('---');
      });
    } else {
      console.log('No entries found!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Create a test entry directly via the API
async function createTestEntry() {
  try {
    console.log('Creating a test entry...');
    
    const entryData = {
      title: `API Test Entry - ${new Date().toLocaleString()}`,
      content: "This is a test entry created directly via the API to check if entries are being saved and displayed correctly.",
      visibility: "private",
      isFavorite: false
    };
    
    const response = await axios.post('http://localhost:5000/api/entries', entryData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Entry creation response:', response.status);
    console.log('Created entry:', response.data);
    
    // Check if the entry appears in the list
    await testEntriesAPI();
    
  } catch (error) {
    console.error('Error creating entry:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
console.log('\n--- LISTING CURRENT ENTRIES ---\n');
await testEntriesAPI();

console.log('\n--- CREATING TEST ENTRY ---\n');
await createTestEntry();