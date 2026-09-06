import React from 'react';
import {
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  Target,
  Sparkles,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { ExpenseCategory } from '../types/budget';
import { EXPENSE_CATEGORIES_META, formatMoney } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { PageHeader } from './PageHeader';

interface BudgetPlanViewProps {
  onOpenBudgetModal: (category?: ExpenseCategory) => void;
}

export const BudgetPlanView: React.FC<BudgetPlanViewProps> = ({ onOpenBudgetModal }) => {
  const {
    budgets,
    user,
    selectedMonth,
    monthlyDashboard,
    deleteBudget,
    setBudgetLimit,
    exportBudgetsReport,
  } = useBudget();

  const { budgetStatuses, totalExpenses, totalIncome, budgetTotalLimit, budgetTotalSpent } =
    monthlyDashboard;

  const categoriesList = Object.keys(EXPENSE_CATEGORIES_META) as ExpenseCategory[];

  const configuredCategories = new Set(
    budgets
      .filter((b) => b.monthYear === selectedMonth || !b.monthYear)
      .map((b) => b.category)
  );

  const unconfiguredList = categoriesList.filter((cat) => !configuredCategories.has(cat));

  const handleAutoRecommend = () => {
    const income = user.monthlyIncomeGoal || totalIncome || 50000;
    const allocation = {
      'Food & Dining': Math.round(income * 0.2),
      'Housing & Utilities': Math.round(income * 0.3),
      'Transportation': Math.round(income * 0.1),
      'Education & Books': Math.round(income * 0.08),
      'Shopping': Math.round(income * 0.1),
      'Entertainment & Fun': Math.round(income * 0.07),
      'Health & Wellness': Math.round(income * 0.05),
      'Investments & Savings': Math.round(income * 0.1),
    };

    Object.entries(allocation).forEach(([cat, amount]) => {
      setBudgetLimit(cat as ExpenseCategory, amount, selectedMonth);
    });
  };

  const utilizationTotal =
    budgetTotalLimit > 0 ? Math.round((budgetTotalSpent / budgetTotalLimit) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <PageHeader
        title="Category Budget Limits"
        subtitle={`Establish category ceiling targets for ${selectedMonth}.`}
        onExportExcel={exportBudgetsReport}
        primaryAction={
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoRecommend}
              className="btn-secondary-glass text-xs sm:text-sm py-2 px-3.5 cursor-pointer"
              title="Auto-establish 50/30/20 standard caps"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Auto Caps</span>
            </button>
            <button
              onClick={() => onOpenBudgetModal()}
              className="btn-primary-gradient text-xs sm:text-sm py-2 px-4 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Cap</span>
            </button>
          </div>
        }
      />

      {/* Aggregate Utilization Counter */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono-code">
              Total Budget Limit Pool
            </span>
            <div className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
              {formatMoney(budgetTotalLimit, user.currency)}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono-code">
              Total Consumed
            </span>
            <div className="font-mono-code text-2xl font-bold text-slate-200 mt-1">
              {formatMoney(budgetTotalSpent, user.currency)}{' '}
              <span className={`text-sm ${utilizationTotal >= 100 ? 'text-rose-400 font-bold' : utilizationTotal >= 80 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}`}>
                ({utilizationTotal}%)
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 mt-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              utilizationTotal >= 100
                ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                : utilizationTotal >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, utilizationTotal)}%` }}
          />
        </div>
      </div>

      {/* Active Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono-code font-semibold uppercase tracking-wider text-slate-400">
            Active Category Caps ({budgetStatuses.length})
          </h2>
        </div>

        {budgetStatuses.length === 0 ? (
          <div className="py-20 text-center glass-card border border-dashed border-slate-800">
            <p className="text-slate-400 text-sm">
              No category caps created for this period.
            </p>
            <button
              onClick={() => onOpenBudgetModal()}
              className="btn-primary-gradient mt-4 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Budget</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {budgetStatuses.map((b) => {
              const isOver = b.status === 'exceeded';
              const isWarning = b.status === 'warning';

              return (
                <div
                  key={b.category}
                  className={`glass-card p-6 flex flex-col justify-between transition-all ${
                    isOver
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : isWarning
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isOver
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                              : isWarning
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                          }`}
                        >
                          <CategoryIcon name={b.category} className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-200">{b.category}</h3>
                          <div className="font-mono-code text-lg font-bold text-white mt-0.5">
                            {formatMoney(b.spent, user.currency)}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              / {formatMoney(b.limit, user.currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`font-mono-code text-xs font-bold px-2.5 py-1 rounded-lg border ${
                          isOver
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                            : isWarning
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}
                      >
                        {b.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 mt-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-5 text-xs">
                    <button
                      onClick={() => onOpenBudgetModal(b.category)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust Cap</span>
                    </button>
                    {b.id && (
                      <button
                        onClick={() => deleteBudget(b.id!)}
                        className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unconfigured Categories */}
      {unconfiguredList.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-xs font-mono-code uppercase tracking-wider text-slate-400 mb-3 font-semibold">
            Unbudgeted Categories (Click to establish cap)
          </p>
          <div className="flex flex-wrap gap-2">
            {unconfiguredList.map((cat) => (
              <button
                key={cat}
                onClick={() => onOpenBudgetModal(cat)}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

