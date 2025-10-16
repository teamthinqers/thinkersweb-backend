import { sendWhatsAppReply } from '../server/whatsapp';

async function sendApologyMessages() {
  const users = [
    { phone: '+919840105234', time: 'today morning' },
    { phone: '+918667244857', time: 'today morning' },
    { phone: '+919840884459', time: 'today morning' },
    { phone: '+919972960079', time: 'yesterday' }
  ];

  const apologyMessage = `Hey ThinQer! 👋

Sorry for the delay in responding. Our DotSpark WhatsApp assistant had a temporary technical issue that's now been fixed.

I'm ready to help you now! Please share your thoughts and I'll save them to your MyNeura space.

Thank you for your patience! 🙏`;

  console.log('Sending apology messages to users who tried contacting us...\n');

  for (const user of users) {
    console.log(`Sending to ${user.phone} (tried ${user.time})...`);
    const success = await sendWhatsAppReply(user.phone, apologyMessage);
    
    if (success) {
      console.log(`✅ Sent successfully to ${user.phone}`);
    } else {
      console.log(`❌ Failed to send to ${user.phone}`);
    }
  }

  console.log('\n✅ Apology messages sent!');
}

sendApologyMessages().catch(console.error);
