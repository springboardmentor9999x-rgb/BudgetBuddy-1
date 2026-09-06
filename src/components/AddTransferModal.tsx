import React, { useState } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Users } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { PersonTransfer, TransferType } from '../types/budget';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PersonTransfer | null;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addTransfer, updateTransfer, user } = useBudget();

  const [personName, setPersonName] = useState(initialData?.personName || '');
  const [type, setType] = useState<TransferType>(initialData?.type || 'received');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [category, setCategory] = useState(initialData?.category || 'Dinner & Food Split');
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<PersonTransfer['status']>(
    initialData?.status || 'settled'
  );
  const [paymentMode, setPaymentMode] = useState<PersonTransfer['paymentMode']>(
    initialData?.paymentMode || 'UPI'
  );
  const [referenceNote, setReferenceNote] = useState(initialData?.referenceNote || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (initialData) {
      updateTransfer(initialData.id, {
        personName,
        type,
        amount: numAmount,
        category,
        date,
        status,
        paymentMode,
        referenceNote,
      });
    } else {
      addTransfer({
        personName,
        type,
        amount: numAmount,
        category,
        date,
        status,
        paymentMode,
        referenceNote,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg shadow-2xl border-slate-800 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code uppercase tracking-wider text-cyan-400 font-semibold">
                Peer-to-Peer Ledger
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white mt-0.5">
              {initialData ? 'Edit Transfer Voucher' : 'Record P2P Transfer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transfer Type Segment */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('received')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'received'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Received</span>
            </button>
            <button
              type="button"
              onClick={() => setType('sent')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'sent'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sent</span>
            </button>
            <button
              type="button"
              onClick={() => setType('split_charge')}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'split_charge'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Amount ({user.currency})</label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 glass-input font-mono-code text-xl sm:text-2xl font-bold text-white"
            />
          </div>

          {/* Counterparty name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Person Name / Counterparty</label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Ramesh, Priya, Rohan"
              className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm"
            />
          </div>

          {/* Purpose & Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Reason / Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Dinner split, Rent share"
                className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Payment Channel</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
              >
                <option value="UPI" className="bg-slate-900 text-slate-200">UPI (Google Pay, PhonePe)</option>
                <option value="Bank Transfer" className="bg-slate-900 text-slate-200">Bank Transfer / IMPS</option>
                <option value="Cash" className="bg-slate-900 text-slate-200">Cash</option>
                <option value="Card" className="bg-slate-900 text-slate-200">Card</option>
                <option value="Digital Wallet" className="bg-slate-900 text-slate-200">Digital Wallet</option>
              </select>
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Transaction Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm font-mono-code"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Settlement Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 glass-input text-xs sm:text-sm cursor-pointer"
              >
                <option value="settled" className="bg-slate-900 text-slate-200">Settled / Completed</option>
                <option value="pending" className="bg-slate-900 text-slate-200">Pending Claim</option>
              </select>
            </div>
          </div>

          {/* Reference note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Reference Note / Transaction ID</label>
            <input
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="e.g. UPI Ref #4029103810"
              className="w-full px-4 py-2.5 glass-input text-xs sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-glass text-xs sm:text-sm py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-gradient text-xs sm:text-sm py-2 px-5 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Save Transfer' : 'Record Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

