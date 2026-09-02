import React, { useEffect, useState } from 'react';
import {
  RiVipCrownLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiRefreshLine,
  RiUserLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import {
  fetchAdminSubscriptionRequestsApi,
  approveSubscriptionRequestApi,
  rejectSubscriptionRequestApi,
} from '../../subscriptions/services/subscription.api.ts';
import type { SubscriptionRequestItem } from '../../subscriptions/types/subscription.type.ts';

interface Props {
  onRequestProcessed?: () => void;
}

export const SubscriptionRequestsSection: React.FC<Props> = ({ onRequestProcessed }) => {
  const [requests, setRequests] = useState<SubscriptionRequestItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async (status = statusFilter) => {
    setIsLoading(true);
    try {
      const data = await fetchAdminSubscriptionRequestsApi(status, 1, 30);
      setRequests(data.requests);
      setPendingCount(data.pending_count);
    } catch (err: any) {
      console.error('Failed to load subscription requests:', err);
      toast.error('Failed to fetch subscription requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(statusFilter);
  }, [statusFilter]);

  const handleApprove = async (id: number, email: string) => {
    setProcessingId(id);
    try {
      await approveSubscriptionRequestApi(id);
      toast.success(`🎉 Approved Premium access for ${email}`);
      await loadRequests();
      if (onRequestProcessed) onRequestProcessed();
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      toast.error(err?.response?.data?.detail || 'Failed to approve subscription.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId) return;
    setProcessingId(rejectingId);
    try {
      await rejectSubscriptionRequestApi(rejectingId, rejectReason);
      toast.success('Subscription request rejected.');
      setRejectingId(null);
      setRejectReason('');
      await loadRequests();
      if (onRequestProcessed) onRequestProcessed();
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      toast.error(err?.response?.data?.detail || 'Failed to reject subscription.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#1e252e] rounded-2xl p-5 sm:p-6 border border-white/5 shadow-xl space-y-4">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl shadow-lg">
            <RiVipCrownLine />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Subscription Approval Requests
              </h2>
              {pendingCount > 0 && (
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <RiTimeLine /> {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Review and approve or reject user requests to unlock the Premium tier.
            </p>
          </div>
        </div>

        {/* Filter Pills & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#141920] p-1 rounded-xl border border-white/10 text-xs">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadRequests()}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm border border-white/5 transition-all cursor-pointer"
            title="Refresh requests"
          >
            <RiRefreshLine className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Request List ── */}
      {isLoading && requests.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400 bg-white/[0.02] border border-white/5 rounded-xl">
          No {statusFilter !== 'all' ? statusFilter : ''} subscription requests found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Date Requested</th>
                <th className="py-2.5 px-3">User Note</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.map((r) => {
                const isPending = r.status === 'pending';
                const isApproved = r.status === 'approved';
                const isRejected = r.status === 'rejected';

                return (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                          <RiUserLine />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {r.user_name || r.user_email.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-gray-400">{r.user_email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-gray-300 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                    </td>

                    <td className="py-3 px-3 max-w-[220px]">
                      {r.user_note ? (
                        <p className="text-gray-300 truncate" title={r.user_note}>
                          "{r.user_note}"
                        </p>
                      ) : (
                        <span className="text-gray-500 italic">None provided</span>
                      )}
                      {r.admin_response && (
                        <p className="text-[10px] text-amber-400 mt-0.5 truncate" title={r.admin_response}>
                          Admin: {r.admin_response}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isPending && <RiTimeLine />}
                        {isApproved && <RiCheckLine />}
                        {isRejected && <RiCloseLine />}
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id, r.user_email)}
                            disabled={processingId === r.id}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                            title="Approve to make user Premium"
                          >
                            <RiCheckLine />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(r.id);
                              setRejectReason('');
                            }}
                            disabled={processingId === r.id}
                            className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            title="Reject subscription request"
                          >
                            <RiCloseLine />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500">
                          Reviewed {r.reviewer_email ? `by ${r.reviewer_email.split('@')[0]}` : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#161c24] border border-rose-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 text-rose-400">
                <RiCloseLine className="text-lg" /> Reject Subscription Request
              </h3>
              <button
                onClick={() => setRejectingId(null)}
                className="text-gray-400 hover:text-white"
              >
                <RiCloseLine size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1 font-medium">
                Reason / feedback for requester (optional):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Incomplete profile details, please contact support."
                className="w-full bg-[#0f141a] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={processingId === rejectingId}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionRequestsSection;
