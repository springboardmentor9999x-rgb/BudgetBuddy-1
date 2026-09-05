import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminUsers({ forcedRole = null }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(forcedRole || searchParams.get("role") || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);

  const pageSize = 5;

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Admin users error:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !query ||
        item.email?.toLowerCase().includes(query) ||
        String(item.id).includes(query);

      const matchesRole =
        roleFilter === "all" || item.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.is_active) ||
        (statusFilter === "inactive" && !item.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / pageSize)
  );

  const visibleUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updateRole = async (userId, role) => {
    try {
      setActionLoading(`role-${userId}`);

      await api.put(
        `/admin/users/${userId}/role`,
        null,
        { params: { role } }
      );

      await loadUsers();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to update user role."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (userId, isActive) => {
    try {
      setActionLoading(`status-${userId}`);

      await api.put(
        `/admin/users/${userId}/status`,
        null,
        { params: { is_active: isActive } }
      );

      await loadUsers();
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Unable to update account status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
              Admin Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              User Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage accounts, roles and account status.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <FiUsers className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    All Users
                  </p>
                  <p className="text-xs text-slate-400">
                    {filteredUsers.length} matching users
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search users..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 sm:w-64"
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500"
                >
                  <option value="all">All Roles</option>
                  <option value="normal">Normal</option>
                  <option value="premium">Premium</option>

                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  onClick={loadUsers}
                  className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 hover:bg-slate-50"
                  title="Refresh"
                >
                  <FiRefreshCw className={usersLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    User
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Email
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Role
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                        <FiRefreshCw className="animate-spin" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((item) => {
                    const initial =
                      item.email?.charAt(0).toUpperCase() || "U";

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-600">
                              {initial}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                User #{item.id}
                              </p>
                              <p className="text-xs text-slate-400">
                                Account ID {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.email}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={item.role}
                            onChange={(event) =>
                              updateRole(item.id, event.target.value)
                            }
                            disabled={
                              actionLoading === `role-${item.id}` ||
                              item.id === user?.id
                            }
                            className={`rounded-lg border px-3 py-2 text-xs font-bold outline-none ${
                              item.role === "admin"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : item.role === "premium"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <option value="normal">Normal</option>
                            <option value="premium">Premium</option>
          
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              updateStatus(
                                item.id,
                                !item.is_active
                              )
                            }
                            disabled={
                              actionLoading === `status-${item.id}`
                            }
                            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                              item.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {item.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (page - 1) * pageSize + 1}{" "}
              to{" "}
              {Math.min(page * pageSize, filteredUsers.length)}{" "}
              of {filteredUsers.length} users
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft />
              </button>

              <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminUsers;












