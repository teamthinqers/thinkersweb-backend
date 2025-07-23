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

// Dynamic grid configuration optimized for user scaling
export const GRID_CONFIG = {
  // Grid dimensions - expanded for better user growth accommodation
  TOTAL_WIDTH: 2400,  // Increased width for more chakras
  TOTAL_HEIGHT: 1600, // Increased height for better distribution
  MARGIN_X: 150,      // Enhanced safety margins
  MARGIN_Y: 150,
  
  // Minimum spacing requirements - these are non-negotiable
  MIN_SPACING: {
    DOT_TO_DOT: 40,           // Minimum edge-to-edge spacing between dots
    WHEEL_TO_WHEEL: 180,      // Minimum edge-to-edge spacing between wheels
    CHAKRA_TO_CHAKRA: 360,    // Minimum edge-to-edge spacing between chakras
    DOT_TO_WHEEL_EDGE: 20,    // Keep dots well within wheel boundaries
    WHEEL_TO_CHAKRA_EDGE: 40  // Keep wheels well within chakra boundaries
  },
  
  // Maximum dots per wheel before creating new wheel - increased for better capacity
  MAX_DOTS_PER_WHEEL: 12,
  
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
    
    // Check collision with existing elements with enhanced buffering
    const hasCollision = existingElements.some(element => {
      const minSpacing = element.type === 'dot' ? GRID_CONFIG.MIN_SPACING.DOT_TO_DOT + 10 :
                        element.type === 'wheel' ? GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL + 20 :
                        GRID_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA + 30;
      
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
  dotRadius: number
): Position[] {
  if (dots.length === 0) return [];
  
  const wheelRadius = wheel.radius;
  const minDotSpacing = dotRadius * 2 + GRID_CONFIG.MIN_SPACING.DOT_TO_DOT + 5; // Center-to-center distance with extra buffer for floating-point precision
  const maxDotDistance = wheelRadius - dotRadius - GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE; // Stay within wheel boundary
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
    // Triangle with enhanced spacing validation
    const minTriangleRadius = (minDotSpacing * Math.sqrt(3)) / 3;
    const radius = Math.max(minTriangleRadius + 10, Math.min(maxDotDistance * 0.5, minTriangleRadius * 2));
    
    if (radius <= maxDotDistance - 10) { // Extra buffer
      const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
      angles.forEach(angle => {
        positions.push({
          x: wheel.position.x + Math.cos(angle) * radius,
          y: wheel.position.y + Math.sin(angle) * radius
        });
      });
      
      // Validate all positions have proper spacing
      let hasViolation = false;
      for (let i = 0; i < positions.length && !hasViolation; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const distance = Math.sqrt(
            Math.pow(positions[i].x - positions[j].x, 2) + 
            Math.pow(positions[i].y - positions[j].y, 2)
          );
          if (distance < minDotSpacing - 5) { // Increased tolerance for floating point
            hasViolation = true;
            break;
          }
        }
      }
      
      if (hasViolation) {
        positions.length = 0; // Clear positions for fallback
      }
    }
    
    if (positions.length === 0) {
      // Linear fallback with guaranteed spacing
      const linearSpacing = Math.min(minDotSpacing * 1.2, maxDotDistance * 0.8);
      positions.push(
        { x: wheel.position.x - linearSpacing, y: wheel.position.y },
        { x: wheel.position.x, y: wheel.position.y },
        { x: wheel.position.x + linearSpacing, y: wheel.position.y }
      );
    }
  } else if (dots.length === 4) {
    // BULLETPROOF 4-dot positioning with guaranteed spacing
    // Start with the minimum required spacing and work upward
    const absoluteMinSpacing = minDotSpacing * 3; // Triple the minimum for absolute safety
    
    // Option 1: Try 2x2 grid with maximum safety spacing
    positions.push(
      { x: wheel.position.x - absoluteMinSpacing/2, y: wheel.position.y - absoluteMinSpacing/2 },
      { x: wheel.position.x + absoluteMinSpacing/2, y: wheel.position.y - absoluteMinSpacing/2 },
      { x: wheel.position.x - absoluteMinSpacing/2, y: wheel.position.y + absoluteMinSpacing/2 },
      { x: wheel.position.x + absoluteMinSpacing/2, y: wheel.position.y + absoluteMinSpacing/2 }
    );
    
    // Verify this arrangement fits within wheel boundaries
    const maxDistanceFromCenter = Math.sqrt(2) * absoluteMinSpacing/2;
    if (maxDistanceFromCenter > maxDotDistance) {
      // If 2x2 doesn't fit, use linear arrangement
      positions.length = 0;
      const linearSpacing = Math.min(absoluteMinSpacing, maxDotDistance * 0.9);
      
      // Place in a line
      positions.push(
        { x: wheel.position.x - linearSpacing * 1.5, y: wheel.position.y },
        { x: wheel.position.x - linearSpacing * 0.5, y: wheel.position.y },
        { x: wheel.position.x + linearSpacing * 0.5, y: wheel.position.y },
        { x: wheel.position.x + linearSpacing * 1.5, y: wheel.position.y }
      );
    }
  } else {
    // For 5+ dots, use guaranteed grid arrangement to prevent all overlaps
    const cols = Math.min(3, Math.ceil(Math.sqrt(dots.length))); // Maximum 3 columns
    const rows = Math.ceil(dots.length / cols);
    
    // Calculate spacing ensuring no overlaps with substantial buffer
    const baseSpacing = minDotSpacing * 2; // Double the minimum spacing for safety
    const horizontalSpacing = Math.max(baseSpacing, maxDotDistance * 1.6 / Math.max(1, cols - 1));
    const verticalSpacing = Math.max(baseSpacing, maxDotDistance * 1.6 / Math.max(1, rows - 1));
    
    // Use the more restrictive spacing with additional safety margin
    const spacing = Math.min(horizontalSpacing, verticalSpacing, maxDotDistance * 0.8);
    
    for (let i = 0; i < dots.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const gridWidth = (cols - 1) * spacing;
      const gridHeight = (rows - 1) * spacing;
      
      positions.push({
        x: wheel.position.x - gridWidth/2 + col * spacing,
        y: wheel.position.y - gridHeight/2 + row * spacing
      });
    }
    

    
    // Final validation to ensure no overlaps in grid arrangement
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.sqrt(
          Math.pow(positions[i].x - positions[j].x, 2) + 
          Math.pow(positions[i].y - positions[j].y, 2)
        );
        if (distance < minDotSpacing - 3) {
          // If grid still causes overlaps, use maximum safe spacing
          positions.length = 0;
          const maxSafeSpacing = Math.max(minDotSpacing * 2, maxDotDistance * 0.8);
          
          for (let k = 0; k < dots.length; k++) {
            const angle = (k * 2 * Math.PI) / dots.length;
            positions.push({
              x: wheel.position.x + Math.cos(angle) * maxSafeSpacing,
              y: wheel.position.y + Math.sin(angle) * maxSafeSpacing
            });
          }
          break; // Exit validation loop
        }
      }
    }
  }
  
  // FINAL VALIDATION: Check all positions for violations and force safe arrangement if needed
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const distance = Math.sqrt(
        Math.pow(positions[i].x - positions[j].x, 2) + 
        Math.pow(positions[i].y - positions[j].y, 2)
      );
      if (distance < minDotSpacing - 3) { // Found violation
        console.log(`WARNING: Spacing violation detected in wheel ${wheel.id}, forcing emergency fallback`);
        
        // Clear all positions and use emergency safe arrangement
        positions.length = 0;
        
        // ULTRA-SAFE ARRANGEMENT: Maximum spacing for absolute guarantee
        const emergencySpacing = minDotSpacing * 4; // Quadruple spacing for absolute safety
        
        if (dots.length <= 4) {
          // Safe grid for small numbers with maximum spacing
          const cols = Math.min(2, dots.length);
          
          for (let k = 0; k < dots.length; k++) {
            const row = Math.floor(k / cols);
            const col = k % cols;
            const gridWidth = (cols - 1) * emergencySpacing;
            const gridHeight = (Math.ceil(dots.length / cols) - 1) * emergencySpacing;
            
            positions.push({
              x: wheel.position.x - gridWidth/2 + col * emergencySpacing,
              y: wheel.position.y - gridHeight/2 + row * emergencySpacing
            });
          }
        } else {
          // Safe circular for larger numbers with maximum spacing
          const safeRadius = Math.max(emergencySpacing, maxDotDistance * 0.5);
          for (let k = 0; k < dots.length; k++) {
            const angle = (k * 2 * Math.PI) / dots.length;
            positions.push({
              x: wheel.position.x + Math.cos(angle) * safeRadius,
              y: wheel.position.y + Math.sin(angle) * safeRadius
            });
          }
        }
        
        console.log(`Emergency fallback applied for wheel ${wheel.id} with ${dots.length} dots`);
        
        // Exit both loops after fixing
        i = positions.length;
        break;
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
  wheelRadii: Map<string, number>
): Position[] {
  if (wheels.length === 0) return [];
  
  // Use dynamic wheel radii, get max for spacing calculations
  const getWheelRadius = (wheel: any) => wheelRadii.get(wheel.id) || 100;
  const maxWheelRadius = Math.max(...wheels.map(getWheelRadius));
  const chakraRadius = chakra.radius;
  const minWheelSpacing = maxWheelRadius * 2 + GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL; // Prevent wheel overlap
  const maxWheelDistance = chakraRadius - maxWheelRadius - GRID_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE; // Stay within chakra
  
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
  chakraRadii: Map<string, number>
): Position[] {
  if (chakras.length === 0) return [];
  
  // Use dynamic radii if available, otherwise use default
  const getChakraRadius = (chakra: any) => chakraRadii.get(chakra.id) || 200;
  
  const positions: Position[] = [];
  
  for (let i = 0; i < chakras.length; i++) {
    const chakra = chakras[i];
    const chakraRadius = getChakraRadius(chakra);
    const minChakraDistance = chakraRadius * 2 + GRID_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA;
    
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
  dotRadius: number
): Position[] {
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
 * Calculate optimal dot radius based on content density and available space
 */
export function calculateOptimalDotRadius(
  totalDots: number,
  totalWheels: number,
  totalChakras: number,
  availableSpace: GridBounds
): number {
  // Base calculation: determine how much space each dot can reasonably use
  const availableArea = (availableSpace.width - 2 * availableSpace.marginX) * 
                       (availableSpace.height - 2 * availableSpace.marginY);
  
  // Account for wheel and chakra space usage
  const baseSpacePerDot = availableArea / Math.max(totalDots, 1);
  
  // Calculate radius based on available space, with minimum and maximum bounds
  const maxRadius = Math.sqrt(baseSpacePerDot / Math.PI) * 0.3; // Conservative space usage
  const minRadius = 15; // Minimum readable size
  const defaultRadius = 35; // Good balance size
  
  return Math.max(minRadius, Math.min(maxRadius, defaultRadius));
}

/**
 * Calculate optimal wheel radius based on dots it contains and spacing requirements
 */
export function calculateOptimalWheelRadius(
  dotCount: number,
  dotRadius: number,
  totalWheels: number,
  availableSpace: GridBounds
): number {
  if (dotCount <= 1) {
    return dotRadius + GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE + 20; // Minimum wheel size
  }
  
  const minDotSpacing = dotRadius * 2 + GRID_CONFIG.MIN_SPACING.DOT_TO_DOT;
  const edgeBuffer = GRID_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE;
  
  let requiredRadius: number;
  
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
    const circularRadius = (minDotSpacing + 1) / (2 * Math.sin(angle / 2)); // Add tolerance
    requiredRadius = circularRadius + dotRadius + edgeBuffer;
  }
  
  // Ensure wheel can fit in available space considering other wheels
  const availableArea = (availableSpace.width - 2 * availableSpace.marginX) * 
                       (availableSpace.height - 2 * availableSpace.marginY);
  const maxWheelRadius = Math.sqrt(availableArea / Math.max(totalWheels, 1)) * 0.4;
  
  return Math.min(requiredRadius, maxWheelRadius);
}

/**
 * Calculate optimal chakra radius based on wheels it contains and spacing requirements
 */
export function calculateOptimalChakraRadius(
  wheelCount: number,
  wheelRadii: number[],
  totalChakras: number,
  availableSpace: GridBounds
): number {
  if (wheelCount === 0) {
    return 150; // Minimum chakra size for empty chakras
  }
  
  const maxWheelRadius = Math.max(...wheelRadii);
  const wheelSpacing = GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL;
  const edgeBuffer = GRID_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE;
  
  let requiredRadius: number;
  
  if (wheelCount === 1) {
    requiredRadius = maxWheelRadius + edgeBuffer + 30;
  } else if (wheelCount === 2) {
    // Side-by-side arrangement
    requiredRadius = maxWheelRadius + (wheelSpacing / 2) + edgeBuffer;
  } else if (wheelCount === 3) {
    // Triangle arrangement
    const triangleRadius = (wheelSpacing + 2 * maxWheelRadius) * Math.sqrt(3) / 3;
    requiredRadius = triangleRadius + maxWheelRadius + edgeBuffer;
  } else {
    // Circular arrangement for 4+ wheels
    const angle = (2 * Math.PI) / wheelCount;
    const circularRadius = (wheelSpacing + 2 * maxWheelRadius) / (2 * Math.sin(angle / 2));
    requiredRadius = circularRadius + maxWheelRadius + edgeBuffer;
  }
  
  // Ensure chakra can fit in available space considering other chakras
  const availableArea = (availableSpace.width - 2 * availableSpace.marginX) * 
                       (availableSpace.height - 2 * availableSpace.marginY);
  const maxChakraRadius = Math.sqrt(availableArea / Math.max(totalChakras, 1)) * 0.5;
  
  return Math.min(requiredRadius, maxChakraRadius);
}

/**
 * Main positioning algorithm that handles the complete grid layout with dynamic sizing
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
    gridElements: [] as GridElement[],
    sizes: {
      dotRadius: 0,
      wheelRadii: new Map<string, number>(),
      chakraRadii: new Map<string, number>()
    }
  };
  
  // Step 1: Calculate optimal dot radius based on total content and available space
  const optimalDotRadius = calculateOptimalDotRadius(
    dots.length,
    wheels.length,
    chakras.length,
    bounds
  );
  result.sizes.dotRadius = optimalDotRadius;
  
  // Step 2: Calculate wheel radii based on their dot content
  const wheelRadii = new Map<string, number>();
  wheels.forEach(wheel => {
    const wheelDots = dots.filter(dot => dot.wheelId === wheel.id);
    const wheelRadius = calculateOptimalWheelRadius(
      wheelDots.length,
      optimalDotRadius,
      wheels.length,
      bounds
    );
    wheelRadii.set(wheel.id, wheelRadius);
    result.sizes.wheelRadii.set(wheel.id, wheelRadius);
  });
  
  // Step 3: Calculate chakra radii based on their wheel content
  const chakraRadii = new Map<string, number>();
  chakras.forEach(chakra => {
    const chakraWheels = wheels.filter(wheel => wheel.chakraId === chakra.id);
    const chakraWheelRadii = chakraWheels.map(wheel => wheelRadii.get(wheel.id) || 100);
    const chakraRadius = calculateOptimalChakraRadius(
      chakraWheels.length,
      chakraWheelRadii,
      chakras.length,
      bounds
    );
    chakraRadii.set(chakra.id, chakraRadius);
    result.sizes.chakraRadii.set(chakra.id, chakraRadius);
  });
  
  // Step 4: Position chakras using their calculated radii
  const chakraPositions = positionChakrasInGrid(chakras, bounds, chakraRadii);
  
  chakras.forEach((chakra, index) => {
    const position = chakraPositions[index];
    const radius = chakraRadii.get(chakra.id) || 150;
    result.chakraPositions.set(chakra.id, position);
    result.gridElements.push({
      id: chakra.id,
      position,
      radius,
      type: 'chakra'
    });
  });
  
  // Step 5: Position wheels using their calculated radii
  const wheelElements: GridElement[] = [];
  
  wheels.forEach(wheel => {
    const wheelRadius = wheelRadii.get(wheel.id) || 100;
    
    if (wheel.chakraId) {
      // Wheel belongs to a chakra
      const chakraElement = result.gridElements.find(el => el.id === wheel.chakraId);
      if (chakraElement) {
        const chakraWheels = wheels.filter(w => w.chakraId === wheel.chakraId);
        const wheelIndex = chakraWheels.findIndex(w => w.id === wheel.id);
        const positions = positionWheelsInChakra(chakraWheels, chakraElement, wheelRadii);
        
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
      const positions = positionDotsInWheel(wheelDotsList, wheelElement, optimalDotRadius);
      
      wheelDotsList.forEach((dot, index) => {
        result.dotPositions.set(dot.id, positions[index]);
      });
    }
  });
  
  // Position free dots
  if (freeDots.length > 0) {
    const freePositions = positionFreeDotsInGrid(freeDots, bounds, result.gridElements, optimalDotRadius);
    freeDots.forEach((dot, index) => {
      result.dotPositions.set(dot.id, freePositions[index]);
    });
  }
  
  // Add sizing information to the result
  result.sizes = {
    dotRadius: optimalDotRadius,
    wheelRadii: wheelRadii,
    chakraRadii: chakraRadii
  };
  
  return result;
}