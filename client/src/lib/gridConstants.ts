// Standardized visual representation guidelines for dot grids
// Used across both MyNeura and Social pages for consistent experience

export const GRID_CONSTANTS = {
  // Margins to prevent dots from being cut off at edges (percentage)
  MARGIN_X: 12, // 12% margin on each side for comfortable edge spacing
  MARGIN_Y: 15, // 15% margin top and bottom for comfortable vertical spacing
  
  // Dot sizes (in pixels)
  DOT_SIZES: {
    MOBILE: [80, 95, 110],
    DESKTOP: [100, 120, 140],
  },
  
  // Identity card positioning
  IDENTITY_CARD: {
    CLEARANCE: 20, // Pixels above dot center to position identity card (reduced from 42)
    WIDTH: 'auto', // Auto-width based on content
  },
  
  // Collision detection
  COLLISION: {
    MIN_DISTANCE: 25, // Minimum distance between dot centers (percentage) - increased for more spacing
    MAX_ATTEMPTS: 200, // Maximum attempts to find non-overlapping position (increased)
    GUTTER_PX: 80, // Minimum pixel gap between dot edges - significantly increased
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
