/**
 * Advanced Grid Positioning Algorithm for DotSpark
 * 
 * This algorithm ensures proper spacing and positioning for dots, wheels, and chakras
 * with collision detection and optimal distribution across the grid space.
 */

export interface Position {
  x: number;
  y: number;
}

export interface GridElement {
  id: string;
  position: Position;
  radius: number;
  type: 'dot' | 'wheel' | 'chakra';
  parentId?: string;
}

export interface GridBounds {
  width: number;
  height: number;
  marginX: number;
  marginY: number;
}

// Balanced grid configuration for optimal space utilization
export const GRID_CONFIG = {
  // Grid dimensions - moderately increased for better space usage
  TOTAL_WIDTH: 1800,
  TOTAL_HEIGHT: 1200,
  MARGIN_X: 120,
  MARGIN_Y: 120,
  
  // Element sizes - moderately increased for better visibility
  DOT_RADIUS: {
    PREVIEW: 35,  // Moderate increase from 25
    REAL: 45      // Moderate increase from 35
  },
  WHEEL_RADIUS: {
    BASE: 160,    // Moderate increase from 120
    MIN: 130,     // Moderate increase from 100
    MAX: 200      // Moderate increase from 150
  },
  CHAKRA_RADIUS: {
    PREVIEW: 280, // Moderate increase from 210
    REAL: 320     // Moderate increase from 185
  },
  
  // Spacing requirements - proportionally adjusted
  MIN_SPACING: {
    DOT_TO_DOT: 20,           // Moderate increase from 15
    WHEEL_TO_WHEEL: 100,      // Moderate increase from 80
    CHAKRA_TO_CHAKRA: 180,    // Moderate increase from 150
    DOT_TO_WHEEL_EDGE: 15,    // Moderate increase from 10
    WHEEL_TO_CHAKRA_EDGE: 30  // Moderate increase from 20
  },
  
  // Maximum dots per wheel before creating new wheel
  MAX_DOTS_PER_WHEEL: 9,
  
  // Grid positioning for chakra distribution - better utilization
  CHAKRA_POSITIONS: [
    { x: 0.2, y: 0.2 },   // Top-left
    { x: 0.8, y: 0.2 },   // Top-right
    { x: 0.2, y: 0.8 },   // Bottom-left
    { x: 0.8, y: 0.8 },   // Bottom-right
    { x: 0.5, y: 0.1 },   // Top-center
    { x: 0.5, y: 0.9 }    // Bottom-center
  ]
};

/**
 * Check if two circular elements collide
 */
export function checkCollision(
  pos1: Position, 
  radius1: number, 
  pos2: Position, 
  radius2: number, 
  minSpacing: number = 0
): boolean {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < (radius1 + radius2 + minSpacing);
}

/**
 * Check if element is within bounds
 */
export function isWithinBounds(
  position: Position, 
  radius: number, 
  bounds: GridBounds
): boolean {
  return (
    position.x - radius >= bounds.marginX &&
    position.x + radius <= bounds.width - bounds.marginX &&
    position.y - radius >= bounds.marginY &&
    position.y + radius <= bounds.height - bounds.marginY
  );
}

/**
 * Generate random position within parent bounds or grid bounds
 */
export function generateRandomPosition(
  radius: number,
  bounds: GridBounds,
  parentElement?: GridElement,
  existingElements: GridElement[] = [],
  maxAttempts: number = 100
): Position {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    let position: Position;
    
    if (parentElement) {
      // Position within parent element (for dots in wheels or wheels in chakras)
      const parentRadius = parentElement.radius;
      const maxDistance = parentRadius - radius - (
        parentElement.type === 'chakra' ? GRID_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE : 
        GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE
      );
      
      if (maxDistance <= 0) {
        // Parent too small, position at center
        position = { ...parentElement.position };
      } else {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * maxDistance;
        position = {
          x: parentElement.position.x + Math.cos(angle) * distance,
          y: parentElement.position.y + Math.sin(angle) * distance
        };
      }
    } else {
      // Position within grid bounds
      position = {
        x: bounds.marginX + radius + Math.random() * (bounds.width - 2 * bounds.marginX - 2 * radius),
        y: bounds.marginY + radius + Math.random() * (bounds.height - 2 * bounds.marginY - 2 * radius)
      };
    }
    
    // Check collision with existing elements
    const hasCollision = existingElements.some(element => {
      const minSpacing = element.type === 'dot' ? GRID_CONFIG.MIN_SPACING.DOT_TO_DOT :
                        element.type === 'wheel' ? GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL :
                        GRID_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA;
      
      return checkCollision(position, radius, element.position, element.radius, minSpacing);
    });
    
    if (!hasCollision && isWithinBounds(position, radius, bounds)) {
      return position;
    }
    
    attempts++;
  }
  
  // Fallback: return a position even if not optimal
  if (parentElement) {
    return { ...parentElement.position };
  } else {
    return {
      x: bounds.marginX + radius + Math.random() * (bounds.width - 2 * bounds.marginX - 2 * radius),
      y: bounds.marginY + radius + Math.random() * (bounds.height - 2 * bounds.marginY - 2 * radius)
    };
  }
}

