import { db } from "@db";
import { users, whatsappUsers, entries, tags } from "@shared/schema";
import { eq } from "drizzle-orm";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { storage } from "./storage";
import twilio from "twilio";

// Twilio WhatsApp API configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
    // Ensure the phone number has the WhatsApp: prefix required by Twilio
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
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
    console.error("Error sending message through WhatsApp chatbot:", error);
    return false;
  }
}

/**
 * Process a message from the DotSpark WhatsApp chatbot to create a learning dot
 */
export async function processWhatsAppMessage(from: string, messageText: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get user ID from WhatsApp number
    const userId = await getUserIdFromWhatsAppNumber(from);
    if (!userId) {
      return {
        success: false,
        message: "Your phone number is not linked to a DotSpark account. Please activate the WhatsApp chatbot through the DotSpark web app first.",
      };
    }

    // Process the message based on content
    if (messageText.toLowerCase().startsWith("help")) {
      return {
        success: true,
        message: "DotSpark WhatsApp commands:\n" +
          "- Send any text to create a new learning entry\n" +
          "- Start with 'Q:' to ask a question about your learnings\n" +
          "- Type 'summary' to get a summary of your recent entries\n" +
          "- Type 'help' to see this message",
      };
    } else if (messageText.toLowerCase().startsWith("q:")) {
      // Handle question - use the chat function to generate a response
      const response = await generateChatResponse(messageText.substring(2).trim(), []); // Empty messages array for now
      return {
        success: true,
        message: response,
      };
    } else if (messageText.toLowerCase() === "summary") {
      // TODO: Implement summary function
      return {
        success: true,
        message: "Summary feature coming soon! Check the web app for now to see your learning insights.",
      };
    } else {
      // Process as a new learning entry
      const structuredEntry = await processEntryFromChat(messageText, []);
      
      if (structuredEntry) {
        try {
          // Create the entry in the database
          // First, we need to update the entries table directly because storage.createEntry doesn't accept userId
          const [insertedEntry] = await db.insert(entries).values({
            title: structuredEntry.title,
            content: structuredEntry.content,
            categoryId: structuredEntry.categoryId,
            userId: userId,
            isFavorite: false,
          }).returning();
          
          const newEntry = insertedEntry;
          
          // If we have tag names, create them and associate with the entry
          if (structuredEntry.tagNames && structuredEntry.tagNames.length > 0) {
            // Create tags that don't exist and get their IDs
            const tagIds: number[] = [];
            
            for (const tagName of structuredEntry.tagNames) {
              try {
                // Try to find existing tag
                const existingTag = await db.query.tags.findFirst({
                  where: eq(tags.name, tagName)
                });
                
                if (existingTag) {
                  tagIds.push(existingTag.id);
                } else {
                  // Create new tag
                  const newTag = await storage.createTag({ name: tagName });
                  tagIds.push(newTag.id);
                }
              } catch (error) {
                console.error(`Error creating tag ${tagName}:`, error);
              }
            }
            
            // Update the entry with the tag IDs
            if (tagIds.length > 0) {
              await storage.updateEntry(newEntry.id, { tagIds });
            }
          }
          
          return {
            success: true,
            message: `✅ New learning dot created!\n\nTitle: ${structuredEntry.title}\n\nCategory: ${structuredEntry.categoryId ? 'Added' : 'None'}\n\nTags: ${structuredEntry.tagNames && structuredEntry.tagNames.length > 0 ? structuredEntry.tagNames.join(', ') : 'None'}`,
          };
        } catch (error) {
          console.error("Error creating learning dot from WhatsApp chatbot:", error);
          return {
            success: false,
            message: "Your learning was processed by our AI but there was an error saving it. Please try again later.",
          };
        }
      } else {
        return {
          success: false,
          message: "Our AI couldn't create a learning dot from your message. Please try again with more detailed information.",
        };
      }
    }
  } catch (error) {
    console.error("Error processing WhatsApp chatbot message:", error);
    return {
      success: false,
      message: "An error occurred while the DotSpark AI was processing your message. Please try again later.",
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
    // Normalize phone number (remove spaces, ensure it includes country code)
    const normalizedPhone = phoneNumber.replace(/\s+/g, "");
    if (!normalizedPhone.startsWith("+")) {
      return {
        success: false,
        message: "Phone number must include country code (e.g., +1 for US)",
      };
    }

    // Check if user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userExists) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check if phone is already registered
    const existingWhatsAppUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, normalizedPhone),
    });

    if (existingWhatsAppUser) {
      // If already registered to this user, just return success
      if (existingWhatsAppUser.userId === userId) {
        return {
          success: true,
          message: "WhatsApp chatbot is already activated for this phone number",
        };
      }
      
      // Otherwise, it's linked to another user
      return {
        success: false,
        message: "This phone number is already connected to another DotSpark account",
      };
    }

    // Register new WhatsApp user
    await db.insert(whatsappUsers).values({
      userId,
      phoneNumber: normalizedPhone,
      active: true,
    });

    return {
      success: true,
      message: "DotSpark WhatsApp chatbot activated successfully. You can now chat with our AI through WhatsApp.",
    };
  } catch (error) {
    console.error("Error activating WhatsApp chatbot:", error);
    return {
      success: false,
      message: "An error occurred while activating the WhatsApp chatbot",
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
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
    });

    if (!whatsappUser) {
      return {
        success: false,
        message: "No WhatsApp chatbot activated for this user",
      };
    }

    // Update the active status instead of deleting
    await db
      .update(whatsappUsers)
      .set({ active: false })
      .where(eq(whatsappUsers.id, whatsappUser.id));

    return {
      success: true,
      message: "DotSpark WhatsApp chatbot deactivated successfully",
    };
  } catch (error) {
    console.error("Error deactivating WhatsApp chatbot:", error);
    return {
      success: false,
      message: "An error occurred while deactivating the WhatsApp chatbot",
    };
  }
}

/**
 * Get DotSpark WhatsApp chatbot status for a user
 */
export async function getWhatsAppStatus(userId: number): Promise<{
  registered: boolean;
  phoneNumber?: string;
}> {
  try {
    const whatsappUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
    });

    if (!whatsappUser || !whatsappUser.active) {
      return { registered: false };
    }

    return {
      registered: true,
      phoneNumber: whatsappUser.phoneNumber,
    };
  } catch (error) {
    console.error("Error getting WhatsApp chatbot status:", error);
    return { registered: false };
  }
}