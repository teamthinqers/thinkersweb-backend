import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendApologyMessages() {
  const users = [
    { phone: '+919840105234', time: 'today morning' },
    { phone: '+918667244857', time: 'today morning' },
    { phone: '+919840884459', time: 'today morning' },
    { phone: '+919972960079', time: 'yesterday' }
  ];

  const apologyMessage = "Apologies, there was a tech glitch because of which I was not able to respond earlier. I'm working perfectly now! Feel free to message me anytime. 😊";

  console.log('Sending apology messages to users who tried contacting us...\n');

  for (const user of users) {
    console.log(`Sending to ${user.phone} (tried ${user.time})...`);
    
    try {
      const result = await client.messages.create({
        body: apologyMessage,
        from: fromNumber,
        to: user.phone
      });
      
      console.log(`✅ Sent successfully to ${user.phone} (SID: ${result.sid})`);
    } catch (error) {
      console.log(`❌ Failed to send to ${user.phone}:`, error);
    }
  }

  console.log('\n✅ Apology messages process completed!');
}

sendApologyMessages().catch(console.error);
