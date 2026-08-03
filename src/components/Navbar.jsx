import { useEffect, useState } from 'react';

import {
  Award,
  ChevronDown,
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
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    let unsubAuth = null;
    const initAuth = async () => {
      try {
        const { getAuth, onAuthStateChanged } = await import('firebase/auth');
        const { firebaseApp } = await import('../utils/firebaseConfig');
        const { getUserProfile, ensureUserProfile } = await import('../utils/profileManager');
        const auth = getAuth(firebaseApp);

        unsubAuth = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            const prof = getUserProfile(fbUser.uid) || ensureUserProfile(fbUser);
            const userData = {
              uid: fbUser.uid,
              name: prof?.name || fbUser.displayName || fbUser.email || 'User',
              email: fbUser.email || '',
              avatar: prof?.avatar || fbUser.photoURL || null,
              category: prof?.category || 'scout',
            };
            setUser(userData);
            try { sessionStorage.setItem('scouts_user_session', JSON.stringify(userData)); } catch {}
          } else {
            setUser(null);
            try { sessionStorage.removeItem('scouts_user_session'); } catch {}
          }
        });
      } catch (err) {
        console.error('Navbar auth sync error:', err);
      }
    };
    initAuth();
    return () => {
      if (typeof unsubAuth === 'function') unsubAuth();
    };
  }, []);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || '#/');
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  const handleSignOut = async () => {
    try {
      const { getAuth, signOut } = await import('firebase/auth');
      const { firebaseApp } = await import('../utils/firebaseConfig');
      const auth = getAuth(firebaseApp);
      await signOut(auth);
    } catch {}
    try { sessionStorage.removeItem('scouts_user_session'); } catch {}
    setUser(null);
    setProfileOpen(false);
    window.location.hash = '#/auth';
  };

  const links = [
    { label: 'Home', href: '#/', icon: Compass },
    { label: 'Badges', href: '#/badges', icon: Award },
    { label: 'Chat', href: '#/chat', icon: MessageCircle },
    { label: 'Shop', href: '#/shop', icon: ShoppingBag },
    { label: 'Event Gallery', href: '#/event-gallery', icon: ImageIcon },
    { label: 'Results', href: '#/results', icon: Map },
  ];

  const logoSrc = import.meta.env.BASE_URL + 'logo.png';

  const isActiveLink = (href) => {
    if (href === '#/') return activeHash === '#/' || activeHash === '#/home' || activeHash === '';
    return activeHash.startsWith(href);
  };

  return (
    <nav className="scout-nav shadow-lg sticky top-0 z-50" style={{ background: 'linear-gradient(90deg, var(--color-header), var(--color-primary), var(--color-header))' }}>
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
                <a key={link.label} href={link.href}
                  className={link.isGetInTouch
                    ? 'ml-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-2 text-gray-100 transition-all duration-200 hover:bg-white/25 hover:text-white border border-white/20 shadow-sm'
                    : 'scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium' + (isActiveLink(link.href) ? ' is-active' : '')}>
                  {link.isGetInTouch ? (
                    <div className="flex items-center gap-3 leading-tight">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                        <Icon size={15} className="text-[var(--color-accent)]" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Contact</span>
                    </div>
                  ) : (<><Icon size={16} aria-hidden="true" /><span>{link.label}</span></>)}
                </a>
              );
            })}
            {user ? (
              <div className="relative group flex items-center gap-2 py-1 px-1">
                {/* Profile Picture & Name (Clicking opens #/profile) */}
                <a
                  href="#/profile"
                  className="flex items-center gap-2 text-white hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
                  title="Go to Profile"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-0 opacity-0 group-hover:max-w-[5rem] group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out">
                    {(user.name || user.email || 'Profile').split(' ')[0] || 'Profile'}
                  </span>
                </a>

                {/* Logout Button (Appears on hover, clicking logs out) */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-red-200 hover:text-white max-w-0 opacity-0 group-hover:max-w-[4rem] group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out pl-1 cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="text-[11px] font-medium"></span>
                </button>
              </div>
            ) : (
              <a href="#/auth" className="scout-nav-link text-gray-200 hover:text-[var(--color-secondary)] transition-colors font-medium flex items-center gap-1.5">
                <User size={16} aria-hidden="true" />
                <span>Login</span>
              </a>
            )}
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none rounded-full border border-white/20 p-2 bg-white/10" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isOpen && (
          <div className="scout-mobile-menu md:hidden pb-4 pt-3" style={{ borderTop: '1px solid rgba(216, 194, 142, 0.35)' }}>
            <div className="px-4 py-3 border-b border-white/10">
              {user ? (
                <div className="flex items-center justify-between">
                  <a href="#/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-lg font-bold text-white">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                      {user.category && <span className="text-xs text-emerald-300 capitalize">{user.category}</span>}
                    </div>
                  </a>
                  <button onClick={() => { setIsOpen(false); handleSignOut(); }} className="text-gray-200 hover:text-red-300 transition-colors p-2" title="Logout"><LogOut className="w-5 h-5" /></button>
                </div>
              ) : (
                <a href="#/auth" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-gray-200"><User size={20} /> <span>Login</span></a>
              )}
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.label} href={link.href} onClick={() => setIsOpen(false)}
                  className={link.isGetInTouch
                    ? 'block rounded-full border border-white/20 bg-white/15 px-4 py-2 text-gray-100 transition-colors hover:bg-white/25'
                    : 'scout-nav-link py-2 px-4 text-gray-200 hover:text-[var(--color-secondary)] hover:bg-[rgba(109,40,217,0.12)] rounded transition-colors'}>
                  {link.isGetInTouch ? (
                    <div className="flex items-center gap-2">
                      <Icon size={18} className="text-[var(--color-accent)]" />
                      <span className="text-sm font-medium text-white">Contact</span>
                    </div>
                  ) : (<><Icon size={16} aria-hidden="true" /><span>{link.label}</span></>)}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}