// Standardized visual representation guidelines for dot grids
// Used across both MyNeura and Social pages for consistent experience

export const GRID_CONSTANTS = {
  // Margins to prevent dots from being cut off at edges (percentage)
  MARGIN_X: 12, // 12% margin on each side
  MARGIN_Y: 18, // 18% margin top and bottom (accounts for identity card space)
  
  // Dot sizes (in pixels)
  DOT_SIZES: {
    MOBILE: [80, 95, 110],
    DESKTOP: [100, 120, 140],
  },
  
  // Identity card positioning
  IDENTITY_CARD: {
    CLEARANCE: 42, // Pixels above dot center to position identity card
    WIDTH: 'auto', // Auto-width based on content
  },
  
  // Collision detection
  COLLISION: {
    MIN_DISTANCE: 18, // Minimum distance between dot centers (percentage)
    MAX_ATTEMPTS: 15, // Maximum attempts to find non-overlapping position
  },
  
  // Cloud/Universe layout
  LAYOUT: {
    DOTS_PER_LAYER_MOBILE: 8,
    DOTS_PER_LAYER_DESKTOP: 12,
    LAYER_OFFSET_MOBILE: 55, // Pixels to push each layer down
    LAYER_OFFSET_DESKTOP: 45,
  },
  
  // Channel indicator badge
  CHANNEL_BADGE: {
    SIZE: 24, // Badge diameter in pixels
    BOTTOM_OFFSET: -2, // Position below dot (negative = outside)
  },
  
  // Floating animation
  ANIMATION: {
    DURATION_MIN: 6, // Minimum animation duration in seconds
    DURATION_VARIATION: 4, // Additional random seconds (0-4)
  },
} as const;

// Helper function to check if two dots collide
export function dotsCollide(
  x1: number, 
  y1: number, 
  size1: number, 
  x2: number, 
  y2: number, 
  size2: number
): boolean {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance < GRID_CONSTANTS.COLLISION.MIN_DISTANCE;
}

// Helper to get dot size based on index and device
export function getDotSize(index: number, isMobile: boolean): number {
  const sizes = isMobile 
    ? GRID_CONSTANTS.DOT_SIZES.MOBILE 
    : GRID_CONSTANTS.DOT_SIZES.DESKTOP;
  
  // Use pseudo-random but consistent size based on index
  const sizeIndex = Math.floor(Math.abs(Math.sin(index * 2.3) * 10000) % sizes.length);
  return sizes[sizeIndex];
}

// Helper to calculate identity card top position
export function getIdentityCardTop(dotSize: number): string {
  return `-${dotSize / 2 + GRID_CONSTANTS.IDENTITY_CARD.CLEARANCE}px`;
}
