import { Request, Response, Router } from 'express';
import { processWhatsAppMessage } from './whatsapp';
import axios from 'axios';

// Create a router for WhatsApp webhook endpoints
const whatsappWebhookRouter = Router();

// Constants for WhatsApp Business API
const WHATSAPP_VERIFY_TOKEN = 'dotspark-neural-extension-token';
const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const META_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

// Use this to send messages back to WhatsApp using the Meta Graph API
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  try {
    // Ensure the number is properly formatted (remove any WhatsApp: prefix)
    let recipientPhone = to.replace('whatsapp:', '').trim();
    
    // If using Meta WhatsApp API, we don't need the + prefix
    if (recipientPhone.startsWith('+')) {
      recipientPhone = recipientPhone.substring(1);
    }
    
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      console.error('Missing WhatsApp API credentials');
      return false;
    }
    
    // Log the attempt
    console.log(`Attempting to send WhatsApp message to ${recipientPhone}: ${text.substring(0, 50)}...`);
    
    // For development mode, just simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV MODE] Simulating successful WhatsApp message send');
      console.log(`Message to ${recipientPhone}: ${text}`);
      return true;
    }
    
    // Make the API request to send the message
    const response = await axios({
      method: 'POST',
      url: `${META_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: {
          body: text
        }
      }
    });
    
    // Check if the message was sent successfully
    if (response.data && response.data.messages && response.data.messages.length > 0) {
      console.log(`Message sent successfully with ID: ${response.data.messages[0].id}`);
      return true;
    } else {
      console.error('Error sending WhatsApp message, unexpected response format:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

// GET endpoint for WhatsApp webhook verification
whatsappWebhookRouter.get('/', (req: Request, res: Response) => {
  try {
    console.log('🔍 WhatsApp Webhook Verification Request:', req.query);
    
    // WhatsApp sends a verification request with these query parameters
    const mode = req.query['hub.mode'] as string | undefined;
    const token = req.query['hub.verify_token'] as string | undefined;
    const challenge = req.query['hub.challenge'] as string | undefined;
    
    console.log(`Received verification: mode=${mode}, token=${token}, challenge=${challenge}`);
    
    // Verify the token matches our verification token
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WhatsApp webhook verified successfully');
      // Important: Set content type to text/plain and return ONLY the challenge string
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(challenge);
    } else {
      // Verification failed
      console.log('❌ WhatsApp webhook verification failed - Invalid mode or token');
      res.sendStatus(403);
    }
  } catch (error) {
    console.error('Error handling WhatsApp webhook verification:', error);
    res.sendStatus(500);
  }
});

// POST endpoint for receiving WhatsApp messages
whatsappWebhookRouter.post('/', async (req: Request, res: Response) => {
  try {
    console.log('📩 Received WhatsApp webhook payload:', JSON.stringify(req.body));
    
    // Always acknowledge receipt quickly (Meta expects fast responses)
    res.status(200).send('EVENT_RECEIVED');
    
    // Extract the webhook data
    const data = req.body;
    
    // Verify this is a WhatsApp Business API message
    if (data.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp Business API message, ignoring');
      return;
    }
    
    // Process each entry in the webhook
    for (const entry of data.entry || []) {
      // Process each change in the entry
      for (const change of entry.changes || []) {
        // We only care about message changes
        if (change.field !== 'messages') continue;
        
        const value = change.value;
        if (!value || !value.messages || !value.messages.length) {
          console.log('No messages found in webhook payload');
          continue;
        }
        
        // Process each message
        for (const message of value.messages) {
          // Currently only handling text messages
          if (message.type !== 'text') {
            console.log(`Ignoring non-text message of type: ${message.type}`);
            continue;
          }
          
          // Extract message details
          const from = message.from; // Sender's WhatsApp number
          const messageText = message.text.body; // The message content
          
          console.log(`📱 Processing WhatsApp message from ${from}: ${messageText}`);
          
          // Process the message through our neural extension
          const response = await processWhatsAppMessage(from, messageText);
          
          // Send response back through WhatsApp API
          if (response && response.message) {
            console.log(`🤖 Neural extension response: ${response.message.substring(0, 50)}...`);
            await sendWhatsAppMessage(from, response.message);
          } else {
            console.log('❌ No response generated from neural extension');
          }
        }
      }
    }
  } catch (error) {
    // Log errors but don't send response (already sent 200 above)
    console.error('Error processing WhatsApp webhook:', error);
  }
});

export default whatsappWebhookRouter;