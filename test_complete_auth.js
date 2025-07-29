// Complete authentication test to verify the entire flow
async function testCompleteAuth() {
  console.log('=== COMPLETE AUTHENTICATION FLOW TEST ===');
  
  // Step 1: Clear any existing sessions
  console.log('\n1. Clearing existing sessions...');
  try {
    await fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    console.log('✓ Cleared existing sessions');
  } catch (error) {
    console.log('No existing session to clear');
  }
  
  // Step 2: Verify no authentication
  console.log('\n2. Verifying clean state...');
  const statusResponse1 = await fetch('http://localhost:5000/api/auth/status', {
    credentials: 'include'
  });
  const status1 = await statusResponse1.json();
  console.log('Status before auth:', status1);
  
  // Step 3: Sign in with Google (simulate)
  console.log('\n3. Signing in with Google...');
  const authResponse = await fetch('http://localhost:5000/api/auth/firebase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      firebaseToken: 'test_real_user_token',
      email: 'realuser@gmail.com',
      uid: 'real_firebase_uid_456',
      displayName: 'Real Test User',
      photoURL: 'https://lh3.googleusercontent.com/test-photo'
    })
  });
  
  const authResult = await authResponse.json();
  console.log('Auth result:', authResult);
  
  // Step 4: Verify authentication with same session
  console.log('\n4. Verifying authentication...');
  const statusResponse2 = await fetch('http://localhost:5000/api/auth/status', {
    credentials: 'include'
  });
  const status2 = await statusResponse2.json();
  console.log('Status after auth:', status2);
  
  // Step 5: Test data access
  console.log('\n5. Testing data access...');
  const dotsResponse = await fetch('http://localhost:5000/api/dots', {
    credentials: 'include'
  });
  const dots = await dotsResponse.json();
  console.log('User dots:', dots.length, 'dots found');
  
  // Step 6: Create a test dot
  console.log('\n6. Creating test dot...');
  const createResponse = await fetch('http://localhost:5000/api/dots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      summary: 'Authentication test dot',
      anchor: 'Testing complete frontend-backend auth flow',
      pulse: 'confident',
      sourceType: 'text'
    })
  });
  
  if (createResponse.ok) {
    const newDot = await createResponse.json();
    console.log('✓ Dot created successfully:', newDot.id);
  } else {
    console.log('✗ Dot creation failed:', createResponse.status);
  }
  
  // Step 7: Verify dot retrieval
  console.log('\n7. Verifying dot retrieval...');
  const dotsResponse2 = await fetch('http://localhost:5000/api/dots', {
    credentials: 'include'
  });
  const dots2 = await dotsResponse2.json();
  console.log('Updated dots count:', dots2.length);
  
  console.log('\n=== AUTHENTICATION TEST COMPLETE ===');
  console.log('Summary:');
  console.log('- User created/logged in:', authResult.email);
  console.log('- Authentication working:', status2.authenticated);
  console.log('- User profile:', status2.user?.fullName || status2.user?.email);
  console.log('- Dots accessible:', dots2.length > 0 ? 'Yes' : 'No');
}

// Run the test
testCompleteAuth().catch(console.error);