// Simplified positioning logic for single wheel validation

export interface Position {
  x: number;
  y: number;
}

// Simple configuration
const SIMPLE_CONFIG = {
  DOT_RADIUS: 35,
  WHEEL_RADIUS: 160,
  MIN_DOT_SPACING: 25,
  DOT_TO_WHEEL_EDGE: 20
};

/**
 * Position dots within a single wheel with strict spacing enforcement
 */
export function positionDotsInSingleWheel(
  dotCount: number,
  wheelCenterX: number = 400,
  wheelCenterY: number = 300
): Position[] {
  const positions: Position[] = [];
  const minDotSpacing = SIMPLE_CONFIG.DOT_RADIUS * 2 + SIMPLE_CONFIG.MIN_DOT_SPACING;
  const maxDotDistance = SIMPLE_CONFIG.WHEEL_RADIUS - SIMPLE_CONFIG.DOT_RADIUS - SIMPLE_CONFIG.DOT_TO_WHEEL_EDGE;
  
  if (dotCount === 0) return positions;
  
  if (dotCount === 1) {
    positions.push({ x: wheelCenterX, y: wheelCenterY });
  } else if (dotCount === 2) {
    const spacing = Math.min(maxDotDistance * 1.2, minDotSpacing);
    positions.push(
      { x: wheelCenterX - spacing/2, y: wheelCenterY },
      { x: wheelCenterX + spacing/2, y: wheelCenterY }
    );
  } else if (dotCount === 3) {
    const radius = Math.min(maxDotDistance * 0.6, (minDotSpacing * Math.sqrt(3)) / 3);
    const angles = [-Math.PI/2, Math.PI/6, 5*Math.PI/6];
    angles.forEach(angle => {
      positions.push({
        x: wheelCenterX + Math.cos(angle) * radius,
        y: wheelCenterY + Math.sin(angle) * radius
      });
    });
  } else if (dotCount === 4) {
    const diagonal = minDotSpacing * Math.sqrt(2);
    const spacing = Math.min(maxDotDistance * 1.0, diagonal);
    positions.push(
      { x: wheelCenterX - spacing/2, y: wheelCenterY - spacing/2 },
      { x: wheelCenterX + spacing/2, y: wheelCenterY - spacing/2 },
      { x: wheelCenterX - spacing/2, y: wheelCenterY + spacing/2 },
      { x: wheelCenterX + spacing/2, y: wheelCenterY + spacing/2 }
    );
  } else {
    // Circular arrangement for 5+ dots
    const circumference = 2 * Math.PI * maxDotDistance * 0.7;
    const requiredSpacing = minDotSpacing * dotCount;
    
    let radius = maxDotDistance * 0.7;
    if (circumference < requiredSpacing) {
      radius = Math.min(requiredSpacing / (2 * Math.PI), maxDotDistance * 0.9);
    }
    
    const angleStep = (2 * Math.PI) / dotCount;
    const startAngle = -Math.PI/2;
    
    for (let i = 0; i < dotCount; i++) {
      const angle = startAngle + i * angleStep;
      positions.push({
        x: wheelCenterX + Math.cos(angle) * radius,
        y: wheelCenterY + Math.sin(angle) * radius
      });
    }
  }
  
  return positions;
}

/**
 * Validate spacing rules for positioned dots
 */
export function validateDotSpacing(positions: Position[], wheelCenterX: number, wheelCenterY: number): string[] {
  const violations: string[] = [];
  
  // Check dot-to-dot spacing
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const distance = Math.sqrt(
        Math.pow(positions[i].x - positions[j].x, 2) + 
        Math.pow(positions[i].y - positions[j].y, 2)
      );
      const minDistance = SIMPLE_CONFIG.DOT_RADIUS * 2 + SIMPLE_CONFIG.MIN_DOT_SPACING;
      
      if (distance < minDistance) {
        violations.push(`Dots ${i+1} and ${j+1} too close: ${distance.toFixed(1)}px (min: ${minDistance}px)`);
      }
    }
  }
  
  // Check dot-to-wheel-edge spacing
  positions.forEach((pos, index) => {
    const distanceFromCenter = Math.sqrt(
      Math.pow(pos.x - wheelCenterX, 2) + 
      Math.pow(pos.y - wheelCenterY, 2)
    );
    const maxAllowedDistance = SIMPLE_CONFIG.WHEEL_RADIUS - SIMPLE_CONFIG.DOT_RADIUS - SIMPLE_CONFIG.DOT_TO_WHEEL_EDGE;
    
    if (distanceFromCenter > maxAllowedDistance) {
      violations.push(`Dot ${index+1} outside wheel boundary: ${distanceFromCenter.toFixed(1)}px (max: ${maxAllowedDistance}px)`);
    }
  });
  
  return violations;
}