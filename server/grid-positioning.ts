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
  
  // Element sizes - updated per user specifications
  DOT_RADIUS: {
    PREVIEW: 35,  // User specified: 35px radius (70px diameter)
    REAL: 45      // Moderate increase from 35
  },
  WHEEL_RADIUS: {
    BASE: 160,    // User specified: 160px radius (320px diameter)
    MIN: 130,     // Moderate increase from 100
    MAX: 200      // Moderate increase from 150
  },
  CHAKRA_RADIUS: {
    PREVIEW: 420, // User specified: 420px radius (840px diameter)
    REAL: 320     // Moderate increase from 185
  },
  
  // Spacing requirements - updated per user specifications
  MIN_SPACING: {
    DOT_TO_DOT: 40,           // User specified: 40px minimum edge-to-edge
    WHEEL_TO_WHEEL: 180,      // User specified: 180px minimum edge-to-edge
    CHAKRA_TO_CHAKRA: 360,    // User specified: 360px minimum edge-to-edge
    DOT_TO_WHEEL_EDGE: 20,    // Keep dots well within wheel boundaries
    WHEEL_TO_CHAKRA_EDGE: 40  // Keep wheels well within chakra boundaries
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
  ],
  
  // Chakra quadrants for positioning algorithm
  CHAKRA_QUADRANTS: [
    { x: 0.25, y: 0.25 }, // Top-left quadrant
    { x: 0.75, y: 0.25 }, // Top-right quadrant  
    { x: 0.25, y: 0.75 }, // Bottom-left quadrant
    { x: 0.75, y: 0.75 }  // Bottom-right quadrant
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
 * Position dots with strict collision detection and wheel boundary enforcement
 */
export function positionDotsInWheel(
  dots: any[],
  wheel: GridElement,
  isPreview: boolean = false
): Position[] {
  const dotRadius = isPreview ? GRID_CONFIG.DOT_RADIUS.PREVIEW : GRID_CONFIG.DOT_RADIUS.REAL;
  const wheelRadius = wheel.radius;
  const minDotSpacing = dotRadius * 2 + GRID_CONFIG.MIN_SPACING.DOT_TO_DOT; // Center-to-center distance for edge-to-edge spacing
  const maxDotDistance = wheelRadius - dotRadius - GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE; // Stay within wheel boundary
  
  if (dots.length === 0) return [];
  if (dots.length === 1) return [{ ...wheel.position }]; // Center for single dot
  

  
  const positions: Position[] = [];
  
  // Validate wheel can accommodate dots
  if (maxDotDistance <= dotRadius) {
    return dots.map(() => ({ ...wheel.position })); // All at center if wheel too small
  }
  
  if (dots.length === 2) {
    // Side by side with enforced minimum spacing
    const spacing = Math.max(minDotSpacing, maxDotDistance * 0.8);
    if (spacing <= maxDotDistance * 2) {
      positions.push(
        { x: wheel.position.x - spacing/2, y: wheel.position.y },
        { x: wheel.position.x + spacing/2, y: wheel.position.y }
      );
    } else {
      // Fallback: vertical alignment
      positions.push(
        { x: wheel.position.x, y: wheel.position.y - spacing/2 },
        { x: wheel.position.x, y: wheel.position.y + spacing/2 }
      );
    }
  } else if (dots.length === 3) {
    // Triangle with strict spacing validation
    const minTriangleRadius = (minDotSpacing * Math.sqrt(3)) / 3;
    const radius = Math.max(minTriangleRadius, Math.min(maxDotDistance * 0.6, minTriangleRadius * 1.5));
    
    if (radius <= maxDotDistance) {
      const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
      angles.forEach(angle => {
        positions.push({
          x: wheel.position.x + Math.cos(angle) * radius,
          y: wheel.position.y + Math.sin(angle) * radius
        });
      });
    } else {
      // Linear fallback if triangle too large
      const linearSpacing = Math.min(minDotSpacing, maxDotDistance);
      positions.push(
        { x: wheel.position.x - linearSpacing, y: wheel.position.y },
        { x: wheel.position.x, y: wheel.position.y },
        { x: wheel.position.x + linearSpacing, y: wheel.position.y }
      );
    }
  } else if (dots.length === 4) {
    // Square with strict diagonal validation
    const minSquareSpacing = minDotSpacing / Math.sqrt(2);
    const spacing = Math.max(minSquareSpacing, Math.min(maxDotDistance * 0.7, minSquareSpacing * 2));
    
    if (spacing * Math.sqrt(2) <= maxDotDistance) {
      positions.push(
        { x: wheel.position.x - spacing/2, y: wheel.position.y - spacing/2 },
        { x: wheel.position.x + spacing/2, y: wheel.position.y - spacing/2 },
        { x: wheel.position.x - spacing/2, y: wheel.position.y + spacing/2 },
        { x: wheel.position.x + spacing/2, y: wheel.position.y + spacing/2 }
      );
    } else {
      // Linear fallback
      const linearSpacing = Math.min(minDotSpacing, maxDotDistance * 0.8);
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        positions.push({
          x: wheel.position.x + Math.cos(angle) * linearSpacing,
          y: wheel.position.y + Math.sin(angle) * linearSpacing
        });
      }
    }
  } else {
    // Circular arrangement with strict spacing enforcement
    const maxCircleRadius = maxDotDistance * 0.95; // Use nearly all available space
    
    // Calculate minimum radius needed to fit all dots with proper spacing
    // For dots on a circle, the chord length between adjacent dots must be >= minDotSpacing
    // Using the formula: chord = 2 * radius * sin(angle/2)
    // Where angle = 2π / numberOfDots
    const angle = (2 * Math.PI) / dots.length;
    const minRadiusForSpacing = (minDotSpacing + 1) / (2 * Math.sin(angle / 2)); // Add 1px tolerance for floating-point precision
    
    // Use the smaller of the two constraints
    const radius = Math.min(maxCircleRadius, Math.max(minRadiusForSpacing, maxCircleRadius * 0.3));
    

    
    if (radius > maxDotDistance) {
      // Fallback to linear arrangement if circular won't fit
      const linearSpacing = Math.min(minDotSpacing, maxDotDistance * 0.8);
      for (let i = 0; i < dots.length; i++) {
        const angle = (i * 2 * Math.PI) / dots.length;
        positions.push({
          x: wheel.position.x + Math.cos(angle) * linearSpacing,
          y: wheel.position.y + Math.sin(angle) * linearSpacing
        });
      }
    } else {
      // Place dots in a circle with guaranteed spacing
      const angleStep = (2 * Math.PI) / dots.length;
      const startAngle = -Math.PI/2;
      
      for (let i = 0; i < dots.length; i++) {
        const angle = startAngle + i * angleStep;
        positions.push({
          x: wheel.position.x + Math.cos(angle) * radius,
          y: wheel.position.y + Math.sin(angle) * radius
        });
      }
    }
  }
  
  return positions;
}

