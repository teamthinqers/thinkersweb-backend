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

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze user input to determine whether it's a question or a learning entry
 */
async function analyzeUserInput(userInput: string): Promise<{
  type: 'question' | 'learning' | 'command';
  confidence: number;
}> {
  try {
    // Check for command prefixes first
    if (userInput.toLowerCase().startsWith("q:") || 
        userInput.toLowerCase().startsWith("question:") ||
        userInput.toLowerCase().startsWith("ask:")) {
      return { type: 'question', confidence: 0.95 };
    }
    
    if (userInput.toLowerCase() === "help" || 
        userInput.toLowerCase() === "summary" || 
        userInput.toLowerCase() === "commands") {
      return { type: 'command', confidence: 1.0 };
    }
    
    // Check if it's an explicit question
    if (userInput.endsWith("?")) {
      return { type: 'question', confidence: 0.9 };
    }
    
    try {
      const analysis = await analyzeContentType(userInput);
      return analysis;
    } catch (e) {
      console.error("Error using OpenAI for content analysis:", e);
    }
    
    // Default to treating it as a learning entry if simple analysis fails
    return { type: 'learning', confidence: 0.7 };
  } catch (error) {
    console.error("Error analyzing user input:", error);
    // Default to treating it as a learning entry if analysis fails
    return { type: 'learning', confidence: 0.5 };
  }
}

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
    if (payload.Body) {
      return payload.Body.trim();
    }
    return null;
  } catch (error) {
    console.error("Error extracting message from WhatsApp chatbot webhook:", error);
    return null;
  }
}

/**
 * Helper function to get user ID from a phone number registered with the DotSpark WhatsApp chatbot
 */
export async function getUserIdFromWhatsAppNumber(phoneNumber: string): Promise<number | null> {
  try {
    // Normalize the phone number format - Twilio sends with WhatsApp: prefix
    const normalizedPhone = phoneNumber.replace('whatsapp:', '').trim();
    
    // First check if this phone number is linked to a specific user account
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, normalizedPhone),
    });
    
    // If the phone is linked to a specific user account, return that user's ID
    if (whatsappUser) {
      if (!whatsappUser.active) {
        // If it exists but is inactive, activate it
        await db.update(whatsappUsers)
          .set({ 
            active: true,
            lastMessageSentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.id, whatsappUser.id));
      } else {
        // Update last message timestamp
        await db.update(whatsappUsers)
          .set({ 
            lastMessageSentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.id, whatsappUser.id));
      }
      
      console.log(`WhatsApp number ${normalizedPhone} linked to user ID ${whatsappUser.userId}`);
      return whatsappUser.userId;
    }
    
    // If no linked account, check if we're in test mode
    const TEST_MODE_ENABLED = process.env.NODE_ENV === 'development';
    const DEMO_USER_ID = 1; // Same as in routes.ts
    
    if (TEST_MODE_ENABLED) {
      console.log(`[TEST MODE] Using demo account for unlinked WhatsApp number ${normalizedPhone}`);
      // Return null for first-time users to trigger welcome message
      return null; // The main handler will create an association with the demo user
    }
    
    // In production, unlinked numbers return null so they can receive instructions to link
    console.log(`Unlinked WhatsApp number: ${normalizedPhone} - awaiting account connection`);
    return null;
  } catch (error) {
    console.error("Error finding user associated with WhatsApp chatbot:", error);
    return null;
  }
}

/**
 * Helper function to send a message through the DotSpark WhatsApp chatbot using Twilio
 */
