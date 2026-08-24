import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNotificationStore } from './useNotificationStore';
import useBudgetStore from '../budget/store/useBudgetStore';
import useExpenseStore from '../expense/store/useExpenseStore';
import useIncomeStore from '../income/store/useIncomeStore';
import useSavingGoalStore from '../saving_goals/store/useSavingGoalStore';
import useAccountStore from '../account/store/useAccountStore';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * useGlobalNotifications
 * Runs globally on every authenticated page to monitor financial state,
 * active budgets, savings goals progress (90% milestone & completion),
 * and bank accounts to emit alerts and popup toasts.
 */
export function useGlobalNotifications() {
  const addNotification = useNotificationStore((s) => s.addNotification);

  const { budgets, fetchBudgets } = useBudgetStore(
    useShallow((s) => ({ budgets: s.budgets, fetchBudgets: s.fetchBudgets }))
  );

  const { expenses, fetchExpenses } = useExpenseStore(
    useShallow((s) => ({ expenses: s.expenses, fetchExpenses: s.fetchExpenses }))
  );

  const { incomes, fetchIncomes } = useIncomeStore(
    useShallow((s) => ({ incomes: s.incomes, fetchIncomes: s.fetchIncomes }))
  );

  const { goals, fetchGoals } = useSavingGoalStore(
    useShallow((s) => ({ goals: s.goals, fetchGoals: s.fetchGoals }))
  );

  const { bankAccounts, fetchBankAccounts } = useAccountStore(
    useShallow((s) => ({ bankAccounts: s.bankAccounts, fetchBankAccounts: s.fetchBankAccounts }))
  );

  // Initial load
  const isInitialLoad = useRef(false);
  useEffect(() => {
    if (!isInitialLoad.current) {
      isInitialLoad.current = true;
      Promise.allSettled([
        fetchBudgets(),
        fetchExpenses(),
        fetchIncomes(),
        fetchGoals(),
        fetchBankAccounts(),
      ]);
    }
  }, [fetchBudgets, fetchExpenses, fetchIncomes, fetchGoals, fetchBankAccounts]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Current month spending by category
  const currentMonthSpendByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        map[e.category] = (map[e.category] ?? 0) + Number(e.amount || 0);
      }
    });
    return map;
  }, [expenses, currentMonth, currentYear]);

  // 2. Evaluate active budgets against current month expenses
  useEffect(() => {
    if (budgets.length === 0 || expenses.length === 0) return;

    budgets.forEach((b) => {
      const spent = currentMonthSpendByCategory[b.category] ?? 0;
      const limit = Number(b.monthly_limit);
      const pct = limit > 0 ? (spent / limit) * 100 : 0;

      if (spent > limit) {
        addNotification({
          type: 'overspend',
          title: `⚠️ Budget Exceeded: ${b.category}`,
          message: `You've spent ₹${spent.toLocaleString('en-IN')} of your ₹${limit.toLocaleString('en-IN')} limit for ${MONTH_NAMES[currentMonth]} ${currentYear}.`,
          dedupKey: `budget:${b.category.toLowerCase()}:${currentYear}-${currentMonth}:exceeded`,
          showToast: true,
        });
      } else if (pct >= 80) {
        addNotification({
          type: 'overspend',
          title: `⚡ Budget Warning: ${b.category}`,
          message: `"${b.category}" is at ${pct.toFixed(0)}% of monthly limit. ₹${(limit - spent).toLocaleString('en-IN')} remaining for ${MONTH_NAMES[currentMonth]}.`,
          dedupKey: `budget:${b.category.toLowerCase()}:${currentYear}-${currentMonth}:warning`,
          showToast: false,
        });
      }
    });
  }, [budgets, currentMonthSpendByCategory, currentMonth, currentYear, addNotification, expenses.length]);

  // 3. Evaluate savings goals progress (90% milestone & 100% completion)
  useEffect(() => {
    if (goals.length === 0) return;

    goals.forEach((g) => {
      const target = Number(g.target_amount);
      const current = Number(g.current_amount);
      const pct = target > 0 ? (current / target) * 100 : 0;

      if (pct >= 100) {
        addNotification({
          type: 'goal_complete',
          title: `🏆 Goal Achieved: ${g.goal_name}`,
          message: `"${g.goal_name}" is fully funded (₹${current.toLocaleString('en-IN')} / ₹${target.toLocaleString('en-IN')})! Amazing job!`,
          dedupKey: `goal:${g.id}:completed`,
          showToast: true,
        });
      } else if (pct >= 90) {
        addNotification({
          type: 'goal_near',
          title: `🔥 Almost There (90%): ${g.goal_name}`,
          message: `"${g.goal_name}" has reached ${pct.toFixed(0)}% (₹${current.toLocaleString('en-IN')} / ₹${target.toLocaleString('en-IN')}) — only ₹${(target - current).toLocaleString('en-IN')} left!`,
          dedupKey: `goal:${g.id}:near_90`,
          showToast: true,
        });
      } else if (pct >= 75) {
        addNotification({
          type: 'goal_near',
          title: `📈 Milestone Progress: ${g.goal_name}`,
          message: `"${g.goal_name}" is ${pct.toFixed(0)}% funded — ₹${(target - current).toLocaleString('en-IN')} to target.`,
          dedupKey: `goal:${g.id}:near_75`,
          showToast: false,
        });
      }
    });
  }, [goals, addNotification]);

  // 4. Overdraft / Negative balance alert
  useEffect(() => {
    if (bankAccounts.length === 0) return;

    bankAccounts.forEach((acc) => {
      const bal = Number(acc.balance);
      if (bal < 0) {
        addNotification({
          type: 'overspend',
          title: `⚠️ Overdraft Alert: ${acc.bank_name}`,
          message: `Account (${acc.account_number}) is in deficit with a balance of ₹${bal.toLocaleString('en-IN')}.`,
          dedupKey: `account:${acc.id}:negative`,
          showToast: true,
        });
      }
    });
  }, [bankAccounts, addNotification]);

  // 5. Monthly Deficit Warning (Expenses > Incomes in current month)
  useEffect(() => {
    if (incomes.length === 0 && expenses.length === 0) return;

    const monthIncome = incomes
      .filter((i) => {
        const d = new Date(i.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const monthExpense = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    if (monthIncome > 0 && monthExpense > monthIncome) {
      addNotification({
        type: 'overspend',
        title: `⚠️ Monthly Spending Deficit`,
        message: `Current month expenses (₹${monthExpense.toLocaleString('en-IN')}) exceed income (₹${monthIncome.toLocaleString('en-IN')}) by ₹${(monthExpense - monthIncome).toLocaleString('en-IN')}.`,
        dedupKey: `deficit:${currentYear}-${currentMonth}`,
        showToast: true,
      });
    }
  }, [incomes, expenses, currentMonth, currentYear, addNotification]);
}
