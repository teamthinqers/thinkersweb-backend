import { db } from "./index";
import { users, connections } from "@shared/schema";
import { sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Hash password function from auth.ts
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    console.log("🌱 Seeding users database...");

    // Check if we already have users
    const existingUsersResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(users);
    
    const existingCount = Number(existingUsersResult[0]?.count || 0);

    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing users, skipping user creation.`);
    } else {
      // Create test users
      console.log("Creating test users...");
      
      // Create a test user with a known password
      const testPassword = "dotsparktest"; // Simple password for testing purposes
      const hashedPassword = await hashPassword(testPassword);
      
      console.log(`Test user credentials: username = "testuser", password = "${testPassword}"`);
      
      const [demoUser] = await db.insert(users)
        .values({ 
          username: "testuser", 
          email: "test@dotspark.app", 
          password: hashedPassword,
          fullName: "Test User",
          bio: "This is a test user for DotSpark with a known password that you can use for testing.",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Hash passwords for other test users as well
      const learningProPassword = await hashPassword("learning123");
      const knowledgeSeekerPassword = await hashPassword("knowledge123");
      
      const [learningPro] = await db.insert(users)
        .values({ 
          username: "learning_pro", 
          email: "learning@example.com", 
          password: learningProPassword, 
          fullName: "Learning Pro",
          bio: "I love to learn and share knowledge with others.",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      const [knowledgeSeeker] = await db.insert(users)
        .values({ 
          username: "knowledge_seeker", 
          email: "knowledge@example.com", 
          password: knowledgeSeekerPassword, 
          fullName: "Knowledge Seeker",
          bio: "Always seeking new information and insights.",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log("Creating test connections...");
      
      // Create an accepted connection between demo_user and learning_pro
      await db.insert(connections)
        .values({ 
          userId: demoUser.id, 
          connectedUserId: learningPro.id, 
          status: "accepted",
          createdAt: new Date(),
          updatedAt: new Date()
        });

      // Create a pending connection request from knowledge_seeker to demo_user
      await db.insert(connections)
        .values({ 
          userId: knowledgeSeeker.id, 
          connectedUserId: demoUser.id, 
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
      console.log("Users and connections created successfully!");
    }

    console.log("✅ User seeding complete!");
  } catch (error) {
    console.error("❌ User seeding failed:", error);
  }
}

// Run the seed function
seedUsers();