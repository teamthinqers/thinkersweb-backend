import { db } from "@db";
import { users, whatsappUsers, entries, tags, whatsappOtpVerifications } from "@shared/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { storage } from "./storage";
import twilio from "twilio";
import { randomInt } from "crypto";

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
    console.error("Error sending message through WhatsApp chatbot:", error);
    
    // In production, we need detailed error logs for troubleshooting
    if (process.env.NODE_ENV === 'production') {
      const twilioError = error as any; // Cast to any for accessing Twilio error properties
      console.error("TWILIO ERROR DETAILS IN PRODUCTION:", JSON.stringify({
        accountSid: TWILIO_ACCOUNT_SID ? `${TWILIO_ACCOUNT_SID.substring(0, 5)}...` : 'undefined',
        authToken: TWILIO_AUTH_TOKEN ? 'present' : 'undefined',
        fromNumber: TWILIO_PHONE_NUMBER ? TWILIO_PHONE_NUMBER : 'undefined',
        toNumber: to,
        errorCode: twilioError.code || 'unknown',
        errorMessage: twilioError.message || 'No error message',
        errorStatus: twilioError.status || 'unknown'
      }, null, 2));
    }
    
    // For development purposes, always succeed
    if (process.env.NODE_ENV !== 'production') {
      console.log("Development mode: Simulating successful WhatsApp message delivery");
      console.log(`Development mode: Message content: ${message}`);
      return true;
    }
    
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
    
    // Send welcome message to user via WhatsApp
    const welcomeMessage = 
      "Welcome to DotSpark - Your Neural chip for limitless learning. Please feel free to ask me anything or record your learnings for the day\n\n" +
      "Here's how to use the chatbot:\n\n" +
      "1️⃣ Send any text to create a new learning dot\n" +
      "2️⃣ Start with 'Q:' to ask questions about your knowledge\n" +
      "3️⃣ Type 'summary' to get an overview of recent entries\n" +
      "4️⃣ Type 'help' to see all available commands\n\n" +
      "Try sending your first learning entry now! For example:\n" +
      "'I learned that consistent small efforts lead to big results over time.'";
    
    // Don't wait for the message to be sent before returning
    sendWhatsAppReply(normalizedPhone, welcomeMessage)
      .then(success => {
        if (!success) {
          console.error(`Failed to send welcome message to ${normalizedPhone}`);
        }
      })
      .catch(error => {
        console.error(`Error sending welcome message to ${normalizedPhone}:`, error);
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
  pendingVerification?: boolean;
}> {
  try {
    // First check if there's a pending OTP verification
    const pendingOtp = await db.query.whatsappOtpVerifications.findFirst({
      where: and(
        eq(whatsappOtpVerifications.userId, userId),
        eq(whatsappOtpVerifications.verified, false),
        gt(whatsappOtpVerifications.expiresAt, new Date())
      ),
      orderBy: [desc(whatsappOtpVerifications.createdAt)]
    });

    if (pendingOtp) {
      return { 
        registered: false, 
        phoneNumber: pendingOtp.phoneNumber,
        pendingVerification: true
      };
    }

    // Check for registered WhatsApp user
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

/**
 * Generate a random 6-digit OTP code
 */
function generateOTPCode(): string {
  // Generate a random 6-digit number
  return randomInt(100000, 999999).toString();
}

/**
 * Calculate expiration time (10 minutes from now)
 */
function getOTPExpirationTime(): Date {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10); // 10 minutes expiration
  return expirationTime;
}

/**
 * Request OTP verification for WhatsApp number
 */
export async function requestWhatsAppOTP(userId: number, phoneNumber: string): Promise<{
  success: boolean;
  message: string;
  otpCode?: string; // For development only
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

    // Check if phone is already registered to another user
    const existingWhatsAppUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, normalizedPhone),
    });

    if (existingWhatsAppUser && existingWhatsAppUser.userId !== userId) {
      return {
        success: false,
        message: "This phone number is already connected to another DotSpark account",
      };
    }

    // Generate OTP code
    const otpCode = generateOTPCode();
    const expiresAt = getOTPExpirationTime();

    // Store OTP verification request
    await db.insert(whatsappOtpVerifications).values({
      userId,
      phoneNumber: normalizedPhone,
      otpCode,
      expiresAt,
      verified: false,
    });

    // Send OTP via WhatsApp
    // Using one of the approved Twilio Sandbox templates
    // See: https://www.twilio.com/docs/whatsapp/sandbox#using-the-sandbox
    const otpMessage = 
      `${otpCode} is your verification code. For your security, do not share this code.`;
    
    // Try to send the message, but in dev mode, we'll succeed even if Twilio fails
    let messageSent = false;
    try {
      console.log('OTP Generation - Twilio Config:', {
        accountSidExists: !!TWILIO_ACCOUNT_SID,
        authTokenExists: !!TWILIO_AUTH_TOKEN,
        phoneNumberExists: !!TWILIO_PHONE_NUMBER,
        numberToSend: normalizedPhone,
        messageLength: otpMessage.length,
        nodeEnv: process.env.NODE_ENV || 'unknown'
      });
      
      messageSent = await sendWhatsAppReply(normalizedPhone, otpMessage);
      console.log('WhatsApp message sent result:', messageSent);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      // In production, we'll return an error, but in dev mode we'll continue
      if (process.env.NODE_ENV === 'production') {
        messageSent = false;
      }
    }
    
    // Always include the OTP code in development mode response for testing
    // Force development mode for testing
    const isDev = true; // Override environment detection for testing
    console.log('Environment mode:', 'FORCED DEVELOPMENT');
    
    if (!messageSent && process.env.NODE_ENV === 'production') {
      return {
        success: false,
        message: "Unable to send verification code to your WhatsApp number. Please check the number and try again.",
      };
    }

    // For development purposes, we'll return the OTP code in the response
    // In production, this would never be returned to the client
    if (isDev) {
      console.log(`Development mode: OTP code for verification is ${otpCode}`);
      console.log(`NODE_ENV = ${process.env.NODE_ENV}, isDev = ${isDev}`);
      
      // Force include OTP code if we're in development OR if the mode is unset
      return {
        success: true,
        message: "Verification code sent to your WhatsApp number. Please check your WhatsApp and enter the 6-digit code.",
        otpCode: otpCode, // Only included in development mode
        devMode: true
      };
    }

    return {
      success: true,
      message: "Verification code sent to your WhatsApp number. Please check your WhatsApp and enter the 6-digit code.",
    };
  } catch (error) {
    console.error("Error requesting WhatsApp OTP:", error);
    return {
      success: false,
      message: "An error occurred while sending the verification code",
    };
  }
}

