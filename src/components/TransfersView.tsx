import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { PersonTransfer, TransferType } from '../types/budget';
import { formatMoney } from '../data/categories';
import { PageHeader } from './PageHeader';

interface TransfersViewProps {
  onOpenAddModal: () => void;
  onEditTransfer?: (transfer: PersonTransfer) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  onOpenAddModal,
  onEditTransfer,
}) => {
  const {
    filteredTransfers,
    user,
    selectedMonth,
    deleteTransfer,
    settleTransfer,
    exportSingleTransaction,
    exportTransfersReport,
  } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const displayedTransfers = useMemo(() => {
    return filteredTransfers.filter((item) => {
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.personName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.referenceNote && item.referenceNote.toLowerCase().includes(q)) ||
        item.amount.toString().includes(q);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [filteredTransfers, searchQuery, selectedType, selectedStatus]);

  const totalReceived = filteredTransfers
    .filter((t) => t.type === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSent = filteredTransfers
    .filter((t) => t.type === 'sent')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = filteredTransfers
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDownloadSingleExcel = (t: PersonTransfer) => {
    exportSingleTransaction({
      id: t.id,
      type: t.type === 'received' ? 'income' : 'expense',
      title: `P2P Transfer: ${t.type.toUpperCase()} - ${t.personName}`,
      amount: t.amount,
      date: t.date,
      categoryOrSource: t.category,
      personName: t.personName,
      paymentMode: t.paymentMode,
      notes: t.referenceNote,
      status: t.status === 'settled' ? 'Settled & Verified' : 'Pending Settlement',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <PageHeader
        title="Transfers & Split Debts"
        subtitle={`Track money lent, borrowed, split expenses for ${selectedMonth}.`}
        onExportExcel={exportTransfersReport}
        primaryAction={
          <button
            onClick={onOpenAddModal}
            className="btn-primary-gradient text-xs sm:text-sm py-2 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Record Transfer</span>
          </button>
        }
      />

      {/* Triplet Stat Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Received Inflow Card */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Received (Inflow)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-mono-code text-2xl font-bold text-emerald-400">
              +{formatMoney(totalReceived, user.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {filteredTransfers.filter((t) => t.type === 'received').length} incoming peer transfers
            </p>
          </div>
        </div>

        {/* Sent Outflow Card */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sent (Outflow)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-mono-code text-2xl font-bold text-rose-400">
              -{formatMoney(totalSent, user.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {filteredTransfers.filter((t) => t.type === 'sent').length} outgoing peer transfers
            </p>
          </div>
        </div>

        {/* Pending Settle Card */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unsettled Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="font-mono-code text-2xl font-bold text-amber-400">
              {formatMoney(totalPending, user.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {filteredTransfers.filter((t) => t.status === 'pending').length} pending settlement(s)
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search person name, notes, reference ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs sm:text-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
          >
            <option value="All">All Transfer Directions</option>
            <option value="sent">Sent (Money Sent)</option>
            <option value="received">Received (Money Got)</option>
            <option value="split_charge">Split Charge</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="settled">Settled</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Transfers Table */}
      {displayedTransfers.length === 0 ? (
        <div className="py-20 text-center glass-card border border-dashed border-slate-800">
          <p className="text-slate-400 text-sm">
            No peer transfers recorded for this criteria.
          </p>
          <button
            onClick={onOpenAddModal}
            className="btn-primary-gradient mt-4 inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Person Transfer</span>
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-mono-code uppercase text-slate-400 bg-slate-900/60 text-left">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Counterparty</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Purpose</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedTransfers.map((t) => {
                  const isReceived = t.type === 'received';
                  const initials = t.personName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onEditTransfer && onEditTransfer(t)}
                    >
                      <td className="py-3.5 px-4 font-mono-code text-xs text-slate-400 whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                              {t.personName}
                            </div>
                            {t.referenceNote && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                                {t.referenceNote}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-code text-xs uppercase whitespace-nowrap font-bold text-slate-300">
                        <span className={`px-2 py-0.5 rounded-md ${isReceived ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                        {t.category}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            settleTransfer(t.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            t.status === 'settled'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                        >
                          {t.status === 'settled' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono-code text-xs sm:text-sm font-bold whitespace-nowrap ${
                          isReceived ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isReceived ? '+' : '-'}
                        {formatMoney(t.amount, user.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDownloadSingleExcel(t)}
                            title="Download P2P Transfer Excel Voucher (.xls)"
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </button>
                          {onEditTransfer && (
                            <button
                              onClick={() => onEditTransfer(t)}
                              title="Edit Record"
                              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTransfer(t.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

