import { db } from "@db";
import { users, whatsappUsers, entries, tags, whatsappOtpVerifications, entryTags } from "@shared/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { storage } from "./storage";
import twilio from "twilio";
import { randomInt } from "crypto";
import OpenAI from "openai";
import { generateAdvancedResponse, analyzeContentType, processLearningEntry } from "./openai";

// Twilio WhatsApp API configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

// Log Twilio configuration status (without revealing actual values)
console.log("Twilio Configuration Status:");
console.log(`- TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID ? "Set" : "Missing"}`);
console.log(`- TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? "Set" : "Missing"}`);
console.log(`- TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER ? "Set" : "Missing"}`);

// Initialize Twilio client (if credentials are available)
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

/**
 * Interface for incoming Twilio WhatsApp message
 */
interface TwilioWhatsAppMessage {
  Body: string;
  From: string;
  To: string;
  ProfileName?: string;
  MessageSid: string;
}

/**
 * Helper function to extract message text from Twilio WhatsApp webhook payload
 */
export function extractWhatsAppMessage(payload: any): string | null {
  try {
    // For Twilio webhook format
    if (payload && payload.Body) {
      return payload.Body;
    }
    
    // For Meta webhook format
    if (payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      return payload.entry[0].changes[0].value.messages[0].text.body;
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting WhatsApp message:", error);
    return null;
  }
}

/**
 * Helper function to get user ID from a phone number registered with the DotSpark WhatsApp chatbot
 */
export async function getUserIdFromWhatsAppNumber(phoneNumber: string): Promise<number | null> {
  try {
    // Normalize phone number format (remove WhatsApp prefix if present)
    const normalizedPhone = phoneNumber.replace('whatsapp:', '').trim();
    
    // Create standardized version (always with + prefix)
    const standardizedPhone = normalizedPhone.startsWith('+') 
      ? normalizedPhone 
      : `+${normalizedPhone}`;
    
    console.log(`🔍 Looking up WhatsApp user with phone: ${normalizedPhone} (standardized: ${standardizedPhone})`);
    
    // Try to find with standardized format first
    let whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, standardizedPhone)
    });
    
    // If not found, try with original format
    if (!whatsappUser) {
      console.log(`🔍 Not found with standardized format, trying original format`);
      whatsappUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, normalizedPhone)
      });
    }
    
    if (whatsappUser?.userId) {
      console.log(`✅ Found WhatsApp user with ID: ${whatsappUser.userId}`);
    } else {
      console.log(`⚠️ No WhatsApp user found for phone: ${normalizedPhone}`);
    }
    
    // Return the user ID if found, or null if not registered
    return whatsappUser?.userId || null;
  } catch (error) {
    console.error("Error getting user ID from WhatsApp number:", error);
    return null;
  }
}

/**
 * Helper function to send a message through the DotSpark WhatsApp chatbot using Twilio
 */
