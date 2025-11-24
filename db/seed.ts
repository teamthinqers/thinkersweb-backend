import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("⏳ Seeding database...");
    
    const testUserExists = await db.query.users.findFirst({
      where: eq(schema.users.email, "test@dotspark.app"),
    });

    if (!testUserExists) {
      const [testUser] = await db.insert(schema.users).values({
        email: "test@dotspark.app",
        fullName: "Test DotSpark",
        username: "test-dotspark",
        dotSparkActivated: true,
        dotSparkActivatedAt: new Date(),
      }).returning();

      if (testUser) {
        await db.insert(schema.cognitiveIdentity).values({
          userId: testUser.id,
        });
      }
    }
    
    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seed();