/**
 * Position dots in optimal arrangement within a wheel
 */
export function positionDotsInWheel(
  dots: any[],
  wheel: GridElement,
  isPreview: boolean = false
): Position[] {
  const dotRadius = isPreview ? GRID_CONFIG.DOT_RADIUS.PREVIEW : GRID_CONFIG.DOT_RADIUS.REAL;
  const wheelRadius = wheel.radius;
  const safeRadius = wheelRadius - dotRadius - GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE;
  
  if (dots.length === 0) return [];
  if (dots.length === 1) return [{ ...wheel.position }]; // Center for single dot
  
  const positions: Position[] = [];
  
  if (safeRadius <= 0) {
    // Wheel too small, stack dots at center
    return dots.map(() => ({ ...wheel.position }));
  }
  
  if (dots.length === 2) {
    // Side by side for 2 dots
    const spacing = Math.min(safeRadius * 1.2, dotRadius * 2 + GRID_CONFIG.MIN_SPACING.DOT_TO_DOT);
    positions.push(
      { x: wheel.position.x - spacing/2, y: wheel.position.y },
      { x: wheel.position.x + spacing/2, y: wheel.position.y }
    );
  } else if (dots.length === 3) {
    // Triangle for 3 dots
    const radius = safeRadius * 0.6;
    const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6]; // Top, bottom-right, bottom-left
    angles.forEach(angle => {
      positions.push({
        x: wheel.position.x + Math.cos(angle) * radius,
        y: wheel.position.y + Math.sin(angle) * radius
      });
    });
  } else if (dots.length === 4) {
    // Square arrangement for 4 dots
    const spacing = safeRadius * 0.8;
    positions.push(
      { x: wheel.position.x - spacing/2, y: wheel.position.y - spacing/2 }, // Top-left
      { x: wheel.position.x + spacing/2, y: wheel.position.y - spacing/2 }, // Top-right
      { x: wheel.position.x - spacing/2, y: wheel.position.y + spacing/2 }, // Bottom-left
      { x: wheel.position.x + spacing/2, y: wheel.position.y + spacing/2 }  // Bottom-right
    );
  } else {
    // Circular arrangement for 5+ dots with better spacing
    const angleStep = (2 * Math.PI) / dots.length;
    const radius = safeRadius * 0.75; // Use more of the available space
    const startAngle = -Math.PI/2; // Start from top
    
    for (let i = 0; i < dots.length; i++) {
      const angle = startAngle + i * angleStep;
      positions.push({
        x: wheel.position.x + Math.cos(angle) * radius,
        y: wheel.position.y + Math.sin(angle) * radius
      });
    }
  }
  
  return positions;
}

/**
 * Position wheels within a chakra with optimal spacing
 */
