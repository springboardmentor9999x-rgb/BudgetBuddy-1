import React, { useEffect, useState } from 'react';
import {
  RiGroupLine,
  RiSearchLine,
  RiFilterLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiShieldUserLine,
  RiVipCrownLine,
  RiUserLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

import ContentWrapper from '../../../components/ContentWrapper.tsx';
import Loading from '../../Loading.tsx';
import DeleteConfirm from '../../DeleteConfirm.tsx';
import CrossUserDataModal from '../components/CrossUserDataModal.tsx';
import { setPageTitle } from '../../../utils/setTitle.ts';
import {
  fetchAdminUsersApi,
  updateUserRoleApi,
  updateUserStatusApi,
  deleteUserApi,
  type AdminUserListItem,
} from '../services/admin.api.ts';

const AdminUsersPage: React.FC = () => {
  setPageTitle('User Management | BudgetBuddy Administration');

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Inspector & Delete modals
  const [inspectUserId, setInspectUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const activeParam =
        statusFilter === 'active' ? true : statusFilter === 'suspended' ? false : undefined;
      const res = await fetchAdminUsersApi({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        is_active: activeParam,
      });
      setUsers(res.users);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load admin users:', err);
      toast.error('Failed to fetch user list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const updated = await updateUserRoleApi(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      toast.success(`User role updated to ${newRole.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update user role.');
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const updated = await updateUserStatusApi(userId, !currentStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u)));
      toast.success(`User ${!currentStatus ? 'activated' : 'suspended'} successfully.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    try {
      await deleteUserApi(deleteUserId);
      toast.success('User permanently deleted.');
      setDeleteUserId(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <RiShieldUserLine /> Admin
          </span>
        );
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <RiVipCrownLine /> Premium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <RiUserLine /> User
          </span>
        );
    }
  };

  return (
    <ContentWrapper>
      <div className="flex-1 max-width mx-auto w-full py-4 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161c24] border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-2xl shadow-lg">
              <RiGroupLine />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  User Management Portal
                </h1>
                <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {total} Registered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Search, inspect cross-user records, change membership tiers, or suspend accounts.
              </p>
            </div>
          </div>

          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <RiRefreshLine className={isLoading ? 'animate-spin' : ''} />
            Refresh Table
          </button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="bg-[#1e252e] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by email address or full name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161c24] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
            />
          </form>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-[#161c24] px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300">
              <RiFilterLine className="text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="premium">Premium</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#161c24] px-3 py-2 rounded-xl border border-white/10 text-xs text-gray-300">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            {(search || roleFilter || statusFilter) && (
              <button
                onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1); }}
                className="text-xs text-gray-400 hover:text-rose-400 px-2 py-1 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Users Table ── */}
        <div className="bg-[#1e252e] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loading />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              <p>No users matching current search and filter parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161c24] text-gray-400 border-b border-white/5 uppercase tracking-wider font-bold text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Tier / Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Footprint</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {(u.full_name?.[0] || u.email[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.full_name || 'No Name Set'}</p>
                            <p className="text-gray-400 text-[11px] font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {getRoleBadge(u.role)}
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-[#161c24] border border-white/10 text-gray-400 text-[10px] rounded-lg px-2 py-1 outline-none hover:text-white cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                            title="Change Role"
                          >
                            <option value="user">User</option>
                            <option value="premium">Premium</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                          title="Click to toggle activation"
                        >
                          {u.is_active ? (
                            <>
                              <RiCheckboxCircleLine /> Active
                            </>
                          ) : (
                            <>
                              <RiCloseCircleLine /> Suspended
                            </>
                          )}
                        </button>
                      </td>

                      {/* Footprint */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] text-gray-400 font-mono">
                          {u.account_count} accts • {u.budget_count} bdgts • {u.transaction_count} txns
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectUserId(u.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/5 transition-all cursor-pointer"
                            title="Inspect User Financial Data (Read-Only)"
                          >
                            <RiEyeLine size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(u.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/5 transition-all cursor-pointer"
                            title="Delete User Permanently"
                          >
                            <RiDeleteBinLine size={15} />
                          </button>
                        </div>
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
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} users
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

      {/* ── Cross-User Inspector Modal ── */}
      <CrossUserDataModal
        userId={inspectUserId}
        onClose={() => setInspectUserId(null)}
      />

      {/* ── Delete Confirm Modal ── */}
      <DeleteConfirm
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteConfirm}
        title="Permanently Delete User Account"
        message="Are you sure you want to delete this user? All their financial records, budgets, accounts, and goals will be permanently deleted."
        isDeleting={isDeleting}
      />
    </ContentWrapper>
  );
};

export default AdminUsersPage;
