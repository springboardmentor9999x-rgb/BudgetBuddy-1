import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  ExpenseItem,
  IncomeItem,
  BudgetLimit,
  PersonTransfer,
  PaymentCard,
  SavingsGoal,
  FinancialAccount,
  NotificationItem,
  ExpenseCategory,
  IncomeType,
  CurrencyCode,
  MonthlyDashboardData,
  BudgetUtilization,
  CategorySummary,
  TransactionUnified,
  FinancialHealthScore,
} from '../types/budget';
import {
  NotificationDoc,
  NotificationPreferenceDoc,
  BillReminderItem,
  NotificationCategory,
} from '../types/notification';
import { playNotificationChime } from '../utils/notificationSound';
import { notificationApi } from '../services/notificationApi';
import { premiumApi } from '../services/premiumApi';
import { permissionApi } from '../services/permissionApi';
import { EXPENSE_CATEGORIES_META } from '../data/categories';
import {
  DEMO_USERS,
  INITIAL_USER,
  INITIAL_BUDGETS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_TRANSFERS,
  INITIAL_CARDS,
  INITIAL_SAVINGS_GOALS,
} from '../data/mockData';
import {
  exportSingleTransactionExcel,
  exportTransfersExcel,
  exportFullFinancialWorkbookExcel,
} from '../utils/excelExport';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface BudgetContextType {
  // Auth state & actions
  isAuthenticated: boolean;
  login: (email: string, password?: string, personaId?: string, customName?: string) => boolean;
  register: (data: {
    fullName: string;
    email: string;
    password?: string;
    role?: 'student' | 'professional' | 'freelancer' | 'admin';
    currency?: CurrencyCode;
    monthlyIncomeGoal?: number;
    savingsTargetPercent?: number;
  }) => boolean;
  completeVerification: (userProfile: UserProfile, token?: string) => void;
  logout: () => void;
  switchDemoAccount: (userId: string) => void;

  user: UserProfile;
  isPremium: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissionsMap: Record<
    string,
    {
      enabled: boolean;
      freeUser: boolean;
      premiumUser: boolean;
      accessible: boolean;
    }
  >;
  hasPermission: (featureKey: string) => boolean;
  isFeatureEnabled: (featureKey: string) => boolean;
  refreshPermissions: () => Promise<void>;
  upgradeToPlan: (planCode?: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;

  updateProfile: (updates: Partial<UserProfile>) => void;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  budgets: BudgetLimit[];
  transfers: PersonTransfer[];
  cards: PaymentCard[];
  savingsGoals: SavingsGoal[];
  accounts: FinancialAccount[];
  notifications: NotificationItem[];
  richNotifications: NotificationDoc[];
  notificationPreferences: NotificationPreferenceDoc;
  billReminders: BillReminderItem[];
  toasts: ToastMessage[];

  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];

  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllReadNotifications: () => void;
  clearAllNotifications: () => void;
  updateNotificationPreferences: (updates: Partial<NotificationPreferenceDoc>) => void;
  createBillReminder: (reminder: Omit<BillReminderItem, 'id' | 'userId' | 'createdAt'>) => void;
  deleteBillReminder: (id: string) => void;
  triggerSecurityNotification: (type: 'SECURITY_LOGIN' | 'PASSWORD_CHANGED' | 'EMAIL_CHANGED', detail?: string) => void;

  // CRUD Expenses
  addExpense: (data: {
    category: ExpenseCategory;
    subcategory?: string;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: ExpenseItem['paymentMethod'];
    accountId?: string;
    bankName?: string;
    recurring?: ExpenseItem['recurring'];
    notes?: string;
  }) => ExpenseItem;
  updateExpense: (id: string, data: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // CRUD Incomes
  addIncome: (data: {
    source: IncomeType;
    incomeType?: IncomeType;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: string;
    accountId?: string;
    bankName?: string;
    isRecurring?: boolean;
    recurring?: IncomeItem['recurring'];
    notes?: string;
  }) => IncomeItem;
  updateIncome: (id: string, data: Partial<IncomeItem>) => void;
  deleteIncome: (id: string) => void;

  // CRUD Savings Goals
  addSavingsGoal: (data: {
    title: string;
    targetAmount: number;
    currentAmount?: number;
    category: SavingsGoal['category'];
    targetDate: string;
    priority?: SavingsGoal['priority'];
    allowOverfunding?: boolean;
    colorTheme?: SavingsGoal['colorTheme'];
    notes?: string;
  }) => SavingsGoal;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToSavingsGoal: (id: string, amount: number) => void;

  // CRUD Accounts
  addAccount: (data: {
    name: string;
    bankName: string;
    accountType: FinancialAccount['accountType'];
    balance: number;
    lastFourDigits: string;
    notes?: string;
  }) => FinancialAccount;
  updateAccount: (id: string, data: Partial<FinancialAccount>) => void;
  deleteAccount: (id: string) => void;

  // Personal Tracking Machine (P2P Transfers)
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

  // Payment Cards
  addCard: (data: {
    cardName: string;
    bankName: string;
    cardType: PaymentCard['cardType'];
    last4: string;
    balanceOrDue: number;
    creditLimit?: number;
    expiryMonthYear: string;
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
  SAVINGS_GOALS: 'budgetvault_savings_goals_v1',
  ACCOUNTS: 'budgetvault_accounts_v1',
  NOTIFICATIONS: 'budgetvault_notifications_v1',
};

const INITIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc_1',
    userId: 'user_1',
    name: 'Salary Advantage Checking',
    bankName: 'State Bank of India (SBI)',
    accountType: 'Savings',
    balance: 64200,
    lastFourDigits: '4829',
    notes: 'Primary salary direct deposit',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc_2',
    userId: 'user_1',
    name: 'Wealth Direct Account',
    bankName: 'HDFC Bank',
    accountType: 'Savings',
    balance: 125000,
    lastFourDigits: '9103',
    notes: 'Secondary emergency vault',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc_3',
    userId: 'user_1',
    name: 'ICICI Platinum Credit Line',
    bankName: 'ICICI Bank',
    accountType: 'Credit Card',
    balance: 8750,
    lastFourDigits: '3318',
    notes: 'Primary online rewards card',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'acc_4',
    userId: 'user_1',
    name: 'Paytm Wallet & UPI',
    bankName: 'Paytm Payments Bank',
    accountType: 'UPI',
    balance: 4500,
    lastFourDigits: '7740',
    notes: 'Daily micro-payments',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NOTIFICATIONS_RICH: NotificationDoc[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'BUDGET_WARNING',
    title: '⚠️ Budget Alert',
    message: 'Your Food budget is 85% used.\n₹4,250 of ₹5,000 has been spent.',
    category: 'budget',
    priority: 'high',
    isRead: false,
    actionUrl: '/budgets',
    metadata: { threshold: 85, budgetId: 'b_food' },
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: 'GOAL_PROGRESS',
    title: '🎯 Savings Goal Progress',
    message: 'You are 75% closer to your laptop goal.\nSaved: ₹60,000 of ₹80,000',
    category: 'savings',
    priority: 'medium',
    isRead: false,
    actionUrl: '/savings-goals',
    metadata: { percentage: 75, goalId: 'g_laptop' },
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    type: 'INCOME_ADDED',
    title: '💰 Income Added',
    message: '₹35,000 salary was added successfully.\nIncome Type: Salary | Account: SBI',
    category: 'income',
    priority: 'low',
    isRead: true,
    actionUrl: '/income',
    metadata: { amount: 35000, source: 'Salary' },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    type: 'MONTHLY_SUMMARY',
    title: '📊 Monthly Report',
    message: 'Your monthly financial report is ready.\nIncome: ₹50,000 | Expenses: ₹24,500 | Savings: ₹25,500 (51% rate)',
    category: 'summary',
    priority: 'medium',
    isRead: true,
    actionUrl: '/monthly-summary',
    metadata: { totalIncome: 50000, totalExpenses: 24500, savingsRate: 51 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_5',
    userId: 'user_1',
    type: 'BILL_REMINDER',
    title: '⚡ Bill Reminder',
    message: 'Your electricity bill of ₹2,500 is due in 2 days.',
    category: 'system',
    priority: 'medium',
    isRead: false,
    actionUrl: '/settings',
    metadata: { billName: 'Electricity Bill', amount: 2500, daysUntilDue: 2 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_6',
    userId: 'user_1',
    type: 'SECURITY_LOGIN',
    title: '🔐 New Login',
    message: 'Your BudgetBuddy account was accessed successfully.',
    category: 'security',
    priority: 'high',
    isRead: true,
    actionUrl: '/profile',
    metadata: { time: new Date().toLocaleString() },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferenceDoc = {
  userId: 'user_1',
  budgetAlerts: true,
  expenseAlerts: true,
  incomeAlerts: true,
  goalAlerts: true,
  billReminders: true,
  accountAlerts: true,
  weeklySummary: true,
  monthlySummary: true,
  emailBudgetAlerts: true,
  emailGoalAlerts: true,
  emailBillReminders: true,
  emailWeeklySummary: true,
  emailMonthlySummary: true,
  largeExpenseThreshold: 10000,
  soundEnabled: false,
};

const INITIAL_BILL_REMINDERS: BillReminderItem[] = [
  {
    id: 'bill_1',
    userId: 'user_1',
    billName: 'Electricity Bill',
    amount: 2500,
    dueDate: '2026-08-20',
    category: 'Utilities',
    accountName: 'SBI',
    recurring: 'Monthly',
    reminderDays: 2,
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill_2',
    userId: 'user_1',
    billName: 'Airtel Broadband Wi-Fi',
    amount: 1199,
    dueDate: '2026-08-25',
    category: 'Internet',
    accountName: 'HDFC',
    recurring: 'Monthly',
    reminderDays: 3,
    isPaid: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    title: '⚠️ Food Budget Alert (85% Used)',
    message: 'Your Food category spending has reached 85% of your monthly limit.',
    type: 'budget_warning',
    isRead: false,
    createdAt: 'Today, 09:30 AM',
  },
];

const getNowMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== 'false';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'bsharmila993@gmail.com' || parsed.email === 'sarah.jenkins@budgetvault.io') {
          return INITIAL_USER;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
    return INITIAL_USER;
  });

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

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse savings goals', e);
      }
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse accounts', e);
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [richNotifications, setRichNotifications] = useState<NotificationDoc[]>(() => {
    const saved = localStorage.getItem('budgetbuddy_rich_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse rich notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS_RICH;
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferenceDoc>(() => {
    const saved = localStorage.getItem('budgetbuddy_notification_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notification preferences', e);
      }
    }
    return INITIAL_NOTIFICATION_PREFERENCES;
  });

  const [billReminders, setBillReminders] = useState<BillReminderItem[]>(() => {
    const saved = localStorage.getItem('budgetbuddy_bill_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse bill reminders', e);
      }
    }
    return INITIAL_BILL_REMINDERS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getNowMonthString());

  // Attempt sync with REST API
  useEffect(() => {
    notificationApi
      .getNotifications()
      .then((data) => {
        if (data.notifications && data.notifications.length > 0) {
          setRichNotifications(data.notifications);
        }
      })
      .catch(() => {});

    notificationApi
      .getPreferences()
      .then((prefs) => {
        if (prefs) setNotificationPreferences(prefs);
      })
      .catch(() => {});

    notificationApi
      .getBillReminders()
      .then((rems) => {
        if (rems && rems.length > 0) setBillReminders(rems);
      })
      .catch(() => {});
  }, []);

  // Persistence
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
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('budgetbuddy_rich_notifications', JSON.stringify(richNotifications));
  }, [richNotifications]);

  useEffect(() => {
    localStorage.setItem('budgetbuddy_notification_preferences', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  useEffect(() => {
    localStorage.setItem('budgetbuddy_bill_reminders', JSON.stringify(billReminders));
  }, [billReminders]);

  // Toast Actions
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Central Helper for Adding Rich Notifications with Preference & Deduplication Check
  const addRichNotification = (input: Omit<NotificationDoc, 'id' | 'userId' | 'createdAt' | 'isRead'>) => {
    if (input.category === 'budget' && !notificationPreferences.budgetAlerts) return;
    if (input.category === 'expenses' && !notificationPreferences.expenseAlerts) return;
    if (input.category === 'income' && !notificationPreferences.incomeAlerts) return;
    if (input.category === 'savings' && !notificationPreferences.goalAlerts) return;
    if (input.type === 'BILL_REMINDER' && !notificationPreferences.billReminders) return;
    if (input.category === 'account' && !notificationPreferences.accountAlerts) return;

    // Deduplication check
    if (input.type === 'BUDGET_WARNING' || input.type === 'BUDGET_EXCEEDED') {
      const bId = input.metadata?.budgetId;
      const th = input.metadata?.threshold;
      if (bId && th) {
        const exists = richNotifications.some(
          (n) => n.metadata?.budgetId === bId && n.metadata?.threshold === th
        );
        if (exists) return;
      }
    }

    const newNotif: NotificationDoc = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: user.id,
      type: input.type,
      title: input.title,
      message: input.message,
      category: input.category,
      priority: input.priority || 'medium',
      isRead: false,
      actionUrl: input.actionUrl,
      metadata: input.metadata || {},
      createdAt: new Date().toISOString(),
    };

    setRichNotifications((prev) => [newNotif, ...prev]);

    if (notificationPreferences.soundEnabled) {
      playNotificationChime();
    }
  };

  // Notification Actions
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setRichNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    notificationApi.markAsRead(id).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setRichNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notificationApi.markAllAsRead().catch(() => {});
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setRichNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationApi.deleteNotification(id).catch(() => {});
  };

  const deleteAllReadNotifications = () => {
    setRichNotifications((prev) => prev.filter((n) => !n.isRead));
    notificationApi.deleteAllRead().catch(() => {});
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setRichNotifications([]);
  };

  const updateNotificationPreferences = (updates: Partial<NotificationPreferenceDoc>) => {
    setNotificationPreferences((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('budgetbuddy_notification_preferences', JSON.stringify(updated));
      return updated;
    });
    notificationApi.updatePreferences(updates).catch(() => {});
    addToast('Notification preferences updated!');
  };

  const createBillReminder = (reminder: Omit<BillReminderItem, 'id' | 'userId' | 'createdAt'>) => {
    const newRem: BillReminderItem = {
      ...reminder,
      id: 'bill_' + Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    setBillReminders((prev) => [...prev, newRem]);
    notificationApi.createBillReminder(reminder).catch(() => {});
    addToast('Bill reminder created!');
  };

  const deleteBillReminder = (id: string) => {
    setBillReminders((prev) => prev.filter((b) => b.id !== id));
    notificationApi.deleteBillReminder(id).catch(() => {});
    addToast('Bill reminder deleted!', 'info');
  };

  const triggerSecurityNotification = (type: 'SECURITY_LOGIN' | 'PASSWORD_CHANGED' | 'EMAIL_CHANGED', detail?: string) => {
    let title = '🔐 New Login';
    let message = `Your BudgetBuddy account was accessed on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.`;

    if (type === 'PASSWORD_CHANGED') {
      title = '🔐 Password Changed';
      message = 'Your BudgetBuddy password was successfully changed. If you did not make this change, secure your account immediately.';
    } else if (type === 'EMAIL_CHANGED') {
      title = '🔐 Email Address Updated';
      message = `Your account email address has been changed successfully ${detail ? `to ${detail}` : ''}.`;
    }

    addRichNotification({
      type,
      title,
      message,
      category: 'security',
      priority: 'high',
      actionUrl: '/profile',
    });
  };

  // Auth Handlers
  const login = (email: string, _password?: string, personaId?: string, customName?: string): boolean => {
    if (personaId && DEMO_USERS[personaId]) {
      setUser(DEMO_USERS[personaId]);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USERS[personaId]));
    } else if (email) {
      const match = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (match) {
        setUser(match);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(match));
      } else {
        const namePart = customName?.trim() || email.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        const newUser: UserProfile = {
          id: 'user_' + Date.now(),
          email: email.trim(),
          fullName: formattedName,
          role: 'professional',
          monthlyIncomeGoal: 50000,
          currency: 'INR',
          savingsTargetPercent: 25,
        };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      }
    }
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    setIsAuthenticated(true);
    triggerSecurityNotification('SECURITY_LOGIN');
    addToast('Welcome back to BudgetBuddy!');
    return true;
  };

  const register = (data: {
    fullName: string;
    email: string;
    password?: string;
    role?: 'student' | 'professional' | 'freelancer' | 'admin';
    currency?: CurrencyCode;
    monthlyIncomeGoal?: number;
    savingsTargetPercent?: number;
  }): boolean => {
    const newUser: UserProfile = {
      id: 'user_' + Date.now(),
      email: data.email.trim(),
      fullName: data.fullName.trim() || data.email.split('@')[0],
      role: data.role || 'professional',
      currency: data.currency || 'INR',
      monthlyIncomeGoal: data.monthlyIncomeGoal || 50000,
      savingsTargetPercent: data.savingsTargetPercent || 25,
      createdAt: new Date().toISOString(),
    };
    // Save registered user profile to storage, but DO NOT log in yet
    localStorage.setItem('budgetbuddy_registered_user_' + data.email.toLowerCase().trim(), JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    setIsAuthenticated(false);
    return true;
  };

  const completeVerification = (userProfile: UserProfile, token?: string) => {
    setUser(userProfile);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    if (token) {
      localStorage.setItem('budgetbuddy_jwt_token_v1', token);
    }
    setIsAuthenticated(true);
    triggerSecurityNotification('SECURITY_LOGIN');
    addToast(`✓ Email verified successfully! Welcome to BudgetBuddy, ${userProfile.fullName}.`);
  };

  const logout = () => {
    localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
    localStorage.removeItem('budgetbuddy_jwt_token_v1');
    setIsAuthenticated(false);
    addToast('Signed out successfully', 'info');
  };

  const isPremium = useMemo(() => {
    return (
      user.premiumStatus === 'ACTIVE' ||
      user.role === 'premium' ||
      user.role === 'admin' ||
      user.role === 'super_admin'
    );
  }, [user.premiumStatus, user.role]);

  const isAdmin = useMemo(() => {
    return user.role === 'admin' || user.role === 'super_admin';
  }, [user.role]);

  const isSuperAdmin = useMemo(() => {
    return user.role === 'super_admin';
  }, [user.role]);

  // Feature Permissions State & Gating
  const [permissionsMap, setPermissionsMap] = useState<
    Record<
      string,
      {
        enabled: boolean;
        freeUser: boolean;
        premiumUser: boolean;
        accessible: boolean;
      }
    >
  >({});

  const refreshPermissions = async () => {
    try {
      const res = await permissionApi.getUserPermissions();
      if (res.success && res.permissions) {
        setPermissionsMap(res.permissions);
      }
    } catch {
      // Offline fallback: keep existing permissions or standard defaults
    }
  };

  useEffect(() => {
    refreshPermissions();
  }, [user.role, user.premiumStatus, isAuthenticated]);

  const hasPermission = (featureKey: string): boolean => {
    // Admins and Super Admins have unrestricted access
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    const perm = permissionsMap[featureKey];
    // If not yet loaded or unknown, allow basic features
    if (!perm) return true;

    // If master switch disabled by Admin, deny for all
    if (!perm.enabled) return false;

    const isUserPremium = user.premiumStatus === 'ACTIVE' || user.role === 'premium';
    return isUserPremium ? perm.premiumUser : perm.freeUser;
  };

  const isFeatureEnabled = (featureKey: string): boolean => {
    const perm = permissionsMap[featureKey];
    if (!perm) return true;
    return perm.enabled;
  };

  const upgradeToPlan = async (planCode: string = 'MONTHLY'): Promise<boolean> => {
    try {
      const res = await premiumApi.subscribe(planCode);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.user));
        addToast('⭐ Welcome to BudgetBuddy Premium! All features unlocked.', 'success');
        return true;
      }
    } catch (err) {
      // Local simulated fallback
      const durationDays = planCode === 'YEARLY' ? 365 : 30;
      const expiry = new Date(Date.now() + durationDays * 86400000).toISOString();
      const updated: UserProfile = {
        ...user,
        premiumStatus: 'ACTIVE',
        premiumPlan: planCode,
        premiumStartedAt: new Date().toISOString(),
        premiumExpiresAt: expiry,
      };
      setUser(updated);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      addToast('⭐ BudgetBuddy Premium Activated!', 'success');
      return true;
    }
    return false;
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      await premiumApi.cancelSubscription();
    } catch (e) {}
    addToast('Subscription auto-renewal has been cancelled.', 'info');
    return true;
  };

  const switchDemoAccount = (userId: string) => {
    if (DEMO_USERS[userId]) {
      setUser(DEMO_USERS[userId]);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (updates.email && updates.email !== user.email) {
      triggerSecurityNotification('EMAIL_CHANGED', updates.email);
    }
    setUser((prev) => ({ ...prev, ...updates }));
    addToast('Profile updated successfully!');
  };

  // Expenses CRUD
  const addExpense = (data: {
    category: ExpenseCategory;
    subcategory?: string;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: ExpenseItem['paymentMethod'];
    accountId?: string;
    bankName?: string;
    recurring?: ExpenseItem['recurring'];
    notes?: string;
  }): ExpenseItem => {
    const amountVal = Math.max(0, Number(data.amount));
    const newExpense: ExpenseItem = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      category: data.category,
      subcategory: data.subcategory?.trim(),
      amount: amountVal,
      description: data.description.trim() || 'Expense',
      date: data.date || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod || 'UPI / Card',
      accountId: data.accountId,
      bankName: data.bankName,
      recurring: data.recurring ?? false,
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // --- Automatic Notification Triggers ---
    // 1. Budget Usage Check (50%, 80%, 90%, 100%, Exceeded)
    const monthStr = (data.date || new Date().toISOString().split('T')[0]).slice(0, 7);
    const categorySpent = expenses
      .filter((e) => e.category === data.category && e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + e.amount, 0) + amountVal;

    const matchedBudget = budgets.find((b) => b.category === data.category);
    if (matchedBudget && matchedBudget.monthlyLimit > 0) {
      const pct = Math.round((categorySpent / matchedBudget.monthlyLimit) * 100);
      if (categorySpent > matchedBudget.monthlyLimit || pct >= 100) {
        const exceeded = categorySpent - matchedBudget.monthlyLimit;
        addRichNotification({
          type: 'BUDGET_EXCEEDED',
          title: '🚨 Budget Exceeded',
          message: `You have reached your ${data.category} budget limit.\nBudget: ₹${matchedBudget.monthlyLimit.toLocaleString('en-IN')}\nSpent: ₹${categorySpent.toLocaleString('en-IN')}\nExceeded by: ₹${exceeded.toLocaleString('en-IN')}`,
          category: 'budget',
          priority: 'high',
          actionUrl: '/budgets',
          metadata: { budgetId: matchedBudget.id, threshold: 100 },
        });
      } else if (pct >= 90) {
        addRichNotification({
          type: 'BUDGET_WARNING',
          title: '⚠️ Budget Warning',
          message: `Your ${data.category} budget is almost exhausted.\n90% of your monthly budget has been used.`,
          category: 'budget',
          priority: 'high',
          actionUrl: '/budgets',
          metadata: { budgetId: matchedBudget.id, threshold: 90 },
        });
      } else if (pct >= 80) {
        addRichNotification({
          type: 'BUDGET_WARNING',
          title: '⚠️ Budget Alert',
          message: `Your ${data.category} budget is 80% used.\n₹${categorySpent.toLocaleString('en-IN')} of ₹${matchedBudget.monthlyLimit.toLocaleString('en-IN')} has been spent.`,
          category: 'budget',
          priority: 'medium',
          actionUrl: '/budgets',
          metadata: { budgetId: matchedBudget.id, threshold: 80 },
        });
      } else if (pct >= 50) {
        addRichNotification({
          type: 'BUDGET_WARNING',
          title: 'Budget Update',
          message: `You have used 50% of your ${data.category} budget.\n₹${categorySpent.toLocaleString('en-IN')} of ₹${matchedBudget.monthlyLimit.toLocaleString('en-IN')} has been spent.`,
          category: 'budget',
          priority: 'low',
          actionUrl: '/budgets',
          metadata: { budgetId: matchedBudget.id, threshold: 50 },
        });
      }
    }

    // 2. Large Expense Trigger
    const lgThreshold = notificationPreferences.largeExpenseThreshold || 10000;
    if (amountVal >= lgThreshold) {
      addRichNotification({
        type: 'LARGE_EXPENSE',
        title: '💸 Large Expense',
        message: `A large expense of ₹${amountVal.toLocaleString('en-IN')} was recorded.\nCategory: ${data.category} | Account: ${data.bankName || 'Primary'} | Date: ${data.date}`,
        category: 'expenses',
        priority: 'medium',
        actionUrl: '/expenses',
        metadata: { amount: amountVal },
      });
    }

    addToast('Expense added successfully!');
    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Expense updated successfully!');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    addToast('Expense deleted successfully!', 'info');
  };

  // Incomes CRUD
  const addIncome = (data: {
    source: IncomeType;
    incomeType?: IncomeType;
    amount: number;
    description: string;
    date: string;
    paymentMethod?: string;
    accountId?: string;
    bankName?: string;
    isRecurring?: boolean;
    recurring?: IncomeItem['recurring'];
    notes?: string;
  }): IncomeItem => {
    const newIncome: IncomeItem = {
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      source: data.source || data.incomeType || 'Salary',
      incomeType: data.incomeType || data.source || 'Salary',
      amount: Math.max(0, Number(data.amount)),
      description: data.description.trim() || 'Income',
      date: data.date || new Date().toISOString().split('T')[0],
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      bankName: data.bankName,
      isRecurring: data.isRecurring ?? false,
      recurring: data.recurring ?? false,
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setIncomes((prev) => [newIncome, ...prev]);

    addRichNotification({
      type: 'INCOME_ADDED',
      title: '💰 Income Added',
      message: `₹${newIncome.amount.toLocaleString('en-IN')} ${newIncome.source} was added successfully.\nIncome Type: ${newIncome.source} | Account: ${data.bankName || 'Primary'}`,
      category: 'income',
      priority: 'low',
      actionUrl: '/income',
      metadata: { amount: newIncome.amount, source: newIncome.source },
    });

    addToast('Income added successfully!');
    return newIncome;
  };

  const updateIncome = (id: string, data: Partial<IncomeItem>) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Income updated successfully!');
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
    addToast('Income deleted successfully!', 'info');
  };

  // Savings Goals CRUD
  const addSavingsGoal = (data: {
    title: string;
    targetAmount: number;
    currentAmount?: number;
    category: SavingsGoal['category'];
    targetDate: string;
    priority?: SavingsGoal['priority'];
    allowOverfunding?: boolean;
    colorTheme?: SavingsGoal['colorTheme'];
    notes?: string;
  }): SavingsGoal => {
    const newGoal: SavingsGoal = {
      id: 'sg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      title: data.title.trim() || 'Savings Goal',
      name: data.title.trim() || 'Savings Goal',
      targetAmount: Math.max(1, Number(data.targetAmount)),
      currentAmount: Math.max(0, Number(data.currentAmount || 0)),
      category: data.category || 'General',
      targetDate: data.targetDate || new Date().toISOString().split('T')[0],
      priority: data.priority || 'Medium',
      allowOverfunding: data.allowOverfunding ?? false,
      colorTheme: data.colorTheme || 'emerald',
      description: data.notes?.trim(),
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals((prev) => [newGoal, ...prev]);

    addRichNotification({
      type: 'GOAL_CREATED',
      title: '🎯 Savings Goal Created',
      message: `Your "${newGoal.title}" savings goal has been created.\nTarget: ₹${newGoal.targetAmount.toLocaleString('en-IN')} | Target Date: ${newGoal.targetDate}`,
      category: 'savings',
      priority: 'low',
      actionUrl: '/savings-goals',
      metadata: { goalId: newGoal.id, targetAmount: newGoal.targetAmount },
    });

    addToast('Savings goal created successfully!');
    return newGoal;
  };

  const updateSavingsGoal = (id: string, data: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Savings goal updated successfully!');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
    addToast('Savings goal deleted successfully!', 'info');
  };

  const depositToSavingsGoal = (id: string, amount: number) => {
    const validAmount = Math.max(0, Number(amount));
    const targetGoal = savingsGoals.find((g) => g.id === id);

    setSavingsGoals((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const cap = item.allowOverfunding ? Infinity : item.targetAmount;
          const newCurrent = Math.min(cap, item.currentAmount + validAmount);
          return { ...item, currentAmount: newCurrent };
        }
        return item;
      })
    );

    if (targetGoal) {
      const prevAmt = targetGoal.currentAmount;
      const newAmt = prevAmt + validAmount;
      const pct = Math.round((newAmt / targetGoal.targetAmount) * 100);

      addRichNotification({
        type: 'SAVINGS_UPDATED',
        title: '💰 Savings Updated',
        message: `₹${validAmount.toLocaleString('en-IN')} has been added to your ${targetGoal.title} goal.\nPrevious savings: ₹${prevAmt.toLocaleString('en-IN')} | New savings: ₹${newAmt.toLocaleString('en-IN')} | Progress: ${pct}%`,
        category: 'savings',
        priority: 'low',
        actionUrl: '/savings-goals',
        metadata: { goalId: id, depositAmount: validAmount, previousAmount: prevAmt, currentAmount: newAmt },
      });

      if (newAmt >= targetGoal.targetAmount && prevAmt < targetGoal.targetAmount) {
        addRichNotification({
          type: 'GOAL_COMPLETED',
          title: '🎉 Savings Goal Completed!',
          message: `Congratulations!\nYou have successfully reached your ${targetGoal.title} savings goal.\nTarget: ₹${targetGoal.targetAmount.toLocaleString('en-IN')} | Saved: ₹${newAmt.toLocaleString('en-IN')}`,
          category: 'savings',
          priority: 'high',
          actionUrl: '/savings-goals',
          metadata: { goalId: id, percentage: 100 },
        });
      } else if (pct >= 75 && Math.round((prevAmt / targetGoal.targetAmount) * 100) < 75) {
        addRichNotification({
          type: 'GOAL_PROGRESS',
          title: '🎯 Almost There!',
          message: `You have reached 75% of your ${targetGoal.title} savings goal.`,
          category: 'savings',
          priority: 'low',
          actionUrl: '/savings-goals',
          metadata: { goalId: id, percentage: 75 },
        });
      } else if (pct >= 50 && Math.round((prevAmt / targetGoal.targetAmount) * 100) < 50) {
        addRichNotification({
          type: 'GOAL_PROGRESS',
          title: '🎯 Halfway There!',
          message: `You have saved 50% of your ${targetGoal.title} goal.\nKeep going!`,
          category: 'savings',
          priority: 'low',
          actionUrl: '/savings-goals',
          metadata: { goalId: id, percentage: 50 },
        });
      } else if (pct >= 25 && Math.round((prevAmt / targetGoal.targetAmount) * 100) < 25) {
        addRichNotification({
          type: 'GOAL_PROGRESS',
          title: '🎯 Goal Progress',
          message: `You have reached 25% of your ${targetGoal.title} savings goal.`,
          category: 'savings',
          priority: 'low',
          actionUrl: '/savings-goals',
          metadata: { goalId: id, percentage: 25 },
        });
      }
    }

    addToast(`Deposited ₹${validAmount.toLocaleString()} to goal!`);
  };

  // Accounts CRUD
  const addAccount = (data: {
    name: string;
    bankName: string;
    accountType: FinancialAccount['accountType'];
    balance: number;
    lastFourDigits: string;
    notes?: string;
  }): FinancialAccount => {
    const newAcc: FinancialAccount = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      name: data.name.trim() || 'Account',
      bankName: data.bankName.trim() || 'Bank',
      accountType: data.accountType,
      balance: Math.max(0, Number(data.balance)),
      lastFourDigits: data.lastFourDigits.slice(-4) || '0000',
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => [...prev, newAcc]);

    addRichNotification({
      type: 'ACCOUNT_ADDED',
      title: '🏦 Account Added',
      message: `${newAcc.bankName} account has been successfully added to BudgetBuddy.`,
      category: 'account',
      priority: 'low',
      actionUrl: '/accounts',
      metadata: { accountId: newAcc.id },
    });

    addToast('Financial account added!');
    return newAcc;
  };

  const updateAccount = (id: string, data: Partial<FinancialAccount>) => {
    setAccounts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Account updated successfully!');
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    addToast('Account deleted!', 'info');
  };

  // Transfers CRUD
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
      category: data.category.trim() || 'Transfer',
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'completed',
      paymentMode: data.paymentMode || 'UPI',
      referenceNote: data.referenceNote?.trim(),
      createdAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    addToast('P2P Transfer logged successfully!');
    return newTransfer;
  };

  const updateTransfer = (id: string, data: Partial<PersonTransfer>) => {
    setTransfers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Transfer updated!');
  };

  const deleteTransfer = (id: string) => {
    setTransfers((prev) => prev.filter((item) => item.id !== id));
    addToast('Transfer deleted!', 'info');
  };

  const settleTransfer = (id: string) => {
    setTransfers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'settled' } : item))
    );
    addToast('Transfer settled!');
  };

  // Cards CRUD
  const addCard = (data: {
    cardName: string;
    bankName: string;
    cardType: PaymentCard['cardType'];
    last4: string;
    balanceOrDue: number;
    creditLimit?: number;
    expiryMonthYear: string;
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
      expiryMonthYear: data.expiryMonthYear.trim() || '12/28',
      isFrozen: false,
      colorTheme: data.colorTheme || 'obsidian',
      billingDay: data.billingDay || 1,
      network: data.network || 'Visa',
    };

    setCards((prev) => [...prev, newCard]);
    addToast('Card instrument added!');
    return newCard;
  };

  const updateCard = (id: string, data: Partial<PaymentCard>) => {
    setCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
    addToast('Card updated!');
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((item) => item.id !== id));
    addToast('Card deleted!', 'info');
  };

  const toggleCardFreeze = (id: string) => {
    setCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFrozen: !item.isFrozen } : item))
    );
    addToast('Card freeze status toggled');
  };

  // Budget Management
  const setBudgetLimit = (
    category: ExpenseCategory,
    monthlyLimit: number,
    alertThresholdPercent: number = 80
  ) => {
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
    addToast(`Budget ceiling set for ${category}!`);
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    addToast('Budget limit removed', 'info');
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
    addToast('Exported single transaction Excel voucher!');
  };

  const exportTransfersReport = () => {
    exportTransfersExcel(transfers, user);
    addToast('Exported transfers report Excel!');
  };

  const exportMasterFinancialReport = () => {
    exportFullFinancialWorkbookExcel(expenses, incomes, transfers, cards, user);
    addToast('Downloaded master financial workbook Excel!');
  };

  const resetToSampleData = () => {
    setUser(INITIAL_USER);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setBudgets(INITIAL_BUDGETS);
    setTransfers(INITIAL_TRANSFERS);
    setCards(INITIAL_CARDS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setAccounts(INITIAL_ACCOUNTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedMonth(getNowMonthString());
    addToast('Reset to initial sample data', 'info');
  };

  const clearAllData = () => {
    setExpenses([]);
    setIncomes([]);
    setBudgets([]);
    setTransfers([]);
    setSavingsGoals([]);
    setAccounts([]);
    addToast('All data cleared', 'info');
  };

  // Filtered lists by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => i.date.startsWith(selectedMonth));
  }, [incomes, selectedMonth]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => t.date.startsWith(selectedMonth));
  }, [transfers, selectedMonth]);

  // Available months
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

    return Array.from(monthsSet).sort().reverse();
  }, [expenses, incomes, transfers, selectedMonth]);

  // Compute Previous Month String
  const prevMonthString = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
  }, [selectedMonth]);

  // Monthly Dashboard summary
  const monthlyDashboard = useMemo<MonthlyDashboardData>(() => {
    const totalIncome = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Compute Previous Month Income & Expenses for % Change
    const prevMonthIncomes = incomes.filter((i) => i.date.startsWith(prevMonthString));
    const prevMonthExpensesList = expenses.filter((e) => e.date.startsWith(prevMonthString));

    const prevMonthIncome = prevMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const prevMonthExpenses = prevMonthExpensesList.reduce((acc, curr) => acc + curr.amount, 0);

    const incomePctChange =
      prevMonthIncome > 0
        ? Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100)
        : totalIncome > 0
        ? 100
        : 0;

    const expensePctChange =
      prevMonthExpenses > 0
        ? Math.round(((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100)
        : totalExpenses > 0
        ? 100
        : 0;

    const currentBalance = totalIncome - totalExpenses;
    const netSavings = currentBalance;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // P2P Net Balance
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
          paymentMethod: e.paymentMethod,
          bankName: e.bankName,
          status: 'Paid',
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
          paymentMethod: i.paymentMethod,
          bankName: i.bankName,
          status: 'Received',
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
          paymentMethod: t.paymentMode,
          status: t.status === 'settled' ? 'Settled' : 'Pending',
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

    // Calculate Financial Health Score (0 - 100)
    let savingsRateScore = Math.min(30, Math.round((savingsRate / 25) * 30));
    let budgetAdherenceScore = budgetUtilizationRate <= 80 ? 30 : Math.max(0, 30 - (budgetUtilizationRate - 80) * 1.5);
    let expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 50;
    let expenseToIncomeRatioScore = expenseRatio <= 70 ? 20 : Math.max(0, 20 - (expenseRatio - 70));
    
    let avgGoalProgress = savingsGoals.length > 0
      ? savingsGoals.reduce((sum, g) => sum + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) / savingsGoals.length
      : 50;
    let goalProgressScore = Math.min(20, Math.round((avgGoalProgress / 100) * 20));

    const totalHealthScore = Math.min(100, Math.round(savingsRateScore + budgetAdherenceScore + expenseToIncomeRatioScore + goalProgressScore));

    let healthRating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
    if (totalHealthScore >= 85) healthRating = 'Excellent';
    else if (totalHealthScore >= 70) healthRating = 'Good';
    else if (totalHealthScore >= 50) healthRating = 'Fair';
    else healthRating = 'Needs Attention';

    const healthInsights: string[] = [];
    if (savingsRate < 20) healthInsights.push('Increase your savings rate to at least 20% of income.');
    if (budgetUtilizationRate > 80) healthInsights.push('Budget utilization is above 80%. Review category limits.');
    if (expenseRatio > 70) healthInsights.push('Outflows exceed 70% of total revenue stream.');
    if (healthInsights.length === 0) healthInsights.push('Your financial equilibrium is in healthy balance!');

    const financialHealth: FinancialHealthScore = {
      score: totalHealthScore,
      rating: healthRating,
      savingsRateScore,
      budgetAdherenceScore,
      expenseToIncomeRatioScore,
      goalProgressScore,
      insights: healthInsights,
    };

    return {
      totalIncome,
      prevMonthIncome,
      incomePctChange,
      totalExpenses,
      prevMonthExpenses,
      expensePctChange,
      currentBalance,
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
      savingsGoals,
      financialHealth,
    };
  }, [filteredExpenses, filteredIncomes, filteredTransfers, budgets, savingsGoals, selectedMonth, prevMonthString, expenses, incomes]);

  // Cash Flow Trends
  const cashFlowTrends = useMemo(() => {
    const sortedMonths = [...availableMonths].sort();
    const targetIndex = sortedMonths.indexOf(selectedMonth);
    const sliceStart = Math.max(0, targetIndex >= 0 ? targetIndex - 5 : sortedMonths.length - 6);
    const displayedMonths = sortedMonths.slice(sliceStart, sliceStart + 6);

    return displayedMonths.map((m) => {
      const monthExpenses = expenses
        .filter((e) => e.date.startsWith(m))
        .reduce((sum, e) => sum + e.amount, 0);
      const monthIncomes = incomes
        .filter((i) => i.date.startsWith(m))
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
        register,
        completeVerification,
        logout,
        switchDemoAccount,
        user,
        isPremium,
        isAdmin,
        isSuperAdmin,
        permissionsMap,
        hasPermission,
        isFeatureEnabled,
        refreshPermissions,
        upgradeToPlan,
        cancelSubscription,
        updateProfile,
        expenses,
        incomes,
        budgets,
        transfers,
        cards,
        savingsGoals,
        accounts,
        notifications,
        richNotifications,
        notificationPreferences,
        billReminders,
        toasts,
        selectedMonth,
        setSelectedMonth,
        availableMonths,
        addToast,
        dismissToast,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        deleteAllReadNotifications,
        clearAllNotifications,
        updateNotificationPreferences,
        createBillReminder,
        deleteBillReminder,
        triggerSecurityNotification,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        depositToSavingsGoal,
        addAccount,
        updateAccount,
        deleteAccount,
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
        exportSingleTransaction,
        exportTransfersReport,
        exportMasterFinancialReport,
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
