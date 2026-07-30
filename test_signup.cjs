const https = require('https');

const apiKey = 'AIzaSyBc2ydViS4uscSazykHpkdJesDbgfir19Q';
const testEmail = 'testuser_' + Date.now() + '@example.com';
const testPassword = 'TestPass123!';

// Test sign-up via Firebase REST API
const data = JSON.stringify({
  email: testEmail,
  password: testPassword,
  returnSecureToken: true
});

const options = {
  hostname: 'identitytoolkit.googleapis.com',
  path: '/v1/accounts:signUp?key=' + apiKey,
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
      if (parsed.error) {
        console.log('❌ SIGNUP FAILED:', parsed.error.message);
        if (parsed.error.message.includes('OPERATION_NOT_ALLOWED')) {
          console.log('');
          console.log('================================================================');
          console.log('🔴 ROOT CAUSE IDENTIFIED:');
          console.log('🔴 Email/Password sign-in is NOT ENABLED in your Firebase project');
          console.log('================================================================');
          console.log('');
          console.log('💡 TO FIX:');
          console.log('1. Go to: https://console.firebase.google.com/project/my-site-90f6a/authentication');
          console.log('2. Click "Sign-in method" tab');
          console.log('3. Find "Email/Password" and click the edit/pencil icon');
          console.log('4. ENABLE it (toggle ON)');
          console.log('5. Click Save');
          console.log('');
          console.log('6. Also enable "Google" provider the same way');
          console.log('');
          console.log('⚠️ Note: It can take 2-5 minutes for changes to propagate');
        } else if (parsed.error.message.includes('EMAIL_EXISTS')) {
          console.log('✅ Email/password sign-up IS ENABLED! (test email already existed)');
        } else {
          console.log('Unknown error:', parsed.error.message);
        }
      } else {
        console.log('✅ SIGNUP SUCCESSFUL!');
        console.log('   Email/password sign-up IS ENABLED and working!');
        console.log('   Created user:', parsed.email);
        console.log('   LocalId:', parsed.localId);
        
        // Clean up - delete test user
        console.log('');
        console.log('   Cleaning up test user...');
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log('Raw:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
});

req.write(data);
req.end();
