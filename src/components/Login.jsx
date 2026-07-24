import { useEffect, useState } from 'react';

// Login page for public users — uses Google Identity Services (client-side)
export default function Login() {
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load Google Identity Services script if not already present
    if (window.google && window.google.accounts) {
      queueMicrotask(() => setGoogleLoaded(true));
      return;
    }


    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => setMessage('Failed to load Google Identity Services script');
    document.head.appendChild(script);

    return () => {
      // Do not remove script on unmount to avoid reloading repeatedly
    };
  }, []);

  useEffect(() => {
    if (!googleLoaded) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || window.__GOOGLE_CLIENT_ID__;
    if (!clientId) {
      queueMicrotask(() => setMessage('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.'));
      return;
    }


    try {
      const handleCredentialResponse = (response) => {
        // response.credential is the ID token (JWT). Do NOT trust it on the client.
        // Send it to your backend to verify and create a session.
        if (!response || !response.credential) {
          queueMicrotask(() => setMessage('No credential received from Google'));
          return;
        }

        // Save token temporarily for client-side UI (for demo only)
        sessionStorage.setItem('google_id_token', response.credential);

        // Decode basic info from JWT to show user name/email (optional)
        try {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          queueMicrotask(() => setMessage(`Signed in as ${payload.name || payload.email}`));

          // After successful sign-in, redirect or update app state as needed
          // Example: navigate back to home
          setTimeout(() => {
            window.location.hash = '#/';
          }, 900);
        } catch (err) {
          console.error('Failed to parse ID token', err);
          queueMicrotask(() => setMessage('Signed in (token received)'));
        }
      };

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });


      // Render the Google Sign-In button into the container
      window.google.accounts.id.renderButton(
        document.getElementById('g_id_signin'),
        { theme: 'outline', size: 'large', width: '300' } // customization
      );

      // Optional: show One Tap prompt (commented out by default)
      // window.google.accounts.id.prompt();
    } catch (err) {
      console.error('Google init error', err);
      queueMicrotask(() => setMessage('Failed to initialize Google Sign-In'));
    }

  }, [googleLoaded]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#312e81] via-[#5b21b6] to-[#9333ea] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-4 shadow-lg shadow-purple-500/30">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Amynabad Scouts Login</h1>
          <p className="text-purple-200 mt-2">Secure sign-in for scouts, leaders, and volunteers.</p>
        </div>

        <div className="bg-white/10 border border-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 text-center text-white">
          <div id="g_id_signin" className="flex justify-center"></div>

          <div className="text-sm text-purple-100">
            <p>By signing in you agree to share basic profile info (name, email) with this site.</p>
            <p className="mt-2">For production, send the ID token to your backend and verify it with Google's token verification.</p>
          </div>

          {message && (
            <div className="mt-4 text-sm text-amber-200">{message}</div>
          )}

          {!googleLoaded && (
            <div className="mt-4 text-sm text-red-300">Loading Google Sign-In...</div>
          )}
        </div>

        <p className="text-purple-200 text-center text-sm mt-6">If you prefer, use the admin panel for site management (admin users only).</p>
      </div>
    </div>
  );
}