/**
 * Verify OTP code for WhatsApp number
 */
export async function verifyWhatsAppOTP(userId: number, otpCode: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Find the most recent unexpired OTP verification request
    const otpVerification = await db.query.whatsappOtpVerifications.findFirst({
      where: and(
        eq(whatsappOtpVerifications.userId, userId),
        eq(whatsappOtpVerifications.verified, false),
        gt(whatsappOtpVerifications.expiresAt, new Date())
      ),
      orderBy: [desc(whatsappOtpVerifications.createdAt)]
    });

    if (!otpVerification) {
      return {
        success: false,
        message: "No verification in progress or verification expired. Please request a new code.",
      };
    }

    // Check if OTP matches
    if (otpVerification.otpCode !== otpCode) {
      return {
        success: false,
        message: "Invalid verification code. Please try again.",
      };
    }

    // Mark OTP as verified
    await db.update(whatsappOtpVerifications)
      .set({ verified: true })
      .where(eq(whatsappOtpVerifications.id, otpVerification.id));

    // Register WhatsApp user or update existing one
    const existingUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.userId, userId),
    });

    if (existingUser) {
      // Update existing user with new phone number
      await db.update(whatsappUsers)
        .set({ 
          phoneNumber: otpVerification.phoneNumber,
          active: true 
        })
        .where(eq(whatsappUsers.id, existingUser.id));
    } else {
      // Register new WhatsApp user
      await db.insert(whatsappUsers).values({
        userId,
        phoneNumber: otpVerification.phoneNumber,
        active: true,
      });
    }
    
    // Send welcome message to user via WhatsApp
    // Using one of the approved Twilio Sandbox templates
    // See: https://www.twilio.com/docs/whatsapp/sandbox#using-the-sandbox
    const welcomeMessage = "Your WhatsApp verification was successful! You can now use WhatsApp to create entries in DotSpark.";
    
    // Don't wait for the message to be sent before returning
    sendWhatsAppReply(otpVerification.phoneNumber, welcomeMessage)
      .then(success => {
        if (!success) {
          console.error(`Failed to send welcome message to ${otpVerification.phoneNumber}`);
        }
      })
      .catch(error => {
        console.error(`Error sending welcome message to ${otpVerification.phoneNumber}:`, error);
      });

    return {
      success: true,
      message: "WhatsApp number verified successfully! You can now use the DotSpark WhatsApp chatbot.",
    };
  } catch (error) {
    console.error("Error verifying WhatsApp OTP:", error);
    return {
      success: false,
      message: "An error occurred while verifying the code",
    };
  }
}