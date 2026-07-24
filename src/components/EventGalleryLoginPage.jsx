import { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

const EVENT_GALLERY_CREDENTIALS = {
  username: 'adminabsu.123',
  password: 'qwertyytrewq',
};

export default function EventGalleryLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('event_gallery_auth') || 'null');
      if (saved?.authenticated) {
        window.location.hash = '#/event-gallery?upload=1';
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (username.trim() === EVENT_GALLERY_CREDENTIALS.username && password === EVENT_GALLERY_CREDENTIALS.password) {
      sessionStorage.setItem('event_gallery_auth', JSON.stringify({ authenticated: true, loginTime: Date.now() }));
      window.location.hash = '#/event-gallery?upload=1';
      return;
    }

    setError('Invalid credentials. Use the approved admin upload access details.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen px-4 py-16 text-white" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))' }}>
        <div className="px-8 py-8" style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-header))' }}>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/80">Uploader access</p>
              <h1 className="text-3xl font-bold">Event Gallery Login</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 p-8">
          <p className="text-sm leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            This page is only for the uploader login. After signing in, you will be taken to the event gallery upload view.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.78)' }}
              placeholder="adminabsu.123"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 px-4 py-3 text-white outline-none"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.78)' }}
              placeholder="qwertyytrewq"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-950 transition disabled:opacity-70"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Checking access...' : 'Login to uploader'}
          </button>
        </form>
      </div>
    </div>
  );
}