export async function sendWhatsAppReply(to: string, message: string): Promise<boolean> {
  try {
    // Check if Twilio client is initialized
    if (!twilioClient) {
      console.error("Twilio client not initialized - missing credentials");
      return false;
    }
    
    // Format the recipient phone number (ensure it has the correct format with country code)
    let formattedNumber = to.replace('whatsapp:', '').trim();
    
    // Add + if missing from the phone number
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = `+${formattedNumber}`;
    }
    
    // Create the full WhatsApp format number for Twilio
    const toNumber = `whatsapp:${formattedNumber}`;
    
    console.log(`Attempting to send WhatsApp message to: ${toNumber}`);
    
    // Use your production Twilio WhatsApp number
    const from = `whatsapp:${TWILIO_PHONE_NUMBER}`;
    console.log(`Sending from: ${from}`);
    
    const response = await twilioClient.messages.create({
      body: message,
      from: from,
      to: toNumber
    });

    if (response.sid) {
      console.log(`Message sent successfully via Twilio with SID: ${response.sid}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error sending WhatsApp message via Twilio:", error);
    
    // In development mode, simulate success for testing
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Simulating successful WhatsApp message delivery");
      console.log(`Development mode: Message content: ${message}`);
      return true;
    }
    
    return false;
  }
}

/**
 * Process a message from the DotSpark WhatsApp chatbot using conversational AI
 */
export async function processWhatsAppMessage(from: string, messageText: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`⭐️ Processing WhatsApp message from ${from}: "${messageText}"`);
    
    // Normalize phone number format
    const normalizedPhone = from.replace('whatsapp:', '').trim();
    console.log(`⭐️ Normalized phone number: ${normalizedPhone}`);
    
    // Check if this phone is linked to a DotSpark account
    let userId = await getUserIdFromWhatsAppNumber(from);
    console.log(`⭐️ Found linked userId: ${userId || 'none'}`);
    
    // Get WhatsApp user record directly to check if this is their first message
    // Make sure to standardize the phone format for correct lookup
    const standardizedPhone = normalizedPhone.startsWith('+') 
      ? normalizedPhone 
      : `+${normalizedPhone}`;
      
    console.log(`Looking up WhatsApp user with standardized phone: ${standardizedPhone}`);
    
    const whatsappUserRecord = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, standardizedPhone)
    });
    
    // First-time user is someone we've never seen before at all
    const isFirstTimeUser = !whatsappUserRecord;
    console.log(`WhatsApp user record found: ${whatsappUserRecord ? 'YES' : 'NO (first time user)'}`);
    
    // Also track if this is linked to an account
    const isLinkedToAccount = !!userId;
    
    // If no linked account found, use the demo account to allow immediate usage
    if (!userId) {
      // Use the demo user ID as a fallback for all unlinked WhatsApp users
      const DEMO_USER_ID = 1;
      userId = DEMO_USER_ID;
      
      // Auto-register this phone number with the demo account
      console.log(`⭐️ Auto-registering new WhatsApp user with demo account: ${standardizedPhone}`);
      try {
        // Use standardized phone format for storage
        const [newWhatsappUser] = await db.insert(whatsappUsers).values({
          userId: DEMO_USER_ID,
          phoneNumber: standardizedPhone,
          active: true,
          lastMessageSentAt: new Date(),
        }).onConflictDoNothing().returning();
        
        if (newWhatsappUser) {
          console.log(`⭐️ Successfully registered WhatsApp user: ${JSON.stringify(newWhatsappUser)}`);
        } else {
          console.log(`⚠️ WhatsApp user already exists (onConflictDoNothing took effect)`);
        }
      } catch (error) {
        // If there's an error (like duplicate entry), just log it but continue
        console.error("Error registering WhatsApp user:", error);
        console.log("⚠️ Continuing with demo user ID despite registration error");
      }
      
      // Later, if they send a link code, we'll update this record to their real account
    }
    
    // Check for our default prompt message with broader matching
    const defaultPromptPatterns = [
      "I've got a few things on my mind — need your thoughts",
      "Hey DotSpark",
      "Hello DotSpark",
      "Hi DotSpark",
      "got a few things on my mind",
      "need your thoughts"
    ];
    
    const isDefaultPrompt = defaultPromptPatterns.some(pattern => 
      messageText.toLowerCase().includes(pattern.toLowerCase())
    );
    
    console.log(`Default prompt check: ${isDefaultPrompt ? "YES" : "NO"} for message: "${messageText}"`);
    console.log(`First time user check: ${isFirstTimeUser ? "YES" : "NO"} for ${from}`);
    
    // For default prompt from returning users, we provide a special greeting
    if (isDefaultPrompt && !isFirstTimeUser) {
      console.log(`Default prompt detected from returning user ${from}`);
      const returningUserGreeting = 
        "Welcome back to DotSpark! I'm here to help organize your thoughts and provide clarity.\n\n" +
        "What would you like to explore today?";
      
      await sendWhatsAppReply(from, returningUserGreeting);
      
      // Return this special greeting as the response and don't process the default prompt further
      return {
        success: true,
        message: returningUserGreeting
      };
    }
    
    // Send welcome message for first-time users
    if (isFirstTimeUser) {
      console.log(`First-time user detected for ${from} - sending welcome message`);
      
      // We'll send an immediate welcome message before processing their actual message
      let welcomeMessage;
      
      // For ANY message from a first-time user, send our welcome message
      // This ensures consistent welcome for both button clicks and direct messages
      welcomeMessage = 
        "✨ *Welcome to DotSpark.*\n\n" +
        "Thanks for reaching out! DotSpark is your neural extension for clearer thinking and instant insights.\n\n" +
        "I can help with anything on your mind — from breaking down complex ideas to organizing your thoughts. What would you like to explore today?";
        
      console.log(`Sending welcome message to first-time user: ${from}`);
      
      // Send the welcome message
      await sendWhatsAppReply(from, welcomeMessage);
      
      // For default prompts, return immediately after welcome message
      // This prevents processing empty/generic first messages from button clicks
      if (isDefaultPrompt) {
        console.log(`First-time user with default prompt: stopping after welcome`);
        return {
          success: true,
          message: welcomeMessage
        };
      }
      
      console.log(`First-time user with custom message: continuing to process their message`);
      // For non-default messages, continue processing their actual message content
    }

    // Handle explicit commands first
    if (messageText.toLowerCase() === "help") {
      return {
        success: true,
        message: "👋 *How I Can Help You*\n\n" +
          "I'm your DotSpark AI assistant, here to help with:\n\n" +
          "💬 *Answering Questions* - Ask me anything you're curious about\n" + 
          "💡 *Brainstorming Ideas* - Let's explore possibilities together\n" +
          "📚 *Learning New Concepts* - I can explain topics in simple terms\n" +
          "🔄 *Having Conversations* - Chat naturally like you would with a friend\n" +
          "📝 *Solving Problems* - I can help you work through challenges\n\n" +
          "Simple commands:\n" +
          "• Type 'link' to connect your WhatsApp to your DotSpark account\n" +
          "• Type 'help' anytime to see this message again\n\n" +
          "Feel free to chat naturally - I'm here to help with whatever you need!",
      };
    }
    
    // Check for email-based linking messages (with extensive logging)
    console.log("⚡️ Checking for email-based linking in message:", messageText);
    
    // Try multiple regex patterns to capture various message formats
    const emailLinkingRegex1 = /link.*whatsapp.*\(([^\)]+)\)/i;
    const emailLinkingRegex2 = /link.*dotspark.*\(([^\)]+)\)/i;
    const emailLinkingRegex3 = /.*dotspark.*account.*\(([^\)]+)\)/i;
    const emailLinkingRegex4 = /please connect my Neural Extension via WhatsApp\.?\s*My DotSpark account is\s*([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/i;
    const emailLinkingRegex5 = /Hey DotSpark,?\s*please connect my Neural Extension via WhatsApp\.?\s*My DotSpark account is\s*([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/i;
    
    // Even more flexible patterns
    const emailLinkingRegex6 = /connect.*Neural Extension.*account.*is\s*([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/i;
    const emailLinkingRegex7 = /Neural Extension.*WhatsApp.*account\s*(?:is)?\s*([\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})/i;
    
    // Log individual regex tests for debugging
    console.log("Regex1 test:", emailLinkingRegex1.test(messageText));
    console.log("Regex2 test:", emailLinkingRegex2.test(messageText));
    console.log("Regex3 test:", emailLinkingRegex3.test(messageText));
    console.log("Regex4 test:", emailLinkingRegex4.test(messageText));
    console.log("Regex5 test:", emailLinkingRegex5.test(messageText));
    console.log("Regex6 test:", emailLinkingRegex6.test(messageText));
    console.log("Regex7 test:", emailLinkingRegex7.test(messageText));
    
    let emailMatch = messageText.match(emailLinkingRegex1) || 
                    messageText.match(emailLinkingRegex2) || 
                    messageText.match(emailLinkingRegex3) ||
                    messageText.match(emailLinkingRegex4) ||
                    messageText.match(emailLinkingRegex5) ||
                    messageText.match(emailLinkingRegex6) ||
                    messageText.match(emailLinkingRegex7);
    
    // Direct email extraction as fallback
    if (!emailMatch) {
      console.log("No regex match, trying direct email extraction");
      // Look for email pattern directly
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const directEmailMatch = messageText.match(emailRegex);
      
      if (directEmailMatch) {
        emailMatch = [messageText, directEmailMatch[0]];
        console.log("Found email directly:", directEmailMatch[0]);
      }
    }
    
    if (emailMatch && emailMatch[1]) {
      console.log("✅ Found email match:", emailMatch[1]);
      console.log("✅ Full match data:", JSON.stringify(emailMatch));
      const userEmail = emailMatch[1].trim();
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      console.log(`✅ Linking WhatsApp number ${normalizedPhone} with email ${userEmail}`);
      
      console.log(`Attempting to link WhatsApp number ${normalizedPhone} with email ${userEmail}`);
      
      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail)
      });
      
      // Log debugging info for user lookup
      console.log(`User lookup result for ${userEmail}:`, user ? `Found user with ID ${user.id}` : "No user found");
      
      if (!user) {
        console.log("Fetching all users to look for approximate matches");
        const allUsers = await db.query.users.findMany();
        console.log("Available user emails:", allUsers.map(u => u.email));
        
        // Look for a closest match - maybe case sensitivity issues?
        const possibleMatch = allUsers.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
        if (possibleMatch) {
          console.log(`Found possible case-insensitive match: ${possibleMatch.email}`);
        }
        
        // Auto-create a provisional account for this user so they can start using it 
        console.log(`Creating provisional account for email: ${userEmail}`);
        
        try {
          // Generate a random username based on the email
          const username = userEmail.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
          
          // Create a new user with minimal required fields
          const [newUser] = await db.insert(users).values({
            email: userEmail,
            username: username,
            password: 'provisional_' + Math.random().toString(36).substring(2), // Random password, they'll need to reset
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();
          
          console.log(`Created provisional user: ${JSON.stringify(newUser)}`);
          
          // Now register their WhatsApp
          await db.insert(whatsappUsers).values({
            userId: newUser.id,
            phoneNumber: normalizedPhone,
            active: true,
            lastMessageSentAt: new Date(),
          }).onConflictDoUpdate({
            target: whatsappUsers.phoneNumber,
            set: {
              userId: newUser.id,
              active: true,
              updatedAt: new Date(),
              lastMessageSentAt: new Date(),
            },
          });
          
          return {
            success: true,
            message: "✅ *Neural Extension Activated Successfully!*\n\n" +
              `DotSpark is now tuned to grow with your thinking.\n` +
              `The more you interact, the sharper and more personalized it becomes.\n\n` +
              `Say anything — a thought, a question, a decision you're stuck on.\n` +
              `Let's begin.\n\n` +
              `We've created a provisional account for you with email ${userEmail}. Visit www.dotspark.in to set up a password and access your dashboard.`
          };
        } catch (error) {
          console.error("Error creating provisional account:", error);
          
          return {
            success: true,
            message: "⚠️ *Account Creation Issue*\n\n" +
              `We tried to create a DotSpark account for you with ${userEmail}, but encountered a technical issue.\n\n` +
              "You can still use WhatsApp with DotSpark, but to sync with a dashboard, please create an account at www.dotspark.in and then reconnect."
          };
        }
      }
      
      // Check if this phone is already registered with another user
      const existingWhatsappUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, normalizedPhone)
      });
      
      if (existingWhatsappUser) {
        // Update the existing record to point to the new user
        await db.update(whatsappUsers)
          .set({
            userId: user.id,
            active: true,
            lastMessageSentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.phoneNumber, normalizedPhone));
      } else {
        // Create a new WhatsApp user record
        await db.insert(whatsappUsers).values({
          userId: user.id,
          phoneNumber: normalizedPhone,
          active: true,
          lastMessageSentAt: new Date()
        });
      }
      
      return {
        success: true,
        message: "✅ *Congratulations — your Neural Extension is now active!*\n\n" +
          `DotSpark is now tuned to grow with your thinking.\n` +
          `The more you interact, the sharper and more personalized it becomes.\n\n` +
          `Say anything — a thought, a question, a decision you're stuck on.\n` +
          `Let's begin.\n\n` +
          `You can also access your personal dashboard for deeper insights at www.dotspark.in.`
      };
    }
    
    // Handle link account command
    const linkCommand = messageText.toLowerCase();
    if (linkCommand === "link" || 
        linkCommand === "link account" || 
        linkCommand === "connect account") {
      return {
        success: true,
        message: "🔗 *Connect to Your DotSpark Account*\n\n" +
          "Thanks for wanting to connect! There are two easy ways to link this WhatsApp with your DotSpark account:\n\n" +
          "*Option 1: From the DotSpark website* (easiest)\n" +
          "1. Log in at dotspark.ai\n" +
          "2. Click 'Link WhatsApp with One Click'\n" +
          "3. Send the pre-filled message that appears in WhatsApp\n\n" +
          "*Option 2: Right here in chat*\n" +
          "Simply type the following (using your account email):\n" +
          "link:youremail@example.com\n\n" +
          "Once connected, all our conversations will appear in your DotSpark dashboard, and I'll be able to provide more personalized assistance based on your saved insights!"
      };
    }
    
    // Handle direct email linking command (link:email@example.com)
    const directLinkRegex = /^link:(.+@.+\..+)$/i;
    const directLinkMatch = messageText.match(directLinkRegex);
    
    if (directLinkMatch && directLinkMatch[1]) {
      const userEmail = directLinkMatch[1].trim();
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      
      console.log(`Direct email linking attempt: ${normalizedPhone} with email ${userEmail}`);
      
      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail)
      });
      
      if (!user) {
        return {
          success: true,
          message: "⚠️ *Account Not Found*\n\n" +
            `We couldn't find a DotSpark account with email "${userEmail}". Please make sure you're using the same email address that you used to create your DotSpark account.\n\n` +
            "If you don't have a DotSpark account yet, you can still use this WhatsApp chatbot, but your conversations won't appear in a dashboard."
        };
      }
      
      // Check if this phone is already registered with another user
      const existingWhatsappUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, normalizedPhone)
      });
      
      if (existingWhatsappUser) {
        // Update the existing record to point to the new user
        await db.update(whatsappUsers)
          .set({
            userId: user.id,
            active: true,
            lastMessageSentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.phoneNumber, normalizedPhone));
      } else {
        // Create a new WhatsApp user record
        await db.insert(whatsappUsers).values({
          userId: user.id,
          phoneNumber: normalizedPhone,
          active: true,
          lastMessageSentAt: new Date()
        });
      }
      
      return {
        success: true,
        message: "✅ *Successfully Connected!*\n\n" +
          `✅ *Congratulations — your Neural Extension is now active!*\n\n` +
          `DotSpark is now tuned to grow with your thinking.\n` +
          `The more you interact, the sharper and more personalized it becomes.\n\n` +
          `Say anything — a thought, a question, a decision you're stuck on.\n` +
          `Let's begin.\n\n` +
          `You can also access your personal dashboard for deeper insights at www.dotspark.in`
      };
    }
    
    // Still support old 6-digit code method
    const linkCodeRegex = /^\d{6}$/;
    if (linkCodeRegex.test(messageText.trim())) {
      const linkCode = messageText.trim();
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      
      console.log(`Attempting to link WhatsApp number ${normalizedPhone} with code ${linkCode}`);
      
      // Find the verification record with this code
      const verification = await db.query.whatsappOtpVerifications.findFirst({
        where: and(
          eq(whatsappOtpVerifications.otpCode, linkCode),
          eq(whatsappOtpVerifications.verified, false),
          gt(whatsappOtpVerifications.expiresAt, new Date())
        )
      });
      
      if (!verification) {
        return {
          success: true,
          message: "⚠️ *Invalid or Expired Code*\n\n" +
            "The code you entered is either invalid or has expired. Please generate a new code from the DotSpark dashboard.\n\n" +
            "To generate a new code:\n" +
            "1. Log in to your DotSpark account\n" +
            "2. Go to Settings > WhatsApp Integration\n" +
            "3. Click 'Generate New Link Code'\n" +
            "4. Send the new code to this chat"
        };
      }
      
      // Valid code found! Update the verification record with the phone number
      await db.update(whatsappOtpVerifications)
        .set({
          phoneNumber: normalizedPhone,
          verified: true
        })
        .where(eq(whatsappOtpVerifications.id, verification.id));
      
      // Also create or update the WhatsApp user record for this user
      const existingWhatsappUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, normalizedPhone)
      });
      
      if (existingWhatsappUser) {
        // Update the existing record to point to the new user
        await db.update(whatsappUsers)
          .set({
            userId: verification.userId,
            active: true,
            lastMessageSentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.phoneNumber, normalizedPhone));
      } else {
        // Create a new WhatsApp user record
        await db.insert(whatsappUsers).values({
          userId: verification.userId,
          phoneNumber: normalizedPhone,
          active: true,
          lastMessageSentAt: new Date()
        });
      }
      
      // Look up the user details to personalize the response
      const user = await db.query.users.findFirst({
        where: eq(users.id, verification.userId)
      });
      
      return {
        success: true,
        message: "✅ *Successfully Connected!*\n\n" +
          `✅ *Congratulations — your Neural Extension is now active!*\n\n` +
          `DotSpark is now tuned to grow with your thinking.\n` +
          `The more you interact, the sharper and more personalized it becomes.\n\n` +
          `Say anything — a thought, a question, a decision you're stuck on.\n` +
          `Let's begin.\n\n` +
          `You can also access your personal dashboard for deeper insights at www.dotspark.in`
      };
    }
    
    if (messageText.toLowerCase() === "summary") {
      return {
        success: true,
        message: "📊 *Your Neural Extension Status*\n\n" +
          "• Connected to: " + (userId === 1 ? "Demo Account (no dashboard access)" : "Personal DotSpark Account") + "\n" +
          "• Personalization Level: " + (userId === 1 ? "Basic (limited to conversation context)" : "Advanced (enhanced with your learning history)") + "\n" +
          "• Dashboard Integration: " + (userId === 1 ? "Disabled" : "Enabled") + "\n\n" +
          "Continue engaging with varied topics and interactive conversations to maximize the adaptive capabilities of your neural connection.",
      };
    }
    
    // Process with GPT-4o as the primary neural extension interface
    try {
      console.log(`⭐️ Calling GPT to generate response for message: "${messageText}"`);
      
      // Generate response that feels like an extension of the user's own thoughts
      const { text: responseText, isLearning } = await generateAdvancedResponse(
        messageText,
        userId,
        from // Pass phone number to maintain conversation context
      );
      
      console.log(`⭐️ GPT response received: "${responseText?.substring(0, 30)}..."`);
      
      // Always save the entry - for BOTH demo and linked users
      // This ensures ALL WhatsApp conversations appear in the dashboard
      try {
        // Create a basic entry with the message content
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        
        console.log(`⭐️ Creating WhatsApp entry for userId: ${userId}`);
        
        // Create the entry in the database with proper fields
        const newEntry = {
          userId: userId,
          title: `WhatsApp - ${formattedDate}`,
          content: messageText,
          visibility: "private", 
          isFavorite: false
        };
        
        // Insert using Drizzle ORM with returning to get the created ID
        const [createdEntry] = await db.insert(entries).values(newEntry).returning();
        
        console.log(`⭐️ Successfully saved WhatsApp message as entry ID: ${createdEntry.id}`);
      } catch (saveError) {
        console.error("⛔️ Error saving WhatsApp message to entries:", saveError);
        // Continue even if saving fails - don't disrupt the conversation
      }
      
      // Check if this is an explicit save request as a learning entry
      const explicitSaveRequest = 
        messageText.toLowerCase().includes("save this") || 
        messageText.toLowerCase().includes("record this") ||
        messageText.toLowerCase().includes("make a note") ||
        messageText.toLowerCase().includes("add to my") ||
        messageText.toLowerCase().includes("remember this");
      
      // Save as a structured learning entry if explicitly requested
      if (explicitSaveRequest) {
        console.log(`User requested to save neural insight: "${messageText.substring(0, 30)}..."`);
        
        // Process the learning with more advanced AI processing
        const structuredEntry = await processLearningEntry(messageText);
        
        if (structuredEntry) {
          // Create the entry in the database with the structured content
          const entryData = {
            userId: userId,
            title: structuredEntry.title || "Untitled Entry",
            content: structuredEntry.content || messageText,
            categoryId: structuredEntry.categoryId,
            visibility: "private",
            isFavorite: false
          };
          
          const [insertedEntry] = await db.insert(entries).values(entryData).returning();
          
          // Handle tags if present
          if (structuredEntry.tagNames && structuredEntry.tagNames.length > 0) {
            // Process each tag
            for (const tagName of structuredEntry.tagNames) {
              // Skip empty tag names
              if (!tagName.trim()) continue;
              
              // Find existing tag or create a new one
              let tag = await db.query.tags.findFirst({
                where: eq(tags.name, tagName)
              });
              
              if (!tag) {
                // Create the new tag
                [tag] = await db.insert(tags).values({
                  name: tagName
                }).returning();
              }
              
              // Link tag to entry
              await db.insert(entryTags).values({
                entryId: insertedEntry.id,
                tagId: tag.id
              });
            }
          }
          
          return {
            success: true,
            message: responseText + "\n\n✓ *Saved to your DotSpark dashboard*"
          };
        }
      }
      
      // Regular response (not a save request or learning entry)
      return {
        success: true,
        message: responseText
      };
    } catch (error) {
      console.error("Error generating WhatsApp response:", error);
      
      return {
        success: false,
        message: "I apologize, but I'm experiencing a temporary neural connection issue. Please try again in a moment while I recalibrate my thought processes."
      };
    }
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    return {
      success: false,
      message: "I'm having trouble processing your message. Please try again or contact support if the issue persists."
    };
  }
}

