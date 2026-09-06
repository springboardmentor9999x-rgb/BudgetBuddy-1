import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  ExpenseItem,
  IncomeItem,
  BudgetLimit,
  PersonTransfer,
  PaymentCard,
  ExpenseCategory,
  IncomeSource,
  MonthlyDashboardData,
  BudgetUtilization,
  CategorySummary,
  TransactionUnified,
  SavingsGoal,
  GoalStatus,
  NotificationMessage,
} from '../types/budget';
import { EXPENSE_CATEGORIES_META } from '../data/categories';
import {
  DEMO_USERS,
  INITIAL_USER,
  INITIAL_BUDGETS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_TRANSFERS,
  INITIAL_CARDS,
} from '../data/mockData';
import {
  exportSingleTransactionExcel,
  exportTransfersExcel,
  exportFullFinancialWorkbookExcel,
  exportExpensesExcel,
  exportIncomesExcel,
  exportBudgetsExcel,
  exportGoalsExcel,
} from '../utils/excelExport';

interface BudgetContextType {
  // Auth state & actions
  isAuthenticated: boolean;
  login: (email: string, password?: string, personaId?: string) => boolean;
  logout: () => void;
  switchDemoAccount: (userId: string) => void;

  user: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  budgets: BudgetLimit[];
  transfers: PersonTransfer[];
  cards: PaymentCard[];
  savingsGoals: SavingsGoal[];
  notifications: NotificationMessage[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  // Notification Methods
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'alert') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // CRUD Expenses
  addExpense: (data: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: ExpenseItem['paymentMethod'];
    notes?: string;
  }) => ExpenseItem;
  updateExpense: (id: string, data: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // CRUD Incomes
  addIncome: (data: {
    source: IncomeSource;
    amount: number;
    description: string;
    date: string;
    isRecurring?: boolean;
    notes?: string;
  }) => IncomeItem;
  updateIncome: (id: string, data: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;

  // Personal Tracking Machine (P2P Transfers & Peer Charges)
  addTransfer: (data: {
    personName: string;
    type: PersonTransfer['type'];
    amount: number;
    category: string;
    date: string;
    status?: PersonTransfer['status'];
    paymentMode?: PersonTransfer['paymentMode'];
    referenceNote?: string;
  }) => PersonTransfer;
  updateTransfer: (id: string, data: Partial<PersonTransfer>) => void;
  deleteTransfer: (id: string) => void;
  settleTransfer: (id: string) => void;

  // Payment Cards & Accounts
  addCard: (data: {
    cardName: string;
    bankName: string;
    cardType: PaymentCard['cardType'];
    last4: string;
    balanceOrDue: number;
    creditLimit?: number;
    expiryMonthYear?: string;
    colorTheme?: PaymentCard['colorTheme'];
    billingDay?: number;
    network?: PaymentCard['network'];
  }) => PaymentCard;
  updateCard: (id: string, data: Partial<PaymentCard>) => void;
  deleteCard: (id: string) => void;
  toggleCardFreeze: (id: string) => void;

  // Budget Management
  setBudgetLimit: (
    category: ExpenseCategory,
    monthlyLimit: number,
    alertThresholdPercent?: number
  ) => void;
  deleteBudget: (id: string) => void;

  // Savings Goals Management
  addSavingsGoal: (data: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadlineDate: string;
    colorTheme?: string;
  }) => SavingsGoal;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  // Excel Exporters
  exportSingleTransaction: (item: {
    id: string;
    type: 'expense' | 'income' | 'transfer';
    title: string;
    amount: number;
    date: string;
    categoryOrSource: string;
    paymentMode?: string;
    personName?: string;
    notes?: string;
    status?: string;
  }) => void;
  exportTransfersReport: () => void;
  exportMasterFinancialReport: () => void;
  exportExpensesReport: () => void;
  exportIncomesReport: () => void;
  exportGoalsReport: () => void;
  exportBudgetsReport: () => void;

  // Bulk actions & Reset
  resetToSampleData: () => void;
  clearAllData: () => void;

  // Computed data for current selected month
  filteredExpenses: ExpenseItem[];
  filteredIncomes: IncomeItem[];
  filteredTransfers: PersonTransfer[];
  monthlyDashboard: MonthlyDashboardData;
  cashFlowTrends: {
    month: string;
    label: string;
    income: number;
    expense: number;
    savings: number;
  }[];
  spendingByNeedsWants: {
    needs: number;
    wants: number;
    savings: number;
    needsPct: number;
    wantsPct: number;
    savingsPct: number;
  };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AUTH: 'budgetvault_auth_state_v1',
  USER: 'budgetvault_user_v1',
  EXPENSES: 'budgetvault_expenses_v1',
  INCOMES: 'budgetvault_incomes_v1',
  BUDGETS: 'budgetvault_budgets_v1',
  TRANSFERS: 'budgetvault_transfers_v1',
  CARDS: 'budgetvault_cards_v1',
  GOALS: 'budgetvault_savings_goals_v1',
  NOTIFICATIONS: 'budgetvault_notifications_v1',
};

const getNowMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved === 'true';
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'bsharmila993@gmail.com') {
          return INITIAL_USER;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    return INITIAL_USER;
  });

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse expenses', e);
      }
    }
    return INITIAL_EXPENSES;
  });

  // Incomes
  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse incomes', e);
      }
    }
    return INITIAL_INCOMES;
  });

  // Budgets
  const [budgets, setBudgets] = useState<BudgetLimit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse budgets', e);
      }
    }
    return INITIAL_BUDGETS;
  });

  // P2P Transfers
  const [transfers, setTransfers] = useState<PersonTransfer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse transfers', e);
      }
    }
    return INITIAL_TRANSFERS;
  });

  // Cards
  const [cards, setCards] = useState<PaymentCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cards', e);
      }
    }
    return INITIAL_CARDS;
  });

  // Savings Goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse savings goals', e);
      }
    }
    return [];
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    return [
      {
        id: 'notif_1',
        userId: INITIAL_USER.id,
        title: 'Welcome to BudgetBuddy!',
        message: 'Your smart financial hub is ready to use.',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(getNowMonthString());

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Notification Handlers
  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    setNotifications((prev) => [
      {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Auth Handlers
  const login = (email: string, _password?: string, personaId?: string): boolean => {
    if (personaId && DEMO_USERS[personaId]) {
      setUser(DEMO_USERS[personaId]);
    } else if (email) {
      const match = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (match) {
        setUser(match);
      } else {
        const namePart = email.split('@')[0];
        setUser({
          id: 'user_' + Date.now(),
          email: email.trim(),
          fullName: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          role: 'professional',
          monthlyIncomeGoal: 50000,
          currency: 'INR',
          savingsTargetPercent: 25,
        });
      }
    }
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchDemoAccount = (userId: string) => {
    if (DEMO_USERS[userId]) {
      setUser(DEMO_USERS[userId]);
      setIsAuthenticated(true);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  // Expenses CRUD
  const addExpense = (data: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: ExpenseItem['paymentMethod'];
    notes?: string;
  }): ExpenseItem => {
    const newExpense: ExpenseItem = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      category: data.category,
      amount: Math.max(0, Number(data.amount)),
      description: data.description.trim() || 'Expense',
      date: data.date || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'UPI / Card',
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);
    addNotification('Expense Added', `Added ${newExpense.description} for ${newExpense.amount}.`, 'success');
    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addNotification('Expense Updated', `The expense record has been successfully updated.`, 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Incomes CRUD
  const addIncome = (data: {
    source: IncomeSource;
    amount: number;
    description: string;
    date: string;
    isRecurring?: boolean;
    notes?: string;
  }): IncomeItem => {
    const newIncome: IncomeItem = {
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      source: data.source,
      amount: Math.max(0, Number(data.amount)),
      description: data.description.trim() || 'Income',
      date: data.date || new Date().toISOString().split('T')[0],
      isRecurring: data.isRecurring ?? false,
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setIncomes((prev) => [newIncome, ...prev]);
    addNotification('Income Added', `Added ${newIncome.description} for ${newIncome.amount}.`, 'success');
    return newIncome;
  };

  const updateIncome = (id: string, data: Partial<IncomeItem>) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addNotification('Income Updated', `The income record has been successfully updated.`, 'success');
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  // P2P Transfers CRUD
  const addTransfer = (data: {
    personName: string;
    type: PersonTransfer['type'];
    amount: number;
    category: string;
    date: string;
    status?: PersonTransfer['status'];
    paymentMode?: PersonTransfer['paymentMode'];
    referenceNote?: string;
  }): PersonTransfer => {
    const newTransfer: PersonTransfer = {
      id: 'tr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      personName: data.personName.trim() || 'Person',
      type: data.type,
      amount: Math.max(0, Number(data.amount)),
      category: data.category.trim() || 'General Transfer',
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'settled',
      paymentMode: data.paymentMode || 'UPI',
      referenceNote: data.referenceNote?.trim(),
      createdAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    const action = newTransfer.type === 'received' ? 'Received from' : newTransfer.type === 'sent' ? 'Sent to' : newTransfer.type === 'charged' ? 'Charged' : 'Split with';
    addNotification('Transfer Recorded', `${action} ${newTransfer.personName} for ${newTransfer.amount}.`, 'success');
    return newTransfer;
  };

  const updateTransfer = (id: string, data: Partial<PersonTransfer>) => {
    setTransfers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addNotification('Transfer Updated', `The P2P transfer record has been successfully updated.`, 'success');
  };

  const deleteTransfer = (id: string) => {
    setTransfers((prev) => prev.filter((item) => item.id !== id));
  };

  const settleTransfer = (id: string) => {
    setTransfers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'settled' } : item))
    );
  };

  // Payment Cards CRUD
  const addCard = (data: {
    cardName: string;
    bankName: string;
    cardType: PaymentCard['cardType'];
    last4: string;
    balanceOrDue: number;
    creditLimit?: number;
    expiryMonthYear?: string;
    colorTheme?: PaymentCard['colorTheme'];
    billingDay?: number;
    network?: PaymentCard['network'];
  }): PaymentCard => {
    const newCard: PaymentCard = {
      id: 'card_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      cardName: data.cardName.trim() || 'Card',
      bankName: data.bankName.trim() || 'Bank',
      cardType: data.cardType,
      last4: data.last4.replace(/\D/g, '').slice(-4) || '0000',
      balanceOrDue: Math.max(0, Number(data.balanceOrDue)),
      creditLimit: data.creditLimit ? Math.max(0, Number(data.creditLimit)) : 0,
      expiryMonthYear: (data.expiryMonthYear || '12/28').trim(),
      isFrozen: false,
      colorTheme: data.colorTheme || 'obsidian',
      billingDay: data.billingDay || 1,
      network: data.network || 'Visa',
    };

    setCards((prev) => [...prev, newCard]);
    return newCard;
  };

  const updateCard = (id: string, data: Partial<PaymentCard>) => {
    setCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCardFreeze = (id: string) => {
    setCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFrozen: !item.isFrozen } : item))
    );
  };

  // Budgets CRUD
  const setBudgetLimit = (
    category: ExpenseCategory,
    monthlyLimit: number,
    alertThresholdPercent: number = 80
  ) => {
    let isNew = false;
    setBudgets((prev) => {
      const existingIndex = prev.findIndex(
        (b) => b.category === category && (b.monthYear === selectedMonth || !b.monthYear)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          monthlyLimit: Math.max(0, Number(monthlyLimit)),
          alertThresholdPercent,
          monthYear: selectedMonth,
        };
        return updated;
      } else {
        isNew = true;
        const newBudget: BudgetLimit = {
          id: 'b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId: user.id,
          category,
          monthlyLimit: Math.max(0, Number(monthlyLimit)),
          monthYear: selectedMonth,
          alertThresholdPercent,
        };
        return [...prev, newBudget];
      }
    });

    setTimeout(() => {
      if (isNew) {
        addNotification('Budget Created', `A new budget limit for ${category} has been created at ${monthlyLimit}.`, 'success');
      } else {
        addNotification('Budget Updated', `Your budget limit for ${category} has been updated to ${monthlyLimit}.`, 'success');
      }
    }, 0);
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Savings Goals CRUD
  const addSavingsGoal = (data: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadlineDate: string;
    colorTheme?: string;
  }): SavingsGoal => {
    const newGoal: SavingsGoal = {
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      title: data.title.trim() || 'New Goal',
      targetAmount: Math.max(0, Number(data.targetAmount)),
      currentAmount: Math.max(0, Number(data.currentAmount)),
      deadlineDate: data.deadlineDate || new Date().toISOString().split('T')[0],
      colorTheme: data.colorTheme || 'emerald',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals((prev) => [...prev, newGoal]);
    addNotification('Savings Goal Created', `You successfully created a new savings goal: ${newGoal.title}.`, 'success');
    return newGoal;
  };

  const updateSavingsGoal = (id: string, data: Partial<SavingsGoal>) => {
    let goalCompleted = false;
    let goalName = 'Goal';
    setSavingsGoals((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...data };
          goalName = updated.title;
          // Auto update status if reached target
          if (updated.currentAmount >= updated.targetAmount && updated.status === 'in_progress') {
            updated.status = 'completed';
            goalCompleted = true;
          } else if (updated.currentAmount < updated.targetAmount && updated.status === 'completed') {
            updated.status = 'in_progress';
          }
          return updated;
        }
        return item;
      })
    );
    
    setTimeout(() => {
      if (goalCompleted) {
        addNotification('Goal Completed! \ud83c\udf89', `Congratulations! You have reached your savings target for ${goalName}.`, 'success');
      } else {
        addNotification('Goal Updated', `Your savings goal "${goalName}" has been successfully updated.`, 'success');
      }
    }, 0);
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
  };

  // Excel Exporters
  const exportSingleTransaction = (item: {
    id: string;
    type: 'expense' | 'income' | 'transfer';
    title: string;
    amount: number;
    date: string;
    categoryOrSource: string;
    paymentMode?: string;
    personName?: string;
    notes?: string;
    status?: string;
  }) => {
    exportSingleTransactionExcel(item, user);
  };

  const exportTransfersReport = () => {
    exportTransfersExcel(transfers, user);
  };

  const exportMasterFinancialReport = () => {
    exportFullFinancialWorkbookExcel(expenses, incomes, transfers, cards, user);
  };

  const exportExpensesReport = () => {
    exportExpensesExcel(filteredExpenses, user);
  };

  const exportIncomesReport = () => {
    exportIncomesExcel(filteredIncomes, user);
  };

  const exportGoalsReport = () => {
    exportGoalsExcel(savingsGoals, user);
  };

  const exportBudgetsReport = () => {
    exportBudgetsExcel(budgets, user);
  };

  // Reset & Clear
  const resetToSampleData = () => {
    setUser(INITIAL_USER);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setBudgets(INITIAL_BUDGETS);
    setTransfers(INITIAL_TRANSFERS);
    setCards(INITIAL_CARDS);
    setSelectedMonth(getNowMonthString());
  };

  const clearAllData = () => {
    setExpenses([]);
    setIncomes([]);
    setBudgets([]);
    setTransfers([]);
  };

  // Filtered lists by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => i.date && i.date.startsWith(selectedMonth));
  }, [incomes, selectedMonth]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => t.date && t.date.startsWith(selectedMonth));
  }, [transfers, selectedMonth]);

  // Compute available months dynamically
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    monthsSet.add(getNowMonthString());
    monthsSet.add(selectedMonth);

    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) monthsSet.add(e.date.substring(0, 7));
    });
    incomes.forEach((i) => {
      if (i.date && i.date.length >= 7) monthsSet.add(i.date.substring(0, 7));
    });
    transfers.forEach((t) => {
      if (t.date && t.date.length >= 7) monthsSet.add(t.date.substring(0, 7));
    });
    budgets.forEach((b) => {
      if (b.monthYear) monthsSet.add(b.monthYear);
    });

    return Array.from(monthsSet).sort().reverse();
  }, [expenses, incomes, transfers, budgets, selectedMonth]);

  // Monthly Dashboard summary
  const monthlyDashboard = useMemo<MonthlyDashboardData>(() => {
    const totalIncome = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // P2P Net Balance for month
    const p2pReceived = filteredTransfers
      .filter((t) => t.type === 'received')
      .reduce((s, t) => s + t.amount, 0);
    const p2pSent = filteredTransfers
      .filter((t) => t.type === 'sent')
      .reduce((s, t) => s + t.amount, 0);
    const p2pNetBalance = p2pReceived - p2pSent;

    // Category aggregations for expenses
    const categoryMap = new Map<ExpenseCategory, { total: number; count: number }>();
    filteredExpenses.forEach((exp) => {
      const current = categoryMap.get(exp.category) || { total: 0, count: 0 };
      categoryMap.set(exp.category, {
        total: current.total + exp.amount,
        count: current.count + 1,
      });
    });

    const categoryBreakdown: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([cat, data]) => ({
        category: cat,
        total: data.total,
        percentage: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
        count: data.count,
        color: EXPENSE_CATEGORIES_META[cat]?.chartColor || '#94a3b8',
      }))
      .sort((a, b) => b.total - a.total);

    const topCategories = categoryBreakdown.slice(0, 4);

    // Unified transactions sorted by date desc
    const unified: TransactionUnified[] = [
      ...filteredExpenses.map(
        (e): TransactionUnified => ({
          id: e.id,
          type: 'expense',
          categoryOrSource: e.category,
          amount: e.amount,
          description: e.description,
          date: e.date,
          createdAt: e.createdAt,
        })
      ),
      ...filteredIncomes.map(
        (i): TransactionUnified => ({
          id: i.id,
          type: 'income',
          categoryOrSource: i.source,
          amount: i.amount,
          description: i.description,
          date: i.date,
          createdAt: i.createdAt,
        })
      ),
      ...filteredTransfers.map(
        (t): TransactionUnified => ({
          id: t.id,
          type: 'transfer',
          categoryOrSource: t.category,
          amount: t.amount,
          description: `${t.type === 'received' ? 'Received from' : t.type === 'sent' ? 'Sent to' : 'Charge:'} ${t.personName}`,
          date: t.date,
          createdAt: t.createdAt,
          personName: t.personName,
        })
      ),
    ].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Budget utilization calculations
    const relevantBudgets = budgets.filter(
      (b) => b.monthYear === selectedMonth || !b.monthYear
    );

    let budgetTotalLimit = 0;
    let budgetTotalSpent = 0;

    const budgetStatuses: BudgetUtilization[] = relevantBudgets.map((b) => {
      const spent = categoryMap.get(b.category)?.total || 0;
      budgetTotalLimit += b.monthlyLimit;
      budgetTotalSpent += spent;
      const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      const threshold = b.alertThresholdPercent || 80;

      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= threshold) {
        status = 'warning';
      }

      return {
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        remaining: Math.max(0, b.monthlyLimit - spent),
        percentage,
        status,
      };
    }).sort((a, b) => b.percentage - a.percentage);

    const budgetUtilizationRate =
      budgetTotalLimit > 0 ? Math.round((budgetTotalSpent / budgetTotalLimit) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      budgetTotalLimit,
      budgetTotalSpent,
      budgetUtilizationRate,
      topCategories,
      recentTransactions: unified.slice(0, 8),
      categoryBreakdown,
      budgetStatuses,
      p2pNetBalance,
    };
  }, [filteredExpenses, filteredIncomes, filteredTransfers, budgets, selectedMonth]);

  // Cash Flow Trends
  const cashFlowTrends = useMemo(() => {
    const sortedMonths = [...availableMonths].sort();
    const targetIndex = sortedMonths.indexOf(selectedMonth);
    const sliceStart = Math.max(0, targetIndex >= 0 ? targetIndex - 5 : sortedMonths.length - 6);
    const displayedMonths = sortedMonths.slice(sliceStart, sliceStart + 6);

    return displayedMonths.map((m) => {
      const monthExpenses = expenses
        .filter((e) => e.date && e.date.startsWith(m))
        .reduce((sum, e) => sum + e.amount, 0);
      const monthIncomes = incomes
        .filter((i) => i.date && i.date.startsWith(m))
        .reduce((sum, i) => sum + i.amount, 0);
      
      const [year, monthNum] = m.split('-');
      const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const label = dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });

      return {
        month: m,
        label,
        income: monthIncomes,
        expense: monthExpenses,
        savings: monthIncomes - monthExpenses,
      };
    });
  }, [availableMonths, selectedMonth, expenses, incomes]);

  // 50/30/20 Rule breakdown
  const spendingByNeedsWants = useMemo(() => {
    let needs = 0;
    let wants = 0;
    let savings = 0;

    filteredExpenses.forEach((exp) => {
      const meta = EXPENSE_CATEGORIES_META[exp.category];
      const type = meta ? meta.ruleType : 'Wants';
      if (type === 'Needs') needs += exp.amount;
      else if (type === 'Wants') wants += exp.amount;
      else if (type === 'Savings') savings += exp.amount;
    });

    const total = needs + wants + savings;
    return {
      needs,
      wants,
      savings,
      needsPct: total > 0 ? Math.round((needs / total) * 100) : 0,
      wantsPct: total > 0 ? Math.round((wants / total) * 100) : 0,
      savingsPct: total > 0 ? Math.round((savings / total) * 100) : 0,
    };
  }, [filteredExpenses]);

  return (
    <BudgetContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        switchDemoAccount,
        user,
        updateProfile,
        expenses,
        incomes,
        budgets,
        transfers,
        cards,
        savingsGoals,
        notifications,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addTransfer,
        updateTransfer,
        deleteTransfer,
        settleTransfer,
        addCard,
        updateCard,
        deleteCard,
        toggleCardFreeze,
        setBudgetLimit,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        exportSingleTransaction,
        exportTransfersReport,
        exportMasterFinancialReport,
        exportExpensesReport,
        exportIncomesReport,
        exportGoalsReport,
        exportBudgetsReport,
        resetToSampleData,
        clearAllData,
        filteredExpenses,
        filteredIncomes,
        filteredTransfers,
        monthlyDashboard,
        cashFlowTrends,
        spendingByNeedsWants,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};