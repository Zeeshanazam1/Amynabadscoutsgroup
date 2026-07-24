import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Camera, ChevronLeft, ChevronRight, Eye, Grid3X3, Images, Lock, LogOut, MapPin, PlayCircle, ShieldCheck, Trash2 } from 'lucide-react';
import eventsData from '../data/events.json';

const EVENT_GALLERY_CREDENTIALS = {
  username: 'adminabsu.123',
  password: 'qwertyytrewq',
};
const STORAGE_KEY = 'event_gallery_state_v1';

function formatEventDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function createPlaceholderImage(label, accent) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="${accent}" />
      <rect x="80" y="80" width="1040" height="640" rx="32" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.35)" stroke-width="8" />
      <circle cx="360" cy="320" r="140" fill="rgba(255,255,255,0.22)" />
      <path d="M260 520c48-96 163-152 290-152 116 0 214 45 300 146" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="24" stroke-linecap="round" />
      <text x="600" y="650" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="700" fill="white">${label}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildInitialEvents() {
  const palette = ['#f59e0b', '#ef4444', '#8b5cf6', '#0f766e'];

  return eventsData.map((event, index) => {
    const baseImage = createPlaceholderImage(`${event.title} • Dummy Cover`, palette[index % palette.length]);
    return {
      ...event,
      thumbnail: baseImage,
      images: [
        baseImage,
        createPlaceholderImage(`${event.title} • Dummy 1`, '#111827'),
        createPlaceholderImage(`${event.title} • Dummy 2`, '#1f2937'),
        createPlaceholderImage(`${event.title} • Dummy 3`, '#0f766e'),
      ],
    };
  });
}

function readStoredEvents() {
  if (typeof window === 'undefined') return buildInitialEvents();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(saved) && saved.length) {
      return saved;
    }
  } catch {
    // ignore malformed storage
  }

  return buildInitialEvents();
}

