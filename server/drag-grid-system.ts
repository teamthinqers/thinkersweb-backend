/**
 * Draggable Grid System for DotSpark
 * 
 * Complete rebuild of the grid positioning system to support manual drag-and-drop
 * positioning of dots, wheels, and chakras with real-time collision detection.
 */

export interface DragPosition {
  x: number;
  y: number;
  id: string;
  type: 'dot' | 'wheel' | 'chakra';
  radius: number;
  lastModified: Date;
}

export interface DragConstraints {
  parentId?: string;
  parentType?: 'wheel' | 'chakra';
  parentPosition?: { x: number; y: number };
  parentRadius?: number;
  canvasWidth: number;
  canvasHeight: number;
  marginX: number;
  marginY: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  collidingWith?: string[];
  suggestedPosition?: { x: number; y: number };
}

export const DRAG_CONFIG = {
  // Enhanced grid dimensions for draggable experience
  CANVAS_WIDTH: 2800,
  CANVAS_HEIGHT: 1800,
  MARGIN_X: 200,
  MARGIN_Y: 200,
  
  // Minimum spacing requirements (same as before)
  MIN_SPACING: {
    DOT_TO_DOT: 40,
    WHEEL_TO_WHEEL: 180,
    CHAKRA_TO_CHAKRA: 360,
    DOT_TO_WHEEL_EDGE: 20,
    WHEEL_TO_CHAKRA_EDGE: 40
  },
  
  // Snap-to-grid settings
  SNAP_GRID: {
    ENABLED: true,
    SIZE: 20, // 20px grid for smooth positioning
    SNAP_THRESHOLD: 10 // Snap when within 10px of grid point
  },
  
  // Animation settings for smooth movements
  ANIMATION: {
    DURATION: 200, // milliseconds
    EASING: 'ease-out'
  }
};

/**
 * Check collision between two elements during drag operation
 */
export function checkDragCollision(
  dragPosition: { x: number; y: number },
  dragRadius: number,
  targetPosition: { x: number; y: number },
  targetRadius: number,
  minSpacing: number
): boolean {
  const distance = Math.sqrt(
    Math.pow(dragPosition.x - targetPosition.x, 2) + 
    Math.pow(dragPosition.y - targetPosition.y, 2)
  );
  return distance < (dragRadius + targetRadius + minSpacing);
}

/**
 * Validate if a position is within parent constraints
 */
export function validateParentConstraints(
  position: { x: number; y: number },
  elementRadius: number,
  constraints: DragConstraints
): boolean {
  // Check canvas boundaries
  const withinCanvas = (
    position.x - elementRadius >= constraints.marginX &&
    position.x + elementRadius <= constraints.canvasWidth - constraints.marginX &&
    position.y - elementRadius >= constraints.marginY &&
    position.y + elementRadius <= constraints.canvasHeight - constraints.marginY
  );
  
  if (!withinCanvas) return false;
  
  // Check parent boundaries (for dots in wheels or wheels in chakras)
  if (constraints.parentPosition && constraints.parentRadius) {
    const parentCenterDistance = Math.sqrt(
      Math.pow(position.x - constraints.parentPosition.x, 2) + 
      Math.pow(position.y - constraints.parentPosition.y, 2)
    );
    
    const bufferDistance = constraints.parentType === 'chakra' 
      ? DRAG_CONFIG.MIN_SPACING.WHEEL_TO_CHAKRA_EDGE 
      : DRAG_CONFIG.MIN_SPACING.DOT_TO_WHEEL_EDGE;
    
    const maxAllowedDistance = constraints.parentRadius - elementRadius - bufferDistance;
    return parentCenterDistance <= maxAllowedDistance;
  }
  
  return true;
}

/**
 * Check for collisions with all other elements
 */
export function checkAllCollisions(
  dragPosition: { x: number; y: number },
  dragElementId: string,
  dragRadius: number,
  allElements: DragPosition[]
): CollisionResult {
  const collidingWith: string[] = [];
  
  for (const element of allElements) {
    if (element.id === dragElementId) continue; // Skip self
    
    // Determine minimum spacing based on element types
    let minSpacing = DRAG_CONFIG.MIN_SPACING.DOT_TO_DOT; // Default
    
    if (element.type === 'wheel') {
      minSpacing = DRAG_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL;
    } else if (element.type === 'chakra') {
      minSpacing = DRAG_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA;
    }
    
    if (checkDragCollision(dragPosition, dragRadius, element, element.radius, minSpacing)) {
      collidingWith.push(element.id);
    }
  }
  
  return {
    hasCollision: collidingWith.length > 0,
    collidingWith: collidingWith.length > 0 ? collidingWith : undefined
  };
}

/**
 * Snap position to grid if enabled and within threshold
 */
export function snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
  if (!DRAG_CONFIG.SNAP_GRID.ENABLED) return position;
  
  const gridSize = DRAG_CONFIG.SNAP_GRID.SIZE;
  const threshold = DRAG_CONFIG.SNAP_GRID.SNAP_THRESHOLD;
  
  const nearestGridX = Math.round(position.x / gridSize) * gridSize;
  const nearestGridY = Math.round(position.y / gridSize) * gridSize;
  
  const snapX = Math.abs(position.x - nearestGridX) <= threshold ? nearestGridX : position.x;
  const snapY = Math.abs(position.y - nearestGridY) <= threshold ? nearestGridY : position.y;
  
  return { x: snapX, y: snapY };
}

/**
 * Find nearest valid position when drag is invalid
 */
