import { useEffect, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Compass,
  FlameKindling,
  Flag,
  Mail,
  Map,
  MessageCircle,
  Mountain,
  Send,
  Tent,
  Users,
  X,
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import ContactAdvertisement from './ContactAdvertisement';

import { getUserProfile } from '../utils/profileManager';
import { addChatAccessRequest, getChatAccessRequests, addLeaveApplication } from '../utils/contactSubmissions';
import { getThemeBackgroundByCategory } from '../utils/themeBackgroundManager';
import { applyTheme, getThemeByCategory } from '../utils/themeManager';



const SESSION_KEY = 'scouts_user_session';


export default function HomePage() {

  const [userProfile, setUserProfile] = useState(null);
  const [chatRequestStatus, setChatRequestStatus] = useState('');


  useEffect(() => {
    const session = (() => {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
      } catch {
        return null;
      }
    })();
    if (!session?.id) {
      queueMicrotask(() => {
        setUserProfile(null);
        setChatRequestStatus('');
      });
      return;
    }

    const profile = getUserProfile(session.id);
    queueMicrotask(() => setUserProfile(profile || null));
  }, []);

  useEffect(() => {
    if (!userProfile) {
      queueMicrotask(() => setChatRequestStatus(''));
      return;
    }

    // Ensure HomePage visuals match the signed-in user's theme category.
    // Use sessionStorage first (it is available right after sign-in),
    // then fall back to loaded userProfile.
    const sessionCategory = (() => {
      try {
        const sess = JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {};
        return sess?.category || null;
      } catch {
        return null;
      }
    })();

    const category = sessionCategory || userProfile?.category;

    if (category) {
      const theme = getThemeByCategory(category);
      applyTheme(theme);
    }

    const requests = getChatAccessRequests();
    const existing = requests.find((r) => r.requesterId === userProfile.uid);

    if (userProfile.chatAccess) {
      queueMicrotask(() => setChatRequestStatus('approved'));
    } else if (existing?.status === 'Pending') {
      queueMicrotask(() => setChatRequestStatus('pending'));
    } else if (existing?.status === 'Rejected') {
      queueMicrotask(() => setChatRequestStatus('rejected'));
    } else {
      queueMicrotask(() => setChatRequestStatus(''));
    }
  }, [userProfile]);

  const handleChatRequest = () => {
    if (!userProfile) {
      setChatRequestStatus('error');
      return;
    }

    const requests = getChatAccessRequests();
    const existing = requests.find((r) => r.requesterId === userProfile.uid && r.status === 'Pending');
    if (existing) {
      setChatRequestStatus('pending');
      return;
    }

    addChatAccessRequest({
      requesterId: userProfile.uid,
      requesterName: userProfile.name,
      requesterEmail: userProfile.email,
      message: 'Please grant me chat access.',
    });
    setChatRequestStatus('pending');
  };

  // Leave application modal state and handlers
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submissionMode, setSubmissionMode] = useState('website');
  const [leaveError, setLeaveError] = useState('');

  const openLeave = () => {
    if (!userProfile) {
      // redirect to login/auth page
      window.location.hash = '#/auth';
      return;
    }
    setIsLeaveOpen(true);
  };

  const closeLeave = () => {
    setIsLeaveOpen(false);
    setLeaveError('');
  };

  const submitLeave = (e) => {
    e.preventDefault();
    setLeaveError('');
    if (!startDate || !endDate) {
      setLeaveError('Please select start and end dates.');
      return;
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (ed < sd) {
      setLeaveError('End date cannot be before start date.');
      return;
    }

    if (submissionMode === 'email') {
      const to = 'zeeshanazam11122@gmail.com';
      const subject = encodeURIComponent(`Leave Application from ${userProfile.name || userProfile.email}`);
      const bodyLines = [];
      bodyLines.push(`Name: ${userProfile.name || ''}`);
      bodyLines.push(`Email: ${userProfile.email || ''}`);
      bodyLines.push(`Leave Type: ${leaveType}`);
      bodyLines.push(`Start Date: ${startDate}`);
      bodyLines.push(`End Date: ${endDate}`);
      bodyLines.push(`Reason:\n${reason}`);
      bodyLines.push(`\nSubmitted at: ${new Date().toISOString()}`);
      const body = encodeURIComponent(bodyLines.join('\n'));
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      closeLeave();
      return;
    }

    addLeaveApplication({
      requesterId: userProfile.uid,
      requesterName: userProfile.name,
      requesterEmail: userProfile.email,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    // stored on-site; admin notification is handled server-side (Cloud Function)
    closeLeave();
  };

  const newsItems = [
    {
      id: 1,
      title: 'Scout Camp Season Opens',
      content: 'Join us for an unforgettable summer camping adventure!',
      date: 'June 15, 2026',
      icon: Tent,
    },
    {
      id: 2,
      title: 'New Badge Programs Launched',
      content: 'Explore our expanded selection of proficiency badges.',
      date: 'June 14, 2026',
      icon: Award,
    },
    {
      id: 3,
      title: 'Community Service Recognition',
      content: 'Our scouts completed 500 hours of community service!',
      date: 'June 13, 2026',
      icon: Flag,
    },
    {
      id: 4,
      title: 'Leadership Training Success',
      content: 'Congratulations to our new unit leaders!',
      date: 'June 12, 2026',
      icon: Compass,
    },
  ];

  const stats = [
    { icon: Users, label: 'Active Scouts', value: '150+' },
    { icon: BadgeCheck, label: 'Badges Available', value: '25+' },
    { icon: Map, label: 'Active Sections', value: '3' },
    { icon: FlameKindling, label: 'Events Yearly', value: '40+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="scout-hero relative text-white py-20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary) 45%, var(--color-accent) 100%)' }}
      >
        {/* Background image (per theme category) */}
        <div className="absolute inset-0" style={{
          backgroundImage: userProfile?.category
            ? `url(${getThemeBackgroundByCategory(userProfile.category) || ''})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: getThemeBackgroundByCategory(userProfile?.category) ? 0.35 : 0.25,
          filter: 'saturate(1.1) contrast(1.05)',
        }} />

        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-12 right-12 text-white/70">
            <Compass size={118} strokeWidth={1.1} />
          </div>
          <div className="absolute bottom-12 left-10 text-white/60">
            <Mountain size={150} strokeWidth={1.1} />
          </div>
        </div>


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <span className="scout-wood-label text-white px-4 py-2 rounded-full font-bold text-sm">
              <Tent size={16} aria-hidden="true" />
              Welcome to Amynabad Scouts
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Building Leaders, <br /> Creating Futures
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join our thriving scout unit and embark on an adventure of personal growth,
            leadership, and community service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#/badges"
              className="inline-flex items-center gap-2 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Award size={18} aria-hidden="true" />
              Explore Badges
            </a>
            <a
              href="#/results"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              <Map size={18} aria-hidden="true" />
              View Results
            </a>
            {userProfile?.chatAccess ? (
              <a
                href="#/chat"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                <MessageCircle size={18} />
                Chat
              </a>
            ) : userProfile ? (
              <button
                type="button"
                onClick={handleChatRequest}
                disabled={chatRequestStatus === 'pending'}
                className={`inline-flex items-center gap-2 font-bold py-3 px-8 rounded-lg border transition-colors ${
                  chatRequestStatus === 'pending'
                    ? 'bg-slate-300 text-slate-700 cursor-not-allowed border-slate-300'
                    : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {chatRequestStatus === 'pending' ? 'Request Pending' : 'Request Chat Access'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={openLeave}
              className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors"
            >
              <Send size={18} aria-hidden="true" />
              Submit Leave Application
            </button>
          </div>
          {chatRequestStatus === 'pending' && (
            <p className="mt-4 text-center text-white">Your chat request is pending approval.</p>
          )}
          {chatRequestStatus === 'rejected' && (
            <p className="mt-4 text-center text-[var(--color-accent)]">
              Your chat request was rejected. You may request access again.
            </p>
          )}
          {chatRequestStatus === 'error' && (
            <p className="mt-4 text-center text-[var(--color-header)]">Unable to submit chat access request. Try again later.</p>
          )}
        </div>
      </section>

      {/* Leave application modal */}
      {isLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={closeLeave} className="absolute right-4 top-4 text-slate-500"><X /></button>
            <h3 className="text-xl font-semibold mb-4">Submit Leave Application</h3>
            <form onSubmit={submitLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg">
                  <option>Sick</option>
                  <option>Personal</option>
                  <option>Official</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="w-full mt-1 px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Submission Method</label>
                <div className="mt-2 flex gap-4 items-center">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="submissionMode" value="website" checked={submissionMode === 'website'} onChange={() => setSubmissionMode('website')} />
                    <span className="text-sm">Submit to website (notify admin)</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="submissionMode" value="email" checked={submissionMode === 'email'} onChange={() => setSubmissionMode('email')} />
                    <span className="text-sm">Send email directly</span>
                  </label>
                </div>
              </div>
              {leaveError && <p className="text-sm text-red-600">{leaveError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeLeave} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white">
                  <Mail />
                  Submit & Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                const emoji = ['🧭', '🎖', '🏕️', '🔥'][idx] || '⛺️';
                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-5 text-center border-2 hover:border-opacity-100 transition-colors"
                    style={{ borderColor: 'var(--color-secondary)' }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-base leading-none" aria-hidden="true">{emoji}</span>
                      <Icon style={{ color: 'var(--color-primary)' }} className="mx-auto" size={22} />
                    </div>
                    <p className="text-slate-600 text-xs font-semibold">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Countdown & Featured Event */}
      <section className="bg-gradient-to-br from-slate-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="scout-section-title text-4xl font-bold text-slate-800 mb-3">
              🚀 Featured Event
            </h2>
            <p className="text-lg text-slate-600">
              Don't miss our upcoming event. Mark your calendar!
            </p>
          </div>
          <CountdownTimer />
        </div>
      </section>

      {/* Latest News Grid */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="scout-section-title text-4xl font-bold text-slate-800 mb-3">
              📰 Latest News
            </h2>
            <p className="text-lg text-slate-600">
              Stay updated with the latest happenings in our unit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {newsItems.map((item) => {
              const NewsIcon = item.icon;
              return (
              <article
                key={item.id}
                className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
                style={{ borderLeft: '4px solid var(--color-secondary)' }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(84,107,47,0.12)] text-[var(--color-secondary)]">
                      <NewsIcon size={26} aria-hidden="true" />
                    </span>
                    <time className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">
                      {item.date}
                    </time>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 transition-colors" style={{ color: 'var(--color-text)' }}>
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {item.content}
                  </p>
                  <a
                    href="#/"
                    className="inline-block font-semibold transition-colors"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    Read More →
                  </a>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-white py-16" style={{ background: 'linear-gradient(90deg, var(--color-header), var(--color-secondary))' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg text-gray-200 mb-8">
            Become part of a community dedicated to growth, adventure, and service.
          </p>
          <a
            href="#/joining"
            className="bg-white text-slate-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Join Now
          </a>
        </div>
      </section>

      {/* Contact Advertisement moved to dedicated page: #/contact */}
      <div className="hidden">
        <ContactAdvertisement />
      </div>
    </div>
  );
}

