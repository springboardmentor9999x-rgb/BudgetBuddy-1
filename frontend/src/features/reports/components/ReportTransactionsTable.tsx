import React, { useState, useMemo } from 'react';
import {
  RiSearchLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFileExcel2Line,
  RiCalendarLine,
  RiUserLine,
} from 'react-icons/ri';
import type { ReportTransactionItem } from '../types/report.type.ts';
import { useReportStore } from '../store/useReportStore.ts';
import { useAuthStore } from '../../auth/store/useAuthStore.ts';

interface Props {
  transactions: ReportTransactionItem[];
  onExportExcel?: () => void;
  isExportingExcel?: boolean;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export const ReportTransactionsTable: React.FC<Props> = ({
  transactions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const {
    exportTransactionsExcel,
    isExportingExcel: isExportingTxExcel,
  } = useReportStore();

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const cat = (t.category_or_source || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const acct = (t.account || '').toLowerCase();
        const userEmail = (t.user_email || '').toLowerCase();
        const amt = t.amount.toString();
        return (
          cat.includes(q) ||
          desc.includes(q) ||
          acct.includes(q) ||
          amt.includes(q) ||
          userEmail.includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [transactions, typeFilter, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  return (
    <div className="bg-[#161c24] border border-white/5 rounded-2xl shadow-xl overflow-hidden mb-8">
      {/* ── Table Top Bar ── */}
      <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-200">Transaction History Ledger</h3>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              Transactions Export
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Full executive summary reports are available above.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search category, note, bank..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0f141a] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Filter */}
          <div className="flex items-center bg-[#0f141a] border border-white/10 rounded-xl p-0.5">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  typeFilter === t
                    ? t === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : t === 'expense'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export Transactions CSV
          <button
            onClick={exportTransactionsCsv}
            disabled={isExportingCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Download Transactions Ledger (.csv)"
          >
            <RiDownload2Line className="text-sm" />
            {isExportingCsv ? 'Exporting...' : 'Export CSV'}
          </button> */}

          {/* Export Transactions Excel */}
          <button
            onClick={exportTransactionsExcel}
            disabled={isExportingTxExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Download Transactions Ledger (.xlsx)"
          >
            <RiFileExcel2Line className="text-sm" />
            {isExportingTxExcel ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* ── Table Content ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#12171e] text-gray-400 uppercase tracking-wider font-semibold border-b border-white/5">
            <tr>
              <th className="py-3 px-4"># ID</th>
              {isAdmin && <th className="py-3 px-4 text-purple-300">User</th>}
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <RiArrowUpLine /> : <RiArrowDownLine />
                  ) : (
                    <RiArrowUpDownLine className="text-gray-600" />
                  )}
                </div>
              </th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Category / Source</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Description</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {sortField === 'amount' ? (
                    sortOrder === 'asc' ? <RiArrowUpLine /> : <RiArrowDownLine />
                  ) : (
                    <RiArrowUpDownLine className="text-gray-600" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-gray-500">
                  No transactions found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const formattedDate = tx.date
                  ? new Date(tx.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '-';

                return (
                  <tr
                    key={`${tx.type}-${tx.id}`}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-500 font-mono">#{tx.id}</td>
                    {isAdmin && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md text-[11px] font-mono">
                          <RiUserLine className="text-purple-400 shrink-0" />
                          {tx.user_email || (tx.user_id ? `User #${tx.user_id}` : '-')}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <RiCalendarLine className="text-gray-500" />
                        {formattedDate}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-200">
                      {tx.category_or_source}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#0f141a] px-2 py-0.5 rounded-md border border-white/5 text-gray-400 font-mono text-[11px]">
                        {tx.account || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 max-w-[240px] truncate">
                      {tx.description || '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold whitespace-nowrap font-mono text-sm ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}₹
                      {tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    currentPage === pageNum
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
