import React from 'react';
import { Target, TrendingUp, Plus, Edit2, CheckCircle2, Clock } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { SavingsGoal } from '../types/budget';
import { formatMoney } from '../data/categories';
import { PageHeader } from './PageHeader';

interface SavingsGoalsViewProps {
  onOpenAddGoalModal: (goal?: SavingsGoal) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  onOpenAddGoalModal,
}) => {
  const { savingsGoals, user, exportGoalsReport } = useBudget();

  const activeGoals = savingsGoals.filter((g) => g.status === 'in_progress');
  const completedGoals = savingsGoals.filter((g) => g.status === 'completed');

  const renderGoalCard = (goal: SavingsGoal) => {
    const percentage = goal.targetAmount > 0 
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
      : 0;
    
    const isCompleted = goal.status === 'completed';

    const colorMap: Record<string, string> = {
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500',
      rose: 'bg-rose-500',
      amber: 'bg-amber-500',
      cyan: 'bg-cyan-500',
      violet: 'bg-violet-500',
    };
    const bgClass = colorMap[goal.colorTheme] || 'bg-emerald-500';
    const textClass = bgClass.replace('bg-', 'text-');

    return (
      <div key={goal.id} className="glass-card p-5 relative overflow-hidden group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}/10 border border-white/5`}>
              {isCompleted ? (
                <CheckCircle2 className={`w-5 h-5 ${textClass}`} />
              ) : (
                <Target className={`w-5 h-5 ${textClass}`} />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base leading-tight">
                {goal.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                <Clock className="w-3 h-3" />
                <span>Due: {new Date(goal.deadlineDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenAddGoalModal(goal)}
            className="p-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono-code font-bold text-white">
              {formatMoney(goal.currentAmount, user.currency)}
            </span>
            <span className="text-slate-400 text-xs font-medium">
              of {formatMoney(goal.targetAmount, user.currency)}
            </span>
          </div>
          
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${bgClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-end">
            <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      <PageHeader
        title={
          <>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Savings Goals
          </>
        }
        subtitle="Track and manage your financial milestones."
        onExportExcel={exportGoalsReport}
        primaryAction={
          <button
            onClick={() => onOpenAddGoalModal()}
            className="btn-primary-gradient text-sm py-2 px-4 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Goal</span>
          </button>
        }
      />

      {/* Active Goals */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          In Progress ({activeGoals.length})
        </h3>
        
        {activeGoals.length === 0 ? (
          <div className="glass-card p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-700">
            <Target className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No active savings goals</p>
            <button
              onClick={() => onOpenAddGoalModal()}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
            >
              + Create your first goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeGoals.map(renderGoalCard)}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-8 pt-8 border-t border-slate-800/60">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Completed Milestones ({completedGoals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-75">
            {completedGoals.map(renderGoalCard)}
          </div>
        </div>
      )}

    </div>
  );
};
