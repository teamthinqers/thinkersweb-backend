import { db } from "../db";
import { whatsappUsers } from "../shared/schema";
import { eq } from "drizzle-orm";

const DEMO_USER_ID = 1; // Same as in routes.ts

async function registerPhoneNumber(phoneNumber: string) {
  try {
    // Normalize phone number (remove WhatsApp: prefix if present, ensure it has + prefix)
    let normalizedPhone = phoneNumber.replace('whatsapp:', '').trim();
    
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+' + normalizedPhone;
    }
    
    console.log(`Attempting to register phone number: ${normalizedPhone}`);
    
    // Check if this phone number is already registered
    const existingUser = await db.query.whatsappUsers.findFirst({
      where: eq(whatsappUsers.phoneNumber, normalizedPhone)
    });
    
    if (existingUser) {
      if (existingUser.active) {
        console.log(`Phone number ${normalizedPhone} is already registered and active`);
      } else {
        // If it exists but is inactive, activate it
        await db.update(whatsappUsers)
          .set({ active: true })
          .where(eq(whatsappUsers.id, existingUser.id));
        console.log(`Phone number ${normalizedPhone} was reactivated`);
      }
    } else {
      // Register new WhatsApp user
      await db.insert(whatsappUsers).values({
        userId: DEMO_USER_ID,
        phoneNumber: normalizedPhone,
        active: true,
      });
      console.log(`Phone number ${normalizedPhone} was registered successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error registering phone number ${phoneNumber}:`, error);
    return false;
  }
}

// If running this script directly
if (require.main === module) {
  // Get phone numbers from command line arguments
  const phoneNumbers = process.argv.slice(2);
  
  if (phoneNumbers.length === 0) {
    console.log('Please provide at least one phone number to register');
    console.log('Usage: npx tsx scripts/register-whatsapp-number.ts +123456789 +987654321');
    process.exit(1);
  }
  
  // Register each phone number
  (async () => {
    console.log(`Registering ${phoneNumbers.length} phone numbers...`);
    
    for (const phoneNumber of phoneNumbers) {
      const success = await registerPhoneNumber(phoneNumber);
      if (success) {
        console.log(`✓ ${phoneNumber} registered successfully`);
      } else {
        console.log(`✗ Failed to register ${phoneNumber}`);
      }
    }
    
    console.log('Registration process complete');
    process.exit(0);
  })();
}

export { registerPhoneNumber };