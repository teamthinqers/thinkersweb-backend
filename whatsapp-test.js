// Script to test WhatsApp webhook
import axios from 'axios';

async function simulateWhatsAppWebhook() {
  try {
    console.log('Simulating WhatsApp webhook call...');
    
    // Create a payload similar to what Twilio would send
    const payload = {
      Body: "This is a test WhatsApp message from the simulator",
      From: "whatsapp:+12065551234", // Test phone number
      To: "whatsapp:+16067157733",    // Your Twilio WhatsApp number
      ProfileName: "Test User",
      MessageSid: "SM" + Math.random().toString(36).substring(2, 15)
    };
    
    // Send the payload to the webhook endpoint
    const webhookUrl = 'http://localhost:5000/api/whatsapp/webhook';
    console.log(`Sending WhatsApp webhook POST to ${webhookUrl}`);
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Webhook response status:', response.status);
    console.log('Webhook response data:', response.data);
    
    // Now check if the entry was created by querying the entries endpoint
    console.log('\nChecking if entry was created...');
    const entriesResponse = await axios.get('http://localhost:5000/api/entries?limit=5');
    
    console.log(`Found ${entriesResponse.data.total} total entries`);
    console.log('Latest entries:');
    
    if (entriesResponse.data.entries && entriesResponse.data.entries.length > 0) {
      entriesResponse.data.entries.forEach((entry, i) => {
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

simulateWhatsAppWebhook();