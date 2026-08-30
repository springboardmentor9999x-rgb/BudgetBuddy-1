import React, { useState } from 'react';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { IncomeView } from './components/IncomeView';
import { TransactionsView } from './components/TransactionsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { MonthlySummaryView } from './components/MonthlySummaryView';
import { TransfersView } from './components/TransfersView';
import { CardsView } from './components/CardsView';
import { AccountsView } from './components/AccountsView';
import { BudgetPlanView } from './components/BudgetPlanView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { NotificationPage } from './components/NotificationPage';
import { LoginView } from './components/LoginView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AddTransferModal } from './components/AddTransferModal';
import { AddCardModal } from './components/AddCardModal';
import { BudgetModal } from './components/BudgetModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ExportImportModal } from './components/ExportImportModal';
import { ToastContainer } from './components/Toast';
import { ExpenseItem, IncomeItem, ExpenseCategory, PersonTransfer, PaymentCard } from './types/budget';
import { Plus } from 'lucide-react';

function BudgetAppContent() {
  const {
    isAuthenticated,
    toasts,
    dismissToast,
    richNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllReadNotifications,
  } = useBudget();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'expense' | 'income'>('expense');
  const [editItem, setEditItem] = useState<
    { type: 'expense'; data: ExpenseItem } | { type: 'income'; data: IncomeItem } | null
  >(null);

  // Transfers modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editTransferItem, setEditTransferItem] = useState<PersonTransfer | null>(null);

  // Cards modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editCardItem, setEditCardItem] = useState<PaymentCard | null>(null);

  // Budgets, profile, export modals
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetModalCategory, setBudgetModalCategory] = useState<ExpenseCategory | undefined>();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // If user is not logged in, render Login page
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

  const handleOpenAddCard = () => {
    setEditCardItem(null);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: PaymentCard) => {
    setEditCardItem(card);
    setIsCardModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-[#0f172a] text-slate-100' : 'bg-slate-900 text-slate-100'} font-body antialiased selection:bg-blue-600 selection:text-white relative`}>
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onNavigateToTab={setActiveTab}
        />

        {/* Main Body View */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddModal={handleOpenAddModal}
              onOpenBudgetModal={handleOpenBudgetModal}
              onOpenAddTransferModal={handleOpenAddTransfer}
              onOpenAddCardModal={handleOpenAddCard}
              onEditTransaction={handleOpenEditTransaction}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationPage
              notifications={richNotifications}
              onMarkAsRead={markNotificationRead}
              onMarkAllAsRead={markAllNotificationsRead}
              onDelete={deleteNotification}
              onDeleteAllRead={deleteAllReadNotifications}
              onNavigateToTab={setActiveTab}
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

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleOpenEditTransaction}
            />
          )}

          {activeTab === 'savings-goals' && <SavingsGoalsView />}

          {activeTab === 'monthly-summary' && <MonthlySummaryView />}

          {activeTab === 'accounts' && <AccountsView />}

          {activeTab === 'transfers' && (
            <TransfersView
              onOpenAddModal={handleOpenAddTransfer}
              onEditTransfer={handleOpenEditTransfer}
            />
          )}

          {activeTab === 'cards' && (
            <CardsView
              onOpenAddCardModal={handleOpenAddCard}
              onEditCard={handleOpenEditCard}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetPlanView onOpenBudgetModal={handleOpenBudgetModal} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'profile' && <ProfileView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Floating Quick Action Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            id="floating-add-btn"
            onClick={() => {
              if (activeTab === 'transfers') {
                handleOpenAddTransfer();
              } else if (activeTab === 'cards') {
                handleOpenAddCard();
              } else if (activeTab === 'income') {
                handleOpenAddModal('income');
              } else {
                handleOpenAddModal('expense');
              }
            }}
            className="w-13 h-13 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-600/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-blue-400/30"
            title="Quick Add Entry"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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

      <AddCardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditCardItem(null);
        }}
        initialData={editCardItem}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        defaultCategory={budgetModalCategory}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
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