export function findNearestValidPosition(
  targetPosition: { x: number; y: number },
  elementId: string,
  elementRadius: number,
  constraints: DragConstraints,
  allElements: DragPosition[],
  maxSearchRadius: number = 200
): { x: number; y: number } | null {
  const searchStep = 10; // Search in 10px increments
  
  for (let radius = searchStep; radius <= maxSearchRadius; radius += searchStep) {
    // Try positions in a circle around the target
    const angleStep = Math.PI / 8; // 22.5 degree steps
    
    for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
      const candidatePosition = {
        x: targetPosition.x + Math.cos(angle) * radius,
        y: targetPosition.y + Math.sin(angle) * radius
      };
      
      // Check if this position is valid
      if (validateParentConstraints(candidatePosition, elementRadius, constraints)) {
        const collisionResult = checkAllCollisions(candidatePosition, elementId, elementRadius, allElements);
        
        if (!collisionResult.hasCollision) {
          return snapToGrid(candidatePosition);
        }
      }
    }
  }
  
  return null; // No valid position found
}

/**
 * Calculate initial positions for new elements using improved algorithm
 */
export function calculateInitialPosition(
  elementType: 'dot' | 'wheel' | 'chakra',
  elementRadius: number,
  constraints: DragConstraints,
  allElements: DragPosition[]
): { x: number; y: number } {
  const { canvasWidth, canvasHeight, marginX, marginY } = constraints;
  
  // Define search areas based on element type
  let searchAreas: { x: number; y: number; weight: number }[] = [];
  
  if (elementType === 'chakra') {
    // Chakras prefer corner and edge positions
    searchAreas = [
      { x: marginX + elementRadius + 100, y: marginY + elementRadius + 100, weight: 1.0 },
      { x: canvasWidth - marginX - elementRadius - 100, y: marginY + elementRadius + 100, weight: 1.0 },
      { x: marginX + elementRadius + 100, y: canvasHeight - marginY - elementRadius - 100, weight: 1.0 },
      { x: canvasWidth - marginX - elementRadius - 100, y: canvasHeight - marginY - elementRadius - 100, weight: 1.0 },
      { x: canvasWidth / 2, y: marginY + elementRadius + 100, weight: 0.8 },
      { x: canvasWidth / 2, y: canvasHeight - marginY - elementRadius - 100, weight: 0.8 }
    ];
  } else if (elementType === 'wheel') {
    // Wheels prefer positions within or near chakras
    if (constraints.parentPosition) {
      // Inside parent chakra
      const parentX = constraints.parentPosition.x;
      const parentY = constraints.parentPosition.y;
      const parentR = constraints.parentRadius || 300;
      
      searchAreas = [
        { x: parentX, y: parentY, weight: 1.0 }, // Center
        { x: parentX - parentR * 0.3, y: parentY - parentR * 0.3, weight: 0.9 },
        { x: parentX + parentR * 0.3, y: parentY - parentR * 0.3, weight: 0.9 },
        { x: parentX - parentR * 0.3, y: parentY + parentR * 0.3, weight: 0.9 },
        { x: parentX + parentR * 0.3, y: parentY + parentR * 0.3, weight: 0.9 }
      ];
    } else {
      // Independent wheel - distribute across canvas
      searchAreas = [
        { x: canvasWidth * 0.3, y: canvasHeight * 0.3, weight: 1.0 },
        { x: canvasWidth * 0.7, y: canvasHeight * 0.3, weight: 1.0 },
        { x: canvasWidth * 0.3, y: canvasHeight * 0.7, weight: 1.0 },
        { x: canvasWidth * 0.7, y: canvasHeight * 0.7, weight: 1.0 },
        { x: canvasWidth * 0.5, y: canvasHeight * 0.5, weight: 0.8 }
      ];
    }
  } else { // dot
    // Dots prefer positions within wheels
    if (constraints.parentPosition) {
      // Inside parent wheel
      const parentX = constraints.parentPosition.x;
      const parentY = constraints.parentPosition.y;
      const parentR = constraints.parentRadius || 150;
      
      searchAreas = [
        { x: parentX, y: parentY, weight: 1.0 }, // Center
        { x: parentX - parentR * 0.4, y: parentY, weight: 0.9 },
        { x: parentX + parentR * 0.4, y: parentY, weight: 0.9 },
        { x: parentX, y: parentY - parentR * 0.4, weight: 0.9 },
        { x: parentX, y: parentY + parentR * 0.4, weight: 0.9 }
      ];
    } else {
      // Free dot - distribute evenly
      const cols = 4;
      const rows = 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          searchAreas.push({
            x: marginX + (c + 1) * (canvasWidth - 2 * marginX) / (cols + 1),
            y: marginY + (r + 1) * (canvasHeight - 2 * marginY) / (rows + 1),
            weight: 1.0
          });
        }
      }
    }
  }
  
  // Try each search area in order of preference
  for (const area of searchAreas.sort((a, b) => b.weight - a.weight)) {
    const validPosition = findNearestValidPosition(
      area, 
      `temp-${Date.now()}`, 
      elementRadius, 
      constraints, 
      allElements, 
      150
    );
    
    if (validPosition) {
      return validPosition;
    }
  }
  
  // Fallback: center of available space
  const fallbackX = constraints.parentPosition?.x || (canvasWidth / 2);
  const fallbackY = constraints.parentPosition?.y || (canvasHeight / 2);
  
  return snapToGrid({ x: fallbackX, y: fallbackY });
}

// All exports are already declared above with their interfaces and constants