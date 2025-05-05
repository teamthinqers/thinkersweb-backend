// This script can be used to test Twilio SMS/WhatsApp functionality
// Run with: node scripts/test-twilio.js
require('dotenv').config(); // Load environment variables

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if environment variables are set
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Error: Missing Twilio environment variables');
  console.error('Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.');
  process.exit(1);
}

// Use the Twilio Node.js library
const client = require('twilio')(accountSid, authToken);

// Test phone number - Replace this with the actual phone number to test
const testPhoneNumber = process.argv[2];

if (!testPhoneNumber) {
  console.error('Error: No test phone number provided');
  console.error('Usage: node scripts/test-twilio.js +1234567890');
  process.exit(1);
}

async function testTwilioSMS() {
  console.log('Testing Twilio SMS functionality...');
  
  try {
    const message = await client.messages.create({
      body: 'This is a test message from your DotSpark application.',
      from: twilioPhoneNumber,
      to: testPhoneNumber
    });
    
    console.log('SMS test successful!');
    console.log('Message SID:', message.sid);
    return true;
  } catch (error) {
    console.error('SMS test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

async function testTwilioWhatsApp() {
  console.log('Testing Twilio WhatsApp functionality...');
  
  try {
    // Format numbers for WhatsApp
    const fromWhatsApp = `whatsapp:${twilioPhoneNumber}`;
    const toWhatsApp = `whatsapp:${testPhoneNumber}`;
    
    const message = await client.messages.create({
      body: 'This is a test WhatsApp message from your DotSpark application.',
      from: fromWhatsApp,
      to: toWhatsApp
    });
    
    console.log('WhatsApp test successful!');
    console.log('Message SID:', message.sid);
    return true;
  } catch (error) {
    console.error('WhatsApp test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    return false;
  }
}

async function runTests() {
  console.log('=== Twilio Integration Test ===');
  console.log('Account SID:', accountSid.substring(0, 5) + '...');
  console.log('Twilio Phone Number:', twilioPhoneNumber);
  console.log('Test Phone Number:', testPhoneNumber);
  console.log('===============================');
  
  const smsResult = await testTwilioSMS();
  const whatsAppResult = await testTwilioWhatsApp();
  
  console.log('===============================');
  console.log('SMS Test:', smsResult ? 'PASSED' : 'FAILED');
  console.log('WhatsApp Test:', whatsAppResult ? 'PASSED' : 'FAILED');
  
  if (!smsResult || !whatsAppResult) {
    console.log('\nPossible reasons for failure:');
    console.log('1. Incorrect Twilio credentials');
    console.log('2. Your Twilio account might not have WhatsApp capabilities enabled');
    console.log('3. The test phone number might not be in the correct format (+1234567890)');
    console.log('4. For WhatsApp, the recipient needs to have activated the Twilio Sandbox');
  }
}

runTests();