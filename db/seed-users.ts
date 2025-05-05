import { db } from "./index";
import { users, connections } from "@shared/schema";
import { sql } from "drizzle-orm";

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
      
      const [demoUser] = await db.insert(users)
        .values({ 
          username: "demo_user", 
          email: "demo@example.com", 
          password: "password123", // In a real app, this would be hashed
          fullName: "Demo User",
          bio: "This is a demo user for testing the Learning Repository app.",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      const [learningPro] = await db.insert(users)
        .values({ 
          username: "learning_pro", 
          email: "learning@example.com", 
          password: "password123", 
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
          password: "password123", 
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