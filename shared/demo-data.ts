/**
 * Static demo data for DotSpark preview mode
 * This data is displayed to unauthorized users to demonstrate how DotSpark works
 * Extracted from the current preview mode functionality
 */

export interface DemoDot {
  id: string;
  oneWordSummary?: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId?: string | null;
  timestamp: Date;
  sourceType: 'text' | 'voice';
  captureMode: 'natural' | 'ai';
  position?: { x: number; y: number };
}

export interface DemoWheel {
  id: string;
  name: string;
  heading: string;
  goals?: string;
  purpose?: string;
  timeline: string;
  category: string;
  color: string;
  chakraId?: string | null;
  position: { x: number; y: number };
  radius: number;
  dots?: DemoDot[];
}

// Demo Chakras (top-level containers)
export const demoChakras: DemoWheel[] = [
  {
    id: "business-chakra",
    name: "Build an Enduring Company",
    heading: "Build an Enduring Company",
    purpose: "Create a lasting business that makes a meaningful impact",
    timeline: "5-10 years",
    category: "Business",
    color: "#B45309",
    chakraId: null,
    position: { x: 400, y: 200 },
    radius: 420
  },
  {
    id: "health-chakra",
    name: "Health & Wellness Journey",
    heading: "Health & Wellness Journey",
    purpose: "Achieve optimal physical and mental wellbeing",
    timeline: "Ongoing",
    category: "Health",
    color: "#B45309",
    chakraId: null,
    position: { x: 1200, y: 200 },
    radius: 370
  }
];

// Demo Wheels (goal-oriented groups)
export const demoWheels: DemoWheel[] = [
  // Business Chakra wheels
  {
    id: "gtm-wheel",
    name: "GTM Strategy",
    heading: "Go-to-Market Strategy",
    goals: "Launch product successfully in target markets",
    timeline: "Q1-Q2 2025",
    category: "Business",
    color: "#EA580C",
    chakraId: "business-chakra",
    position: { x: 280, y: 120 },
    radius: 120
  },
  {
    id: "leadership-wheel",
    name: "Leadership Development",
    heading: "Leadership Development", 
    goals: "Build strong leadership capabilities and team culture",
    timeline: "2025",
    category: "Professional",
    color: "#EA580C",
    chakraId: "business-chakra",
    position: { x: 520, y: 120 },
    radius: 120
  },
  {
    id: "product-wheel",
    name: "Product Innovation",
    heading: "Product Innovation",
    goals: "Develop cutting-edge features and user experience",
    timeline: "Ongoing",
    category: "Technology", 
    color: "#EA580C",
    chakraId: "business-chakra",
    position: { x: 400, y: 280 },
    radius: 120
  },
  // Health Chakra wheels
  {
    id: "fitness-wheel",
    name: "Fitness & Exercise",
    heading: "Fitness & Exercise",
    goals: "Maintain consistent workout routine and physical strength",
    timeline: "Daily",
    category: "Health",
    color: "#EA580C",
    chakraId: "health-chakra",
    position: { x: 1120, y: 130 },
    radius: 120
  },
  {
    id: "nutrition-wheel", 
    name: "Nutrition & Mindfulness",
    heading: "Nutrition & Mindfulness",
    goals: "Balanced diet and mental wellness practices",
    timeline: "Daily",
    category: "Health",
    color: "#EA580C",
    chakraId: "health-chakra", 
    position: { x: 1280, y: 270 },
    radius: 120
  }
];

