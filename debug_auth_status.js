// Simple browser console test
console.log('🔥 Firebase Environment Check:');
console.log('API Key available:', !!window.VITE_FIREBASE_API_KEY);
console.log('Project ID available:', !!window.VITE_FIREBASE_PROJECT_ID);

// Test backend session status
fetch('/api/auth/status', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    console.log('🔍 Current Backend Session:', data);
    if (data.authenticated) {
      console.log('✅ User is authenticated in backend');
      console.log('👤 Full Name:', data.user?.fullName);
      console.log('🖼️ Avatar URL:', data.user?.avatarUrl);
    } else {
      console.log('❌ No backend session found');
    }
  })
  .catch(err => console.error('Backend session check failed:', err));