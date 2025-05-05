import { db } from "./index";
import { users, connections } from "@shared/schema";

async function seedUsers() {
  try {
    console.log("🌱 Seeding users database...");

    // Check if we already have users
    const existingUsers = await db.query.users.findMany({
      limit: 10
    });

    if (existingUsers.length > 0) {
      console.log();
    } else {
      // Create test users
      console.log("Creating test users...");
      
      const demoUser = await createUser({
        username: "demo_user",
        email: "demo@example.com",
        password: "password", // In a real app, this would be hashed
        fullName: "Demo User",
        bio: "This is a demo user for testing the Learning Repository app."
      });

      const learningPro = await createUser({
        username: "learning_pro",
        email: "learning@example.com",
        password: "password", // In a real app, this would be hashed
        fullName: "Learning Pro",
        bio: "I love to learn and share knowledge with others."
      });

      const knowledgeSeeker = await createUser({
        username: "knowledge_seeker",
        email: "knowledge@example.com",
        password: "password", // In a real app, this would be hashed
        fullName: "Knowledge Seeker",
        bio: "Always seeking new information and insights."
      });

      console.log("Creating test connections...");
      
      // Create an accepted connection between demo_user and learning_pro
      await createConnection({
        userId: demoUser.id,
        connectedUserId: learningPro.id,
        status: "accepted"
      });

      // Create a pending connection request from knowledge_seeker to demo_user
      await createConnection({
        userId: knowledgeSeeker.id,
        connectedUserId: demoUser.id,
        status: "pending"
      });
    }

    console.log("✅ User seeding complete!");
  } catch (error) {
    console.error("❌ User seeding failed:", error);
  } finally {
    await db.end();
  }
}

async function createUser({ username, email, password, fullName, bio }) {
  const [user] = await db.insert(users)
    .values({ 
      username, 
      email, 
      password, 
      fullName, 
      bio,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  return user;
}

async function createConnection({ userId, connectedUserId, status }) {
  const [connection] = await db.insert(connections)
    .values({ 
      userId, 
      connectedUserId, 
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  return connection;
}

// Run the seed function
seedUsers();
