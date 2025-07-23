#!/usr/bin/env node

// Simple spacing validation test for DotSpark grid positioning
const GRID_CONFIG = {
  DOT_RADIUS: { PREVIEW: 35, REAL: 45 },
  WHEEL_RADIUS: { BASE: 160, MIN: 130, MAX: 200 },
  CHAKRA_RADIUS: { PREVIEW: 420, REAL: 320 },
  MIN_SPACING: {
    DOT_TO_DOT: 40,
    WHEEL_TO_WHEEL: 180,
    CHAKRA_TO_CHAKRA: 360,
    DOT_TO_WHEEL_EDGE: 20,
    WHEEL_TO_CHAKRA_EDGE: 40
  }
};

function checkCollision(pos1, radius1, pos2, radius2, minSpacing = 0) {
  const distance = Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
  return distance < (radius1 + radius2 + minSpacing);
}

async function testSpacing() {
  console.log('🔍 Testing DotSpark spacing enforcement...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/grid/positions?preview=true');
    const data = await response.json();
    
    if (!data.success) {
      console.log('❌ API Error:', data.error);
      return;
    }
    
    const { dotPositions, wheelPositions, chakraPositions } = data.data;
    let violations = 0;
    
    // Test Chakra spacing
    console.log('📊 Testing Chakra spacing (minimum 360px edge-to-edge)...');
    const chakraIds = Object.keys(chakraPositions);
    for (let i = 0; i < chakraIds.length; i++) {
      for (let j = i + 1; j < chakraIds.length; j++) {
        const chakra1Id = chakraIds[i];
        const chakra2Id = chakraIds[j];
        const chakra1Pos = chakraPositions[chakra1Id];
        const chakra2Pos = chakraPositions[chakra2Id];
        const hasCollision = checkCollision(
          chakra1Pos, 
          GRID_CONFIG.CHAKRA_RADIUS.PREVIEW,
          chakra2Pos, 
          GRID_CONFIG.CHAKRA_RADIUS.PREVIEW,
          GRID_CONFIG.MIN_SPACING.CHAKRA_TO_CHAKRA
        );
        
        if (hasCollision) {
          console.log(`❌ VIOLATION: Chakras ${chakra1Id} and ${chakra2Id} overlap`);
          violations++;
        }
      }
    }
    
    // Test Wheel spacing
    console.log('📊 Testing Wheel spacing (minimum 180px edge-to-edge)...');
    const wheelIds = Object.keys(wheelPositions);
    for (let i = 0; i < wheelIds.length; i++) {
      for (let j = i + 1; j < wheelIds.length; j++) {
        const wheel1Id = wheelIds[i];
        const wheel2Id = wheelIds[j];
        const wheel1Pos = wheelPositions[wheel1Id];
        const wheel2Pos = wheelPositions[wheel2Id];
        const hasCollision = checkCollision(
          wheel1Pos, 
          GRID_CONFIG.WHEEL_RADIUS.BASE,
          wheel2Pos, 
          GRID_CONFIG.WHEEL_RADIUS.BASE,
          GRID_CONFIG.MIN_SPACING.WHEEL_TO_WHEEL
        );
        
        if (hasCollision) {
          console.log(`❌ VIOLATION: Wheels ${wheel1Id} and ${wheel2Id} overlap`);
          violations++;
        }
      }
    }
    
    // Test Dot spacing within same wheel  
    console.log('📊 Testing Dot spacing (minimum 40px edge-to-edge)...');
    const dotIds = Object.keys(dotPositions);
    for (let i = 0; i < dotIds.length; i++) {
      for (let j = i + 1; j < dotIds.length; j++) {
        const dot1Id = dotIds[i];
        const dot2Id = dotIds[j];
        const dot1Pos = dotPositions[dot1Id];
        const dot2Pos = dotPositions[dot2Id];
        const hasCollision = checkCollision(
          dot1Pos, 
          GRID_CONFIG.DOT_RADIUS.PREVIEW,
          dot2Pos, 
          GRID_CONFIG.DOT_RADIUS.PREVIEW,
          GRID_CONFIG.MIN_SPACING.DOT_TO_DOT
        );
        
        if (hasCollision) {
          console.log(`❌ VIOLATION: Dots ${dot1Id} and ${dot2Id} overlap`);
          violations++;
        }
      }
    }
    
    console.log(`\n📋 Test Results:`);
    console.log(`  Chakras tested: ${chakraIds.length}`);
    console.log(`  Wheels tested: ${wheelIds.length}`);
    console.log(`  Dots tested: ${dotIds.length}`);
    console.log(`  Total violations: ${violations}`);
    
    if (violations === 0) {
      console.log('✅ All spacing rules are properly enforced!');
    } else {
      console.log(`❌ Found ${violations} spacing violations that need to be fixed.`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpacing();