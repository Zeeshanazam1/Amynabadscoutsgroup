import { useEffect, useState } from 'react';

import { Trash2 } from 'lucide-react';

import {
  getChatAccessRequests,
  getLeaveApplications,
  setChatAccessRequestStatus,
  setLeaveApplicationStatus,
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

export default function AdminChatControl() {
  const [chatSubTab, setChatSubTab] = useState('new');
  const [leaveSubTab, setLeaveSubTab] = useState('new');

  const [chatAccessRequests, setChatAccessRequests] = useState(getChatAccessRequests());
  const [leaveApplications, setLeaveApplications] = useState(getLeaveApplications());

  useEffect(() => {
    const unsubs = [];
    try {
      // chatAccessRequests normalization because localStorage uses 'requestedAt' (ISO)
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
    setChatAccessRequests(getChatAccessRequests());
    setLeaveApplications(getLeaveApplications());
  };

  const markChatAccess = (requestId, status, requesterId) => {
    setChatAccessRequestStatus(requestId, status);
    if (status === 'Approved' && requesterId) {
      setUserChatAccess(requesterId, true);
    }
    refresh();
  };

  const markLeaveApplication = (applicationId, status) => {
    setLeaveApplicationStatus(applicationId, status);
    refresh();
  };

  const newChat = (chatAccessRequests || []).filter((r) => !r.status || r.status === 'Pending' || r.status === 'Submitted');
  const acceptedChat = (chatAccessRequests || []).filter((r) => r.status === 'Approved');
  const rejectedChat = (chatAccessRequests || []).filter((r) => r.status === 'Rejected');

  const newLeaves = (leaveApplications || []).filter((r) => !r.status || r.status === 'Submitted' || r.status === 'Pending');
  const acceptedLeaves = (leaveApplications || []).filter((r) => r.status === 'Approved');
  const rejectedLeaves = (leaveApplications || []).filter((r) => r.status === 'Rejected');

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chat Control</h2>
        <p className="text-slate-600">Approve chat requests and manage leave applications.</p>
      </div>

      {/* Chat Requests */}
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

        {chatSubTab === 'new' && (
          <div className="space-y-3">
            {newChat.length === 0 ? (
              <div className="text-sm text-slate-500">No new chat requests.</div>
            ) : (
              newChat.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          try { await deleteDocument('chatAccessRequests', r.id); } catch {}
                          try { deleteChatAccessRequest(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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

        {chatSubTab === 'accepted' && (
          <div className="space-y-3">
            {acceptedChat.length === 0 ? (
              <div className="text-sm text-slate-500">No accepted chat requests.</div>
            ) : (
              acceptedChat.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          try { await deleteDocument('chatAccessRequests', r.id); } catch {}
                          try { deleteChatAccessRequest(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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

        {chatSubTab === 'rejected' && (
          <div className="space-y-3">
            {rejectedChat.length === 0 ? (
              <div className="text-sm text-slate-500">No rejected chat requests.</div>
            ) : (
              rejectedChat.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          try { await deleteDocument('chatAccessRequests', r.id); } catch {}
                          try { deleteChatAccessRequest(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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
      </div>

      {/* Leave Applications */}
      <div className="mt-8">
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

        {leaveSubTab === 'new' && (
          <div className="space-y-3">
            {newLeaves.length === 0 ? (
              <div className="text-sm text-slate-500">No new leave applications.</div>
            ) : (
              newLeaves.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          onClick={() => markLeaveApplication(r.id, 'Approved')}
                          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => markLeaveApplication(r.id, 'Rejected')}
                          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this leave application?')) return;
                          try { await deleteDocument('leaveApplications', r.id); } catch {}
                          try { deleteLeaveApplication(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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

        {leaveSubTab === 'accepted' && (
          <div className="space-y-3">
            {acceptedLeaves.length === 0 ? (
              <div className="text-sm text-slate-500">No accepted leave applications.</div>
            ) : (
              acceptedLeaves.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          try { await deleteDocument('leaveApplications', r.id); } catch {}
                          try { deleteLeaveApplication(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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

        {leaveSubTab === 'rejected' && (
          <div className="space-y-3">
            {rejectedLeaves.length === 0 ? (
              <div className="text-sm text-slate-500">No rejected leave applications.</div>
            ) : (
              rejectedLeaves.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white">
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
                          try { await deleteDocument('leaveApplications', r.id); } catch {}
                          try { deleteLeaveApplication(r.id); } catch {}
                          refresh();
                        }}
                        className="text-red-600 hover:text-red-800 transition"
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
      </div>
    </div>
  );
}