export async function sendWhatsAppReply(to: string, message: string): Promise<boolean> {
  try {
    // Check if Twilio credentials are properly configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio credentials. Please check environment variables.");
      return false;
    }

    // Format the phone number to ensure it's in E.164 format
    let formattedNumber = to.trim();
    
    // Remove any WhatsApp prefix if it exists
    if (formattedNumber.startsWith('whatsapp:')) {
      formattedNumber = formattedNumber.substring(9);
    }
    
    // Ensure the number starts with "+"
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    
    // Ensure the phone number has the WhatsApp: prefix required by Twilio
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
    // Normalize phone number format
    const normalizedPhone = from.replace('whatsapp:', '').trim();
    
    // Check if this phone is linked to a DotSpark account
    let userId = await getUserIdFromWhatsAppNumber(from);
    const isFirstTimeUser = !userId;
    
    // If no linked account found, use the demo account to allow immediate usage
    if (!userId) {
      // Use the demo user ID as a fallback for all unlinked WhatsApp users
      const DEMO_USER_ID = 1;
      userId = DEMO_USER_ID;
      
      // Auto-register this phone number with the demo account
      console.log(`Auto-registering new WhatsApp user with demo account: ${normalizedPhone}`);
      await db.insert(whatsappUsers).values({
        userId: DEMO_USER_ID,
        phoneNumber: normalizedPhone,
        active: true,
        lastMessageSentAt: new Date(),
      });
      
      // Later, if they send a link code, we'll update this record to their real account
    }
    
    // Send welcome message for first-time users
    if (isFirstTimeUser) {
      console.log(`First-time user detected for ${from} - sending welcome message`);
      
      // We'll send an immediate welcome message before processing their actual message
      const welcomeMessage = 
        "👋 *Welcome to DotSpark!*\n\n" +
        "I'm your AI assistant, ready to help you with questions, ideas, or conversations about any topic.\n\n" +
        "How can I help you today? Feel free to ask me anything or share your thoughts.\n\n" +
        "💡 *Want more features?*\n" +
        "If you create a DotSpark account at dotspark.ai, you'll be able to:\n" +
        "• Save our conversations to your dashboard\n" +
        "• Track your learning patterns over time\n" +
        "• Customize your neural extension\n\n" +
        "Just type 'link' anytime to connect your WhatsApp with your DotSpark account.";
        
      await sendWhatsAppReply(from, welcomeMessage);
      
      // We'll handle their initial message below after sending the welcome
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
    console.log("Checking for email-based linking in message:", messageText);
    
    // Try multiple regex patterns to capture various message formats
    const emailLinkingRegex1 = /link.*whatsapp.*\(([^\)]+)\)/i;
    const emailLinkingRegex2 = /link.*dotspark.*\(([^\)]+)\)/i;
    const emailLinkingRegex3 = /.*dotspark.*account.*\(([^\)]+)\)/i;
    
    let emailMatch = messageText.match(emailLinkingRegex1) || 
                    messageText.match(emailLinkingRegex2) || 
                    messageText.match(emailLinkingRegex3);
    
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
      console.log("Found email match:", emailMatch[1]);
      const userEmail = emailMatch[1].trim();
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      
      console.log(`Attempting to link WhatsApp number ${normalizedPhone} with email ${userEmail}`);
      
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
        message: "✅ *DotSpark Account Successfully Linked*\n\n" +
          `Your WhatsApp number is now linked to your DotSpark account (${userEmail}). All your conversations here will be available in your dashboard.\n\n` +
          "Your neural extension is now fully synchronized with your account, providing personalized insights based on your previous interactions and learning entries."
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
      
      // Check if this phone is already registered with another user
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
      
      return {
        success: true,
        message: "✅ *DotSpark Account Successfully Linked*\n\n" +
          "Your WhatsApp number is now linked to your DotSpark account. All your conversations here will be available in your dashboard.\n\n" +
          "Your neural extension is now fully synchronized with your account, providing personalized insights based on your previous interactions and learning entries."
      };
    }
    
    if (messageText.toLowerCase() === "summary") {
      return {
        success: true,
        message: "🧠 *Neural Extension Status*\n\n" +
          "Your neural extension is actively processing inputs and forming new connections.\n\n" +
          "Each interaction strengthens the neural pathways between concepts, enhancing your cognitive framework and creating a more responsive neural extension.\n\n" +
          "Your interactive chat capabilities are fully enabled - ask questions, discuss ideas, or explore topics just like you would with ChatGPT. This WhatsApp channel gives you direct access to your neural extension anywhere, anytime.\n\n" +
          "Continue engaging with varied topics and interactive conversations to maximize the adaptive capabilities of your neural connection.",
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
        message: "✅ *DotSpark Account Successfully Linked*\n\n" +
          `Your WhatsApp number is now linked to your DotSpark account (${userEmail}). All your conversations here will be available in your dashboard.\n\n` +
          "Your neural extension is now fully synchronized with your account, providing personalized insights based on your previous interactions and learning entries."
      };
    }
    
    // Process with GPT-4o as the primary neural extension interface
    try {
      // Generate response that feels like an extension of the user's own thoughts
      const { text: responseText, isLearning } = await generateAdvancedResponse(
        messageText,
        userId,
        from // Pass phone number to maintain conversation context
      );
      
      // Check if this is an explicit save request
      const explicitSaveRequest = 
        messageText.toLowerCase().includes("save this") || 
        messageText.toLowerCase().includes("record this") ||
        messageText.toLowerCase().includes("make a note") ||
        messageText.toLowerCase().includes("add to my") ||
        messageText.toLowerCase().includes("remember this");
      
      // Save only if explicitly requested (no automatic classification)
      if (explicitSaveRequest) {
        console.log(`User requested to save neural insight: "${messageText.substring(0, 30)}..."`);
        
        // Process the learning with more advanced AI processing
        const structuredEntry = await processLearningEntry(messageText);
        
        if (structuredEntry) {
          // Create the entry in the database with the structured content
          const [insertedEntry] = await db.insert(entries).values({
            title: structuredEntry.title,
            content: structuredEntry.content,
            categoryId: structuredEntry.categoryId || 1, // Default category if none provided
            userId: userId,
            isFavorite: false,
          }).returning();
          
          // If we have tag names, create and associate them
          if (structuredEntry.tagNames && structuredEntry.tagNames.length > 0) {
            const tagIds: number[] = [];
            
            // Create or get IDs for each tag
            for (const tagName of structuredEntry.tagNames) {
              // Check if tag exists
              let tag = await db.query.tags.findFirst({
                where: eq(tags.name, tagName),
              });
              
              // Create tag if it doesn't exist
              if (tag) {
                tagIds.push(tag.id);
              } else {
                const [newTag] = await db.insert(tags).values({
                  name: tagName,
                }).returning();
                tagIds.push(newTag.id);
              }
            }
            
            // Associate tags with the entry
            if (tagIds.length > 0) {
              await storage.updateEntry(insertedEntry.id, { tagIds });
            }
          }
          
          // Return the response with confirmation that the insight was saved
          return {
            success: true,
            message: `${responseText}\n\n(💡 Neural insight saved to your extended memory)`,
          };
        }
      }
      
      // For all other interactions, provide the neural extension response
      return {
        success: true,
        message: responseText
      };
    } catch (aiError) {
      // Log the error
      console.error("Error in neural extension processing:", aiError);
      
      // Simple fallback with neural extension terminology
      return {
        success: true,
        message: "I'm experiencing a temporary neural processing limitation. Please try expressing your thought in a different way, and I'll continue functioning as your cognitive extension."
      };
    }
  } catch (error) {
    // Main try/catch block for the whole function
    console.error("Error processing WhatsApp chatbot message:", error);
    return {
      success: false,
      message: "I'm having trouble processing that right now. Can we try again in a moment?",
    };
  }
}

