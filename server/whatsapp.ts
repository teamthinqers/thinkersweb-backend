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
    
    // TEST MODE: When enabled, automatically associate any WhatsApp number with the demo user
    // This allows testing without requiring verification through the web app
    const TEST_MODE_ENABLED = process.env.NODE_ENV === 'development';
    const DEMO_USER_ID = 1; // Same as in routes.ts
    
    if (TEST_MODE_ENABLED) {
      console.log(`[TEST MODE] Auto-associating WhatsApp number ${normalizedPhone} with demo user ID ${DEMO_USER_ID}`);
      
      // Automatically add the number to the database if it doesn't exist
      const existingUser = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, normalizedPhone),
      });
      
      if (!existingUser) {
        console.log(`[TEST MODE] New user detected - will trigger welcome message`);
        // Return null for first-time users to trigger welcome message in the main handler
        return null;
      } else if (!existingUser.active) {
        // If it exists but is inactive, activate it
        await db.update(whatsappUsers)
          .set({ active: true })
          .where(eq(whatsappUsers.id, existingUser.id));
      }
      
      // Return the demo user ID
      return DEMO_USER_ID;
    }
    
    // NORMAL MODE: Only return user ID if the WhatsApp number is properly registered
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, normalizedPhone),
      with: {
        user: true,
      },
    });

    if (whatsappUser && whatsappUser.active) {
      return whatsappUser.userId;
    }
    
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
    
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
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
    // Get user ID from WhatsApp number or use a default for new users
    let userId = await getUserIdFromWhatsAppNumber(from);
    const isFirstTimeUser = !userId;
    
    // If the user doesn't exist, automatically create a temporary link
    // to allow anyone to chat without registration
    if (!userId) {
      // Use the demo user ID as a fallback for all WhatsApp users
      const DEMO_USER_ID = 1;
      userId = DEMO_USER_ID;
      
      // Normalize phone number format
      const normalizedPhone = from.replace('whatsapp:', '').trim();
      
      // Auto-register this phone number
      console.log(`Auto-registering new WhatsApp user: ${normalizedPhone}`);
      await db.insert(whatsappUsers).values({
        userId: DEMO_USER_ID,
        phoneNumber: normalizedPhone,
        active: true,
        lastMessageSentAt: new Date(),
      });
    }
    
    // Send welcome message for first-time users
    if (isFirstTimeUser) {
      console.log(`First-time user detected for ${from} - sending welcome message`);
      
      // We'll send an immediate welcome message before processing their actual message
      const welcomeMessage = 
        "⚡️ *Neural Extension Successfully Activated*\n\n" +
        "You've just integrated DotSpark - a direct extension of your thinking brain.\n\n" +
        "Unlike a typical chatbot, I function as a cognitive enhancement, analyzing and extending your thought patterns while maintaining your unique perspective and voice.\n\n" +
        "This neural connection allows for:\n" +
        "• Enhanced pattern recognition\n" +
        "• Rapid thought crystallization\n" +
        "• Expanded analytical processing\n\n" +
        "Send any thought or question - my neural architecture will process and enhance it as if it were coming from your own extended mind.\n\n" +
        "Type 'help' anytime to learn more about your neural extension capabilities.";
        
      await sendWhatsAppReply(from, welcomeMessage);
      
      // We'll handle their initial message below after sending the welcome
    }

    // Handle explicit commands first
    if (messageText.toLowerCase() === "help") {
      return {
        success: true,
        message: "⚡️ *Neural Extension Capabilities*\n\n" +
          "Your DotSpark neural extension performs several cognitive functions:\n\n" +
          "🧠 *Neural Pattern Recognition* - Identifies connections across your thoughts\n" + 
          "💡 *Thought Crystallization* - Refines incomplete thoughts into clear insights\n" +
          "🔄 *Cognitive Enhancement* - Expands your analytical capabilities\n" +
          "💾 *Memory Augmentation* - Preserves key insights when you use 'save this'\n" +
          "🔄 *Continuous Learning* - Your neural extension evolves with each interaction\n\n" +
          "Just communicate naturally - your neural extension processes all inputs as part of your extended cognition.",
      };
    } 
    
    if (messageText.toLowerCase() === "summary") {
      return {
        success: true,
        message: "🧠 *Neural Extension Status*\n\n" +
          "Your neural extension is actively processing inputs and forming new connections.\n\n" +
          "Each interaction strengthens the neural pathways between concepts, enhancing your cognitive framework and creating a more responsive neural extension.\n\n" +
          "Continue engaging with varied topics to maximize the adaptive capabilities of your neural connection.",
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