/**
 * Position wheels within chakra with strict non-overlapping enforcement
 */
export function positionWheelsInChakra(
  wheels: any[],
  chakra: GridElement,
  isPreview: boolean = false
): Position[] {
  if (wheels.length === 0) return [];
  
  const wheelRadius = GRID_CONFIG.WHEEL_RADIUS.BASE;
  const chakraRadius = chakra.radius;
  const minWheelSpacing = wheelRadius * 2 + GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL; // Prevent wheel overlap
  const maxWheelDistance = chakraRadius - wheelRadius - GRID_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE; // Stay within chakra
  
  if (wheels.length === 1) {
    return [{ ...chakra.position }]; // Center for single wheel
  }
  
  const positions: Position[] = [];
  
  if (maxWheelDistance <= 0) {
    return wheels.map(() => ({ ...chakra.position })); // Fallback if chakra too small
  }
  
  if (wheels.length === 2) {
    // Horizontal with enforced spacing
    const spacing = Math.max(minWheelSpacing, maxWheelDistance * 1.0);
    positions.push(
      { x: chakra.position.x - spacing/2, y: chakra.position.y },
      { x: chakra.position.x + spacing/2, y: chakra.position.y }
    );
  } else if (wheels.length === 3) {
    // Triangle with collision avoidance
    const minTriangleRadius = (minWheelSpacing * Math.sqrt(3)) / 3;
    const radius = Math.max(minTriangleRadius, Math.min(maxWheelDistance * 0.6, minTriangleRadius * 1.5));
    const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
    
    angles.forEach(angle => {
      positions.push({
        x: chakra.position.x + Math.cos(angle) * radius,
        y: chakra.position.y + Math.sin(angle) * radius
      });
    });
  } else if (wheels.length === 4) {
    // Square with diagonal validation
    const minSquareSpacing = minWheelSpacing / Math.sqrt(2);
    const spacing = Math.max(minSquareSpacing, Math.min(maxWheelDistance * 0.8, minSquareSpacing * 1.5));
    
    positions.push(
      { x: chakra.position.x - spacing/2, y: chakra.position.y - spacing/2 },
      { x: chakra.position.x + spacing/2, y: chakra.position.y - spacing/2 },
      { x: chakra.position.x - spacing/2, y: chakra.position.y + spacing/2 },
      { x: chakra.position.x + spacing/2, y: chakra.position.y + spacing/2 }
    );
  } else {
    // Circular with strict collision detection
    const circumference = 2 * Math.PI * maxWheelDistance * 0.7;
    const requiredSpacing = minWheelSpacing * wheels.length;
    
    let radius = maxWheelDistance * 0.7;
    
    // Adjust radius if spacing is insufficient
    if (circumference < requiredSpacing) {
      radius = requiredSpacing / (2 * Math.PI);
      // If still too large for chakra, use maximum possible
      radius = Math.min(radius, maxWheelDistance * 0.9);
    }
    
    const angleStep = (2 * Math.PI) / wheels.length;
    const startAngle = -Math.PI/2;
    
    for (let i = 0; i < wheels.length; i++) {
      const angle = startAngle + i * angleStep;
      const pos = {
        x: chakra.position.x + Math.cos(angle) * radius,
        y: chakra.position.y + Math.sin(angle) * radius
      };
      
      // Validate no collision with previous wheels
      const hasCollision = positions.some(existingPos => {
        const distance = Math.sqrt(
          Math.pow(pos.x - existingPos.x, 2) + 
          Math.pow(pos.y - existingPos.y, 2)
        );
        return distance < minWheelSpacing;
      });
      
      if (!hasCollision) {
        positions.push(pos);
      } else {
        // Adjust to safe position
        positions.push({
          x: chakra.position.x + Math.cos(angle) * radius * 0.8,
          y: chakra.position.y + Math.sin(angle) * radius * 0.8
        });
      }
    }
  }
  
  return positions;
}

