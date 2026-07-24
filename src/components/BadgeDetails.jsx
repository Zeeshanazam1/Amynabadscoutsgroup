import { useMemo } from 'react';
import { getBadges } from '../utils/dataManager';
import AdGuard from './AdGuard';

// This project uses hash routing in src/App.jsx.
// BadgeDetails reads the badge id from window.location.hash.

const SESSION_KEY = 'scouts_user_session';

const getBadgeIdFromHash = () => {
  const hash = window.location.hash || '';
  // Expected: #/badge/<id>
  const match = hash.match(/^#\/badge\/(.+)$/);
  return match?.[1] || '';
};

const getUserSectionFromSession = () => {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    return session?.category?.toLowerCase() || null;
  } catch {
    return null;
  }
};

const isBadgeAllowedForUser = (badgeSection, userCategory) => {
  // leader can see everything
  if (!userCategory || userCategory === 'leader') return true;

  const sect = String(badgeSection || '');
  const userCat = String(userCategory || '');

  const userIsScout = userCat.toLowerCase() === 'scout';
  const userIsRover = userCat.toLowerCase() === 'rover';
  const userIsShaheen = userCat.toLowerCase() === 'shaheen';

  if (userIsScout && sect !== 'Scout') return false;
  if (userIsRover && sect !== 'Rover') return false;
  if (userIsShaheen && sect !== 'Shaheen') return false;

  return true;
};

export default function BadgeDetails() {
  const badgeId = getBadgeIdFromHash();
  const badges = useMemo(() => getBadges(), []);

  const badge = useMemo(() => {
    return badges.find((b) => b.id === badgeId) || null;
  }, [badges, badgeId]);

  const userCategory = getUserSectionFromSession();
  const isAllowed = badge ? isBadgeAllowedForUser(badge.section, userCategory) : false;

  if (!badge || !isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-12">
        <AdGuard trigger="badges" />
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Badge not found</h1>
          <p className="text-slate-600">The badge you are looking for doesn’t exist for your section.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-12">
      <AdGuard trigger="badges" />
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-slate-800">{badge.title}</h1>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-sm font-semibold">
              {badge.section}
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(109, 40, 217, 0.12)', color: 'var(--color-secondary)' }}>
              {badge.badgeType || 'Proficiency Badge'}
            </span>
          </div>
          <p className="text-slate-600 text-lg">📂 {badge.category}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          {badge.descriptionHtml && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mb-3">Description</h2>
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: badge.descriptionHtml }}
              />
            </>
          )}

          {(badge.images?.length || 0) > 0 && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badge.images.map((src, idx) => (
                  <a
                    key={`${src}-${idx}`}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img src={src} alt={`${badge.title} image ${idx + 1}`} className="w-full rounded border border-slate-200" />
                  </a>
                ))}
              </div>
            </>
          )}

          {badge.pdf && (
            <>
              <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3">PDF</h2>
              <a
                href={badge.pdf}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-white font-semibold px-4 py-2 rounded transition"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Open PDF
              </a>
            </>
          )}

          <h2 className="text-xl font-bold text-slate-800 mt-6 mb-4">Requirements</h2>
          <ul className="space-y-3">
            {badge.requirements?.map((req, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <span className="font-bold" style={{ color: 'var(--color-secondary)' }}>✓</span>
                <span className="text-slate-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <a
            href="#/badges"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2 rounded-lg transition"
          >
            Back to library
          </a>
        </div>
      </div>
    </div>
  );
}