export default function EventGalleryPage() {
  const [events, setEvents] = useState(readStoredEvents);
  const [selectedEventId, setSelectedEventId] = useState(eventsData[0]?.id || null);
  const [viewMode, setViewMode] = useState('grid');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Community',
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('event_gallery_auth') || 'null');
      if (saved?.authenticated) {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (!events.length) return;

    const syncFromUrl = () => {
      const hash = window.location.hash || '#/event-gallery';
      const [, query = ''] = hash.split('?');
      const params = new URLSearchParams(query);
      const uploadEnabled = params.get('upload') === '1' || params.get('upload') === 'true' || params.get('admin') === '1';
      const eventParam = params.get('event');

      setIsUploadMode(uploadEnabled);
      if (eventParam && events.some((event) => event.id === eventParam)) {
        setSelectedEventId(eventParam);
      } else if (!selectedEventId && events[0]) {
        setSelectedEventId(events[0].id);
      }
    };

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
    return () => window.removeEventListener('hashchange', syncFromUrl);
  }, [events, selectedEventId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const selectedEvent = useMemo(() => {
    return events.find((event) => event.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedEventId]);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (username.trim() === EVENT_GALLERY_CREDENTIALS.username && password === EVENT_GALLERY_CREDENTIALS.password) {
      sessionStorage.setItem('event_gallery_auth', JSON.stringify({ authenticated: true, loginTime: Date.now() }));
      setIsAuthenticated(true);
      setLoading(false);
      setUsername('');
      setPassword('');
      setUploadMessage('Upload access granted. You can add images to any event below.');
      return;
    }

    setError('Invalid credentials. Use the approved admin access details.');
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('event_gallery_auth');
    setIsAuthenticated(false);
    setError('');
    setUploadMessage('');
    setUsername('');
    setPassword('');
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !selectedEvent) {
      return;
    }

    if (!isAuthenticated) {
      setUploadMessage('Upload access is protected. Open this page with the upload URL to sign in first.');
      return;
    }

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    const uploadedImages = await Promise.all(readers);

    setEvents((previous) => {
      const updated = previous.map((entry) =>
        entry.id === selectedEvent.id
          ? {
              ...entry,
              images: [...entry.images, ...uploadedImages],
              thumbnail: entry.thumbnail || uploadedImages[0],
            }
          : entry
      );
      return updated;
    });

    setUploadMessage(`Added ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''} to ${selectedEvent.title}.`);
    event.target.value = '';
  };

  const handleCreateEvent = (event) => {
    event.preventDefault();

    if (!newEventForm.title.trim()) {
      setUploadMessage('Add a title before creating a new event.');
      return;
    }

    const createdEvent = {
      id: `event-${Date.now()}`,
      title: newEventForm.title.trim(),
      description: newEventForm.description.trim() || 'New event added by the uploader.',
      date: newEventForm.date || new Date().toISOString().slice(0, 10),
      location: newEventForm.location.trim() || 'Scouts venue',
      category: newEventForm.category.trim() || 'Community',
      thumbnail: createPlaceholderImage(`${newEventForm.title.trim()} • Dummy Cover`, '#0f766e'),
      images: [
        createPlaceholderImage(`${newEventForm.title.trim()} • Dummy Cover`, '#0f766e'),
        createPlaceholderImage(`${newEventForm.title.trim()} • Dummy 1`, '#7c3aed'),
        createPlaceholderImage(`${newEventForm.title.trim()} • Dummy 2`, '#f59e0b'),
      ],
    };

    setEvents((previous) => [createdEvent, ...previous]);
    setSelectedEventId(createdEvent.id);
    setNewEventForm({ title: '', description: '', date: '', location: '', category: 'Community' });
    setUploadMessage(`Created a new event: ${createdEvent.title}.`);
  };

  const handleRemoveImage = (imageIndex) => {
    if (!selectedEvent) return;

    const nextImages = selectedEvent.images.filter((_, index) => index !== imageIndex);
    const fallbackImages = nextImages.length ? nextImages : [createPlaceholderImage(`${selectedEvent.title} • Dummy Cover`, '#0f766e')];

    setEvents((previous) =>
      previous.map((entry) =>
        entry.id === selectedEvent.id
          ? {
              ...entry,
              images: fallbackImages,
              thumbnail: fallbackImages[0],
            }
          : entry
      )
    );
  };

  const handleRemoveEvent = (eventId) => {
    if (!eventId) return;

    setEvents((previous) => {
      const remaining = previous.filter((entry) => entry.id !== eventId);
      if (selectedEvent?.id === eventId) {
        setSelectedEventId(remaining[0]?.id || null);
      }
      return remaining;
    });
    setUploadMessage('Removed the selected event from the gallery.');
  };

  const nextImage = () => {
    if (!selectedEvent) return;
    setCurrentImageIndex((previous) => (previous + 1) % selectedEvent.images.length);
  };

  const previousImage = () => {
    if (!selectedEvent) return;
    setCurrentImageIndex((previous) => (previous - 1 + selectedEvent.images.length) % selectedEvent.images.length);
  };

  return (
    <div className="min-h-screen px-4 py-10 text-slate-50" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="mx-auto max-w-7xl space-y-8">
        {isUploadMode ? (
          <section className="rounded-[2rem] border border-white/10 p-6 shadow-xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.85))' }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Protected uploader</p>
                <h2 className="text-2xl font-semibold">Add images to an event</h2>
              </div>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              ) : null}
            </div>

            {!isAuthenticated ? (
              <form onSubmit={handleLogin} className="mt-6 grid gap-4 rounded-3xl border border-white/10 p-6 md:grid-cols-2" style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)' }}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
                    placeholder="adminabsu.123"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
                    placeholder="qwertyytrewq"
                    autoComplete="current-password"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    {error ? <p className="text-sm text-rose-300">{error}</p> : null}
                    {uploadMessage ? <p className="text-sm text-slate-400">{uploadMessage}</p> : null}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-950 transition disabled:opacity-70"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <Lock className="w-4 h-4" />
                    {loading ? 'Checking access...' : 'Sign in to upload'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-3xl border border-emerald-500/20 p-6" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                      <ShieldCheck className="w-4 h-4" />
                      Upload access enabled
                    </p>
                    <p className="mt-2 text-sm text-slate-100">Choose an event and add one or more images from your device.</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-slate-950 transition" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <Camera className="w-4 h-4" />
                    Upload images
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                  </label>
                </div>
                <form onSubmit={handleCreateEvent} className="mt-6 grid gap-3 rounded-3xl border border-white/10 p-5 md:grid-cols-2" style={{ backgroundColor: 'rgba(15, 23, 42, 0.82)' }}>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-emerald-200">Create a new event</p>
                  </div>
                  <input
                    type="text"
                    value={newEventForm.title}
                    onChange={(event) => setNewEventForm((previous) => ({ ...previous, title: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                    placeholder="Event name"
                  />
                  <input
                    type="date"
                    value={newEventForm.date}
                    onChange={(event) => setNewEventForm((previous) => ({ ...previous, date: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                  />
                  <input
                    type="text"
                    value={newEventForm.location}
                    onChange={(event) => setNewEventForm((previous) => ({ ...previous, location: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                    placeholder="Location"
                  />
                  <input
                    type="text"
                    value={newEventForm.category}
                    onChange={(event) => setNewEventForm((previous) => ({ ...previous, category: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                    placeholder="Category"
                  />
                  <textarea
                    value={newEventForm.description}
                    onChange={(event) => setNewEventForm((previous) => ({ ...previous, description: event.target.value }))}
                    className="md:col-span-2 min-h-[96px] w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                    placeholder="Short description"
                  />
                  <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                    <button type="submit" className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-950" style={{ backgroundColor: 'var(--color-secondary)' }}>
                      Create event
                    </button>
                    {selectedEvent ? (
                      <button type="button" onClick={() => handleRemoveEvent(selectedEvent.id)} className="flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
                        <Trash2 className="w-4 h-4" />
                        Remove current event
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="mt-6 flex flex-wrap gap-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className={`rounded-full px-3 py-2 text-sm transition ${selectedEvent?.id === event.id ? 'text-slate-950' : 'text-slate-200 hover:bg-white/20'}`}
                      style={selectedEvent?.id === event.id ? { backgroundColor: 'var(--color-secondary)' } : { backgroundColor: 'rgba(255,255,255,0.12)' }}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
                {uploadMessage ? <p className="mt-4 text-sm text-slate-100">{uploadMessage}</p> : null}
              </div>
            )}
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-4">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full overflow-hidden rounded-[1.5rem] border text-left transition ${selectedEvent?.id === event.id ? 'shadow-lg shadow-black/20' : 'border-white/10 hover:border-amber-400/50'}`}
                style={selectedEvent?.id === event.id ? { borderColor: 'var(--color-secondary)', backgroundColor: 'rgba(2, 6, 23, 0.92)' } : { backgroundColor: 'rgba(2, 6, 23, 0.82)' }}
              >
                <img src={event.thumbnail} alt={event.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300">
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-300">{formatEventDate(event.date)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-100">{event.description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[2rem] border border-white/10 p-6 shadow-xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(2, 6, 23, 0.95), rgba(15, 23, 42, 0.85))' }}>
            {selectedEvent ? (
              <>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Selected event</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedEvent.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100">{selectedEvent.description}</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${viewMode === 'grid' ? 'text-slate-950' : 'text-slate-200 hover:bg-white/20'}`}
                      style={viewMode === 'grid' ? { backgroundColor: 'var(--color-secondary)' } : { backgroundColor: 'rgba(255,255,255,0.10)' }}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('slideshow')}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${viewMode === 'slideshow' ? 'text-slate-950' : 'text-slate-200 hover:bg-white/20'}`}
                      style={viewMode === 'slideshow' ? { backgroundColor: 'var(--color-secondary)' } : { backgroundColor: 'rgba(255,255,255,0.10)' }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Slideshow
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-100">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-amber-300" />
                    {formatEventDate(selectedEvent.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-300" />
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-amber-300" />
                    {selectedEvent.images.length} image{selectedEvent.images.length === 1 ? '' : 's'}
                  </div>
                </div>

                {viewMode === 'grid' ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {selectedEvent.images.map((image, index) => (
                      <div key={`${selectedEvent.id}-${index}`} className="overflow-hidden rounded-[1.25rem] border border-white/10" style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)' }}>
                        <img src={image} alt={`${selectedEvent.title} ${index + 1}`} className="h-52 w-full object-cover" />
                        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-100">
                          <span>Image {index + 1}</span>
                          <button type="button" onClick={() => handleRemoveImage(index)} className="flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-rose-200 transition hover:bg-rose-500/20">
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-[1.5rem] border border-white/10 p-4" style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)' }}>
                    <div className="relative overflow-hidden rounded-[1.25rem]">
                      <img src={selectedEvent.images[currentImageIndex]} alt={`${selectedEvent.title} slide ${currentImageIndex + 1}`} className="h-[360px] w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <button onClick={previousImage} className="rounded-full bg-white/15 p-2 backdrop-blur">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="rounded-full px-3 py-2 text-sm text-slate-100" style={{ backgroundColor: 'rgba(2, 6, 23, 0.9)' }}>
                          {currentImageIndex + 1} / {selectedEvent.images.length}
                        </div>
                        <button onClick={nextImage} className="rounded-full bg-white/15 p-2 backdrop-blur">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 p-10 text-center text-slate-300">
                Select an event to view its photo gallery.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
