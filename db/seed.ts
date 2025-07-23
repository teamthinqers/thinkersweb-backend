import { db } from "./index";
import * as schema from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

async function seed() {
  try {
    console.log("⏳ Seeding database...");

    // Categories seeding
    console.log("Creating categories...");
    const categories = [
      { name: "Professional", color: "#6366f1" }, // Primary color
      { name: "Personal", color: "#8b5cf6" }, // Secondary color
      { name: "Health", color: "#10b981" }, // Green-500
      { name: "Finance", color: "#f59e0b" }, // Yellow-500
    ];

    for (const category of categories) {
      const existing = await db.query.categories.findFirst({
        where: eq(schema.categories.name, category.name),
      });

      if (!existing) {
        await db.insert(schema.categories).values(category);
      }
    }

    // Tags seeding
    console.log("Creating tags...");
    const tags = [
      "productivity",
      "coding",
      "career",
      "health",
      "mindfulness",
      "time management",
      "focus",
      "work techniques",
      "meditation",
      "morning routine",
      "communication",
      "relationships",
      "social skills",
      "react",
      "web development",
      "finance",
      "budgeting",
      "personal finance",
      "meetings",
      "leadership",
    ];

    for (const tagName of tags) {
      const existing = await db.query.tags.findFirst({
        where: eq(schema.tags.name, tagName),
      });

      if (!existing) {
        await db.insert(schema.tags).values({ name: tagName });
      }
    }

    // Get seeded categories and tags for reference
    const seededCategories = await db.query.categories.findMany();
    const categoryMap = seededCategories.reduce(
      (acc, cat) => ({ ...acc, [cat.name]: cat.id }),
      {} as Record<string, number>
    );

    const seededTags = await db.query.tags.findMany();
    const tagMap = seededTags.reduce(
      (acc, tag) => ({ ...acc, [tag.name]: tag.id }),
      {} as Record<string, number>
    );

    // Entries seeding
    console.log("Creating entries...");
    const entriesData = [
      {
        title: "The Pomodoro Technique: Increasing Productivity",
        content: "I've been experimenting with the Pomodoro Technique for the past week. Working in 25-minute focused sessions with 5-minute breaks has significantly improved my concentration and output.\n\n## The Basic Principle\nThe Pomodoro Technique involves working in focused 25-minute sessions (called \"pomodoros\") followed by 5-minute breaks. After completing four pomodoros, you take a longer break of 15-30 minutes.\n\n## What I Discovered\n- The time constraint helps me focus more intensely during work periods\n- Regular breaks prevent burnout and mental fatigue\n- I'm more aware of how I spend my time\n- The technique helps me overcome procrastination by breaking work into manageable chunks\n\n## My Personal Adjustments\nI found that sometimes 25 minutes is too short for deep work, so I've experimented with 40-minute pomodoros with 8-minute breaks. This works better for coding tasks where context-switching is costly.\n\n## Tools I'm Using\nI started with a simple kitchen timer but switched to the \"Forest\" app, which gamifies the process by growing virtual trees during focus periods.\n\n## Next Steps\nI want to track my productivity over a month using this technique and see if I need to make further adjustments based on different types of work.",
        categoryId: categoryMap["Professional"],
        tagIds: [tagMap["productivity"], tagMap["time management"], tagMap["focus"], tagMap["work techniques"]],
        createdAt: new Date("2023-05-12"),
      },
      {
        title: "Benefits of Morning Meditation",
        content: "Starting my day with 10 minutes of meditation has helped me stay centered throughout the day. I've noticed improved focus, less reactivity to stress, and better decision-making overall.\n\nMeditation helps set the tone for the entire day. By taking just 10 minutes each morning to sit quietly and focus on my breath, I've created a buffer between sleep and the day's activities.\n\n## Benefits I've Noticed\n- Increased mental clarity throughout the day\n- More emotional stability when facing challenges\n- Better ability to prioritize tasks\n- Reduced anxiety about upcoming events\n- Improved sleep quality\n\n## My Simple Practice\nI sit in a comfortable position, set a timer for 10 minutes, and focus on my breath. When thoughts arise (which they always do), I gently acknowledge them and return to my breath without judgment.\n\n## Resources That Helped\nThe Headspace app provided a good foundation with its beginner courses. I also enjoyed the book \"Why We Sleep\" by Matthew Walker, which explains the science behind how meditation improves sleep quality.\n\n## Moving Forward\nI'd like to gradually increase my practice to 20 minutes and experiment with different meditation techniques.",
        categoryId: categoryMap["Health"],
        tagIds: [tagMap["meditation"], tagMap["mindfulness"], tagMap["morning routine"], tagMap["health"]],
        createdAt: new Date("2023-05-10"),
      },
      {
        title: "Active Listening in Conversations",
        content: "I've been practicing active listening by focusing entirely on the speaker, avoiding interruptions, and asking clarifying questions. This has led to deeper connections and fewer misunderstandings.\n\n## Key Components of Active Listening\n\n1. **Give Full Attention**: Face the speaker and maintain eye contact. Put away distractions like phones.\n\n2. **Don't Interrupt**: Let the person complete their thoughts before responding.\n\n3. **Ask Clarifying Questions**: \"What did you mean when you said...?\" or \"Can you tell me more about...?\"\n\n4. **Paraphrase**: \"So what you're saying is...\" to confirm understanding.\n\n5. **Acknowledge Emotions**: \"That sounds really frustrating\" or \"I can see why you'd be excited about that.\"\n\n## Results I've Noticed\n\n- People seem more comfortable sharing deeper thoughts and feelings\n- Conversations have more substance and less small talk\n- I remember details better after conversations\n- Fewer misunderstandings and follow-up questions later\n\n## Challenging Situations\n\nI find it hardest to practice active listening when I strongly disagree with what someone is saying. I'm working on separating the act of understanding from the act of agreeing.",
        categoryId: categoryMap["Personal"],
        tagIds: [tagMap["communication"], tagMap["relationships"], tagMap["social skills"]],
        createdAt: new Date("2023-05-08"),
      },
      {
        title: "Understanding React Hooks",
        content: "Today I finally grasped how useEffect works with dependencies. The key insight was understanding the cleanup function and how it prevents memory leaks in components that unmount.\n\n## useEffect Dependency Array\n\nThe dependency array controls when the effect runs:\n\n```jsx\n// Runs on every render\nuseEffect(() => { ... });\n\n// Runs only once after initial render\nuseEffect(() => { ... }, []);\n\n// Runs when count changes\nuseEffect(() => { ... }, [count]);\n```\n\n## Cleanup Function\n\nThe cleanup function runs before the component unmounts and before the effect runs again:\n\n```jsx\nuseEffect(() => {\n  const subscription = subscribeToData();\n  \n  // This is the cleanup function\n  return () => {\n    subscription.unsubscribe();\n  };\n}, []);\n```\n\n## Common Mistakes\n\n1. **Missing Dependencies**: ESLint warns about this, but people often ignore it\n2. **Unnecessary Re-renders**: Including too many dependencies\n3. **Stale Closures**: Not including all necessary dependencies\n\n## Next Steps\n\nI need to practice more with useCallback and useMemo to optimize performance.",
        categoryId: categoryMap["Professional"],
        tagIds: [tagMap["coding"], tagMap["react"], tagMap["web development"]],
        createdAt: new Date("2023-05-05"),
      },
      {
        title: "The 50/30/20 Budgeting Rule",
        content: "Started implementing the 50/30/20 budgeting approach: 50% for needs, 30% for wants, and 20% for savings/debt. This simple framework is making financial planning much more manageable.\n\n## The Framework Breakdown\n\n### 50% - Needs (Essential Expenses)\n- Rent/Mortgage\n- Utilities\n- Groceries\n- Healthcare\n- Minimum debt payments\n- Car payments/transportation\n\n### 30% - Wants (Discretionary Spending)\n- Dining out\n- Entertainment\n- Travel\n- Hobbies\n- Subscription services\n- Shopping (non-essential)\n\n### 20% - Savings/Debt Reduction\n- Emergency fund\n- Retirement accounts\n- Investments\n- Extra debt payments\n- Other financial goals\n\n## Implementation Process\n\n1. Calculated my after-tax income\n2. Tracked all expenses for a month and categorized them\n3. Adjusted spending to align with the 50/30/20 ratio\n4. Set up automatic transfers for savings\n\n## Challenges\n\nThe biggest challenge was properly categorizing certain expenses. For example, is my gym membership a need or a want? I decided to classify it as a need because it's essential for my health.\n\n## Results So Far\n\nAfter two months, I've increased my savings rate from 10% to 18% and feel much more in control of my spending. I've also reduced my anxiety about financial decisions because I have clear boundaries.",
        categoryId: categoryMap["Finance"],
        tagIds: [tagMap["finance"], tagMap["budgeting"], tagMap["personal finance"]],
        createdAt: new Date("2023-05-03"),
      },
      {
        title: "Effective Meeting Facilitation Techniques",
        content: "Setting clear agendas, timeboxing discussions, and assigning action items with owners has transformed our team meetings from drawn-out conversations to productive sessions.\n\n## Pre-Meeting Preparation\n\n1. **Distribute Agenda in Advance**\n   - Share 24 hours before the meeting\n   - Include timing for each topic\n   - Clarify expected outcomes\n\n2. **Assign Roles**\n   - Facilitator (keeps discussion on track)\n   - Timekeeper\n   - Note-taker\n\n## During the Meeting\n\n1. **Start with a Quick Check-In**\n   - 30-second updates from each person\n   - Sets a collaborative tone\n\n2. **Timebox Each Topic**\n   - Stick to allocated times\n   - Use a visible timer\n   - Table discussions that need more time\n\n3. **Parking Lot**\n   - Document ideas that are off-topic\n   - Review at the end if time allows\n\n4. **Decision-Making Protocol**\n   - Clarify how decisions will be made (consensus vs. consultative)\n   - Document decisions clearly\n\n## After the Meeting\n\n1. **Action Items**\n   - Who is doing what by when\n   - Document in shared location\n   - Follow up system\n\n2. **Brief Meeting Evaluation**\n   - What went well?\n   - What could be improved?\n\n## Results\n\nOur weekly team meetings have gone from 90 minutes to 45 minutes with better outcomes and higher team satisfaction.",
        categoryId: categoryMap["Professional"],
        tagIds: [tagMap["meetings"], tagMap["leadership"], tagMap["productivity"]],
        createdAt: new Date("2023-04-28"),
      },
    ];

    // Check if we already have entries to avoid duplicates
    const existingCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(schema.entries);

    if (existingCount[0].count === 0) {
      for (const entryData of entriesData) {
        const { title, content, categoryId, tagIds, createdAt } = entryData;

        // Insert entry
        const [entry] = await db
          .insert(schema.entries)
          .values({
            title,
            content,
            categoryId,
            createdAt,
            updatedAt: createdAt,
          })
          .returning();

        // Insert tag relationships
        if (tagIds.length > 0) {
          await db.insert(schema.entryTags).values(
            tagIds.map((tagId) => ({
              entryId: entry.id,
              tagId,
            }))
          );
        }
      }

      // Create some relationships between entries
      const allEntries = await db.query.entries.findMany();
      
      if (allEntries.length >= 3) {
        // Connect Pomodoro with meeting facilitation (both productivity related)
        await db.insert(schema.entryRelations).values({
          originEntryId: allEntries[0].id, // Pomodoro
          relatedEntryId: allEntries[5].id, // Meeting facilitation
        });
        
        // Connect React hooks with Pomodoro (both professional)
        await db.insert(schema.entryRelations).values({
          originEntryId: allEntries[3].id, // React hooks
          relatedEntryId: allEntries[0].id, // Pomodoro
        });
        
        // Connect meditation with active listening (mindfulness related)
        await db.insert(schema.entryRelations).values({
          originEntryId: allEntries[1].id, // Meditation
          relatedEntryId: allEntries[2].id, // Active listening
        });
      }
    }

    // Create a demo user if not exists
    let demoUser = await db.query.users.findFirst({
      where: eq(schema.users.username, 'demo')
    });

    if (!demoUser) {
      try {
        [demoUser] = await db.insert(schema.users).values({
          username: 'demo',
          email: 'demo@example.com',
          password: 'hashedpassword', // In real app, this would be properly hashed
          fullName: 'Demo User'
        }).returning();
      } catch (error) {
        // If user already exists with email, fetch by email
        demoUser = await db.query.users.findFirst({
          where: eq(schema.users.email, 'demo@example.com')
        });
      }
    }

    // Chakras (top-level wheels) seeding
    console.log("Creating chakras...");
    const chakrasData = [
      {
        name: "Business Growth",
        heading: "Build an Enduring Company",
        purpose: "Create a sustainable business that makes a meaningful impact",
        timeline: "2-3 years",
        category: "Professional",
        color: "#B45309", // Dark amber for chakras
        positionX: 700,
        positionY: 400,
        radius: 400,
        userId: demoUser.id
      },
      {
        name: "Personal Development",
        heading: "Continuous Self-Improvement",
        purpose: "Develop skills, mindset, and habits for personal growth",
        timeline: "Ongoing",
        category: "Personal",
        color: "#B45309", // Dark amber for chakras
        positionX: 1400,
        positionY: 400,
        radius: 400,
        userId: demoUser.id
      }
    ];

    const createdChakras = [];
    for (const chakraData of chakrasData) {
      const existing = await db.query.wheels.findFirst({
        where: and(
          eq(schema.wheels.name, chakraData.name),
          eq(schema.wheels.userId, demoUser.id)
        )
      });

      if (!existing) {
        const [chakra] = await db.insert(schema.wheels).values(chakraData).returning();
        createdChakras.push(chakra);
      } else {
        createdChakras.push(existing);
      }
    }

    // Wheels seeding
    console.log("Creating wheels...");
    const wheelsData = [
      // Business Chakra Wheels
      {
        name: "GTM Strategy",
        heading: "Go-to-Market Strategy",
        goals: "Develop comprehensive strategy for product launch and market penetration",
        timeline: "Q1-Q2 2025",
        category: "Professional",
        color: "#EA580C", // Orange for wheels
        chakraId: createdChakras[0].id,
        positionX: 600,
        positionY: 320,
        radius: 160,
        userId: demoUser.id
      },
      {
        name: "Leadership Development",
        heading: "Build Leadership Skills",
        goals: "Develop team leadership and management capabilities",
        timeline: "6 months",
        category: "Professional", 
        color: "#EA580C",
        chakraId: createdChakras[0].id,
        positionX: 800,
        positionY: 320,
        radius: 160,
        userId: demoUser.id
      },
      {
        name: "Product Innovation",
        heading: "Innovative Product Development",
        goals: "Create cutting-edge products that solve real problems",
        timeline: "12 months",
        category: "Professional",
        color: "#EA580C",
        chakraId: createdChakras[0].id,
        positionX: 700,
        positionY: 480,
        radius: 160,
        userId: demoUser.id
      },
      // Personal Development Chakra Wheels
      {
        name: "Health & Wellness",
        heading: "Physical and Mental Wellness",
        goals: "Maintain optimal health through exercise, nutrition, and mindfulness",
        timeline: "Ongoing",
        category: "Health",
        color: "#EA580C",
        chakraId: createdChakras[1].id,
        positionX: 1300,
        positionY: 320,
        radius: 160,
        userId: demoUser.id
      },
      {
        name: "Skill Development",
        heading: "Continuous Learning",
        goals: "Acquire new technical and soft skills regularly",
        timeline: "Quarterly goals",
        category: "Personal",
        color: "#EA580C",
        chakraId: createdChakras[1].id,
        positionX: 1500,
        positionY: 320,
        radius: 160,
        userId: demoUser.id
      }
    ];

    const createdWheels = [];
    for (const wheelData of wheelsData) {
      const existing = await db.query.wheels.findFirst({
        where: and(
          eq(schema.wheels.name, wheelData.name),
          eq(schema.wheels.userId, demoUser.id)
        )
      });

      if (!existing) {
        const [wheel] = await db.insert(schema.wheels).values(wheelData).returning();
        createdWheels.push(wheel);
      } else {
        createdWheels.push(existing);
      }
    }

    // Dots seeding
    console.log("Creating dots...");
    const dotsData = [
      // GTM Strategy wheel dots
      {
        summary: "Research target market segments and customer personas",
        anchor: "Understanding our ideal customers is crucial for effective messaging and positioning",
        pulse: "focused",
        wheelId: createdWheels[0].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 580,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Develop compelling value proposition and messaging framework", 
        anchor: "Clear value communication differentiates us from competitors",
        pulse: "confident",
        wheelId: createdWheels[0].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 620,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Create multi-channel marketing and sales strategy",
        anchor: "Integrated approach ensures consistent customer experience across touchpoints",
        pulse: "strategic",
        wheelId: createdWheels[0].id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 580,
        positionY: 340,
        userId: demoUser.id
      },
      {
        summary: "Establish metrics and KPIs for tracking success",
        anchor: "Data-driven decisions enable continuous optimization and course correction",
        pulse: "analytical",
        wheelId: createdWheels[0].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 620,
        positionY: 340,
        userId: demoUser.id
      },
      {
        summary: "Plan launch timeline and milestone checkpoints",
        anchor: "Structured execution ensures nothing falls through the cracks",
        pulse: "organized",
        wheelId: createdWheels[0].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 600,
        positionY: 320,
        userId: demoUser.id
      },
      // Leadership Development wheel dots  
      {
        summary: "Practice active listening in all team interactions",
        anchor: "Great leaders understand before seeking to be understood",
        pulse: "empathetic",
        wheelId: createdWheels[1].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 780,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Develop clear communication and feedback skills",
        anchor: "Honest, constructive feedback accelerates team growth and performance",
        pulse: "direct",
        wheelId: createdWheels[1].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 820,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Learn delegation and empowerment techniques",
        anchor: "Empowering others creates stronger teams and sustainable growth",
        pulse: "trusting",
        wheelId: createdWheels[1].id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 780,
        positionY: 340,
        userId: demoUser.id
      },
      {
        summary: "Build decision-making frameworks for complex situations",
        anchor: "Structured thinking leads to better decisions under pressure",
        pulse: "decisive",
        wheelId: createdWheels[1].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 820,
        positionY: 340,
        userId: demoUser.id
      },
      // Product Innovation wheel dots
      {
        summary: "Research emerging technologies and market trends",
        anchor: "Innovation requires deep understanding of technological possibilities and user needs",
        pulse: "curious",
        wheelId: createdWheels[2].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 680,
        positionY: 460,
        userId: demoUser.id
      },
      {
        summary: "Design user-centric solutions with rapid prototyping",
        anchor: "Fast iteration cycles help validate ideas before major investment",
        pulse: "creative",
        wheelId: createdWheels[2].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 720,
        positionY: 460,
        userId: demoUser.id
      },
      {
        summary: "Establish feedback loops with early adopters",
        anchor: "Customer insights drive meaningful product improvements and market fit",
        pulse: "receptive",
        wheelId: createdWheels[2].id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 680,
        positionY: 500,
        userId: demoUser.id
      },
      {
        summary: "Build scalable development and deployment processes",
        anchor: "Strong infrastructure enables rapid feature delivery and quality assurance",
        pulse: "systematic",
        wheelId: createdWheels[2].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 720,
        positionY: 500,
        userId: demoUser.id
      },
      // Health & Wellness wheel dots
      {
        summary: "Maintain consistent exercise routine 5x per week",
        anchor: "Physical fitness directly impacts mental clarity and energy levels",
        pulse: "energetic",
        wheelId: createdWheels[3].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1280,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Practice mindfulness meditation for 20 minutes daily",
        anchor: "Mental stillness enhances focus and emotional regulation",
        pulse: "calm",
        wheelId: createdWheels[3].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 1320,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Optimize nutrition with balanced, whole foods",
        anchor: "Quality nutrition fuels both physical performance and cognitive function",
        pulse: "nourished",
        wheelId: createdWheels[3].id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 1280,
        positionY: 340,
        userId: demoUser.id
      },
      {
        summary: "Prioritize 7-8 hours of quality sleep nightly",
        anchor: "Sleep is the foundation for memory consolidation and recovery",
        pulse: "rested",
        wheelId: createdWheels[3].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1320,
        positionY: 340,
        userId: demoUser.id
      },
      // Skill Development wheel dots
      {
        summary: "Master advanced TypeScript patterns and architecture",
        anchor: "Strong technical foundation enables building more robust applications",
        pulse: "determined",
        wheelId: createdWheels[4].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1480,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Develop public speaking and presentation skills",
        anchor: "Effective communication amplifies the impact of technical expertise",
        pulse: "confident",
        wheelId: createdWheels[4].id,
        sourceType: "voice",
        captureMode: "natural",
        positionX: 1520,
        positionY: 300,
        userId: demoUser.id
      },
      {
        summary: "Learn systems thinking and complex problem solving",
        anchor: "Holistic thinking enables solutions that address root causes",
        pulse: "insightful",
        wheelId: createdWheels[4].id,
        sourceType: "text",
        captureMode: "ai",
        positionX: 1480,
        positionY: 340,
        userId: demoUser.id
      },
      {
        summary: "Build network of mentors and learning peers",
        anchor: "Continuous learning accelerates through quality relationships and shared knowledge",
        pulse: "connected",
        wheelId: createdWheels[4].id,
        sourceType: "text",
        captureMode: "natural",
        positionX: 1520,
        positionY: 340,
        userId: demoUser.id
      }
    ];

    for (const dotData of dotsData) {
      const existing = await db.query.dots.findFirst({
        where: and(
          eq(schema.dots.summary, dotData.summary),
          eq(schema.dots.userId, demoUser.id)
        )
      });

      if (!existing) {
        await db.insert(schema.dots).values(dotData);
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Execute the seed function
seed();
