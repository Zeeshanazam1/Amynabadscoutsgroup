import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
import { firebaseApp } from './utils/firebaseConfig';

import badgesData from './data/badges.json';
import eventsData from './data/events.json';
import resultsData from './data/results.json';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [websiteInfo, setWebsiteInfo] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase auth state globally
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    initializeData(badgesData, eventsData, resultsData);
    const info = getWebsiteInfo();
    queueMicrotask(() => setWebsiteInfo(info));
    applyTheme(getTheme());
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2) || 'home';
      setCurrentPage(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (currentPage === 'admin-login' || currentPage === 'admin-dashboard') {
      return;
    }
    const pageId = (() => {
      if (currentPage === 'home') return 'home';
      if (currentPage === 'login' || currentPage === 'auth') return 'login';
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
    applyTheme(getThemeForPage(pageId));
  }, [currentPage]);

  const renderPage = () => {
    // Auth pages - always accessible (Auth component handles redirect if logged in)
    if (currentPage === 'auth' || currentPage === 'login') {
      return <Auth />;
    }

    // Protected pages - require Firebase auth
    if (currentPage === 'profile' || currentPage === 'chat') {
      if (authLoading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#14532d] via-[#16a34a] to-[#84cc16] flex items-center justify-center p-4">
            <div className="text-emerald-50 text-lg animate-pulse">Loading...</div>
          </div>
        );
      }
      if (!firebaseUser) {
        setTimeout(() => { window.location.hash = '#/auth'; }, 0);
        return <Auth />;
      }
    }

    if (currentPage === 'admin-login') {
      return <AdminLogin />;
    }
    if (currentPage === 'admin-dashboard') {
      if (!isAuthenticated()) {
        if (window.location.hash !== '#/admin-login') {
          setTimeout(() => { window.location.hash = '#/admin-login'; }, 0);
        }
        return <AdminLogin />;
      }
      return <AdminDashboard />;
    }
    if (currentPage === 'home') {
      return <HomePage />;
    }
    switch (currentPage) {
      case 'badges': return <BadgeLibrary />;
      case 'results': return <Results />;
      case 'contact': return <GetInTouchPage />;
      case 'joining': return <JoiningFormPage />;
      case 'shop': return <ShopPage />;
      case 'event-gallery': return <EventGalleryPage />;
      case 'event-gallery-login': return <EventGalleryLoginPage />;
      case 'profile': return <UserProfilePage />;
      case 'chat': return <ChatPage />;
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
                <p className="mb-2">&copy; 2026 {websiteInfo?.unitName || 'Amynabad Scouts Group'}. All rights reserved.</p>
                <p className="text-sm text-gray-400">
                  {websiteInfo?.tagline || 'zeeshanazam.1\n03221318878\nzeeshanazam11122@gmail.com'}
                </p>
              </div>
              <div className="md:col-span-1 text-center">
                <div className="flex items-center justify-center gap-x-4 text-[11px] mt-2">
                  <a href="https://instagram.com/zeeshanazam.1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">&#x1F4F7;</span>
                    <span className="underline underline-offset-2">zeeshanazam.1</span>
                  </a>
                  <a href="https://wa.me/923221318878" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">&#x1F4AC;</span>
                    <span className="underline underline-offset-2">03221318878</span>
                  </a>
                  <a href="mailto:zeeshanazam11122@gmail.com" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/10">&#x2709;&#xFE0F;</span>
                    <span className="underline underline-offset-2">zeeshanazam11122@gmail.com</span>
                  </a>
                  <a href="https://www.linkedin.com/in/zeeshanazam.1/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition whitespace-nowrap">
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

