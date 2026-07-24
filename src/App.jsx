import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import BadgeLibrary from './components/BadgeLibrary';
import Results from './components/Results';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import GetInTouchPage from './components/GetInTouchPage';
import JoiningFormPage from './components/JoiningFormPage';
import UserProfilePage from './components/UserProfilePage';
import ChatPage from './components/ChatPage';
import BadgeDetails from './components/BadgeDetails';
import ShopPage from './components/ShopPage';
import EventGalleryPage from './components/EventGalleryPage';
import EventGalleryLoginPage from './components/EventGalleryLoginPage';
import { isAuthenticated } from './utils/authManager';
import { initializeData, getWebsiteInfo } from './utils/dataManager';
import { getTheme, applyTheme, getThemeForPage } from './utils/themeManager';

import badgesData from './data/badges.json';

import eventsData from './data/events.json';
import resultsData from './data/results.json';

function getStoredSessionUser() {
  try {
    const stored = JSON.parse(sessionStorage.getItem('scouts_user_session') || 'null');
    if (stored && (stored.id || stored.uid || stored.email)) {
      return stored;
    }
  } catch {
    // ignore malformed session data
  }
  return null;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [websiteInfo, setWebsiteInfo] = useState(null);

  // Initialize data and theme on app load
  useEffect(() => {
    initializeData(badgesData, eventsData, resultsData);
    // Avoid setState inside this effect to satisfy strict lint rules.
    const info = getWebsiteInfo();
    queueMicrotask(() => setWebsiteInfo(info));
    applyTheme(getTheme());
  }, []);


  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2) || 'home';
      setCurrentPage(hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Apply per-page theme whenever the page changes (public pages only)
  useEffect(() => {
    if (
      currentPage === 'admin-login' ||
      currentPage === 'admin-dashboard'
    ) {
      return;
    }

    // Map route -> pageId keys used by the admin theme settings.
    const pageId = (() => {

      if (currentPage === 'home') return 'home';
      if (currentPage === 'login') return 'login';
      if (currentPage === 'auth') return 'login';
      if (currentPage === 'signup') return 'signup';
      if (currentPage === 'profile') return 'profile';
      if (currentPage === 'chat') return 'chat';

      if (currentPage === 'badges') return 'badges';
      if (currentPage === 'results') return 'results';
      if (currentPage === 'contact') return 'contact';
      if (currentPage === 'joining') return 'joining';
      if (currentPage === 'shop') return 'shop';
      if (currentPage === 'event-gallery') return 'event-gallery';
      if (currentPage === 'event-gallery-login') return 'event-gallery-login';

      if (window.location.hash.startsWith('#/badge/')) return 'badges';
      return 'home';
    })();

    const theme = getThemeForPage(pageId);
    applyTheme(theme);
  }, [currentPage]);



  const renderPage = () => {

    // Admin routes
    if (currentPage === 'admin-login') {
      return <AdminLogin />;
    }

  if (currentPage === 'admin-dashboard') {
      if (!isAuthenticated()) {
        // Avoid mutating location during render.
        if (window.location.hash !== '#/admin-login') {
          setTimeout(() => {
            window.location.hash = '#/admin-login';
          }, 0);
        }
        return <AdminLogin />;
      }
      return <AdminDashboard />;
    }


    // Public auth routes
    if (currentPage === 'auth' || currentPage === 'login') {
      return <Auth />;
    }

    if (currentPage === 'badges' && !getStoredSessionUser()) {
      if (window.location.hash !== '#/auth') {
        setTimeout(() => {
          window.location.hash = '#/auth';
        }, 0);
      }
      return <Auth />;
    }

    // If someone visits '#/home' (or '#/') always show HomePage.
    // `Auth` should not be rendered at '#/' anymore.
    if (currentPage === 'home') {
      return <HomePage />;
    }



    // Public routes
    switch (currentPage) {
      case 'badges':
        return <BadgeLibrary />;
      case 'results':
        return <Results />;
      case 'contact':
        return <GetInTouchPage />;
      case 'joining':
        return <JoiningFormPage />;
      case 'shop':
        return <ShopPage />;
      case 'event-gallery':
        return <EventGalleryPage />;
      case 'event-gallery-login':
        return <EventGalleryLoginPage />;
      case 'profile':
        return <UserProfilePage />;
      case 'chat':
        return <ChatPage />;

      // Badge details uses hash pattern #/badge/<id>
      default: {
        if (window.location.hash.startsWith('#/badge/')) {
          return <BadgeDetails />;
        }
        return <HomePage />;
      }
    }
  };

  return (
    <div className="scout-site-shell min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && <Navbar />}
      {renderPage()}
      {currentPage !== 'admin-login' && currentPage !== 'admin-dashboard' && (
        <footer className="scout-footer bg-slate-800 text-gray-300 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 text-center md:text-left">
                <p className="mb-2">© 2026 {websiteInfo?.unitName || 'Amynabad Scouts Group'}. All rights reserved.</p>
                <p className="text-sm text-gray-400">
                  {websiteInfo?.tagline || 'zeeshanazam.1\n03221318878\nzeeshanazam11122@gmail.com'}
                </p>
              </div>

              <div className="md:col-span-1 text-center">
                <div className="flex items-center justify-center gap-x-4 text-[11px] mt-2">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/zeeshanazam.1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">📷</span>
                    <span className="underline underline-offset-2">zeeshanazam.1</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/923221318878"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">💬</span>
                    <span className="underline underline-offset-2">03221318878</span>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:zeeshanazam11122@gmail.com"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">✉️</span>
                    <span className="underline underline-offset-2">zeeshanazam11122@gmail.com</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/in/zeeshanazam.1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">in</span>
                    <span className="underline underline-offset-2">zeeshanazam.1</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
