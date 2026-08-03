import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MessageCircle,
  ThumbsUp,
  PencilLine,
  Megaphone,
  Send,
} from 'lucide-react';
import ContactAdvertisement from './ContactAdvertisement';
import {
  addFeedback,
  addSuggestion,
  addAdRequest,
} from '../utils/contactSubmissions';
import { getWebsiteInfo, subscribeToData } from '../utils/dataManager';

const triggerOptions = [
  { id: 'results', label: 'Results Page' },
  { id: 'badges', label: 'Badge Details' },
];

const fieldClass =
  'w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white';

export default function GetInTouchPage() {
  const [websiteInfo, setWebsiteInfo] = useState(() => getWebsiteInfo());

  useEffect(() => {
    const unsubscribe = subscribeToData(() => {
      setWebsiteInfo(getWebsiteInfo());
    });

    return () => unsubscribe();
  }, []);

  const [active, setActive] = useState('feedback');
  const [successMsg, setSuccessMsg] = useState('');

  // Feedback form
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbMessage, setFbMessage] = useState('');

  // Suggestion form
  const [sgName, setSgName] = useState('');
  const [sgEmail, setSgEmail] = useState('');
  const [sgCategory, setSgCategory] = useState('General');
  const [sgText, setSgText] = useState('');

  // Ad request form
  const [rqName, setRqName] = useState('');
  const [rqEmail, setRqEmail] = useState('');
  const [rqTitle, setRqTitle] = useState('');
  const [rqDescription, setRqDescription] = useState('');
  const [rqType, setRqType] = useState('image');
  const [rqImageUrl, setRqImageUrl] = useState('');
  const [rqVideoUrl, setRqVideoUrl] = useState('');
  const [rqLinkUrl, setRqLinkUrl] = useState('');
  const [rqTriggerOn, setRqTriggerOn] = useState(['results']);

  const resetSuccessSoon = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const toggleTrigger = (id) => {
    setRqTriggerOn((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    if (!fbName.trim() || !fbMessage.trim()) {
      alert('Please enter your name and message.');
      return;
    }
    addFeedback({ name: fbName, email: fbEmail, message: fbMessage });
    setFbName('');
    setFbEmail('');
    setFbMessage('');
    resetSuccessSoon('Thanks! Your feedback was submitted.');
  };

  const submitSuggestion = (e) => {
    e.preventDefault();
    if (!sgName.trim() || !sgText.trim()) {
      alert('Please enter your name and suggestion.');
      return;
    }
    addSuggestion({
      name: sgName,
      email: sgEmail,
      category: sgCategory,
      suggestion: sgText,
    });
    setSgName('');
    setSgEmail('');
    setSgCategory('General');
    setSgText('');
    resetSuccessSoon('Thanks! Your suggestion was submitted.');
  };

  const submitAdRequest = (e) => {
    e.preventDefault();
    if (!rqName.trim() || !rqTitle.trim()) {
      alert('Please enter your name and ad title.');
      return;
    }
    if (rqTriggerOn.length === 0) {
      alert('Please choose where your ad should appear.');
      return;
    }

    if (rqType === 'image' && !rqImageUrl.trim()) {
      alert('Please provide an Image URL for image ads.');
      return;
    }
    if (rqType === 'video' && !rqVideoUrl.trim()) {
      alert('Please provide a Video URL for video ads.');
      return;
    }

    addAdRequest({
      requesterName: rqName,
      requesterEmail: rqEmail,
      title: rqTitle,
      description: rqDescription,
      type: rqType,
      imageUrl: rqImageUrl,
      videoUrl: rqVideoUrl,
      linkUrl: rqLinkUrl,
      triggerOn: rqTriggerOn,
      status: 'Pending',
    });

    setRqName('');
    setRqEmail('');
    setRqTitle('');
    setRqDescription('');
    setRqType('image');
    setRqImageUrl('');
    setRqVideoUrl('');
    setRqLinkUrl('');
    setRqTriggerOn(['results']);

    resetSuccessSoon('Request received! Admin will review your ad.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pt-8 pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-3">
            Get In Touch
          </h1>
          <p className="text-lg text-slate-600">
            Feedback, suggestions, and ad requests—everything in one place.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-lg p-4 font-medium" style={{ backgroundColor: 'rgba(109, 40, 217, 0.12)', border: '1px solid rgba(109, 40, 217, 0.22)', color: 'var(--color-primary)' }}>
            {successMsg}
          </div>
        )}

        {/* Main cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActive('feedback')}
            className={`text-left rounded-2xl p-6 border transition shadow-sm bg-white hover:shadow-md ${
              active === 'feedback' ? 'ring-2' : 'border-slate-200'
            }`}
            style={ active === 'feedback' ? { borderColor: 'var(--color-secondary)', ringColor: 'rgba(22, 163, 74, 0.25)' } : undefined }
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(109,40,217,0.12)] flex items-center justify-center">
                <ThumbsUp className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Feedback</h2>
                <p className="text-slate-600 mt-1">Tell us what’s working and what to improve.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActive('ad')}
            className={`text-left rounded-2xl p-6 border transition shadow-sm bg-white hover:shadow-md ${
              active === 'ad' ? 'ring-2' : 'border-slate-200'
            }`}
            style={ active === 'ad' ? { borderColor: 'var(--color-secondary)', boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.12)' } : undefined }
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(109,40,217,0.12)] flex items-center justify-center">
                <Megaphone className="text-[var(--color-secondary)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Post an Ad</h2>
                <p className="text-slate-600 mt-1">Request an ad for admin approval and publishing.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActive('suggestions')}
            className={`text-left rounded-2xl p-6 border transition shadow-sm bg-white hover:shadow-md ${
              active === 'suggestions' ? 'ring-2' : 'border-slate-200'
            }`}
            style={ active === 'suggestions' ? { borderColor: 'var(--color-secondary)', boxShadow: '0 0 0 2px rgba(109, 40, 217, 0.12)' } : undefined }
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(109,40,217,0.12)] flex items-center justify-center">
                <PencilLine className="text-[var(--color-header)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Suggestions</h2>
                <p className="text-slate-600 mt-1">New ideas for events, badges, and community.</p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {active === 'feedback' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Send Feedback</h3>
                <form onSubmit={submitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                      <input value={fbName} onChange={(e) => setFbName(e.target.value)} className={fieldClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={fbEmail}
                        onChange={(e) => setFbEmail(e.target.value)}
                        className={fieldClass}
                        placeholder="optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                    <textarea
                      value={fbMessage}
                      onChange={(e) => setFbMessage(e.target.value)}
                      className={fieldClass}
                      rows={5}
                      placeholder="Write your feedback..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </button>
                </form>
              </div>
            )}

            {active === 'suggestions' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Send Suggestions</h3>
                <form onSubmit={submitSuggestion} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                      <input value={sgName} onChange={(e) => setSgName(e.target.value)} className={fieldClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={sgEmail}
                        onChange={(e) => setSgEmail(e.target.value)}
                        className={fieldClass}
                        placeholder="optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select value={sgCategory} onChange={(e) => setSgCategory(e.target.value)} className={fieldClass}>
                      <option>General</option>
                      <option>Badges</option>
                      <option>Events</option>
                      <option>Community Service</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Suggestion *</label>
                    <textarea
                      value={sgText}
                      onChange={(e) => setSgText(e.target.value)}
                      className={fieldClass}
                      rows={5}
                      placeholder="Share your idea..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Send className="w-4 h-4" />
                    Submit Suggestion
                  </button>
                </form>
              </div>
            )}

            {active === 'ad' && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Request to Post an Ad</h3>
                <p className="text-slate-600 mb-5">
                  Submit your details. Admin will review and publish the ad if approved.
                </p>

                <form onSubmit={submitAdRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Your Name *</label>
                      <input value={rqName} onChange={(e) => setRqName(e.target.value)} className={fieldClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={rqEmail}
                        onChange={(e) => setRqEmail(e.target.value)}
                        className={fieldClass}
                        placeholder="optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ad Title *</label>
                    <input
                      value={rqTitle}
                      onChange={(e) => setRqTitle(e.target.value)}
                      className={fieldClass}
                      placeholder="e.g., Summer Camp Registration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={rqDescription}
                      onChange={(e) => setRqDescription(e.target.value)}
                      className={fieldClass}
                      rows={3}
                      placeholder="Optional short description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ad Type</label>
                      <select value={rqType} onChange={(e) => setRqType(e.target.value)} className={fieldClass}>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Link URL (optional)</label>
                      <input
                        value={rqLinkUrl}
                        onChange={(e) => setRqLinkUrl(e.target.value)}
                        className={fieldClass}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  {rqType === 'image' ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                      <input
                        value={rqImageUrl}
                        onChange={(e) => setRqImageUrl(e.target.value)}
                        className={fieldClass}
                        placeholder="https://.../image.jpg"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Video URL *</label>
                      <input
                        value={rqVideoUrl}
                        onChange={(e) => setRqVideoUrl(e.target.value)}
                        className={fieldClass}
                        placeholder="https://.../video.mp4"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Where should it show? *</label>
                    <div className="space-y-2">
                      {triggerOptions.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rqTriggerOn.includes(opt.id)}
                            onChange={() => toggleTrigger(opt.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg transition"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <Send className="w-4 h-4" />
                    Submit Ad Request
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Quick Contact</h3>
              <p className="text-slate-600 mb-5">
                Prefer direct messaging? Use the channels below.
              </p>

              <div className="space-y-4">
                <a
                  href="https://instagram.com/zeeshanazam.1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 hover:opacity-95 transition"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Instagram</div>
                      <div className="text-sm opacity-90">@zeeshanazam.1</div>
                    </div>
                  </div>
                </a>

                <a
                  href="https://wa.me/923221318878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white rounded-xl p-4 hover:opacity-95 transition"
                  style={{ background: 'linear-gradient(90deg, var(--color-secondary), var(--color-accent))' }}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-sm opacity-90">+92 322 1318878</div>
                    </div>
                  </div>
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Or email / phone</h4>
                <p className="text-slate-600 text-sm">
                  {websiteInfo?.contactEmail ? (
                    <span>
                      Email: <span className="font-semibold">{websiteInfo.contactEmail}</span>
                    </span>
                  ) : (
                    <span>Email: unavailable</span>
                  )}
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  {websiteInfo?.phone ? (
                    <span>
                      Phone: <span className="font-semibold">{websiteInfo.phone}</span>
                    </span>
                  ) : (
                    <span>Phone: unavailable</span>
                  )}
                </p>
              </div>
            </div>

            {/* Keep existing contact section hidden? Not needed, but we include it for backward compatibility if you want styles.
                Currently ContactAdvertisement itself is a full-width section, so we won't render it here. */}
          </div>
        </div>

        {/* Optional: legacy full section removed from HomePage, but keep component available */}
        <div className="hidden">
          <ContactAdvertisement />
        </div>
      </div>
    </div>
  );
}

