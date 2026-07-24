import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { getBadges } from '../utils/dataManager';
import AdGuard from './AdGuard';

const SESSION_KEY = 'scouts_user_session';

const sectionColor = (section) => {
  if (section === 'Shaheen') return '#f59e0b';
  if (section === 'Scout') return '#15803d';
  if (section === 'Rover') return '#ef4444';
  return '#0f172a';
};

const normalizeCategory = (category) => {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower === 'shaheen') return 'Shaheen';
  if (lower === 'scout') return 'Scout';
  if (lower === 'rover') return 'Rover';
  return null;
};

export default function BadgeLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('Shaheen');
  const [badgeTypeFilter, setBadgeTypeFilter] = useState('Rank Badge');
  const [proficiencyCategory, setProficiencyCategory] = useState('All');
  const [isProficiencyOpen, setIsProficiencyOpen] = useState(false);
  const [badges, setBadges] = useState(() => getBadges());
  const [userCategory, setUserCategory] = useState(() => {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      return session?.category?.toLowerCase() || null;
    } catch {
      return null;
    }
  });
  const proficiencyRef = useRef(null);

  const sections = ['Shaheen', 'Scout', 'Rover'];
  const proficiencyCategories = ['All', 'spiritual', 'social', 'mental', 'physical'];

  useEffect(() => {
    const onDocumentMouseDown = (e) => {
      if (!isProficiencyOpen) return;
      const target = e.target;
      if (proficiencyRef.current && !proficiencyRef.current.contains(target)) {
        setIsProficiencyOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => {
      document.removeEventListener('mousedown', onDocumentMouseDown);
    };
  }, [isProficiencyOpen]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'scouts_data') {
        setBadges(getBadges());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (userCategory && userCategory !== 'leader') {
      const section = normalizeCategory(userCategory);
      if (section) setActiveSection(section);
    }
  }, [userCategory]);

  useEffect(() => {
    const handleSession = () => {
      try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        setUserCategory(session?.category?.toLowerCase() || null);
      } catch {
        setUserCategory(null);
      }
    };

    handleSession();
    window.addEventListener('storage', handleSession);
    return () => window.removeEventListener('storage', handleSession);
  }, []);

  const visibleSections = userCategory && userCategory !== 'leader'
    ? [normalizeCategory(userCategory)]
    : sections;

  const sectionButtonsDisabled = userCategory && userCategory !== 'leader';

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      const normalizedBadgeType = badge.badgeType || 'Proficiency Badge';
      const matchesProficiencyCategory =
        badgeTypeFilter !== 'Proficiency Badge' ||
        proficiencyCategory === 'All' ||
        badge.category.toLowerCase() === proficiencyCategory.toLowerCase();
      const matchesSearch =
        badge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (badge.requirements || []).some((req) =>
          req.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Access control:
      // - Scout cannot see Rover badges
      // - Rover cannot see Shaheen badges
      // - Shaheen cannot see Rover badges
      // (Keeps behavior consistent with "user is a scout should not be able to access badges of rovers and shaheen" feedback)
      if (userCategory && userCategory !== 'leader') {
        const sect = String(badge.section || '');
        const userSect = String(userCategory);

        const userIsScout = userSect.toLowerCase() === 'scout';
        const userIsRover = userSect.toLowerCase() === 'rover';
        const userIsShaheen = userSect.toLowerCase() === 'shaheen';

        // if user is scout => only Scout section allowed
        if (userIsScout && sect !== 'Scout') return false;

        // if user is rover => only Rover section allowed
        if (userIsRover && sect !== 'Rover') return false;

        // if user is shaheen => only Shaheen section allowed
        if (userIsShaheen && sect !== 'Shaheen') return false;
      }

      const matchesSection = badge.section === activeSection;

      const matchesBadgeType = normalizedBadgeType === badgeTypeFilter;

      return matchesSearch && matchesSection && matchesBadgeType && matchesProficiencyCategory;
    });
  }, [searchTerm, activeSection, badgeTypeFilter, proficiencyCategory, badges, userCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-12">
      <AdGuard trigger="badges" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            Badge Library
          </h1>
          <p className="text-lg text-slate-600">
            Explore and filter scout proficiency badges by section and category
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by badge name, category, or requirement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none bg-white shadow-sm"
            style={{ borderColor: '#cbd5e1' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {visibleSections.map((section) => {
            const isActive = activeSection === section;
            const color = sectionColor(section);
            return (
              <button
                key={section}
                onClick={() => {
                  if (!sectionButtonsDisabled) setActiveSection(section);
                }}
                disabled={sectionButtonsDisabled}
                className="px-6 py-2 rounded-full font-semibold transition-all border-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={
                  isActive
                    ? { backgroundColor: color, color: '#ffffff', borderColor: color }
                    : { borderColor: color, color: '#1f2937' }
                }
              >
                {section}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => {
                setBadgeTypeFilter('Rank Badge');
                setProficiencyCategory('All');
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                badgeTypeFilter === 'Rank Badge'
                  ? 'text-white shadow-lg'
                  : 'bg-white text-slate-700 border-2 border-slate-300 hover:text-[var(--color-primary)]'
              }`}
              style={badgeTypeFilter === 'Rank Badge' ? { backgroundColor: 'var(--color-primary)' } : undefined}
            >
              Rank
            </button>

            <div className="relative" ref={proficiencyRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isProficiencyOpen}
                onClick={() => {
                  setBadgeTypeFilter('Proficiency Badge');
                  setIsProficiencyOpen((v) => !v);
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  badgeTypeFilter === 'Proficiency Badge'
                    ? 'text-white shadow-lg'
                    : 'bg-white text-slate-700 border-2 border-slate-300 hover:text-[var(--color-primary)]'
                }`}
                style={badgeTypeFilter === 'Proficiency Badge' ? { backgroundColor: 'var(--color-primary)' } : undefined}
              >
                Proficiency
                <span className="text-xs">▾</span>
              </button>

              {isProficiencyOpen && (
                <div
                  id="proficiency-dropdown"
                  role="menu"
                  className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg border border-slate-200 bg-white overflow-hidden z-10 transform transition-all duration-150"
                >
                  {proficiencyCategories.map((cat) => {
                    const isActive =
                      cat === 'All'
                        ? proficiencyCategory === 'All'
                        : proficiencyCategory.toLowerCase() === cat.toLowerCase();

                    return (
                      <button
                        key={cat}
                        role="menuitem"
                        onClick={() => {
                          setBadgeTypeFilter('Proficiency Badge');
                          setProficiencyCategory(cat);
                          setIsProficiencyOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'text-slate-900'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                        style={isActive ? { backgroundColor: 'rgba(109, 40, 217, 0.08)' } : undefined}
                      >
                        {cat === 'All'
                          ? 'All categories'
                          : cat[0].toUpperCase() + cat.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.length > 0 ? (
            filteredBadges.map((badge) => {
              const cardColor = sectionColor(badge.section);
              return (
                <div
                  key={badge.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                  style={{ borderLeft: `4px solid ${cardColor}` }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-800 transition-colors" style={{ color: badgeTypeFilter === 'Rank Badge' ? 'var(--color-primary)' : 'inherit' }}>
                        {badge.title}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          badge.section === 'Shaheen'
                            ? 'bg-[rgba(251,191,36,0.12)] text-[var(--color-accent)]'
                            : badge.section === 'Scout'
                            ? 'bg-[rgba(16,185,129,0.12)] text-[var(--color-secondary)]'
                            : 'bg-[rgba(109,40,217,0.12)] text-[var(--color-header)]'
                        }`}
                      >
                        {badge.section}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mb-4">
                      📂 {badge.category}
                    </p>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm">
                        Requirements:
                      </h4>
                      <ul className="space-y-1">
                        {(badge.requirements || []).map((req, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start">
                            <span className="mr-2" style={{ color: 'var(--color-secondary)' }}>✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[rgba(109,40,217,0.08)] px-6 py-3 border-t border-slate-200">
                    <button
                      onClick={() => (window.location.hash = `#/badge/${badge.id}`)}
                      className="w-full text-white py-2 rounded font-semibold transition-colors"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center">
              <p className="text-2xl text-slate-500 font-semibold">
                No badges found
              </p>
              <p className="text-slate-400 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-slate-600">
          <p className="text-lg">
            Showing <span className="font-bold text-[var(--color-secondary)]">{filteredBadges.length}</span>{' '}
            {filteredBadges.length === 1 ? 'badge' : 'badges'}
          </p>
        </div>
      </div>
    </div>
  );
}
