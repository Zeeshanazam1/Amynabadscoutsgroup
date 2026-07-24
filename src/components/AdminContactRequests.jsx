import { useState, useEffect } from 'react';

import { CheckCircle2, Trash2, X } from 'lucide-react';


import {
  getAdRequests,
  getFeedbackSubmissions,
  getSuggestionSubmissions,
  getChatAccessRequests,
  getLeaveApplications,
  setAdRequestStatus,
  setChatAccessRequestStatus,
  setLeaveApplicationStatus,
  deleteAdRequest,
  deleteFeedbackSubmission,
  deleteSuggestionSubmission,
  deleteChatAccessRequest,
  deleteLeaveApplication,
} from '../utils/contactSubmissions';
import { listenToCollection, deleteDocument } from '../utils/firestoreClient';
import { setUserChatAccess } from '../utils/profileManager';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function AdminContactRequests({ mode, defaultTab } = {}) {
  const isContactMode = mode === 'contact';
  const isChatMode = mode === 'chat';

  const [activeTab, setActiveTab] = useState(defaultTab || 'ad-requests');

  const [chatSubTab, setChatSubTab] = useState('new');
  const [leaveSubTab, setLeaveSubTab] = useState('new');

  const [adRequests, setAdRequests] = useState(getAdRequests());
  const [feedbacks, setFeedbacks] = useState(getFeedbackSubmissions());
  const [suggestions, setSuggestions] = useState(getSuggestionSubmissions());
  const [chatAccessRequests, setChatAccessRequests] = useState(getChatAccessRequests());
  const [leaveApplications, setLeaveApplications] = useState(getLeaveApplications());

  // const [loading, setLoading] = useState(false);


  // Listen to Firestore collections for live updates (fallback to localStorage)
  useEffect(() => {
    const unsubs = [];
    try {
      unsubs.push(listenToCollection('adRequests', setAdRequests, { orderBy: 'createdAt', direction: 'desc' }));
      unsubs.push(listenToCollection('feedback', setFeedbacks, { orderBy: 'createdAt', direction: 'desc' }));
      unsubs.push(listenToCollection('suggestions', setSuggestions, { orderBy: 'createdAt', direction: 'desc' }));

      // chatAccessRequests needs normalization because localStorage uses 'requestedAt' (ISO)
      unsubs.push(
        listenToCollection('chatAccessRequests', (items) => {
          if (!items || items.length === 0) {
            setChatAccessRequests(getChatAccessRequests());
            return;
          }
          const normalized = items.map((d) => ({
            id: d.id,
            requesterId: d.requesterId || d.requesterUID || '',
            requesterName: d.requesterName || d.name || '',
            requesterEmail: d.requesterEmail || d.email || '',
            message: d.message || d.msg || '',
            status: d.status || 'Pending',
            requestedAt: d.requestedAt || (d.createdAt ? new Date(d.createdAt).toISOString() : undefined),
          }));
          setChatAccessRequests(normalized);
        }, { orderBy: 'createdAt', direction: 'desc' })
      );

      // leave applications listener
      unsubs.push(
        listenToCollection('leaveApplications', (items) => {
          if (!items || items.length === 0) {
            setLeaveApplications(getLeaveApplications());
            return;
          }
          const normalized = items.map((d) => ({
            id: d.id,
            requesterId: d.requesterId || d.requesterUID || '',
            requesterName: d.requesterName || d.name || '',
            requesterEmail: d.requesterEmail || d.email || '',
            leaveType: d.leaveType || d.type || '',
            startDate: d.startDate || null,
            endDate: d.endDate || null,
            reason: d.reason || '',
            status: d.status || 'Submitted',
            createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : d.requestedAt || undefined,
          }));
          setLeaveApplications(normalized);
        }, { orderBy: 'createdAt', direction: 'desc' })
      );
    } catch {
      // ignore — fallback already uses localStorage
    }

    return () => unsubs.forEach((u) => typeof u === 'function' && u());
  }, []);

  const refresh = () => {
    setAdRequests(getAdRequests());
    setFeedbacks(getFeedbackSubmissions());
    setSuggestions(getSuggestionSubmissions());
    setChatAccessRequests(getChatAccessRequests());
    setLeaveApplications(getLeaveApplications());
  };

  const mark = (id, status) => {
    setAdRequestStatus(id, status);
    refresh();
  };

  const markChatAccess = (requestId, status, requesterId) => {
    setChatAccessRequestStatus(requestId, status);
    if (status === 'Approved' && requesterId) {
      setUserChatAccess(requesterId, true);
    }
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact & Ad Requests</h2>
        <p className="text-slate-600">Review feedback, suggestions, and ad requests from visitors.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab('ad-requests')}
          className={`px-4 py-2 rounded-lg border transition font-semibold ${
            activeTab === 'ad-requests'
              ? 'bg-green-50 border-green-600 text-green-800'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Ad Requests ({adRequests.length})
        </button>
        {/* Feedback and Suggestions tabs removed per request */}


        {(!isContactMode || isChatMode) && (


          <>
            <button
              onClick={() => setActiveTab('chat-access')}
              className={`px-4 py-2 rounded-lg border transition font-semibold ${
                activeTab === 'chat-access'
                  ? 'bg-green-50 border-green-600 text-green-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Chat Requests ({chatAccessRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('leave-apps')}
              className={`px-4 py-2 rounded-lg border transition font-semibold ${
                activeTab === 'leave-apps'
                  ? 'bg-green-50 border-green-600 text-green-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Leave Applications ({leaveApplications.length})
            </button>
          </>
        )}
      </div>

      {activeTab === 'ad-requests' && (
        <div className="space-y-4">
          {adRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
              <p>No ad requests yet.</p>
            </div>
          ) : (
            adRequests.map((r) => (
              <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{r.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : r.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status || 'Pending'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">{r.description || '—'}</p>

                    <div className="text-sm text-slate-700 space-y-1">
                      <p>
                        <span className="font-semibold">Requester:</span> {r.requesterName || '—'}
                      </p>
                      {r.requesterEmail && (
                        <p>
                          <span className="font-semibold">Email:</span> {r.requesterEmail}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">Type:</span> {r.type}
                      </p>
                      <p>
                        <span className="font-semibold">Shows on:</span>{' '}
                        {(r.triggerOn || []).join(', ') || '—'}
                      </p>
                      <p>
                        <span className="font-semibold">Requested:</span> {formatDate(r.requestedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <button
                        onClick={() => mark(r.id, 'Approved')}
                        className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition flex items-center gap-2"
                        title="Approve request"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => mark(r.id, 'Rejected')}
                        className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition flex items-center gap-2"
                        title="Reject request"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this ad request?')) return;
                        try {
                          await deleteDocument('adRequests', r.id);
                        } catch (err) {
                          // ignore
                        }

                        deleteAdRequest(r.id);
                        refresh();
                      }}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Note: Feedback/Suggestions tabs intentionally kept for CONTACT mode only.
          In CHAT mode, these are hidden (handled via the tab bar above). */}
      {(isContactMode || !isChatMode) && activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
              <p>No feedback yet.</p>
            </div>
          ) : (
            feedbacks.map((f) => (
              <div key={f.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{f.name || 'Anonymous'}</h3>
                      {f.email && <span className="text-xs text-slate-500">{f.email}</span>}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{f.message || ''}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatDate(f.createdAt)}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this feedback submission?')) return;
                      try {
                        await deleteDocument('feedback', f.id);
                      } catch {}
                      deleteFeedbackSubmission(f.id);
                      refresh();
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {(isContactMode || !isChatMode) && activeTab === 'suggestions' && (
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
              <p>No suggestions yet.</p>
            </div>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{s.name || 'Anonymous'}</h3>
                      {s.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {s.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{s.suggestion || ''}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {s.email ? `${s.email} • ` : ''}
                      {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this suggestion submission?')) return;
                      try {
                        await deleteDocument('suggestions', s.id);
                      } catch {}
                      deleteSuggestionSubmission(s.id);
                      refresh();
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}


      {/* Chat control is separate sidebar item */}
      {isChatMode && activeTab === 'chat-access' && (


        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setChatSubTab('new')}
              className={`px-3 py-1 rounded-lg ${chatSubTab === 'new' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              New
            </button>
            <button
              onClick={() => setChatSubTab('accepted')}
              className={`px-3 py-1 rounded-lg ${chatSubTab === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              Accepted
            </button>
            <button
              onClick={() => setChatSubTab('rejected')}
              className={`px-3 py-1 rounded-lg ${chatSubTab === 'rejected' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              Rejected
            </button>
          </div>

          {(() => {
            const newChat = (chatAccessRequests || []).filter((r) => !r.status || r.status === 'Pending' || r.status === 'Submitted');
            const acceptedChat = (chatAccessRequests || []).filter((r) => r.status === 'Approved');
            const rejectedChat = (chatAccessRequests || []).filter((r) => r.status === 'Rejected');

            if (chatSubTab === 'new') {
              return newChat.length === 0 ? (
                <div className="text-sm text-slate-500">No new chat requests.</div>
              ) : newChat.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">New</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{r.message}</p>
                      <div className="text-sm text-slate-700 space-y-1">
                        <p><span className="font-semibold">Email:</span> {r.requesterEmail || '—'}</p>
                        <p><span className="font-semibold">Requested:</span> {formatDate(r.requestedAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => markChatAccess(r.id, 'Approved', r.requesterId)}
                          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => markChatAccess(r.id, 'Rejected', r.requesterId)}
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this chat access request?')) return;
                          try {
                            await deleteDocument('chatAccessRequests', r.id);
                          } catch {}
                          try {
                            deleteChatAccessRequest(r.id);
                          } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ));
            }

            if (chatSubTab === 'accepted') {
              return acceptedChat.length === 0 ? (
                <div className="text-sm text-slate-500">No accepted chat requests.</div>
              ) : acceptedChat.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                      <p className="text-sm text-slate-700">{r.requesterEmail || ''}</p>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(r.requestedAt)}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Accepted</span>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this chat access request?')) return;
                          try {
                            await deleteDocument('chatAccessRequests', r.id);
                          } catch {}
                          try {
                            deleteChatAccessRequest(r.id);
                          } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ));
            }

            // rejected
            return rejectedChat.length === 0 ? (
              <div className="text-sm text-slate-500">No rejected chat requests.</div>
            ) : rejectedChat.map((r) => (
              <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                    <p className="text-sm text-slate-700">{r.requesterEmail || ''}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatDate(r.requestedAt)}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Rejected</span>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this chat access request?')) return;
                        try {
                          await deleteDocument('chatAccessRequests', r.id);
                        } catch {}
                        try {
                          deleteChatAccessRequest(r.id);
                        } catch {}
                        refresh();
                      }}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {!isContactMode && activeTab === 'leave-apps' && (
        <div>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setLeaveSubTab('new')}
              className={`px-3 py-1 rounded-lg ${leaveSubTab === 'new' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              New
            </button>
            <button
              onClick={() => setLeaveSubTab('accepted')}
              className={`px-3 py-1 rounded-lg ${leaveSubTab === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              Accepted
            </button>
            <button
              onClick={() => setLeaveSubTab('rejected')}
              className={`px-3 py-1 rounded-lg ${leaveSubTab === 'rejected' ? 'bg-green-50 border border-green-200' : 'bg-white border border-slate-200'}`}
            >
              Rejected
            </button>
          </div>

          {(() => {
            const newLeaves = (leaveApplications || []).filter((r) => !r.status || r.status === 'Submitted' || r.status === 'Pending');
            const acceptedLeaves = (leaveApplications || []).filter((r) => r.status === 'Approved');
            const rejectedLeaves = (leaveApplications || []).filter((r) => r.status === 'Rejected');

            if (leaveSubTab === 'new') {
              return newLeaves.length === 0 ? (
                <div className="text-sm text-slate-500">No new leave applications.</div>
              ) : newLeaves.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">New</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{r.reason || '—'}</p>
                      <div className="text-sm text-slate-700 space-y-1">
                        <p><span className="font-semibold">Email:</span> {r.requesterEmail || '—'}</p>
                        <p><span className="font-semibold">Dates:</span> {r.startDate || '—'} → {r.endDate || '—'}</p>
                        <p><span className="font-semibold">Submitted:</span> {formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (confirm('Approve this leave application?')) {
                              setLeaveApplicationStatus(r.id, 'Approved');
                              refresh();
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Reject this leave application?')) {
                              setLeaveApplicationStatus(r.id, 'Rejected');
                              refresh();
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this leave application?')) return;
                          try {
                            await deleteDocument('leaveApplications', r.id);
                          } catch {}
                          try {
                            deleteLeaveApplication(r.id);
                          } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ));
            }

            if (leaveSubTab === 'accepted') {
              return acceptedLeaves.length === 0 ? (
                <div className="text-sm text-slate-500">No accepted leave applications.</div>
              ) : acceptedLeaves.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                      <p className="text-sm text-slate-700">{r.leaveType || ''} • {r.startDate || '—'} → {r.endDate || '—'}</p>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Accepted</span>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this leave application?')) return;
                          try {
                            await deleteDocument('leaveApplications', r.id);
                          } catch {}
                          try {
                            deleteLeaveApplication(r.id);
                          } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ));
            }

            // rejected
            return rejectedLeaves.length === 0 ? (
              <div className="text-sm text-slate-500">No rejected leave applications.</div>
            ) : rejectedLeaves.map((r) => (
              <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white mb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{r.requesterName || 'Anonymous'}</h3>
                    <p className="text-sm text-slate-700">{r.leaveType || ''} • {r.startDate || '—'} → {r.endDate || '—'}</p>
                    <p className="text-xs text-slate-500 mt-2">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Rejected</span>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this leave application?')) return;
                        try {
                          await deleteDocument('leaveApplications', r.id);
                        } catch {}
                        try {
                          deleteLeaveApplication(r.id);
                        } catch {}
                        refresh();
                      }}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {false && <div className="mt-6 text-center text-slate-500 text-sm">Loading…</div>}

    </div>
  );
}

