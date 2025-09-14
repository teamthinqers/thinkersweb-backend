import type { Dot as DbDot, Wheel as DbWheel, Chakra as DbChakra } from './schema';

// Frontend-compatible types that match what the Dashboard expects
export interface FrontendDot {
  id: string;
  oneWordSummary: string;
  summary: string;
  anchor: string;
  pulse: string;
  wheelId: string | null;
  chakraId: string | null;
  timestamp: Date;
  createdAt: Date;
  sourceType: string;
  captureMode: string;
  positionX?: number;
  positionY?: number;
}

export interface FrontendWheel {
  id: string;
  name: string; // Maps to heading
  heading: string;
  goals: string;
  purpose?: string; // For chakras
  timeline: string;
  category: string;
  color: string;
  chakraId: string | null;
  position?: { x: number; y: number };
  connections?: string[];
  dots: FrontendDot[];
  createdAt: Date;
}

export interface FrontendChakra {
  id: string;
  name: string; // Maps to heading
  heading: string;
  purpose: string;
  timeline: string;
  category?: string;
  color: string;
  chakraId?: undefined; // Chakras don't have parent chakras
  position?: { x: number; y: number };
  connections?: string[];
  dots: FrontendDot[];
  createdAt: Date;
}

// Type adapters to transform database types to frontend types
export const adaptDotToFrontend = (dbDot: DbDot): FrontendDot => ({
  id: dbDot.id.toString(),
  oneWordSummary: dbDot.oneWordSummary,
  summary: dbDot.summary,
  anchor: dbDot.anchor,
  pulse: dbDot.pulse,
  wheelId: dbDot.wheelId?.toString() || null,
  chakraId: dbDot.chakraId?.toString() || null,
  timestamp: dbDot.createdAt, // Map createdAt to timestamp
  createdAt: dbDot.createdAt,
  sourceType: dbDot.sourceType,
  captureMode: dbDot.captureMode,
  positionX: dbDot.positionX || 0,
  positionY: dbDot.positionY || 0
});

export const adaptWheelToFrontend = (dbWheel: DbWheel, dots: FrontendDot[] = []): FrontendWheel => ({
  id: dbWheel.id.toString(),
  name: dbWheel.heading, // Map heading to name for frontend compatibility
  heading: dbWheel.heading,
  goals: dbWheel.goals,
  timeline: dbWheel.timeline,
  category: dbWheel.category || 'general',
  color: dbWheel.color,
  chakraId: dbWheel.chakraId?.toString() || null,
  position: { 
    x: dbWheel.positionX || 0, 
    y: dbWheel.positionY || 0 
  },
  connections: [], // Will be populated based on relationships
  dots: dots.filter(dot => dot.wheelId === dbWheel.id.toString()),
  createdAt: dbWheel.createdAt
});

export const adaptChakraToFrontend = (dbChakra: DbChakra, dots: FrontendDot[] = []): FrontendChakra => ({
  id: dbChakra.id.toString(),
  name: dbChakra.heading, // Map heading to name for frontend compatibility
  heading: dbChakra.heading,
  purpose: dbChakra.purpose,
  timeline: dbChakra.timeline,
  color: dbChakra.color,
  position: { 
    x: dbChakra.positionX || 0, 
    y: dbChakra.positionY || 0 
  },
  connections: [], // Will be populated based on relationships
  dots: dots.filter(dot => dot.chakraId === dbChakra.id.toString()),
  createdAt: dbChakra.createdAt
});

// Helper function to adapt arrays
export const adaptDotsToFrontend = (dbDots: DbDot[]): FrontendDot[] => 
  dbDots.map(adaptDotToFrontend);

export const adaptWheelsToFrontend = (dbWheels: DbWheel[], dots: FrontendDot[] = []): FrontendWheel[] => 
  dbWheels.map(wheel => adaptWheelToFrontend(wheel, dots));

export const adaptChakrasToFrontend = (dbChakras: DbChakra[], dots: FrontendDot[] = []): FrontendChakra[] => 
  dbChakras.map(chakra => adaptChakraToFrontend(chakra, dots));