import { registerPhoneNumber } from "./register-whatsapp-number";

// List of phone numbers to register
const phoneNumbers = [
  "+919894458026", 
  "+918145559630", 
  "+919791725973", 
  "+919840105234", 
  "+919480073047", 
  "+917824902140", 
  "+918667244857", 
  "+919600032265"
];

async function registerAllNumbers() {
  console.log(`Registering ${phoneNumbers.length} phone numbers...`);
  
  for (const phoneNumber of phoneNumbers) {
    try {
      const success = await registerPhoneNumber(phoneNumber);
      if (success) {
        console.log(`✓ ${phoneNumber} registered successfully`);
      } else {
        console.log(`✗ Failed to register ${phoneNumber}`);
      }
    } catch (error) {
      console.error(`Error registering ${phoneNumber}:`, error);
    }
  }
  
  console.log('Registration process complete');
}

// Run the registration
registerAllNumbers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error in registration process:', error);
    process.exit(1);
  });