export function positionWheelsInChakra(
  wheels: any[],
  chakra: GridElement,
  isPreview: boolean = false
): Position[] {
  if (wheels.length === 0) return [];
  
  const wheelRadius = GRID_CONFIG.WHEEL_RADIUS.BASE;
  const chakraRadius = chakra.radius;
  const safeRadius = chakraRadius - wheelRadius - GRID_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE;
  
  if (wheels.length === 1) {
    return [{ ...chakra.position }]; // Center for single wheel
  }
  
  const positions: Position[] = [];
  
  if (safeRadius <= 0) {
    // Chakra too small, stack wheels at center
    return wheels.map(() => ({ ...chakra.position }));
  }
  
  // For multiple wheels, use strategic positioning with better spacing
  if (wheels.length === 2) {
    // Side by side with generous spacing
    const spacing = safeRadius * 1.2;
    positions.push(
      { x: chakra.position.x - spacing/2, y: chakra.position.y },
      { x: chakra.position.x + spacing/2, y: chakra.position.y }
    );
  } else if (wheels.length === 3) {
    // Triangle arrangement with optimal spacing
    const radius = safeRadius * 0.7;
    const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6]; // Top, bottom-right, bottom-left
    angles.forEach(angle => {
      positions.push({
        x: chakra.position.x + Math.cos(angle) * radius,
        y: chakra.position.y + Math.sin(angle) * radius
      });
    });
  } else if (wheels.length === 4) {
    // Square arrangement for 4 wheels
    const spacing = safeRadius * 1.0;
    positions.push(
      { x: chakra.position.x - spacing/2, y: chakra.position.y - spacing/2 }, // Top-left
      { x: chakra.position.x + spacing/2, y: chakra.position.y - spacing/2 }, // Top-right
      { x: chakra.position.x - spacing/2, y: chakra.position.y + spacing/2 }, // Bottom-left
      { x: chakra.position.x + spacing/2, y: chakra.position.y + spacing/2 }  // Bottom-right
    );
  } else {
    // Circular arrangement for 5+ wheels using more space
    const angleStep = (2 * Math.PI) / wheels.length;
    const radius = safeRadius * 0.8; // Use more of the available space
    const startAngle = -Math.PI/2; // Start from top
    
    for (let i = 0; i < wheels.length; i++) {
      const angle = startAngle + i * angleStep;
      positions.push({
        x: chakra.position.x + Math.cos(angle) * radius,
        y: chakra.position.y + Math.sin(angle) * radius
      });
    }
  }
  
  return positions;
}

/**
 * Position chakras across the grid using quadrant distribution
 */
export function positionChakrasInGrid(
  chakras: any[],
  bounds: GridBounds,
  isPreview: boolean = false
): Position[] {
  if (chakras.length === 0) return [];
  
  const chakraRadius = isPreview ? GRID_CONFIG.CHAKRA_RADIUS.PREVIEW : GRID_CONFIG.CHAKRA_RADIUS.REAL;
  const positions: Position[] = [];
  const usedQuadrants: number[] = [];
  
  for (let i = 0; i < chakras.length; i++) {
    let quadrantIndex: number;
    
    // Select next available quadrant
    if (usedQuadrants.length < GRID_CONFIG.CHAKRA_QUADRANTS.length) {
      do {
        quadrantIndex = Math.floor(Math.random() * GRID_CONFIG.CHAKRA_QUADRANTS.length);
      } while (usedQuadrants.includes(quadrantIndex));
      usedQuadrants.push(quadrantIndex);
    } else {
      // All quadrants used, distribute randomly
      quadrantIndex = Math.floor(Math.random() * GRID_CONFIG.CHAKRA_QUADRANTS.length);
    }
    
    const quadrant = GRID_CONFIG.CHAKRA_QUADRANTS[quadrantIndex];
    
    // Add randomization within quadrant
    const quadrantWidth = (bounds.width - 2 * bounds.marginX) / 2;
    const quadrantHeight = (bounds.height - 2 * bounds.marginY) / 2;
    
    const randomOffsetX = (Math.random() - 0.5) * quadrantWidth * 0.6;
    const randomOffsetY = (Math.random() - 0.5) * quadrantHeight * 0.6;
    
    const baseX = bounds.marginX + quadrant.x * (bounds.width - 2 * bounds.marginX);
    const baseY = bounds.marginY + quadrant.y * (bounds.height - 2 * bounds.marginY);
    
    positions.push({
      x: Math.max(bounds.marginX + chakraRadius, 
          Math.min(bounds.width - bounds.marginX - chakraRadius, baseX + randomOffsetX)),
      y: Math.max(bounds.marginY + chakraRadius, 
          Math.min(bounds.height - bounds.marginY - chakraRadius, baseY + randomOffsetY))
    });
  }
  
  return positions;
}

/**
 * Position free dots (not belonging to any wheel) randomly across the grid
 */
export function positionFreeDotsInGrid(
  freeDots: any[],
  bounds: GridBounds,
  existingElements: GridElement[],
  isPreview: boolean = false
): Position[] {
  const dotRadius = isPreview ? GRID_CONFIG.DOT_RADIUS.PREVIEW : GRID_CONFIG.DOT_RADIUS.REAL;
  const positions: Position[] = [];
  
  for (const dot of freeDots) {
    const position = generateRandomPosition(
      dotRadius,
      bounds,
      undefined, // No parent
      [...existingElements, ...positions.map((pos, index) => ({
        id: `free-dot-${index}`,
        position: pos,
        radius: dotRadius,
        type: 'dot' as const
      }))],
      150 // More attempts for better distribution
    );
    
    positions.push(position);
  }
  
  return positions;
}

