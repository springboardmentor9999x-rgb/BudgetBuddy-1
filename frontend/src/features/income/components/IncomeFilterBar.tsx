import React, { useState, useEffect, useMemo } from 'react';
import {
  RiSearchLine,
  RiFilter3Line,
  RiCalendarEventLine,
  RiCloseLine,
  RiShieldUserLine,
  RiArrowUpDownLine,
  RiMoneyDollarCircleLine,
  RiBankCardLine,
  RiListCheck2,
} from 'react-icons/ri';
import type { IncomeFilterParams, Income } from '../types/income.type.ts';
import useAccountStore from '../../account/store/useAccountStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';
import { fetchAdminUsersApi, type AdminUserListItem } from '../../admin/services/admin.api.ts';

const PREDEFINED_SOURCES = [
  'Salary',
  'Freelance',
  'Investment',
  'Rental',
  'Business',
  'Gift',
  'Refund',
  'Other',
];

interface IncomeFilterBarProps {
  onFilterChange: (filters: IncomeFilterParams) => void;
  incomes: Income[];
  isLoading?: boolean;
}

export const IncomeFilterBar: React.FC<IncomeFilterBarProps> = ({
  onFilterChange,
  incomes,
  isLoading,
}) => {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const bankAccounts = useAccountStore((s) => s.bankAccounts);
  const fetchBankAccounts = useAccountStore((s) => s.fetchBankAccounts);

  // Filter state
  const [search, setSearch] = useState('');
  const [preset, setPreset] = useState<string>('all_time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [userScope, setUserScope] = useState('me');
  const [adminUsers, setAdminUsers] = useState<AdminUserListItem[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch accounts and admin users if admin
  useEffect(() => {
    fetchBankAccounts();
    if (isAdmin) {
      fetchAdminUsersApi({ page_size: 100 })
        .then((res) => setAdminUsers(res.users))
        .catch((err) => console.error('Failed to fetch admin users for filter:', err));
    }
  }, [fetchBankAccounts, isAdmin]);

  // Aggregate dynamic sources from incomes
  const availableSources = useMemo(() => {
    const set = new Set<string>(PREDEFINED_SOURCES);
    incomes.forEach((i) => {
      if (i.source) set.add(i.source);
    });
    return Array.from(set);
  }, [incomes]);

  // Available accounts from bank accounts + cash
  const availableAccounts = useMemo(() => {
    const list = ['Cash'];
    bankAccounts.forEach((acc) => {
      const label = `${acc.bank_name} (${acc.account_number.slice(-4)})`;
      if (!list.includes(label)) list.push(label);
    });
    return list;
  }, [bankAccounts]);

  // Calculate dates based on preset
  const computeDatesForPreset = (presetKey: string): { start?: string; end?: string } => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (presetKey === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: toYMD(first), end: toYMD(last) };
    }
    if (presetKey === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toYMD(first), end: toYMD(last) };
    }
    if (presetKey === 'last_30_days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: toYMD(past), end: toYMD(now) };
    }
    if (presetKey === 'this_year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      return { start: toYMD(first), end: toYMD(last) };
    }
    if (presetKey === 'custom') {
      return { start: startDate || undefined, end: endDate || undefined };
    }
    return {};
  };

  // Build filter object and notify parent
  const applyFilters = (
    overrides?: Partial<{
      search: string;
      preset: string;
      startDate: string;
      endDate: string;
      source: string;
      account: string;
      minAmount: string;
      maxAmount: string;
      sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
      userScope: string;
    }>
  ) => {
    const s = overrides?.search !== undefined ? overrides.search : search;
    const p = overrides?.preset !== undefined ? overrides.preset : preset;
    const sDate = overrides?.startDate !== undefined ? overrides.startDate : startDate;
    const eDate = overrides?.endDate !== undefined ? overrides.endDate : endDate;
    const src = overrides?.source !== undefined ? overrides.source : selectedSource;
    const acc = overrides?.account !== undefined ? overrides.account : selectedAccount;
    const min = overrides?.minAmount !== undefined ? overrides.minAmount : minAmount;
    const max = overrides?.maxAmount !== undefined ? overrides.maxAmount : maxAmount;
    const sort = overrides?.sortBy !== undefined ? overrides.sortBy : sortBy;
    const uScope = overrides?.userScope !== undefined ? overrides.userScope : userScope;

    const dateRange = p === 'custom'
      ? { start: sDate || undefined, end: eDate || undefined }
      : computeDatesForPreset(p);

    const filterPayload: IncomeFilterParams = {
      search: s.trim() || undefined,
      start_date: dateRange.start,
      end_date: dateRange.end,
      source: src !== 'all' ? src : undefined,
      account: acc !== 'all' ? acc : undefined,
      min_amount: min ? parseFloat(min) : undefined,
      max_amount: max ? parseFloat(max) : undefined,
      sort_by: sort,
      user_id: isAdmin && uScope !== 'me' ? uScope : undefined,
    };

    onFilterChange(filterPayload);
  };

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      const dates = computeDatesForPreset(newPreset);
      setStartDate(dates.start || '');
      setEndDate(dates.end || '');
      applyFilters({ preset: newPreset });
    } else {
      setShowAdvanced(true);
    }
  };

  const handleCustomDateApply = () => {
    applyFilters({ preset: 'custom', startDate, endDate });
  };

  const handleClearFilters = () => {
    setSearch('');
    setPreset('all_time');
    setStartDate('');
    setEndDate('');
    setSelectedSource('all');
    setSelectedAccount('all');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('date_desc');
    setUserScope('me');

    onFilterChange({
      sort_by: 'date_desc',
      user_id: undefined,
    });
  };

  // Check if any filter is active
  const isFilterActive =
    search.trim() !== '' ||
    preset !== 'all_time' ||
    selectedSource !== 'all' ||
    selectedAccount !== 'all' ||
    minAmount !== '' ||
    maxAmount !== '' ||
    sortBy !== 'date_desc' ||
    (isAdmin && userScope !== 'me');

  const activeCount = [
    search.trim() !== '',
    preset !== 'all_time',
    selectedSource !== 'all',
    selectedAccount !== 'all',
    minAmount !== '' || maxAmount !== '',
    sortBy !== 'date_desc',
    isAdmin && userScope !== 'me',
  ].filter(Boolean).length;

  return (
    <div className="bg-[#1e252e] border border-white/5 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl space-y-4">
      {/* ─── ROW 1: Search & Quick Presets & Filter Toggle ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search incomes by source or account..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilters({ search: e.target.value });
            }}
            className="w-full bg-[#161c24] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-all"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                applyFilters({ search: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <RiCloseLine size={16} />
            </button>
          )}
        </div>

        {/* Date presets chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <RiCalendarEventLine className="text-emerald-400" />
          </span>
          {[
            { id: 'all_time', label: 'All' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'last_30_days', label: '30 Days' },
            { id: 'this_year', label: 'This Year' },
            { id: 'custom', label: 'Custom' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                preset === p.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
            showAdvanced || isFilterActive
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-white/5 text-gray-400 hover:text-white border-white/5'
          }`}
        >
          <RiFilter3Line className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── ROW 2: Primary Dropdowns (Source, Account, Sort, Admin Scope) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/5">
        {/* Source Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
            <RiListCheck2 className="text-emerald-400" /> Income Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              applyFilters({ source: e.target.value });
            }}
            className="w-full bg-[#161c24] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Sources</option>
            {availableSources.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Account Dropdown */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
            <RiBankCardLine className="text-cyan-400" /> Linked Account
          </label>
          <select
            value={selectedAccount}
            onChange={(e) => {
              setSelectedAccount(e.target.value);
              applyFilters({ account: e.target.value });
            }}
            className="w-full bg-[#161c24] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Accounts</option>
            {availableAccounts.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
            <RiArrowUpDownLine className="text-purple-400" /> Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value as any;
              setSortBy(val);
              applyFilters({ sortBy: val });
            }}
            className="w-full bg-[#161c24] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-purple-500 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: Highest First</option>
            <option value="amount_asc">Amount: Lowest First</option>
          </select>
        </div>

        {/* Admin User Scope (Visible only for Administrator) */}
        {isAdmin ? (
          <div>
            <label className="block text-[11px] font-medium text-amber-300 mb-1 flex items-center gap-1">
              <RiShieldUserLine className="text-amber-400" /> User Scope (Admin)
            </label>
            <select
              value={userScope}
              onChange={(e) => {
                setUserScope(e.target.value);
                applyFilters({ userScope: e.target.value });
              }}
              className="w-full bg-[#1b1629] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-100 outline-none focus:border-amber-400 transition-colors cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="me">👤 My Incomes Only</option>
              <option value="all">🌐 All Users (System-wide)</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id.toString()}>
                  👤 {u.email} {u.full_name ? `(${u.full_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          /* Amount Range Quick Display when non-admin */
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
              <RiMoneyDollarCircleLine className="text-emerald-400" /> Min - Max Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minAmount}
                onChange={(e) => {
                  setMinAmount(e.target.value);
                  applyFilters({ minAmount: e.target.value });
                }}
                className="w-1/2 bg-[#161c24] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
              />
              <span className="text-gray-500 text-xs">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxAmount}
                onChange={(e) => {
                  setMaxAmount(e.target.value);
                  applyFilters({ maxAmount: e.target.value });
                }}
                className="w-1/2 bg-[#161c24] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── ROW 3: Collapsible Advanced Filters (Custom Dates, Amount Range for Admin) ─── */}
      {(showAdvanced || preset === 'custom') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5 animate-fadeIn">
          {/* Custom Start Date */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPreset('custom');
              }}
              className="w-full bg-[#161c24] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Custom End Date */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPreset('custom');
              }}
              className="w-full bg-[#161c24] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Apply Date Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCustomDateApply}
              className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Apply Date Range
            </button>
          </div>

          {/* Amount inputs if admin (since non-admin has it in row 2) */}
          {isAdmin && (
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-1 flex items-center gap-1">
                <RiMoneyDollarCircleLine className="text-emerald-400" /> Amount Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    applyFilters({ minAmount: e.target.value });
                  }}
                  className="w-1/2 bg-[#161c24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                />
                <span className="text-gray-500 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    applyFilters({ maxAmount: e.target.value });
                  }}
                  className="w-1/2 bg-[#161c24] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ROW 4: Active Filter Badges & Reset Button ─── */}
      {isFilterActive && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-[11px]">Active Filters:</span>
            {search && (
              <span className="bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[11px]">
                Search: "{search}"
              </span>
            )}
            {preset !== 'all_time' && (
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[11px]">
                Period: {preset.replace('_', ' ')}
              </span>
            )}
            {selectedSource !== 'all' && (
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[11px]">
                Source: {selectedSource}
              </span>
            )}
            {selectedAccount !== 'all' && (
              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full text-[11px]">
                Account: {selectedAccount}
              </span>
            )}
            {(minAmount || maxAmount) && (
              <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full text-[11px]">
                Amount: ₹{minAmount || '0'} - ₹{maxAmount || '∞'}
              </span>
            )}
            {isAdmin && userScope !== 'me' && (
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-[11px]">
                Scope: {userScope === 'all' ? 'All Users' : `User #${userScope}`}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomeFilterBar;
