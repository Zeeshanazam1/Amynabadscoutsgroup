import { useEffect, useState } from 'react';

import {
  Award,
  Compass,
  ImageIcon,
  LogOut,
  Map,
  Menu,
  MessageCircle,
  Send,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const sess = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {};
      if (sess?.id) return { uid: sess.id };
    } catch {}
    return null;
  });
  const [activeHash, setActiveHash] = useState(window.location.hash || '#/');

  const toggleMenu = () => setIsOpen(!isOpen);

  // IMPORTANT: Use Firebase auth state, not just sessionStorage.
  // Otherwise the profile icon can appear while Firebase auth is missing,
  // causing UserProfilePage to redirect back to /auth.
  useEffect(() => {
    let unsub = null;
    let cancelled = false;

    const run = async () => {
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const { firebaseApp } = await import('../utils/firebaseConfig');
      const { listenToDocument } = await import('../utils/firestoreClient');
      const { saveUserProfile } = await import('../utils/profileManager');

      const auth = getAuth(firebaseApp);
      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (cancelled) return;
        setUser(fbUser);
        try {
          if (fbUser && fbUser.uid) {
            const docUnsub = listenToDocument('userProfiles', fbUser.uid, (doc) => {
              if (!doc) return;
              try { saveUserProfile({ uid: doc.id, ...doc }); } catch { void 0; }
              try {
                const sess = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {};
                if (sess.id === fbUser.uid) {
                  const updated = { ...sess, name: doc.name || sess.name, email: doc.email || sess.email };
                  sessionStorage.setItem('scouts_user_session', JSON.stringify(updated));
                }
              } catch { void 0; }
            });

            fbUser._profileUnsub = docUnsub;
          }
        } catch {
          // ignore
        }
      });
    };

    run();

    return () => {
      cancelled = true;
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || '#/');
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Ensure the correct user/session state even if firebase auth is still resolving
  useEffect(() => {
    try {
      const sess = JSON.parse(sessionStorage.getItem('scouts_user_session')) || {};
      if (!sess?.id) return;
      // Only keep minimal user presence; Firebase listener will replace with full user later.
      setUser((prev) => prev || { uid: sess.id });
    } catch {}
  }, []);


  const handleSignOut = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const { firebaseApp } = await import('../utils/firebaseConfig');
      const auth = getAuth(firebaseApp);
      await signOut(auth);
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem('scouts_user_session');
    } catch { void 0; }
    setUser(null);
    window.location.hash = '#/home';
  };

  const links = [
    { label: 'Home', href: '#/', icon: Compass },
    { label: 'Badges', href: '#/badges', icon: Award },
    { label: 'Chat', href: '#/chat', icon: MessageCircle },
    { label: 'Shop', href: '#/shop', icon: ShoppingBag },
    { label: 'Event Gallery', href: '#/event-gallery', icon: ImageIcon },
    { label: 'Results', href: '#/results', icon: Map },
    { label: 'Get In Touch', href: '#/contact', isGetInTouch: true, icon: Send },
  ];

  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  const isActiveLink = (href) => {
    if (href === '#/') return activeHash === '#/' || activeHash === '#/home' || activeHash === '';
    return activeHash.startsWith(href);
  };

  return (
    <nav
      className="scout-nav shadow-lg sticky top-0 z-50"
      style={{
        background: 'linear-gradient(90deg, var(--color-header), var(--color-primary), var(--color-header))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#/" className="relative flex items-center space-x-3 group">
            <img src={logoSrc} alt="Amynabad Scouts logo" className="scout-brand-badge w-10 h-10 rounded-full object-cover" />
            <span className="text-xl font-bold text-white hidden sm:inline">Amynabad Scouts</span>
          </a>

          <div className="hidden md:flex items-center gap-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={
                    link.isGetInTouch
                      ? 'scout-contact-chip ml-2 inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 text-gray-100 px-3 py-1.5 rounded-xl transition-colors border border-white/10'
                      : `scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium ${isActiveLink(link.href) ? 'is-active' : ''}`
                  }
                >
                  {link.isGetInTouch ? (
                    <div className="flex items-center gap-3 leading-tight">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Icon size={17} className="text-[var(--color-accent)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-white leading-none">Zeeshan Azam</div>
                        <div className="text-[11px] text-gray-200 leading-none">Web Developer</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Icon size={16} aria-hidden="true" />
                      <span>{link.label}</span>
                    </>
                  )}
                </a>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3">
                <a
                  href="#/profile"
                  className={`scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium ${isActiveLink('#/profile') ? 'is-active' : ''}`}
                  title="Profile"
                >
                  <User size={20} className="inline-block" />
                </a>
                <button
                  onClick={handleSignOut}
                  className="text-gray-200 hover:text-[var(--color-accent)] transition-colors flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline"></span>
                </button>
              </div>
            ) : (
              <a
                href="#/auth"
                className={`scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium ${isActiveLink('#/auth') ? 'is-active' : ''}`}
              >
                <User size={16} aria-hidden="true" />
                <span>Login</span>
              </a>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none rounded-full border border-white/20 p-2 bg-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="scout-mobile-menu md:hidden pb-4 pt-3" style={{ borderTop: '1px solid rgba(216, 194, 142, 0.35)' }}>
            {/* Mobile auth actions */}
            <div className="px-4 py-2 border-b border-white/10">
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <a
                    href="#/profile"
                    onClick={() => setIsOpen(false)}
                    className="scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium flex-1 justify-center"
                    title="Profile"
                  >
                    <User size={18} className="inline-block" />
                  </a>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="text-gray-200 hover:text-[var(--color-accent)] transition-colors flex items-center justify-center gap-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <a
                  href="#/auth"
                  onClick={() => setIsOpen(false)}
                  className="scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium"
                >
                  <User size={18} aria-hidden="true" />
                  <span className="ml-2">Login</span>
                </a>
              )}
            </div>

            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={
                    link.isGetInTouch
                      ? 'scout-contact-chip block py-2 px-4 rounded transition-colors bg-white/10 hover:bg-white/15 text-gray-100 border border-white/10'
                      : `scout-nav-link py-2 px-4 text-gray-200 hover:text-[var(--color-secondary)] hover:bg-[rgba(109,40,217,0.12)] rounded transition-colors ${isActiveLink(link.href) ? 'is-active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.isGetInTouch ? (
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-[var(--color-accent)]" />
                      <div className="leading-tight">
                        <div className="font-semibold text-sm text-white">Zeeshan Azam</div>
                        <div className="text-xs text-gray-200">Web Developer</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Icon size={16} aria-hidden="true" />
                      <span>{link.label}</span>
                    </>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
