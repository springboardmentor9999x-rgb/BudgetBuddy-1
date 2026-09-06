import React, { useState } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { IncomeView } from './components/IncomeView';
import { TransfersView } from './components/TransfersView';
import { BudgetPlanView } from './components/BudgetPlanView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { UserView } from './components/UserView';
import { NotificationsView } from './components/NotificationsView';
import { LoginView } from './components/LoginView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddTransferModal } from './components/AddTransferModal';
import { BudgetModal } from './components/BudgetModal';
import { AddGoalModal } from './components/AddGoalModal';
import { ExpenseItem, IncomeItem, ExpenseCategory, PersonTransfer, PaymentCard, SavingsGoal } from './types/budget';
import { Plus, FileSpreadsheet, LayoutDashboard, ArrowDownLeft, ArrowUpRight, Repeat, Target, User, TrendingUp } from 'lucide-react';

function BudgetAppContent() {
  const { isAuthenticated, exportMasterFinancialReport } = useBudget();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'expense' | 'income'>('expense');
  const [editItem, setEditItem] = useState<
    { type: 'expense'; data: ExpenseItem } | { type: 'income'; data: IncomeItem } | null
  >(null);

  // Transfers modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editTransferItem, setEditTransferItem] = useState<PersonTransfer | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalCategory, setBudgetModalCategory] = useState<ExpenseCategory | undefined>();

  // Goals modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editGoalItem, setEditGoalItem] = useState<SavingsGoal | null>(null);

  // Dedicated Login Screen if unauthenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenAddModal = (type: 'expense' | 'income' = 'expense') => {
    setEditItem(null);
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenEditTransaction = (
    item: { type: 'expense'; data: ExpenseItem } | { type: 'income'; data: IncomeItem }
  ) => {
    setEditItem(item);
    setIsAddModalOpen(true);
  };

  const handleOpenBudgetModal = (category?: ExpenseCategory) => {
    setBudgetModalCategory(category);
    setIsBudgetModalOpen(true);
  };

  const handleOpenAddTransfer = () => {
    setEditTransferItem(null);
    setIsTransferModalOpen(true);
  };

  const handleOpenEditTransfer = (transfer: PersonTransfer) => {
    setEditTransferItem(transfer);
    setIsTransferModalOpen(true);
  };

  const handleOpenGoalModal = (goal?: SavingsGoal) => {
    setEditGoalItem(goal || null);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient background glowing orbs */}
      <div className="ambient-glow-bg" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModal('expense')}
        onOpenBudgetModal={() => handleOpenBudgetModal()}
      />

      {/* Main View Body */}
      <main className="flex-1 w-full pb-20 md:pb-8 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onOpenBudgetModal={handleOpenBudgetModal}
            onOpenAddTransferModal={handleOpenAddTransfer}
            onEditTransaction={handleOpenEditTransaction}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            onOpenAddModal={() => handleOpenAddModal('expense')}
            onEditExpense={(expense) =>
              handleOpenEditTransaction({ type: 'expense', data: expense })
            }
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            onOpenAddModal={() => handleOpenAddModal('income')}
            onEditIncome={(income) =>
              handleOpenEditTransaction({ type: 'income', data: income })
            }
          />
        )}

        {activeTab === 'transfers' && (
          <TransfersView
            onOpenAddModal={handleOpenAddTransfer}
            onEditTransfer={handleOpenEditTransfer}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetPlanView onOpenBudgetModal={handleOpenBudgetModal} />
        )}

        {activeTab === 'goals' && (
          <SavingsGoalsView onOpenAddGoalModal={handleOpenGoalModal} />
        )}

        {activeTab === 'user' && (
          <UserView />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-40">
        <button
          onClick={() => {
            if (activeTab === 'transfers') {
              handleOpenAddTransfer();
            } else if (activeTab === 'income') {
              handleOpenAddModal('income');
            } else {
              handleOpenAddModal('expense');
            }
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Quick Record"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Mobile Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'expenses' ? 'text-rose-400' : 'text-slate-400'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Expenses</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'income' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Income</span>
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'transfers' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>P2P</span>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'goals' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Goals</span>
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'user' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-slate-800/80 bg-slate-950/40 backdrop-blur-md text-xs font-mono-code text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-row items-center justify-between">
          <div>BudgetBuddy &bull; Modern FinTech &amp; Wealth Operating System</div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportMasterFinancialReport}
              className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-medium inline-flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Master Excel Report</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditItem(null);
        }}
        initialType={addModalType}
        editItem={editItem}
      />

      <AddTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setEditTransferItem(null);
        }}
        initialData={editTransferItem}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        defaultCategory={budgetModalCategory}
      />

      <AddGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditGoalItem(null);
        }}
        editGoal={editGoalItem}
      />
    </div>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <BudgetAppContent />
    </BudgetProvider>
  );
}