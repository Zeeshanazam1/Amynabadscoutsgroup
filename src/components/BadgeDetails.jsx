import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Star, FileText, Image as ImageIcon } from 'lucide-react';
import { getBadges } from '../utils/dataManager';
import AdGuard from './AdGuard';

const SESSION_KEY = 'scouts_user_session';

const getBadgeIdFromHash = () => {
  const hash = window.location.hash || '';
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

const buildBookPage = (page, index) => {
  if (!page) return null;
  if (page.type === 'cover') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 rounded-[24px] border text-white shadow-inner p-8 text-center" style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 30%, #000), color-mix(in srgb, var(--color-primary) 50%, #000))`,
        borderColor: 'var(--color-secondary)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em]" style={{backgroundColor: 'rgba(255,255,255,0.08)'}}>
          Badge Book Cover
        </div>
        <div>
          <h2 className="text-4xl font-black leading-tight">{page.title}</h2>
          <p className="mt-3 text-lg" style={{color: 'var(--color-secondary)'}}>{page.subtitle}</p>
        </div>
        <div className="max-w-md rounded-2xl border border-white/20 p-4 text-sm leading-7" style={{backgroundColor: 'rgba(255,255,255,0.08)'}}>
          {page.content}
        </div>
      </div>
    );
  }

  switch (page.type) {
    case 'image':
      return (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <ImageIcon size={16} /> {page.title || `Image ${index + 1}`}
          </div>
          {page.imageUrl ? (
            <img src={page.imageUrl} alt={page.title || 'Badge illustration'} className="max-h-72 w-full rounded-xl border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              Add an image URL in the admin badge book editor.
            </div>
          )}
          {page.content ? <p className="text-sm leading-7 text-slate-700">{page.content}</p> : null}
        </div>
      );
    case 'pdf':
      return (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <FileText size={16} /> {page.title || `PDF ${index + 1}`}
          </div>
          {page.pdfUrl ? (
            <a href={page.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Open PDF
            </a>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              Add a PDF link in the admin badge book editor.
            </div>
          )}
          {page.content ? <p className="text-sm leading-7 text-slate-700">{page.content}</p> : null}
        </div>
      );
    case 'text':
    default:
      return (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <BookOpen size={16} /> {page.title || `Page ${index + 1}`}
          </div>
          {page.content ? <div className="prose prose-slate max-w-none text-sm leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: page.content }} /> : null}
        </div>
      );
  }
};

export default function BadgeDetails() {
  const badgeId = getBadgeIdFromHash();
  const badges = useMemo(() => getBadges(), []);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipDirection, setFlipDirection] = useState('next');

  const badge = useMemo(() => {
    return badges.find((b) => b.id === badgeId) || null;
  }, [badges, badgeId]);

  const userCategory = getUserSectionFromSession();
  const isAllowed = badge ? isBadgeAllowedForUser(badge.section, userCategory) : false;

  const bookPages = useMemo(() => {
    if (!badge?.book?.pages?.length) {
      return [{ id: 'default', type: 'text', title: 'Overview', content: badge?.descriptionHtml || 'Add content through the admin dashboard.', important: true }];
    }
    return badge.book.pages;
  }, [badge]);

  const allPages = useMemo(() => {
    const cover = {
      id: 'cover',
      type: 'cover',
      title: badge?.book?.title || badge?.title || 'Badge Book',
      subtitle: badge?.book?.subtitle || `${badge?.badgeType || 'Proficiency Badge'} • ${badge?.category || 'General'}`,
      content: badge?.descriptionHtml || 'This badge book is ready to be filled with stories, images, and PDF resources.',
      important: true,
    };
    return [cover, ...bookPages];
  }, [badge, bookPages]);

  const page = allPages[currentPage] || allPages[0];

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

  const goToPage = (index, direction = 'next') => {
    setFlipDirection(direction);
    setCurrentPage(Math.max(0, Math.min(index, allPages.length - 1)));
  };
  const nextPage = () => goToPage(currentPage + 1, 'next');
  const prevPage = () => goToPage(currentPage - 1, 'prev');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-12">
      <AdGuard trigger="badges" />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-slate-800">{badge.title}</h1>
              <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-800">{badge.section}</span>
              <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: 'rgba(109, 40, 217, 0.12)', color: 'var(--color-secondary)' }}>
                {badge.badgeType || 'Proficiency Badge'}
              </span>
            </div>
            <p className="text-lg text-slate-600">📂 {badge.category}</p>
          </div>
          <a href="#/badges" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2 font-semibold text-white transition hover:bg-slate-700">
            <ArrowLeft size={16} /> Back to library
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={18} />
              <h2 className="text-lg font-bold text-slate-800">Book Index</h2>
            </div>
            <div className="space-y-2">
              {bookPages.map((bookPage, index) => (
                <button
                  key={bookPage.id || `${bookPage.title}-${index}`}
                  onClick={() => goToPage(index)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${currentPage === index ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                >
                  <span className="flex items-center gap-2">
                    {bookPage.important ? <Star size={14} className="text-amber-500" /> : <FileText size={14} className="text-slate-400" />}
                    {bookPage.title || `Page ${index + 1}`}
                  </span>
                  <span className="text-xs text-slate-400">{index + 1}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[32px] border border-slate-200 bg-[#fdf7ea] p-4 shadow-[0_20px_80px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-inner sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Badge Book</p>
                  <h3 className="text-2xl font-bold text-slate-800">{badge.book?.title || badge.title}</h3>
                  <p className="text-sm text-slate-500">{badge.book?.subtitle || `${badge.badgeType || 'Proficiency Badge'} • ${badge.category}`}</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  Page {currentPage + 1} / {bookPages.length}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-[#faf8f3] to-[#f4efe3] p-6 shadow-sm">
                <div key={page.id || currentPage} className={`min-h-[420px] page-turn page-turn-${flipDirection}`}>
                  {buildBookPage(page, currentPage)}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button onClick={prevPage} disabled={currentPage === 0} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50">
                  <ChevronLeft size={16} /> Previous
                </button>
                <div className="text-sm text-slate-500">Turn the page to explore the badge</div>
                <button onClick={nextPage} disabled={currentPage === allPages.length - 1} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50">
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <style>{`
        .page-turn {
          animation: pageTurn 0.55s cubic-bezier(0.2, 0.8, 0.2, 1);
          transform-origin: center center;
        }
        .page-turn-next {
          animation-name: pageTurnNext;
        }
        .page-turn-prev {
          animation-name: pageTurnPrev;
        }
        @keyframes pageTurnNext {
          0% { opacity: 0; transform: perspective(1400px) rotateY(18deg) translateX(12px); }
          100% { opacity: 1; transform: perspective(1400px) rotateY(0deg) translateX(0); }
        }
        @keyframes pageTurnPrev {
          0% { opacity: 0; transform: perspective(1400px) rotateY(-18deg) translateX(-12px); }
          100% { opacity: 1; transform: perspective(1400px) rotateY(0deg) translateX(0); }
        }
      `}</style>
    </div>
  );
}