/**
 * Activate the DotSpark WhatsApp chatbot for a user
 */
export async function registerWhatsAppUser(userId: number, phoneNumber: string): Promise<{
  success: boolean;
  message: string;
  otpCode?: string;
}> {
  try {
    // Normalize phone number (remove any + prefix for consistent format)
    const normalizedPhone = phoneNumber.replace('+', '').trim();
    
    // Default expiration: 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Generate a random 6-digit code
    const otpCode = randomInt(100000, 999999).toString();
    
    // Create verification record
    await db.insert(whatsappOtpVerifications).values({
      userId,
      otpCode,
      expiresAt,
      verified: false,
    });
    
    return {
      success: true,
      message: "WhatsApp verification code generated successfully!",
      otpCode
    };
  } catch (error) {
    console.error("Error registering WhatsApp user:", error);
    return {
      success: false,
      message: "Failed to generate WhatsApp verification code. Please try again later."
    };
  }
}

/**
 * Deactivate the DotSpark WhatsApp chatbot for a user
 */
export async function unregisterWhatsAppUser(userId: number): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Find all WhatsApp users associated with this user
    const whatsappUserRecords = await db.query.whatsappUsers.findMany({
      where: eq(whatsappUsers.userId, userId)
    });
    
    if (whatsappUserRecords.length === 0) {
      return {
        success: false,
        message: "No WhatsApp numbers found for this user."
      };
    }
    
    // Deactivate all associated WhatsApp numbers
    for (const record of whatsappUserRecords) {
      await db.update(whatsappUsers)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(whatsappUsers.id, record.id));
    }
    
    return {
      success: true,
      message: `Successfully deactivated ${whatsappUserRecords.length} WhatsApp integration(s).`
    };
  } catch (error) {
    console.error("Error unregistering WhatsApp user:", error);
    return {
      success: false,
      message: "Failed to deactivate WhatsApp integration. Please try again later."
    };
  }
}

