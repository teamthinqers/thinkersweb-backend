import { db } from './index';
import { previewDots, previewWheels } from '@shared/schema';

/**
 * Seed preview tables with demonstration data
 * This preserves the exact grid layout users currently see in preview mode
 */
export async function seedPreviewData() {
  console.log('🌱 Seeding preview data...');

  try {
    // Clear existing preview data
    await db.delete(previewDots);
    await db.delete(previewWheels);

    // Insert preview chakras (top-level wheels with chakraId = null)
    const [businessChakra, personalChakra] = await db.insert(previewWheels).values([
      {
        name: "Build an Enduring Company",
        heading: "Build an Enduring Company",
        purpose: "Create a lasting business that makes a meaningful impact",
        timeline: "5-10 years",
        category: "Business",
        color: "#B45309", // Dark amber for chakras
        chakraId: null, // Top-level chakra
        positionX: 400, // Locked position
        positionY: 200, // Locked position
        radius: 420, // Larger chakra radius
      },
      {
        name: "Health & Wellness Journey",
        heading: "Health & Wellness Journey", 
        purpose: "Achieve optimal physical and mental wellbeing",
        timeline: "Ongoing",
        category: "Health",
        color: "#B45309", // Dark amber for chakras
        chakraId: null, // Top-level chakra
        positionX: 1200, // Locked position
        positionY: 200, // Locked position
        radius: 370, // Smaller chakra
      },
    ]).returning();

    // Insert preview wheels (sub-wheels belonging to chakras)
    const [gtmWheel, leadershipWheel, productWheel, fitnessWheel, nutritionWheel] = await db.insert(previewWheels).values([
      // Business Chakra wheels
      {
        name: "GTM Strategy",
        heading: "Go-to-Market Strategy",
        goals: "Launch product successfully in target markets",
        timeline: "Q1-Q2 2025",
        category: "Business",
        color: "#EA580C", // Orange for wheels
        chakraId: businessChakra.id,
        positionX: 280, // Locked position within business chakra
        positionY: 120,
        radius: 120,
      },
      {
        name: "Leadership Development",
        heading: "Leadership Development",
        goals: "Build strong leadership capabilities and team culture",
        timeline: "2025",
        category: "Professional",
        color: "#EA580C", // Orange for wheels
        chakraId: businessChakra.id,
        positionX: 520, // Locked position within business chakra
        positionY: 120,
        radius: 120,
      },
      {
        name: "Product Innovation",
        heading: "Product Innovation",
        goals: "Develop cutting-edge features and user experience",
        timeline: "Ongoing",
        category: "Technology",
        color: "#EA580C", // Orange for wheels
        chakraId: businessChakra.id,
        positionX: 400, // Locked position within business chakra
        positionY: 280,
        radius: 120,
      },
      // Health Chakra wheels
      {
        name: "Fitness & Exercise",
        heading: "Fitness & Exercise",
        goals: "Maintain consistent workout routine and physical strength",
        timeline: "Daily",
        category: "Health",
        color: "#EA580C", // Orange for wheels
        chakraId: personalChakra.id,
        positionX: 1120, // Locked position within health chakra
        positionY: 130,
        radius: 120,
      },
      {
        name: "Nutrition & Mindfulness",
        heading: "Nutrition & Mindfulness",
        goals: "Balanced diet and mental wellness practices",
        timeline: "Daily",
        category: "Health",
        color: "#EA580C", // Orange for wheels
        chakraId: personalChakra.id,
        positionX: 1280, // Locked position within health chakra
        positionY: 270,
        radius: 120,
      },
    ]).returning();

    // Insert preview dots with locked positions
    await db.insert(previewDots).values([
      // GTM Strategy wheel dots
      {
        summary: "Target enterprise customers first",
        anchor: "Enterprise clients have higher LTV and structured procurement processes",
        pulse: "focused",
        wheelId: gtmWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 250, // Locked within GTM wheel
        positionY: 90,
      },
      {
        
        summary: "Content marketing strategy",
        anchor: "Educational content builds trust and demonstrates expertise",
        pulse: "strategic",
        wheelId: gtmWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 310, // Locked within GTM wheel
        positionY: 90,
      },
      {
        
        summary: "Partnership channels",
        anchor: "Strategic partnerships accelerate market penetration",
        pulse: "collaborative",
        wheelId: gtmWheel.id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 280, // Locked within GTM wheel
        positionY: 150,
      },
      {
        
        summary: "Pricing model optimization",
        anchor: "Value-based pricing aligns with customer outcomes",
        pulse: "strategic",
        wheelId: gtmWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 250, // Locked within GTM wheel
        positionY: 210,
      },
      {
        
        summary: "Sales team enablement",
        anchor: "Well-trained sales team converts more prospects effectively",
        pulse: "driven",
        wheelId: gtmWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 310, // Locked within GTM wheel
        positionY: 210,
      },

      // Leadership Development wheel dots
      {
        
        summary: "Weekly one-on-ones",
        anchor: "Regular feedback builds trust and improves performance",
        pulse: "supportive",
        wheelId: leadershipWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 490, // Locked within Leadership wheel
        positionY: 90,
      },
      {
        
        summary: "Decision-making framework",
        anchor: "Clear frameworks enable faster and better decisions",
        pulse: "decisive",
        wheelId: leadershipWheel.id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 550, // Locked within Leadership wheel
        positionY: 90,
      },
      {
        
        summary: "Team empowerment culture",
        anchor: "Empowered teams take ownership and drive innovation",
        pulse: "empowering",
        wheelId: leadershipWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 520, // Locked within Leadership wheel
        positionY: 150,
      },
      {
        
        summary: "Leadership book club",
        anchor: "Continuous learning keeps leadership skills sharp",
        pulse: "curious",
        wheelId: leadershipWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 490, // Locked within Leadership wheel
        positionY: 210,
      },

      // Product Innovation wheel dots
      {
        
        summary: "User feedback integration",
        anchor: "Direct user input drives product-market fit",
        pulse: "receptive",
        wheelId: productWheel.id,
        sourceType: "voice",
        captureMode: "ai",
        positionX: 370, // Locked within Product wheel
        positionY: 250,
      },
      {
        
        summary: "AI-powered features",
        anchor: "AI capabilities differentiate and add significant value",
        pulse: "innovative",
        wheelId: productWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 430, // Locked within Product wheel
        positionY: 250,
      },
      {
        
        summary: "Mobile-first design",
        anchor: "Mobile experience drives user engagement and retention",
        pulse: "modern",
        wheelId: productWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 400, // Locked within Product wheel
        positionY: 310,
      },
      {
        
        summary: "Performance optimization",
        anchor: "Fast, responsive app creates delightful user experience",
        pulse: "efficient",
        wheelId: productWheel.id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 370, // Locked within Product wheel
        positionY: 370,
      },

      // Fitness wheel dots
      {
        
        summary: "Morning workout routine",
        anchor: "Consistent morning exercise boosts energy and focus",
        pulse: "energized",
        wheelId: fitnessWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 1090, // Locked within Fitness wheel
        positionY: 100,
      },
      {
        
        summary: "Strength training progression",
        anchor: "Progressive overload builds muscle and bone strength",
        pulse: "strong",
        wheelId: fitnessWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1150, // Locked within Fitness wheel
        positionY: 100,
      },
      {
        
        summary: "Recovery and rest days",
        anchor: "Proper recovery prevents injury and improves performance",
        pulse: "balanced",
        wheelId: fitnessWheel.id,
        sourceType: "voice",
        captureMode: "ai",
        positionX: 1120, // Locked within Fitness wheel
        positionY: 160,
      },

      // Nutrition wheel dots
      {
        
        summary: "Meal prep Sunday",
        anchor: "Prepared meals ensure consistent healthy eating",
        pulse: "organized",
        wheelId: nutritionWheel.id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1250, // Locked within Nutrition wheel
        positionY: 240,
      },
      {
        
        summary: "Mindful eating practices",
        anchor: "Conscious eating improves digestion and satisfaction",
        pulse: "mindful",
        wheelId: nutritionWheel.id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 1310, // Locked within Nutrition wheel
        positionY: 240,
      },
      {
        
        summary: "Hydration tracking",
        anchor: "Adequate hydration supports cognitive and physical performance",
        pulse: "healthy",
        wheelId: nutritionWheel.id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 1280, // Locked within Nutrition wheel
        positionY: 300,
      },

      // Free-floating individual dots (not in wheels)
      {
        
        summary: "Weekly tech industry reading",
        anchor: "Staying current with industry trends informs strategic decisions",
        pulse: "informed",
        wheelId: null, // Free dot
        sourceType: "voice",
        captureMode: "natural",
        positionX: 800, // Free position
        positionY: 150,
      },
      {
        
        summary: "Personal branding on LinkedIn",
        anchor: "Professional visibility creates opportunities and connections",
        pulse: "visible",
        wheelId: null, // Free dot
        sourceType: "text",
        captureMode: "natural",
        positionX: 850, // Free position
        positionY: 300,
      },
      {
        
        summary: "Weekend family time",
        anchor: "Quality time with family maintains important relationships",
        pulse: "connected",
        wheelId: null, // Free dot
        sourceType: "voice",
        captureMode: "ai",
        positionX: 750, // Free position
        positionY: 400,
      },
      {
        
        summary: "Financial planning review",
        anchor: "Regular financial reviews ensure long-term security",
        pulse: "secure",
        wheelId: null, // Free dot
        sourceType: "text",
        captureMode: "natural",
        positionX: 900, // Free position
        positionY: 450,
      },
      {
        
        summary: "Creative side projects",
        anchor: "Personal projects maintain creativity and passion",
        pulse: "creative",
        wheelId: null, // Free dot
        sourceType: "voice",
        captureMode: "natural",
        positionX: 650, // Free position
        positionY: 350,
      },
      {
        
        summary: "Network expansion strategy",
        anchor: "Strong professional network opens doors to opportunities",
        pulse: "connected",
        wheelId: null, // Free dot
        sourceType: "text",
        captureMode: "ai",
        positionX: 950, // Free position
        positionY: 200,
      },
      {
        
        summary: "Learn new programming language",
        anchor: "Technical skill development keeps capabilities current",
        pulse: "growing",
        wheelId: null, // Free dot
        sourceType: "voice",
        captureMode: "natural",
        positionX: 700, // Free position
        positionY: 500,
      },
    ]);

    console.log('✅ Preview data seeded successfully with locked positions!');
    console.log('   - 2 Chakras (top-level containers)');
    console.log('   - 5 Wheels (goal-oriented groups)');
    console.log('   - 26 Dots (individual insights)');
    console.log('   - All positions locked for consistent demonstration experience');

  } catch (error) {
    console.error('❌ Error seeding preview data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPreviewData()
    .then(() => {
      console.log('Preview data seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Preview data seeding failed:', error);
      process.exit(1);
    });
}