/**
 * Position chakras with strict non-overlapping enforcement
 */
export function positionChakrasInGrid(
  chakras: any[],
  bounds: GridBounds,
  isPreview: boolean = false
): Position[] {
  if (chakras.length === 0) return [];
  
  const chakraRadius = isPreview ? GRID_CONFIG.CHAKRA_RADIUS.PREVIEW : GRID_CONFIG.CHAKRA_RADIUS.REAL;
  const minChakraDistance = chakraRadius * 2 + GRID_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA;
  const positions: Position[] = [];
  
  for (let i = 0; i < chakras.length; i++) {
    let bestPosition: Position | null = null;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Try to find a non-overlapping position
    while (!bestPosition && attempts < maxAttempts) {
      let candidatePos: Position;
      
      if (attempts < 20) {
        // First try quadrant-based positioning
        const quadrantIndex = attempts % GRID_CONFIG.CHAKRA_QUADRANTS.length;
        const quadrant = GRID_CONFIG.CHAKRA_QUADRANTS[quadrantIndex];
        
        const quadrantWidth = (bounds.width - 2 * bounds.marginX) / 2;
        const quadrantHeight = (bounds.height - 2 * bounds.marginY) / 2;
        
        const randomOffsetX = (Math.random() - 0.5) * quadrantWidth * 0.4;
        const randomOffsetY = (Math.random() - 0.5) * quadrantHeight * 0.4;
        
        const baseX = bounds.marginX + quadrant.x * (bounds.width - 2 * bounds.marginX);
        const baseY = bounds.marginY + quadrant.y * (bounds.height - 2 * bounds.marginY);
        
        candidatePos = {
          x: Math.max(bounds.marginX + chakraRadius, 
              Math.min(bounds.width - bounds.marginX - chakraRadius, baseX + randomOffsetX)),
          y: Math.max(bounds.marginY + chakraRadius, 
              Math.min(bounds.height - bounds.marginY - chakraRadius, baseY + randomOffsetY))
        };
      } else {
        // Then try random positioning
        candidatePos = {
          x: bounds.marginX + chakraRadius + Math.random() * (bounds.width - 2 * bounds.marginX - 2 * chakraRadius),
          y: bounds.marginY + chakraRadius + Math.random() * (bounds.height - 2 * bounds.marginY - 2 * chakraRadius)
        };
      }
      
      // Check for collisions with existing chakras
      const hasCollision = positions.some(existingPos => {
        const distance = Math.sqrt(
          Math.pow(candidatePos.x - existingPos.x, 2) + 
          Math.pow(candidatePos.y - existingPos.y, 2)
        );
        return distance < minChakraDistance;
      });
      
      if (!hasCollision) {
        bestPosition = candidatePos;
      }
      
      attempts++;
    }
    
    // If no position found, use grid fallback
    if (!bestPosition) {
      const cols = Math.ceil(Math.sqrt(chakras.length));
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const spacingX = Math.max((bounds.width - 2 * bounds.marginX) / Math.max(1, cols - 1), minChakraDistance);
      const spacingY = Math.max((bounds.height - 2 * bounds.marginY) / Math.max(1, Math.ceil(chakras.length / cols) - 1), minChakraDistance);
      
      bestPosition = {
        x: bounds.marginX + chakraRadius + (col * spacingX),
        y: bounds.marginY + chakraRadius + (row * spacingY)
      };
      
      // Ensure it's still within bounds
      bestPosition.x = Math.min(bestPosition.x, bounds.width - bounds.marginX - chakraRadius);
      bestPosition.y = Math.min(bestPosition.y, bounds.height - bounds.marginY - chakraRadius);
    }
    
    positions.push(bestPosition);
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
 * Calculate dynamic wheel radius based on number of dots and spacing requirements
 */
export function calculateWheelRadius(dotCount: number, isPreview: boolean = false): number {
  const dotRadius = isPreview ? GRID_CONFIG.DOT_RADIUS.PREVIEW : GRID_CONFIG.DOT_RADIUS.REAL;
  const minDotSpacing = dotRadius * 2 + GRID_CONFIG.MIN_SPACING.DOT_TO_DOT;
  const edgeBuffer = GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE;
  
  if (dotCount <= 1) return GRID_CONFIG.WHEEL_RADIUS.BASE;
  
  let requiredRadius = GRID_CONFIG.WHEEL_RADIUS.BASE;
  
  if (dotCount === 2) {
    // Side-by-side arrangement
    requiredRadius = (minDotSpacing / 2) + dotRadius + edgeBuffer;
  } else if (dotCount === 3) {
    // Triangle arrangement
    const triangleRadius = (minDotSpacing * Math.sqrt(3)) / 3;
    requiredRadius = triangleRadius + dotRadius + edgeBuffer;
  } else if (dotCount === 4) {
    // Square arrangement  
    const squareRadius = minDotSpacing / Math.sqrt(2);
    requiredRadius = squareRadius + dotRadius + edgeBuffer;
  } else {
    // Circular arrangement for 5+ dots
    const angle = (2 * Math.PI) / dotCount;
    const circularRadius = minDotSpacing / (2 * Math.sin(angle / 2));
    requiredRadius = circularRadius + dotRadius + edgeBuffer;
  }
  
  // Use the larger of base size or calculated requirement, capped at maximum
  const finalRadius = Math.min(Math.max(requiredRadius, GRID_CONFIG.WHEEL_RADIUS.BASE), GRID_CONFIG.WHEEL_RADIUS.MAX);
  

  
  return finalRadius;
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
    const wheelRadius = calculateWheelRadius(wheel.dots?.length || 0, isPreview);
    
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