/**
 * Get DotSpark WhatsApp chatbot status for a user
 */
export async function getWhatsAppStatus(userId: number): Promise<{
  isRegistered: boolean;
  phoneNumber?: string;
  registeredAt?: string;
  userId?: number;
}> {
  try {
    console.log(`Checking WhatsApp status for user ID: ${userId}`);
    
    // Find the most recently updated WhatsApp user record for this user
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
      orderBy: desc(whatsappUsers.updatedAt || whatsappUsers.createdAt)
    });
    
    console.log(`WhatsApp user record found:`, whatsappUser ? 'Yes' : 'No');
    
    if (!whatsappUser) {
      return { isRegistered: false };
    }
    
    // When a record exists and is active, the user is registered
    const isRegistered = whatsappUser.active ?? false;
    
    // Log the status for debugging
    console.log(`WhatsApp activation status for user ${userId}: ${isRegistered ? 'ACTIVATED' : 'NOT ACTIVATED'}`);
    
    return {
      isRegistered: isRegistered,
      phoneNumber: whatsappUser.phoneNumber,
      registeredAt: whatsappUser.createdAt.toISOString(),
      userId: whatsappUser.userId
    };
  } catch (error) {
    console.error("Error getting WhatsApp status:", error);
    return { isRegistered: false };
  }
}