/**
 * Activate the DotSpark WhatsApp chatbot for a user
 */
export async function registerWhatsAppUser(userId: number, phoneNumber: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Normalize phone number format (remove spaces, ensure it starts with +)
    let formattedNumber = phoneNumber.trim();
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    
    // Check if this phone number is already registered
    const existingRegistration = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, formattedNumber)
    });
    
    if (existingRegistration) {
      // If already registered to this user, just activate
      if (existingRegistration.userId === userId) {
        await db.update(whatsappUsers)
          .set({ 
            active: true,
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.id, existingRegistration.id));
        
        return {
          success: true,
          message: "Your WhatsApp number has been reactivated. You can now interact with DotSpark via WhatsApp."
        };
      }
      
      // If registered to another user, return error
      return {
        success: false,
        message: "This phone number is already registered with another DotSpark account."
      };
    }
    
    // This is a new registration, create it
    await db.insert(whatsappUsers).values({
      userId,
      phoneNumber: formattedNumber,
      active: true,
    });
    
    return {
      success: true,
      message: "Your WhatsApp number has been activated. You can now interact with DotSpark via WhatsApp."
    };
  } catch (error) {
    console.error("Error registering WhatsApp user:", error);
    return {
      success: false,
      message: "An error occurred while registering your WhatsApp number. Please try again later."
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
    // Find the user's WhatsApp registration
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
    });
    
    if (!whatsappUser) {
      return {
        success: false,
        message: "WhatsApp integration not found for your account."
      };
    }
    
    // Update to inactive instead of deleting
    await db.update(whatsappUsers)
      .set({ 
        active: false,
        updatedAt: new Date()
      })
      .where(eq(whatsappUsers.id, whatsappUser.id));
    
    return {
      success: true,
      message: "WhatsApp integration has been deactivated successfully."
    };
  } catch (error) {
    console.error("Error unregistering WhatsApp user:", error);
    return {
      success: false,
      message: "An error occurred while deactivating WhatsApp integration. Please try again later."
    };
  }
}

/**
 * Get DotSpark WhatsApp chatbot status for a user
 */
export async function getWhatsAppStatus(userId: number): Promise<{
  active: boolean;
  phoneNumber: string | null;
  message: string;
}> {
  try {
    // Find the user's WhatsApp registration
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
    });
    
    if (!whatsappUser) {
      return {
        active: false,
        phoneNumber: null,
        message: "WhatsApp integration not configured for your account."
      };
    }
    
    // Return the status
    return {
      active: whatsappUser.active,
      phoneNumber: whatsappUser.phoneNumber,
      message: whatsappUser.active 
        ? `WhatsApp integration is active for ${whatsappUser.phoneNumber}`
        : `WhatsApp integration is inactive for ${whatsappUser.phoneNumber}`
    };
  } catch (error) {
    console.error("Error getting WhatsApp status:", error);
    return {
      active: false,
      phoneNumber: null,
      message: "An error occurred while checking WhatsApp integration status."
    };
  }
}
