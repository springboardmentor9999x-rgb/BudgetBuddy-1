import React, { useEffect, useState } from 'react';
import {
  RiSearchLine,
  RiFilterLine,
  RiRefreshLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiHistoryLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

import ContentWrapper from '../../../components/ContentWrapper.tsx';
import Loading from '../../Loading.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';
import {
  fetchSystemLogsApi,
  type AuditLogItem,
} from '../services/admin.api.ts';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'AUTH_LOGIN', label: 'User Logins' },
  { value: 'AUTH_LOGIN_FAILED', label: 'Failed Logins' },
  { value: 'AUTH_SIGNUP', label: 'New Signups' },
  { value: 'EXPORT_EXCEL', label: 'Excel Exports' },
  { value: 'EXPORT_PDF', label: 'PDF Exports' },
  { value: 'USER_ROLE_UPDATED', label: 'Role Changes' },
  { value: 'USER_STATUS_UPDATED', label: 'Status Toggles' },
  { value: 'CROSS_USER_DATA_VIEWED', label: 'Cross-User Inspections' },
  { value: 'USER_DELETED_BY_ADMIN', label: 'User Deletions' },
  { value: 'USER_TIER_UPGRADED', label: 'Tier Self-Upgrades' },
];

const AdminLogsPage: React.FC = () => {
  setPageTitle('System Audit Logs | BudgetBuddy Administration');

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSystemLogsApi({
        page,
        page_size: pageSize,
        action: actionFilter || undefined,
        status_filter: statusFilter || undefined,
        user_email: userEmail.trim() || undefined,
      });
      setLogs(res.logs);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load system audit logs:', err);
      toast.error('Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <RiCheckDoubleLine /> SUCCESS
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <RiAlertLine /> DENIED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
            <RiCloseCircleLine /> FAILED
          </span>
        );
    }
  };

  const getActionColor = (action: string) => {
    if (action.startsWith('AUTH_LOGIN_FAILED') || action.includes('DELETED')) return 'text-rose-400';
    if (action.startsWith('AUTH_LOGIN') || action.startsWith('AUTH_SIGNUP')) return 'text-cyan-400';
    if (action.startsWith('EXPORT')) return 'text-emerald-400';
    if (action.includes('ROLE') || action.includes('UPGRADED')) return 'text-amber-400';
    if (action.includes('CROSS_USER')) return 'text-purple-400';
    return 'text-gray-300';
  };

  return (
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full py-4 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161c24] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl shadow-lg">
              <RiHistoryLine />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  System Audit & Security Logs
                </h1>
                <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {total} Records
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Traceable administrative audit trail, role modifications, access validations, and exports.
              </p>
            </div>
          </div>

          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <RiRefreshLine className={isLoading ? 'animate-spin' : ''} />
            Refresh Logs
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="bg-[#1e252e] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search logs by user email address..."
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-[#161c24] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-all"
            />
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Action selector */}
            <div className="flex items-center gap-1.5 bg-[#161c24] px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300">
              <RiFilterLine className="text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-1.5 bg-[#161c24] px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="DENIED">Denied</option>
              </select>
            </div>

            {(userEmail || actionFilter || statusFilter) && (
              <button
                onClick={() => { setUserEmail(''); setActionFilter(''); setStatusFilter(''); setPage(1); }}
                className="text-xs text-gray-400 hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Logs Table ── */}
        <div className="bg-[#1e252e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loading />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <p>No audit log records found for the selected query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161c24] text-gray-400 border-b border-white/5 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 text-white text-[11px] whitespace-nowrap">
                        {log.user_email || 'Anonymous / System'}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4">
                        <span className={`font-bold text-[11px] ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-gray-300 font-sans text-xs max-w-md truncate">
                        {log.details || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-right">
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="p-4 bg-[#161c24] border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span>
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} audit records
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-gray-300 disabled:opacity-30 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * pageSize >= total}
                  className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-gray-300 disabled:opacity-30 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentWrapper>
  );
};

export default AdminLogsPage;
