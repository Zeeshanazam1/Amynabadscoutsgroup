const https = require('https');

const apiKey = 'AIzaSyBc2ydViS4uscSazykHpkdJesDbgfir19Q';

// Test 1: Check if API key is valid by calling createAuthUri
const data = JSON.stringify({ identifier: 'test@test.com', continueUri: 'http://localhost' });
const options = {
  hostname: 'identitytoolkit.googleapis.com',
  path: '/v1/accounts:createAuthUri?key=' + apiKey,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      if (parsed.error) {
        console.log('\n❌ FIREBASE AUTH ERROR:', parsed.error.message);
        if (parsed.error.message.includes('OPERATION_NOT_ALLOWED')) {
          console.log('💡 FIX: Go to https://console.firebase.google.com/project/my-site-90f6a/authentication');
          console.log('   Enable Email/Password sign-in method!');
        } else if (parsed.error.message.includes('API_KEY_NOT_VALID')) {
          console.log('💡 FIX: API key is invalid. Get the correct one from Firebase Console.');
        }
      } else {
        console.log('\n✅ Firebase Auth API is WORKING!');
        console.log('   Sign-in methods returned:', parsed.signInMethods || 'none found (normal for test)');
      }
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
});

req.write(data);
req.end();
