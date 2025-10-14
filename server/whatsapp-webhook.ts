import { Request, Response, Router } from 'express';
import { processWhatsAppMessage } from './whatsapp';
import axios from 'axios';
import twilio from 'twilio';
import { db } from "@db";
import { whatsappUsers, entries, whatsappConversationStates, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { extractUserIdFromMessage, cleanMessageFromToken } from './lib/whatsappToken';

// Create a router for WhatsApp webhook endpoints
const whatsappWebhookRouter = Router();

// Constants for WhatsApp Business API
const WHATSAPP_VERIFY_TOKEN = 'dotspark-verification-token';
const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '2519650718400538'; // Your WhatsApp Business Account ID
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
    console.log('📨 WhatsApp webhook headers:', JSON.stringify(req.headers));
    
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

      console.log(`⭐️ Received Twilio WhatsApp message from ${from}: ${messageText}`);
      
      // Find a user associated with this phone number
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      
      // Additional normalization to handle international formats
      // Some phone numbers might come with '+' prefix, others without
      const standardizedPhone = normalizedPhone.startsWith('+') 
        ? normalizedPhone 
        : `+${normalizedPhone}`;
        
      console.log(`⭐️ Looking up user for WhatsApp number: ${normalizedPhone} (standardized: ${standardizedPhone})`);
      
      // Check if this phone is already linked to a user account
      let whatsappUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, standardizedPhone)
      });
      
      // If not found with standardized format, try the original format
      if (!whatsappUser) {
        whatsappUser = await db.query.whatsappUsers.findFirst({
          where: eq(whatsappUsers.phoneNumber, normalizedPhone)
        });
      }

      let userId;
      
      // If already linked, proceed normally
      if (whatsappUser && whatsappUser.userId) {
        userId = whatsappUser.userId;
        console.log(`⭐️ Found linked user ID: ${userId} for phone ${normalizedPhone}`);
      } else {
        // Not linked - check conversation state
        console.log(`⚠️ No linked user found for phone ${normalizedPhone}. Checking conversation state...`);
        
        // Check if we're awaiting email from this user
        const conversationState = await db.query.whatsappConversationStates.findFirst({
          where: eq(whatsappConversationStates.phoneNumber, standardizedPhone)
        });
        
        if (conversationState && conversationState.state === 'awaiting_email' && new Date(conversationState.expiresAt) > new Date()) {
          // User is sending their email
          const emailInput = messageText.trim().toLowerCase();
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailInput)) {
            await sendWhatsAppMessage(
              normalizedPhone,
              "That doesn't look like a valid email address. Please share your email ID in the format: name@example.com"
            );
            res.status(200).send('Invalid email format');
            return;
          }
          
          // Look up user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, emailInput)
          });
          
          if (user) {
            // Email found - link the account!
            await db.insert(whatsappUsers).values({
              userId: user.id,
              phoneNumber: standardizedPhone,
              active: true
            });
            
            // Delete the conversation state
            await db.delete(whatsappConversationStates)
              .where(eq(whatsappConversationStates.phoneNumber, standardizedPhone));
            
            // Welcome the user
            await sendWhatsAppMessage(
              normalizedPhone,
              "✅ Welcome ThinQer, now you can easily interact with DotSpark using this chat window anytime !!"
            );
            
            res.status(200).send('User linked successfully');
            return;
          } else {
            // Email not found
            await sendWhatsAppMessage(
              normalizedPhone,
              `This email (${emailInput}) is not registered with DotSpark.\n\nPlease register first at: https://dotspark.in/auth\n\nAfter registration, come back and send me "Hey DotSpark" to link your account! 👋`
            );
            
            // Delete the conversation state
            await db.delete(whatsappConversationStates)
              .where(eq(whatsappConversationStates.phoneNumber, standardizedPhone));
            
            res.status(200).send('Email not found');
            return;
          }
        } else {
          // First message from unlinked user
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute timeout
          
          // Check if they already had a conversation state (returning after registration)
          const isGreeting = messageText.trim().toLowerCase().match(/^(hey|hi|hello)/i);
          const hadPreviousState = conversationState !== undefined;
          
          let responseMessage;
          if (hadPreviousState && isGreeting) {
            // Returning user - be smart about it
            responseMessage = "Hey! I hope you got registered. Can you please share your email ID?";
          } else {
            // First time or not a greeting - full instructions
            responseMessage = "Hey! Can you please share your email ID registered with DotSpark?\n\nIf not registered, please use the below link to register:\nhttps://dotspark.in/auth";
          }
          
          // Create or update conversation state
          await db.insert(whatsappConversationStates).values({
            phoneNumber: standardizedPhone,
            state: 'awaiting_email',
            stateData: null,
            expiresAt: expiresAt
          }).onConflictDoUpdate({
            target: whatsappConversationStates.phoneNumber,
            set: {
              state: 'awaiting_email',
              expiresAt: expiresAt,
              updatedAt: new Date()
            }
          });
          
          await sendWhatsAppMessage(normalizedPhone, responseMessage);
          
          res.status(200).send('Awaiting email');
          return;
        }
      }
      
      // Create an entry for the received message (skip if it's the initial greeting)
      try {
        // Check if this is the initial greeting message
        const isGreeting = messageText.trim().toLowerCase().includes('hey dotspark');
        
        // Only create entry if this is NOT a greeting message
        if (!isGreeting) {
          console.log(`⭐️ Creating entry for WhatsApp message from user ID: ${userId}`);
          
          const cleanedMessage = messageText;
          
          const timestamp = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });
          
          const now = new Date();
          
          const entryData = {
            userId: userId,
            title: `WhatsApp - ${timestamp}`,
            content: cleanedMessage,
            visibility: "private",
            isFavorite: false,
            createdAt: now,
            updatedAt: now
          };
          
          // Insert with explicit timestamp to ensure it's visible in dashboard
          const [newEntry] = await db.insert(entries).values(entryData).returning();
        
          if (newEntry) {
            console.log(`⭐️ Created entry with ID ${newEntry.id} for WhatsApp message with timestamp ${now.toISOString()}`);
            
            // Double-check entry creation
            try {
              const verifyEntry = await db.query.entries.findFirst({
                where: eq(entries.id, newEntry.id)
              });
              
              if (verifyEntry) {
                console.log(`⭐️ Entry verification successful. Entry ID ${newEntry.id} exists in database.`);
              } else {
                console.error(`⛔️ Failed to verify entry existence after creation. Entry ID ${newEntry.id} not found!`);
              }
            } catch (verifyError) {
              console.error(`⛔️ Error verifying entry: ${verifyError}`);
            }
          } else {
            console.error(`⛔️ Failed to create entry! No entry returned after insert.`);
          }
        } else {
          console.log(`ℹ️ Skipping entry creation for greeting message`);
        }
      } catch (entryError) {
        console.error("⛔️ Error creating entry for WhatsApp message:", entryError);
      }
      
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
          
          // Process the message through DotSpark
          const response = await processWhatsAppMessage(from, messageText);
          
          // Send response back through WhatsApp API
          if (response && response.message) {
            console.log(`🤖 DotSpark response: ${response.message.substring(0, 50)}...`);
            await sendWhatsAppMessage(from, response.message);
          } else {
            console.log('❌ No response generated from DotSpark');
          }
        }
      }
    }
  } catch (error) {
    // For Twilio, we need to respond with valid TwiML even for errors
    console.error('Error processing WhatsApp webhook:', error);
    try {
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message("DotSpark is experiencing technical difficulties. Please try again later.");
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