/**
 * Calculate dynamic wheel radius based on number of dots
 */
export function calculateWheelRadius(dotCount: number): number {
  if (dotCount <= 3) return GRID_CONFIG.WHEEL_RADIUS.BASE;
  if (dotCount <= 6) return GRID_CONFIG.WHEEL_RADIUS.BASE + 15;
  if (dotCount <= 9) return GRID_CONFIG.WHEEL_RADIUS.BASE + 30;
  return GRID_CONFIG.WHEEL_RADIUS.MAX;
}

/**
 * Main positioning algorithm that handles the complete grid layout
 */
export function calculateGridPositions(
  dots: any[],
  wheels: any[],
  chakras: any[],
  isPreview: boolean = false
) {
  const bounds: GridBounds = {
    width: GRID_CONFIG.TOTAL_WIDTH,
    height: GRID_CONFIG.TOTAL_HEIGHT,
    marginX: GRID_CONFIG.MARGIN_X,
    marginY: GRID_CONFIG.MARGIN_Y
  };
  
  const result = {
    chakraPositions: new Map<string, Position>(),
    wheelPositions: new Map<string, Position>(),
    dotPositions: new Map<string, Position>(),
    gridElements: [] as GridElement[]
  };
  
  // 1. Position chakras first (largest elements)
  const chakraRadius = isPreview ? GRID_CONFIG.CHAKRA_RADIUS.PREVIEW : GRID_CONFIG.CHAKRA_RADIUS.REAL;
  const chakraPositions = positionChakrasInGrid(chakras, bounds, isPreview);
  
  chakras.forEach((chakra, index) => {
    const position = chakraPositions[index];
    result.chakraPositions.set(chakra.id, position);
    result.gridElements.push({
      id: chakra.id,
      position,
      radius: chakraRadius,
      type: 'chakra'
    });
  });
  
  // 2. Position wheels (both in chakras and free wheels)
  const wheelElements: GridElement[] = [];
  
  wheels.forEach(wheel => {
    const wheelRadius = calculateWheelRadius(wheel.dots?.length || 0);
    
    if (wheel.chakraId) {
      // Wheel belongs to a chakra
      const chakraElement = result.gridElements.find(el => el.id === wheel.chakraId);
      if (chakraElement) {
        const chakraWheels = wheels.filter(w => w.chakraId === wheel.chakraId);
        const wheelIndex = chakraWheels.findIndex(w => w.id === wheel.id);
        const positions = positionWheelsInChakra(chakraWheels, chakraElement, isPreview);
        
        const position = positions[wheelIndex];
        result.wheelPositions.set(wheel.id, position);
        wheelElements.push({
          id: wheel.id,
          position,
          radius: wheelRadius,
          type: 'wheel',
          parentId: wheel.chakraId
        });
      }
    } else {
      // Free wheel
      const position = generateRandomPosition(
        wheelRadius,
        bounds,
        undefined,
        [...result.gridElements, ...wheelElements],
        100
      );
      
      result.wheelPositions.set(wheel.id, position);
      wheelElements.push({
        id: wheel.id,
        position,
        radius: wheelRadius,
        type: 'wheel'
      });
    }
  });
  
  result.gridElements.push(...wheelElements);
  
  // 3. Position dots (both in wheels and free dots)
  const freeDots = dots.filter(dot => !dot.wheelId);
  const wheelDots = dots.filter(dot => dot.wheelId);
  
  // Position dots within wheels
  wheels.forEach(wheel => {
    const wheelElement = wheelElements.find(el => el.id === wheel.id);
    if (wheelElement) {
      const wheelDotsList = wheelDots.filter(dot => dot.wheelId === wheel.id);
      const positions = positionDotsInWheel(wheelDotsList, wheelElement, isPreview);
      
      wheelDotsList.forEach((dot, index) => {
        result.dotPositions.set(dot.id, positions[index]);
      });
    }
  });
  
  // Position free dots
  if (freeDots.length > 0) {
    const freePositions = positionFreeDotsInGrid(freeDots, bounds, result.gridElements, isPreview);
    freeDots.forEach((dot, index) => {
      result.dotPositions.set(dot.id, freePositions[index]);
    });
  }
  
  return result;
}