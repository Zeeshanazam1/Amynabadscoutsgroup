import { useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { setTheme } from '../utils/themeManager';
import { addDocument } from '../utils/firestoreClient';

const fieldClass =
  'w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white';

const JOINING_KEY = 'scouts_joining_requests';

const readAll = () => {
  const raw = localStorage.getItem(JOINING_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeAll = (items) => {
  localStorage.setItem(JOINING_KEY, JSON.stringify(items));
};

const THEME_BY_CATEGORY = {
  Shaheen: {
    primary: '#facc15', // yellow
    secondary: '#f59e0b',
    accent: '#d97706',
    headerColor: '#78350f',
    footerColor: '#78350f',
  },
  Scout: {
    primary: '#22c55e', // green
    secondary: '#06b6d4',
    accent: '#84cc16',
    headerColor: '#0f172a',
    footerColor: '#0f172a',
  },
  Rover: {
    primary: '#ef4444', // red
    secondary: '#f97316',
    accent: '#dc2626',
    headerColor: '#450a0a',
    footerColor: '#450a0a',
  },
  Leader: {
    primary: '#a855f7', // purple-ish
    secondary: '#06b6d4',
    accent: '#d946ef',
    headerColor: '#4c1d95',
    footerColor: '#4c1d95',
  },
};

export default function JoiningFormPage() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [section, setSection] = useState('Scout');

  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Apply theme as soon as category changes
    if (!selectedCategory) return;
    const theme = THEME_BY_CATEGORY[selectedCategory];
    if (theme) setTheme(theme);
  }, [selectedCategory]);

  const submit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter your name.');

      return;
    }
    if (!selectedCategory) {
      alert('Please select your category (Shaheen / Scout / Rover / Leader).');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a short message.');
      return;
    }

    const categoryToSave = selectedCategory || section;
    const newReq = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      section: categoryToSave,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };

    const items = readAll();
    items.unshift({ id: `join-${Date.now()}`, ...newReq });
    writeAll(items);

    try {
      addDocument('joiningRequests', newReq);
    } catch {}

    setSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setSection('Scout');
    setMessage('');

    setTimeout(() => {
      setSubmitted(false);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-10 pb-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">Joining Form</h1>
          <p className="text-slate-600 mt-2">
            Share your details and message. Our team will get back to you.
          </p>
        </div>

        {submitted && (
          <div className="mb-6 rounded-lg p-4 font-medium flex items-center gap-3" style={{ backgroundColor: 'rgba(109, 40, 217, 0.12)', border: '1px solid rgba(109, 40, 217, 0.22)', color: 'var(--color-primary)' }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            Thanks! Your joining request has been submitted.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  placeholder="optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                  placeholder="optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Which category are you joining?*
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSelectedCategory(v);
                    // Keep original section field for storage/back-compat
                    setSection(v === 'Leader' ? 'Scout' : v);
                  }}
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Select one...
                  </option>
                  <option value="Shaheen">Shaheen</option>
                  <option value="Scout">Scout</option>
                  <option value="Rover">Rover</option>
                  <option value="Leader">Leader</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={fieldClass}
                rows={5}
                placeholder="Tell us about your interest (age group, schedule, etc.)"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </form>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Note: This demo saves joining requests to your browser (localStorage).
        </p>
      </div>
    </div>
  );
}

