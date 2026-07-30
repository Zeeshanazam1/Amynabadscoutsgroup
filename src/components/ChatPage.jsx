import { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../utils/firebaseConfig';
import { getUserProfile } from '../utils/profileManager';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { addDocument, listenToCollection, listenToDocument, purgeOldDocuments } from '../utils/firestoreClient';
import { saveUserProfile } from '../utils/profileManager';

export default function ChatPage() {
  const auth = useMemo(() => getAuth(firebaseApp), []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  const ONE_DAY = 24 * 60 * 60 * 1000;

  useEffect(() => {
    let profileUnsub = null;
    const authUnsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setLoading(false);
        setProfile(null);
        if (typeof profileUnsub === 'function') profileUnsub();
        profileUnsub = null;
        return;
      }

      const savedProfile = getUserProfile(fbUser.uid);
      setProfile(savedProfile);
      setLoading(false);

      // listen to Firestore profile updates for this user
      try {
        profileUnsub = listenToDocument('users', fbUser.uid, (doc) => {
          if (!doc) return;
          setProfile(doc);
          try { saveUserProfile({ uid: doc.id, ...doc }); } catch {}
        });
      } catch {}
    });

    // purge old messages server-side (if available) and listen for live updates
    try {
      purgeOldDocuments('chatMessages', ONE_DAY);
    } catch {}

    const chatUnsub = listenToCollection('chatMessages', (items) => {
      setMessages(items || []);
    }, { orderBy: 'createdAt', direction: 'asc' });

    return () => {
      if (typeof chatUnsub === 'function') chatUnsub();
      if (typeof profileUnsub === 'function') profileUnsub();
      if (typeof authUnsub === 'function') authUnsub();
    };
  }, [auth]);

  const handleSend = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;

    const now = Date.now();
    const msg = {
      senderId: profile.uid || 'unknown',
      sender: profile.name || profile.email || 'You',
      text: draft.trim(),
      timestamp: new Date(now).toLocaleTimeString(),
      createdAt: now,
    };

    try {
      addDocument('chatMessages', msg);
    } catch (err) {
      // fallback to local update if Firestore fails
      setMessages((current) => [...current, { id: `msg-${now}`, ...msg }]);
    }

    setDraft('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div>Loading chat…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <MessageCircle className="mx-auto mb-4 text-teal-600" size={48} />
          <h1 className="text-2xl font-bold mb-3">Sign in to access chat</h1>
          <p className="text-slate-600 mb-6">You need to sign in before using the chat feature.</p>
          <button
            type="button"
            onClick={() => { window.location.hash = '#/auth'; }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition"
          >
            <ArrowLeft size={16} />
            Go to login
          </button>
        </div>
      </div>
    );
  }

  if (!profile.chatAccess) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <MessageCircle className="mx-auto mb-4 text-amber-500" size={48} />
          <h1 className="text-2xl font-bold mb-3">Chat access required</h1>
          <p className="text-slate-600 mb-6">
            Your account must be approved by an admin before you can use the chat feature.
          </p>
          <button
            type="button"
            onClick={() => { window.location.hash = '#/'; }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MessageCircle size={32} /> Chat Room
            </h1>
            <p className="text-slate-600 mt-2">Only approved members can send messages here.</p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.hash = '#/'; }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="h-[52vh] overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 py-16">
                No messages yet. Start the conversation below.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-2xl p-4 bg-teal-50 border border-teal-100">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">{message.sender}</span>
                    <span>{message.timestamp}</span>
                  </div>
                  <p className="text-slate-700">{message.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-5 py-4 flex gap-3 items-center">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 font-semibold transition"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
