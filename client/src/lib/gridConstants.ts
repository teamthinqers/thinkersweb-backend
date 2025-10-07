// Standardized visual representation guidelines for dot grids
// Used across both MyNeura and Social pages for consistent experience

export const GRID_CONSTANTS = {
  // Margins to prevent dots from being cut off at edges (percentage)
  MARGIN_X: 15, // 15% margin on each side for spacious edge spacing
  MARGIN_Y: 22, // 22% margin top and bottom - generous space for identity cards
  
  // Dot sizes (in pixels) - uniform size for clean appearance
  DOT_SIZES: {
    MOBILE: [100], // Single size for consistency
    DESKTOP: [120], // Single size for consistency
  },
  
  // Identity card positioning
  IDENTITY_CARD: {
    CLEARANCE: 28, // Pixels above dot center to position identity card - optimized for spacing
    WIDTH: 'auto', // Auto-width based on content
  },
  
  // Collision detection
  COLLISION: {
    MIN_DISTANCE: 35, // Minimum distance between dot centers (percentage) - generous spacing
    MAX_ATTEMPTS: 300, // Maximum attempts to find non-overlapping position (increased)
    GUTTER_PX: 180, // Minimum pixel gap between dot edges - very spacious for clean cloud
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

// Helper function to check if two dots collide (pixel-based with radius awareness)
export function dotsCollide(
  x1: number, 
  y1: number, 
  size1: number, 
  x2: number, 
  y2: number, 
  size2: number,
  containerWidth: number,
  containerHeight: number
): boolean {
  // Convert percentage positions to pixels
  const x1Px = (x1 / 100) * containerWidth;
  const y1Px = (y1 / 100) * containerHeight;
  const x2Px = (x2 / 100) * containerWidth;
  const y2Px = (y2 / 100) * containerHeight;
  
  // Calculate distance in pixels
  const distancePx = Math.sqrt(Math.pow(x2Px - x1Px, 2) + Math.pow(y2Px - y1Px, 2));
  
  // Check if distance is less than sum of radii plus gutter
  const radius1 = size1 / 2;
  const radius2 = size2 / 2;
  const minDistance = radius1 + radius2 + GRID_CONSTANTS.COLLISION.GUTTER_PX;
  
  return distancePx < minDistance;
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

// Bounding box constants for dot + identity card groups
const BOUNDING_BOX = {
  // Identity card dimensions (approximate)
  CARD_HEIGHT: 45, // Height of identity card in pixels
  CARD_WIDTH: 180, // Typical width of identity card
  
  // Guardrail padding around the entire group - generous spacing for clean cloud
  GUARDRAIL_PADDING: 30, // Spacious breathing room around each unit
  
  // Calculate total bounding box size
  getBoxDimensions: (dotSize: number) => {
    // Total height: dot + card above it + clearance + generous guardrails
    const totalHeight = dotSize + BOUNDING_BOX.CARD_HEIGHT + GRID_CONSTANTS.IDENTITY_CARD.CLEARANCE + (BOUNDING_BOX.GUARDRAIL_PADDING * 2);
    // Total width: max of dot and card + generous guardrails
    const totalWidth = Math.max(dotSize, BOUNDING_BOX.CARD_WIDTH) + (BOUNDING_BOX.GUARDRAIL_PADDING * 2);
    return { width: totalWidth, height: totalHeight };
  }
};

// Seeded random function for consistent positioning across refreshes
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate 100 fixed positions with organic "stars in the cloud" distribution
// Uses jittered grid to ensure spacing while creating natural scatter
// Returns PIXEL positions for use in infinite scrolling canvas
function generateFixedGridPositions(): Array<{ x: number; y: number; size: number; rotation: number }> {
  const positions: Array<{ x: number; y: number; size: number; rotation: number }> = [];
  const sizes = GRID_CONSTANTS.DOT_SIZES.DESKTOP;
  
  const TOTAL_POSITIONS = 100; // Optimize for 100 thoughts max
  const DOTS_PER_ROW = 4; // Base grid: 4 dots per row - very spacious cloud layout
  
  // Use pixel-based layout for infinite canvas (assume 1200px width container)
  const containerWidth = 1200;
  const leftMarginPx = 180; // 15% of 1200px
  const rightMarginPx = 180;
  const topMarginPx = 150; // Starting top margin in pixels - more space at top
  const availableWidthPx = containerWidth - leftMarginPx - rightMarginPx; // 840px
  
  // Base grid spacing in pixels
  const cellWidthPx = availableWidthPx / DOTS_PER_ROW; // ~210px per cell
  const cellHeightPx = 350; // Vertical spacing in pixels - extra spacious for clean cloud with 4 dots per row
  
  // Jitter amount in pixels - random offset within cell to create organic look
  const maxJitterXPx = cellWidthPx * 0.2; // Reduced jitter for better spacing
  const maxJitterYPx = cellHeightPx * 0.15; // Reduced jitter for better spacing
  
  let index = 0;
  
  for (let row = 0; row < Math.ceil(TOTAL_POSITIONS / DOTS_PER_ROW); row++) {
    for (let col = 0; col < DOTS_PER_ROW && index < TOTAL_POSITIONS; col++) {
      // Base grid position (center of cell) in pixels
      const baseX = leftMarginPx + (col * cellWidthPx) + (cellWidthPx / 2);
      const baseY = topMarginPx + (row * cellHeightPx) + (cellHeightPx / 2);
      
      // Add seeded random jitter for organic "scattered stars" look
      const jitterX = (seededRandom(index * 2.5) - 0.5) * 2 * maxJitterXPx;
      const jitterY = (seededRandom(index * 3.7) - 0.5) * 2 * maxJitterYPx;
      
      // Final position with jitter (clamped to margins) in PIXELS
      const x = Math.max(leftMarginPx + 60, Math.min(containerWidth - rightMarginPx - 60, baseX + jitterX));
      const y = Math.max(topMarginPx, baseY + jitterY);
      
      const size = sizes[index % sizes.length];
      const rotation = (index * 137.5) % 360; // Golden angle rotation
      
      positions.push({ x, y, size, rotation });
      index++;
    }
  }
  
  return positions;
}

// Pre-generated fixed positions (regenerated on each module load for updates)
const FIXED_GRID_POSITIONS = generateFixedGridPositions();

export function getFixedPosition(index: number): { x: number; y: number; size: number; rotation: number } {
  // Cycle through positions if we exceed 100
  const actualIndex = index % 100;
  return FIXED_GRID_POSITIONS[actualIndex];
}

// Channel configuration types
export interface ChannelConfig {
  icon: any;
  color: string;
  borderColor: string;
  hoverBorderColor: string;
  bgGradient: string;
  badgeBg: string;
  name: string;
}

// Import icons needed for channel configs
import { PenTool, Sparkles } from 'lucide-react';
import { SiLinkedin, SiWhatsapp, SiOpenai } from 'react-icons/si';

// Shared channel configuration
export function getChannelConfig(channel: string): ChannelConfig {
  switch (channel) {
    case 'write':
      return {
        icon: PenTool,
        color: 'from-amber-400 via-orange-400 to-red-400',
        borderColor: 'border-amber-300',
        hoverBorderColor: 'border-orange-400',
        bgGradient: 'from-white via-amber-50 to-orange-50',
        badgeBg: 'bg-amber-500',
        name: 'Write'
      };
    case 'linkedin':
      return {
        icon: SiLinkedin,
        color: 'from-blue-400 via-blue-500 to-blue-600',
        borderColor: 'border-blue-300',
        hoverBorderColor: 'border-blue-500',
        bgGradient: 'from-white via-blue-50 to-blue-100',
        badgeBg: 'bg-blue-600',
        name: 'LinkedIn'
      };
    case 'whatsapp':
      return {
        icon: SiWhatsapp,
        color: 'from-green-400 via-green-500 to-green-600',
        borderColor: 'border-green-300',
        hoverBorderColor: 'border-green-500',
        bgGradient: 'from-white via-green-50 to-green-100',
        badgeBg: 'bg-green-600',
        name: 'WhatsApp'
      };
    case 'chatgpt':
      return {
        icon: SiOpenai,
        color: 'from-purple-400 via-purple-500 to-purple-600',
        borderColor: 'border-purple-300',
        hoverBorderColor: 'border-purple-500',
        bgGradient: 'from-white via-purple-50 to-purple-100',
        badgeBg: 'bg-purple-600',
        name: 'ChatGPT'
      };
    case 'aihelp':
      return {
        icon: Sparkles,
        color: 'from-violet-400 via-fuchsia-400 to-pink-400',
        borderColor: 'border-violet-300',
        hoverBorderColor: 'border-fuchsia-400',
        bgGradient: 'from-white via-violet-50 to-fuchsia-50',
        badgeBg: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
        name: 'AI Help'
      };
    default:
      return {
        icon: PenTool,
        color: 'from-amber-400 via-orange-400 to-red-400',
        borderColor: 'border-amber-300',
        hoverBorderColor: 'border-orange-400',
        bgGradient: 'from-white via-amber-50 to-orange-50',
        badgeBg: 'bg-amber-500',
        name: 'Default'
      };
  }
}
