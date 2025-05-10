import { Request, Response, Router } from 'express';
import { processWhatsAppMessage } from './whatsapp';
import axios from 'axios';
import twilio from 'twilio';

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

// GET endpoint for WhatsApp webhook verification (Meta API)
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

// POST endpoint for receiving WhatsApp messages - handles BOTH Twilio and Meta formats
whatsappWebhookRouter.post('/', async (req: Request, res: Response) => {
  try {
    console.log('📩 Received WhatsApp webhook payload:', JSON.stringify(req.body));
    
    // Check if this is a Twilio request by looking for Twilio-specific fields
    if (req.body.Body && req.body.From) {
      // This is a Twilio request
      console.log("💬 RECEIVED WEBHOOK from Twilio WhatsApp");
      
      // Extract message from Twilio WhatsApp request
      const messageText = req.body.Body;
      const from = req.body.From;

      if (!messageText || !from) {
        console.log("❌ Received invalid Twilio WhatsApp message:", req.body);
        // Not a valid message or missing required fields
        return res.status(200).send(); // Always return 200 to Twilio
      }

      console.log(`Received Twilio WhatsApp message from ${from}: ${messageText}`);
      
      // Process the message and get a response
      const response = await processWhatsAppMessage(from, messageText);
      
      // Create a TwiML response to send back to the user
      const twiml = new twilio.twiml.MessagingResponse();
      
      if (response && response.message) {
        // Add the message to the TwiML response
        twiml.message(response.message);
        console.log("Sending WhatsApp chatbot reply:", response.message);
      } else {
        // Send a default message if something went wrong
        twiml.message("Sorry, I couldn't process your message. Please try again later.");
      }
      
      // Set response headers and send TwiML response
      res.set('Content-Type', 'text/xml');
      return res.send(twiml.toString());
    }
    
    // If not Twilio, assume it's from Meta WhatsApp Business API
    // We've already sent 200 to Twilio if that was the case, so now handle Meta
    
    // Acknowledge receipt for Meta (if this is a Meta request)
    res.status(200).send('EVENT_RECEIVED');
    
    // Extract the webhook data
    const data = req.body;
    
    // Verify this is a WhatsApp Business API message
    if (data.object !== 'whatsapp_business_account') {
      console.log('Not a WhatsApp Business API message');
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
          
          console.log(`📱 Processing Meta WhatsApp message from ${from}: ${messageText}`);
          
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
    // For Twilio, we need to respond with valid TwiML even for errors
    console.error('Error processing WhatsApp webhook:', error);
    try {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message("Our neural extension is experiencing technical difficulties. Please try again later.");
      res.set('Content-Type', 'text/xml');
      res.send(twiml.toString());
    } catch (innerError) {
      console.error('Error creating error response:', innerError);
      // As a last resort, just send an empty 200 response
      res.status(200).send();
    }
  }
});

export default whatsappWebhookRouter;