// Demo Dots (individual insights)
export const demoDots: DemoDot[] = [
  // GTM Strategy wheel dots
  {
    id: "gtm-1",
    oneWordSummary: "Enterprise",
    summary: "Target enterprise customers first",
    anchor: "Enterprise clients have higher LTV and structured procurement processes",
    pulse: "focused",
    wheelId: "gtm-wheel",
    timestamp: new Date("2025-08-20T10:00:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 250, y: 90 }
  },
  {
    id: "gtm-2", 
    oneWordSummary: "Content",
    summary: "Content marketing strategy",
    anchor: "Educational content builds trust and demonstrates expertise",
    pulse: "strategic",
    wheelId: "gtm-wheel",
    timestamp: new Date("2025-08-21T09:30:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 310, y: 90 }
  },
  {
    id: "gtm-3",
    oneWordSummary: "Partnerships",
    summary: "Partnership channels",
    anchor: "Strategic partnerships accelerate market penetration",
    pulse: "collaborative",
    wheelId: "gtm-wheel",
    timestamp: new Date("2025-08-22T14:15:00Z"),
    sourceType: "text",
    captureMode: "ai",
    position: { x: 280, y: 150 }
  },
  {
    id: "gtm-4",
    oneWordSummary: "Pricing",
    summary: "Pricing model optimization",
    anchor: "Value-based pricing aligns with customer outcomes",
    pulse: "strategic",
    wheelId: "gtm-wheel",
    timestamp: new Date("2025-08-23T11:45:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 250, y: 210 }
  },
  {
    id: "gtm-5",
    oneWordSummary: "Sales",
    summary: "Sales team enablement",
    anchor: "Well-trained sales team converts more prospects effectively",
    pulse: "driven",
    wheelId: "gtm-wheel",
    timestamp: new Date("2025-08-24T16:20:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 310, y: 210 }
  },

  // Leadership Development wheel dots
  {
    id: "leadership-1",
    oneWordSummary: "OneOnOnes",
    summary: "Weekly one-on-ones",
    anchor: "Regular feedback builds trust and improves performance",
    pulse: "supportive",
    wheelId: "leadership-wheel",
    timestamp: new Date("2025-08-19T08:00:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 490, y: 90 }
  },
  {
    id: "leadership-2",
    oneWordSummary: "Decisions",
    summary: "Decision-making framework",
    anchor: "Clear frameworks enable faster and better decisions",
    pulse: "decisive",
    wheelId: "leadership-wheel",
    timestamp: new Date("2025-08-20T13:30:00Z"),
    sourceType: "text",
    captureMode: "ai",
    position: { x: 550, y: 90 }
  },
  {
    id: "leadership-3",
    oneWordSummary: "Empowerment",
    summary: "Team empowerment culture",
    anchor: "Empowered teams take ownership and drive innovation",
    pulse: "empowering",
    wheelId: "leadership-wheel",
    timestamp: new Date("2025-08-21T15:45:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 520, y: 150 }
  },
  {
    id: "leadership-4",
    oneWordSummary: "Learning",
    summary: "Leadership book club",
    anchor: "Continuous learning keeps leadership skills sharp",
    pulse: "curious",
    wheelId: "leadership-wheel",
    timestamp: new Date("2025-08-25T12:00:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 490, y: 210 }
  },

  // Product Innovation wheel dots
  {
    id: "product-1",
    oneWordSummary: "Feedback",
    summary: "User feedback integration",
    anchor: "Direct user input drives product-market fit",
    pulse: "receptive",
    wheelId: "product-wheel",
    timestamp: new Date("2025-08-18T10:15:00Z"),
    sourceType: "voice",
    captureMode: "ai",
    position: { x: 370, y: 250 }
  },
  {
    id: "product-2",
    oneWordSummary: "AI",
    summary: "AI-powered features",
    anchor: "AI capabilities differentiate and add significant value",
    pulse: "innovative",
    wheelId: "product-wheel",
    timestamp: new Date("2025-08-19T14:30:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 430, y: 250 }
  },
  {
    id: "product-3",
    oneWordSummary: "Mobile",
    summary: "Mobile-first design",
    anchor: "Mobile experience drives user engagement and retention",
    pulse: "modern",
    wheelId: "product-wheel",
    timestamp: new Date("2025-08-20T16:45:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 400, y: 310 }
  },
  {
    id: "product-4",
    oneWordSummary: "Performance",
    summary: "Performance optimization",
    anchor: "Fast, responsive app creates delightful user experience",
    pulse: "efficient",
    wheelId: "product-wheel",
    timestamp: new Date("2025-08-22T09:20:00Z"),
    sourceType: "text",
    captureMode: "ai",
    position: { x: 370, y: 370 }
  },

  // Fitness wheel dots
  {
    id: "fitness-1",
    oneWordSummary: "Morning",
    summary: "Morning workout routine",
    anchor: "Consistent morning exercise boosts energy and focus",
    pulse: "energized",
    wheelId: "fitness-wheel",
    timestamp: new Date("2025-08-17T06:30:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 1090, y: 100 }
  },
  {
    id: "fitness-2",
    oneWordSummary: "Strength",
    summary: "Strength training progression",
    anchor: "Progressive overload builds muscle and bone strength",
    pulse: "strong",
    wheelId: "fitness-wheel",
    timestamp: new Date("2025-08-19T07:00:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 1150, y: 100 }
  },
  {
    id: "fitness-3",
    oneWordSummary: "Recovery",
    summary: "Recovery and rest days",
    anchor: "Proper recovery prevents injury and improves performance",
    pulse: "balanced",
    wheelId: "fitness-wheel",
    timestamp: new Date("2025-08-21T18:00:00Z"),
    sourceType: "voice",
    captureMode: "ai",
    position: { x: 1120, y: 160 }
  },

  // Nutrition wheel dots
  {
    id: "nutrition-1",
    oneWordSummary: "MealPrep",
    summary: "Meal prep Sunday",
    anchor: "Prepared meals ensure consistent healthy eating",
    pulse: "organized",
    wheelId: "nutrition-wheel",
    timestamp: new Date("2025-08-18T12:00:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 1250, y: 240 }
  },
  {
    id: "nutrition-2",
    oneWordSummary: "Mindful",
    summary: "Mindful eating practices",
    anchor: "Conscious eating improves digestion and satisfaction",
    pulse: "mindful",
    wheelId: "nutrition-wheel",
    timestamp: new Date("2025-08-20T19:30:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 1310, y: 240 }
  },
  {
    id: "nutrition-3",
    oneWordSummary: "Hydration",
    summary: "Hydration tracking",
    anchor: "Adequate hydration supports cognitive and physical performance",
    pulse: "healthy",
    wheelId: "nutrition-wheel",
    timestamp: new Date("2025-08-23T08:15:00Z"),
    sourceType: "text",
    captureMode: "ai",
    position: { x: 1280, y: 300 }
  },

  // Free-floating individual dots (not in wheels)
  {
    id: "free-1",
    oneWordSummary: "Reading",
    summary: "Weekly tech industry reading",
    anchor: "Staying current with industry trends informs strategic decisions",
    pulse: "informed",
    wheelId: null,
    timestamp: new Date("2025-08-16T20:00:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 800, y: 150 }
  },
  {
    id: "free-2",
    oneWordSummary: "Branding",
    summary: "Personal branding on LinkedIn",
    anchor: "Professional visibility creates opportunities and connections",
    pulse: "visible",
    wheelId: null,
    timestamp: new Date("2025-08-17T11:30:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 850, y: 300 }
  },
  {
    id: "free-3",
    oneWordSummary: "Family",
    summary: "Weekend family time",
    anchor: "Quality time with family maintains important relationships",
    pulse: "connected",
    wheelId: null,
    timestamp: new Date("2025-08-24T15:00:00Z"),
    sourceType: "voice",
    captureMode: "ai",
    position: { x: 750, y: 400 }
  },
  {
    id: "free-4",
    oneWordSummary: "Finance",
    summary: "Financial planning review",
    anchor: "Regular financial reviews ensure long-term security",
    pulse: "secure",
    wheelId: null,
    timestamp: new Date("2025-08-25T14:00:00Z"),
    sourceType: "text",
    captureMode: "natural",
    position: { x: 900, y: 450 }
  },
  {
    id: "free-5",
    oneWordSummary: "Creative",
    summary: "Creative side projects",
    anchor: "Personal projects maintain creativity and passion",
    pulse: "creative",
    wheelId: null,
    timestamp: new Date("2025-08-26T17:30:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 650, y: 350 }
  },
  {
    id: "free-6",
    oneWordSummary: "Network",
    summary: "Network expansion strategy",
    anchor: "Strong professional network opens doors to opportunities",
    pulse: "connected",
    wheelId: null,
    timestamp: new Date("2025-08-22T13:45:00Z"),
    sourceType: "text",
    captureMode: "ai",
    position: { x: 950, y: 200 }
  },
  {
    id: "free-7",
    oneWordSummary: "Learning",
    summary: "Learn new programming language",
    anchor: "Technical skill development keeps capabilities current",
    pulse: "growing",
    wheelId: null,
    timestamp: new Date("2025-08-21T21:00:00Z"),
    sourceType: "voice",
    captureMode: "natural",
    position: { x: 700, y: 500 }
  }
];

// Combined data for easy access
export const demoData = {
  dots: demoDots,
  wheels: demoWheels,
  chakras: demoChakras,
  allWheels: [...demoChakras, ...demoWheels] // Combined for components that need all wheels
};

// Helper function to get demo data in the format expected by components
export function getDemoDataForPreview() {
  return {
    previewDots: demoDots,
    previewWheels: [...demoChakras, ...demoWheels]
  };
}