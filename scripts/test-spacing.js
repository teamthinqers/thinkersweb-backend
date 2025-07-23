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
    
    const { dotPositions, wheelPositions, chakraPositions, sizes } = data.data;
    
    console.log('📏 Dynamic sizes from API:');
    console.log(`  - Dot radius: ${sizes?.dotRadius || 'N/A'}px`);
    console.log(`  - Wheel radii: ${Object.keys(sizes?.wheelRadii || {}).length} wheels with dynamic sizing`);
    console.log(`  - Chakra radii: ${Object.keys(sizes?.chakraRadii || {}).length} chakras with dynamic sizing\n`);
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
        const chakra1Radius = sizes?.chakraRadii?.[chakra1Id] || GRID_CONFIG.CHAKRA_RADIUS.PREVIEW;
        const chakra2Radius = sizes?.chakraRadii?.[chakra2Id] || GRID_CONFIG.CHAKRA_RADIUS.PREVIEW;
        const hasCollision = checkCollision(
          chakra1Pos, 
          chakra1Radius,
          chakra2Pos, 
          chakra2Radius,
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
        const wheel1Radius = sizes?.wheelRadii?.[wheel1Id] || GRID_CONFIG.WHEEL_RADIUS.BASE;
        const wheel2Radius = sizes?.wheelRadii?.[wheel2Id] || GRID_CONFIG.WHEEL_RADIUS.BASE;
        const hasCollision = checkCollision(
          wheel1Pos, 
          wheel1Radius,
          wheel2Pos, 
          wheel2Radius,
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
        const dotRadius = sizes?.dotRadius || GRID_CONFIG.DOT_RADIUS.PREVIEW;
        const hasCollision = checkCollision(
          dot1Pos, 
          dotRadius,
          dot2Pos, 
          dotRadius,
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