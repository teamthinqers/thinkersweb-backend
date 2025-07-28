import { db } from "./index.js";
import { previewDots, previewWheels } from "@shared/schema.ts";

async function seedPreviewData() {
  console.log("Seeding preview data...");

  try {
    // First, seed preview wheels (including chakras)
    const previewWheelsData = [
      // Business Chakra (top-level)
      {
        id: "preview-chakra-business",
        name: "Build an Enduring Company",
        heading: "Strategic Business Vision",
        purpose: "Creating a sustainable, impactful business that generates lasting value for customers, employees, and society while achieving profitable growth and market leadership",
        timeline: "5-10 years strategic horizon",
        category: "Professional",
        color: "#B45309", // Dark amber for chakras
        chakraId: null, // Top-level chakra
        positionX: 400,
        positionY: 300,
        radius: 370,
      },
      // Wheels belonging to Business Chakra
      {
        id: "preview-wheel-gtm",
        name: "GTM Strategy",
        heading: "Go-to-Market Excellence",
        goals: "Develop comprehensive go-to-market strategy focusing on customer acquisition, retention, pricing optimization, and market penetration to achieve sustainable revenue growth",
        timeline: "6-12 months execution",
        category: "Professional",
        color: "#EA580C", // Orange for wheels
        chakraId: "preview-chakra-business",
        positionX: 300,
        positionY: 180,
        radius: 120,
      },
      {
        id: "preview-wheel-leadership",
        name: "Leadership Development",
        heading: "Building Exceptional Teams",
        goals: "Cultivate leadership capabilities, build high-performing teams, establish strong company culture, and develop effective management systems for scaling operations",
        timeline: "12-18 months development",
        category: "Professional", 
        color: "#EA580C",
        chakraId: "preview-chakra-business",
        positionX: 500,
        positionY: 180,
        radius: 120,
      },
      {
        id: "preview-wheel-product",
        name: "Product Innovation",
        heading: "Next-Gen Product Development",
        goals: "Drive product innovation through user research, feature development, technical excellence, and market differentiation to maintain competitive advantage",
        timeline: "3-6 months sprint cycles",
        category: "Professional",
        color: "#EA580C",
        chakraId: "preview-chakra-business",
        positionX: 400,
        positionY: 420,
        radius: 120,
      },
      // Health & Wellness Wheel (independent)
      {
        id: "preview-wheel-health",
        name: "Health & Wellness",
        heading: "Optimal Physical & Mental Health",
        goals: "Maintain consistent exercise routine, balanced nutrition, quality sleep, stress management, and regular health checkups for long-term wellbeing",
        timeline: "Daily habits & quarterly reviews",
        category: "Health",
        color: "#EA580C",
        chakraId: null, // Independent wheel
        positionX: 800,
        positionY: 300,
        radius: 120,
      },
      // Individual Development Wheel (independent)
      {
        id: "preview-wheel-individual",
        name: "Individual Development",
        heading: "Personal Growth & Learning",
        goals: "Continuous skill development, knowledge acquisition, personal reflection, networking, and pursuing meaningful experiences for holistic growth",
        timeline: "Ongoing with monthly milestones",
        category: "Personal",
        color: "#EA580C",
        chakraId: null,
        positionX: 100,
        positionY: 300,
        radius: 120,
      },
    ];

    // Insert preview wheels
    await db.insert(previewWheels).values(previewWheelsData).onConflictDoNothing();

    // Now seed preview dots
    const previewDotsData = [
      // GTM Strategy Wheel Dots (5 dots)
      {
        id: "preview-dot-gtm-1",
        oneWordSummary: "Positioning",
        summary: "Define unique value proposition that differentiates us from competitors while addressing core customer pain points effectively",
        anchor: "Conduct comprehensive competitive analysis and customer interviews to identify positioning gaps and opportunities in the market",
        pulse: "confident",
        wheelId: "preview-wheel-gtm",
        sourceType: "text",
        captureMode: "natural",
        positionX: 280,
        positionY: 140,
      },
      {
        id: "preview-dot-gtm-2", 
        oneWordSummary: "Pricing",
        summary: "Develop value-based pricing strategy that maximizes revenue while remaining competitive and accessible to target market",
        anchor: "Analyze customer willingness to pay, competitor pricing models, and cost structure to optimize pricing tiers and packages",
        pulse: "focused",
        wheelId: "preview-wheel-gtm",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 320,
        positionY: 160,
      },
      {
        id: "preview-dot-gtm-3",
        oneWordSummary: "Channels",
        summary: "Establish multi-channel distribution strategy leveraging digital marketing, partnerships, and direct sales approaches",
        anchor: "Map customer journey and identify optimal touchpoints for acquisition, conversion, and retention across all channels",
        pulse: "excited",
        wheelId: "preview-wheel-gtm",
        sourceType: "text",
        captureMode: "natural",
        positionX: 300,
        positionY: 200,
      },
      {
        id: "preview-dot-gtm-4",
        oneWordSummary: "Metrics",
        summary: "Implement comprehensive analytics framework to track customer acquisition cost, lifetime value, and conversion metrics",
        anchor: "Define key performance indicators and measurement systems to optimize marketing spend and sales effectiveness",
        pulse: "analytical",
        wheelId: "preview-wheel-gtm",
        sourceType: "text",
        captureMode: "ai",
        positionX: 280,
        positionY: 220,
      },
      {
        id: "preview-dot-gtm-5",
        oneWordSummary: "Launch",
        summary: "Execute coordinated product launch campaign with PR, content marketing, and strategic partnerships for maximum impact",
        anchor: "Create detailed launch timeline with contingency plans, stakeholder communication, and success metrics for evaluation",
        pulse: "determined",
        wheelId: "preview-wheel-gtm",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 320,
        positionY: 240,
      },
      
      // Leadership Development Wheel Dots (4 dots)
      {
        id: "preview-dot-leadership-1",
        oneWordSummary: "Culture",
        summary: "Foster collaborative, innovative company culture that attracts top talent and drives high performance across all teams",
        anchor: "Define core values, behavioral expectations, and recognition systems that reinforce desired cultural attributes",
        pulse: "inspired",
        wheelId: "preview-wheel-leadership",
        sourceType: "text",
        captureMode: "natural",
        positionX: 480,
        positionY: 140,
      },
      {
        id: "preview-dot-leadership-2",
        oneWordSummary: "Delegation",
        summary: "Master effective delegation by matching tasks to team member strengths while providing clear expectations and support",
        anchor: "Develop systematic approach to task assignment, progress tracking, and feedback delivery to ensure successful outcomes",
        pulse: "empowering",
        wheelId: "preview-wheel-leadership",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 520,
        positionY: 160,
      },
      {
        id: "preview-dot-leadership-3",
        oneWordSummary: "Feedback",
        summary: "Establish regular feedback loops and coaching conversations to accelerate team member development and performance",
        anchor: "Implement structured feedback frameworks that promote growth mindset and continuous improvement across the organization",
        pulse: "supportive",
        wheelId: "preview-wheel-leadership",
        sourceType: "text",
        captureMode: "natural",
        positionX: 500,
        positionY: 200,
      },
      {
        id: "preview-dot-leadership-4",
        oneWordSummary: "Vision",
        summary: "Communicate compelling vision that aligns team efforts and motivates sustained high performance toward shared goals",
        anchor: "Develop clear messaging and storytelling capabilities to inspire teams and stakeholders around company mission",
        pulse: "visionary",
        wheelId: "preview-wheel-leadership",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 480,
        positionY: 220,
      },

      // Product Innovation Wheel Dots (4 dots)
      {
        id: "preview-dot-product-1",
        oneWordSummary: "Research",
        summary: "Conduct deep user research to understand unmet needs and validate assumptions before development investment",
        anchor: "Implement systematic user research methodology including interviews, surveys, and behavioral analytics for insights",
        pulse: "curious",
        wheelId: "preview-wheel-product",
        sourceType: "text",
        captureMode: "natural",
        positionX: 380,
        positionY: 460,
      },
      {
        id: "preview-dot-product-2",
        oneWordSummary: "Prototyping",
        summary: "Rapid prototyping and iteration cycles to test concepts quickly and fail fast before major resource commitment",
        anchor: "Establish agile development processes with regular user testing and feedback integration for continuous improvement",
        pulse: "innovative",
        wheelId: "preview-wheel-product",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 420,
        positionY: 440,
      },
      {
        id: "preview-dot-product-3",
        oneWordSummary: "Quality",
        summary: "Maintain high technical standards through code reviews, testing automation, and performance optimization practices",
        anchor: "Implement comprehensive quality assurance processes to ensure reliable, scalable, and maintainable product development",
        pulse: "meticulous",
        wheelId: "preview-wheel-product",
        sourceType: "text",
        captureMode: "natural",
        positionX: 400,
        positionY: 480,
      },
      {
        id: "preview-dot-product-4",
        oneWordSummary: "Roadmap",
        summary: "Strategic product roadmap balancing customer needs, technical feasibility, and business objectives for growth",
        anchor: "Prioritize features based on impact analysis, resource requirements, and alignment with company strategic goals",
        pulse: "strategic",
        wheelId: "preview-wheel-product",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 380,
        positionY: 400,
      },

      // Health & Wellness Wheel Dots (5 dots)
      {
        id: "preview-dot-health-1",
        oneWordSummary: "Exercise",
        summary: "Consistent strength training and cardio routine 5x weekly to maintain optimal physical fitness and energy levels",
        anchor: "Schedule workout sessions like non-negotiable meetings and track progress through measurable fitness benchmarks",
        pulse: "energized",
        wheelId: "preview-wheel-health",
        sourceType: "text",
        captureMode: "natural",
        positionX: 780,
        positionY: 260,
      },
      {
        id: "preview-dot-health-2",
        oneWordSummary: "Nutrition",
        summary: "Balanced whole food diet with proper hydration and mindful eating habits to fuel peak performance",
        anchor: "Meal prep and nutrition tracking to maintain consistent energy levels and support long-term health goals",
        pulse: "nourished",
        wheelId: "preview-wheel-health",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 820,
        positionY: 280,
      },
      {
        id: "preview-dot-health-3",
        oneWordSummary: "Sleep",
        summary: "7-8 hours quality sleep nightly with consistent sleep schedule and optimized sleep environment for recovery",
        anchor: "Establish evening routine and eliminate screen time 1 hour before bed to improve sleep quality and duration",
        pulse: "rested",
        wheelId: "preview-wheel-health",
        sourceType: "text",
        captureMode: "natural",
        positionX: 800,
        positionY: 320,
      },
      {
        id: "preview-dot-health-4",
        oneWordSummary: "Stress",
        summary: "Daily meditation and stress management techniques to maintain mental clarity and emotional equilibrium",
        anchor: "Practice mindfulness, deep breathing, and regular stress assessment to prevent burnout and maintain wellbeing",
        pulse: "calm",
        wheelId: "preview-wheel-health",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 780,
        positionY: 340,
      },
      {
        id: "preview-dot-health-5",
        oneWordSummary: "Checkups",
        summary: "Regular medical and dental checkups with preventive care to maintain long-term health and catch issues early",
        anchor: "Schedule annual physicals, dental cleanings, and specialized screenings based on age and risk factors",
        pulse: "proactive",
        wheelId: "preview-wheel-health",
        sourceType: "text",
        captureMode: "ai",
        positionX: 820,
        positionY: 320,
      },

      // Individual Development Wheel Dots (8 dots)
      {
        id: "preview-dot-individual-1",
        oneWordSummary: "Reading",
        summary: "Read 24 books annually across leadership, technology, and personal development to expand knowledge and perspectives",
        anchor: "Dedicated daily reading time with note-taking and reflection to maximize learning retention and application",
        pulse: "curious",
        wheelId: "preview-wheel-individual",
        sourceType: "text",
        captureMode: "natural",
        positionX: 80,
        positionY: 260,
      },
      {
        id: "preview-dot-individual-2",
        oneWordSummary: "Skills",
        summary: "Develop new technical and soft skills through online courses, workshops, and hands-on practice projects",
        anchor: "Identify skill gaps and create structured learning plans with milestones and practical application opportunities",
        pulse: "motivated",
        wheelId: "preview-wheel-individual",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 120,
        positionY: 280,
      },
      {
        id: "preview-dot-individual-3",
        oneWordSummary: "Network",
        summary: "Build meaningful professional relationships through industry events, mentorship, and peer collaboration",
        anchor: "Actively engage with community leaders, attend conferences, and maintain regular communication with key contacts",
        pulse: "connected",
        wheelId: "preview-wheel-individual",
        sourceType: "text",
        captureMode: "natural",
        positionX: 100,
        positionY: 320,
      },
      {
        id: "preview-dot-individual-4",
        oneWordSummary: "Reflection",
        summary: "Weekly self-reflection sessions to assess progress, identify areas for improvement, and celebrate achievements",
        anchor: "Structured reflection process including goal review, lesson learned documentation, and next week planning",
        pulse: "thoughtful",
        wheelId: "preview-wheel-individual",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 80,
        positionY: 340,
      },
      {
        id: "preview-dot-individual-5",
        oneWordSummary: "Travel",
        summary: "Experience new cultures and environments through travel to broaden perspective and inspire creativity",
        anchor: "Plan meaningful travel experiences that combine exploration, learning, and personal growth opportunities",
        pulse: "adventurous",
        wheelId: "preview-wheel-individual",
        sourceType: "text",
        captureMode: "ai",
        positionX: 120,
        positionY: 320,
      },
      {
        id: "preview-dot-individual-6",
        oneWordSummary: "Hobbies",
        summary: "Pursue creative hobbies and interests outside work to maintain work-life balance and personal fulfillment",
        anchor: "Dedicate time to activities that bring joy and provide mental stimulation beyond professional responsibilities",
        pulse: "fulfilled",
        wheelId: "preview-wheel-individual",
        sourceType: "voice",
        captureMode: "natural",
        positionX: 100,
        positionY: 360,
      },
      {
        id: "preview-dot-individual-7",
        oneWordSummary: "Goals",
        summary: "Set and track quarterly personal development goals aligned with long-term vision and values",
        anchor: "Create SMART goals with regular progress reviews and adjustments to ensure continuous growth and achievement",
        pulse: "focused",
        wheelId: "preview-wheel-individual",
        sourceType: "text",
        captureMode: "natural",
        positionX: 80,
        positionY: 380,
      },
      {
        id: "preview-dot-individual-8",
        oneWordSummary: "Mentoring",
        summary: "Both seek mentorship from experienced leaders and provide guidance to emerging professionals for mutual growth",
        anchor: "Establish mentor relationships and actively contribute to others' development through knowledge sharing and support",
        pulse: "generous",
        wheelId: "preview-wheel-individual",
        sourceType: "voice",
        captureMode: "ai",
        positionX: 120,
        positionY: 360,
      },
    ];

    // Insert preview dots
    await db.insert(previewDots).values(previewDotsData).onConflictDoNothing();

    console.log("✅ Preview data seeded successfully!");
    console.log(`📊 Seeded ${previewWheelsData.length} preview wheels and ${previewDotsData.length} preview dots`);

  } catch (error) {
    console.error("❌ Error seeding preview data:", error);
    throw error;
  }
}

// Run the seed function
seedPreviewData()
  .then(() => {
    console.log("Preview data seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Preview data seeding failed:", error);
    process.exit(1);
  });