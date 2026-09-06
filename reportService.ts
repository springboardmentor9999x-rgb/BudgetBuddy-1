import { IncomeModel } from '../models/Income';
import { ExpenseModel } from '../models/Expense';
import { BudgetModel } from '../models/Budget';
import { SavingsGoalModel } from '../models/SavingsGoal';
import { BillModel } from '../models/Bill';

export interface ReportQueryParams {
  period?: 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all_time' | 'custom';
  startDate?: string;
  endDate?: string;
  monthYear?: string;
}

export const getReportsData = async (userId: string, params: ReportQueryParams = {}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = String(currentMonth).padStart(2, '0');
  const defaultMonthYear = params.monthYear || `${currentYear}-${currentMonthStr}`;

  // 1. Calculate Date Range Bounds
  let startDate = '';
  let endDate = '';
  const period = params.period || 'this_month';

  if (params.startDate && params.endDate) {
    startDate = params.startDate;
    endDate = params.endDate;
  } else if (period === 'today') {
    const todayStr = `${currentYear}-${currentMonthStr}-${String(now.getDate()).padStart(2, '0')}`;
    startDate = todayStr;
    endDate = todayStr;
  } else if (period === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(new Date().setDate(diff));
    const sunday = new Date(new Date().setDate(diff + 6));
    startDate = monday.toISOString().split('T')[0];
    endDate = sunday.toISOString().split('T')[0];
  } else if (period === 'this_month') {
    startDate = `${defaultMonthYear}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'last_month') {
    const prevD = new Date(currentYear, currentMonth - 2, 1);
    const pYr = prevD.getFullYear();
    const pMo = String(prevD.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${pYr}-${pMo}-31`;
  } else if (period === 'last_3_months') {
    const prev3D = new Date(currentYear, currentMonth - 3, 1);
    const pYr = prev3D.getFullYear();
    const pMo = String(prev3D.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'last_6_months') {
    const prev6D = new Date(currentYear, currentMonth - 6, 1);
    const pYr = prev6D.getFullYear();
    const pMo = String(prev6D.getMonth() + 1).padStart(2, '0');
    startDate = `${pYr}-${pMo}-01`;
    endDate = `${defaultMonthYear}-31`;
  } else if (period === 'this_year') {
    startDate = `${currentYear}-01-01`;
    endDate = `${currentYear}-12-31`;
  } else if (period === 'all_time') {
    startDate = '2000-01-01';
    endDate = '2099-12-31';
  } else {
    startDate = `${defaultMonthYear}-01`;
    endDate = `${defaultMonthYear}-31`;
  }

  // 2. Fetch User Financial Records
  const [allIncomes, allExpenses, allBudgets, allGoals, allBills] = await Promise.all([
    (IncomeModel as any).find({ userId }).sort({ date: -1 }).lean(),
    (ExpenseModel as any).find({ userId }).sort({ date: -1 }).lean(),
    (BudgetModel as any).find({ userId }).lean(),
    (SavingsGoalModel as any).find({ userId }).sort({ priority: 1, createdAt: -1 }).lean(),
    (BillModel as any).find({ userId }).sort({ dueDate: 1 }).lean(),
  ]);

  // Adjust all_time bounds based on real data if applicable
  if (period === 'all_time') {
    const allDates = [
      ...allIncomes.map((i: any) => i.date),
      ...allExpenses.map((e: any) => e.date),
    ].filter(Boolean).sort();
    if (allDates.length > 0) {
      startDate = allDates[0];
      endDate = allDates[allDates.length - 1];
    }
  }

  // Filter records for selected period
  const periodIncomes = allIncomes.filter((item: any) => item.date >= startDate && item.date <= endDate);
  const periodExpenses = allExpenses.filter((item: any) => item.date >= startDate && item.date <= endDate);

  // Previous period calculation for comparison trends
  const dateDiffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const dateDiffDays = Math.max(1, Math.ceil(dateDiffMs / (1000 * 60 * 60 * 24)) + 1);

  const prevPeriodEndDateObj = new Date(new Date(startDate).getTime() - 24 * 60 * 60 * 1000);
  const prevPeriodStartDateObj = new Date(prevPeriodEndDateObj.getTime() - (dateDiffDays - 1) * 24 * 60 * 60 * 1000);
  const prevStartDate = prevPeriodStartDateObj.toISOString().split('T')[0];
  const prevEndDate = prevPeriodEndDateObj.toISOString().split('T')[0];

  const prevIncomes = allIncomes.filter((item: any) => item.date >= prevStartDate && item.date <= prevEndDate);
  const prevExpenses = allExpenses.filter((item: any) => item.date >= prevStartDate && item.date <= prevEndDate);

  const prevTotalIncome = prevIncomes.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const prevTotalExpenses = prevExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);

  // 3. Core Financial Calculations
  const totalIncome = periodIncomes.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = periodExpenses.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;
  const savings = balance;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
  const expenseRatio = totalIncome > 0 ? Math.min(100, Math.round((totalExpenses / totalIncome) * 100)) : 0;

  const incomePctChange = prevTotalIncome > 0
    ? Math.round(((totalIncome - prevTotalIncome) / prevTotalIncome) * 100)
    : 0;
  const expensePctChange = prevTotalExpenses > 0
    ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
    : 0;

  // 4. Budget Report Calculations
  const totalBudget = allBudgets.reduce(
    (sum: number, b: any) => sum + (Number(b.budgetAmount || b.monthlyLimit) || 0),
    0
  );
  const budgetUsed = totalExpenses;
  const budgetRemaining = Math.max(0, totalBudget - budgetUsed);
  const budgetPercentage = totalBudget > 0
    ? Math.min(200, Math.round((budgetUsed / totalBudget) * 100))
    : 0;

  let budgetHealthStatus: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Exceeded' = 'Healthy';
  if (budgetPercentage >= 100) {
    budgetHealthStatus = 'Exceeded';
  } else if (budgetPercentage >= 90) {
    budgetHealthStatus = 'Almost Exceeded';
  } else if (budgetPercentage >= 70) {
    budgetHealthStatus = 'Warning';
  }

  const categoryBudgets = allBudgets.map((b: any) => {
    const catExpenses = periodExpenses.filter((e: any) => e.category === b.category);
    const catSpent = catExpenses.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    const catLimit = Number(b.budgetAmount || b.monthlyLimit || 0);
    const catRemaining = Math.max(0, catLimit - catSpent);
    const catPercent = catLimit > 0 ? Math.round((catSpent / catLimit) * 100) : 0;

    let catStatus: 'Healthy' | 'Warning' | 'Almost Exceeded' | 'Exceeded' = 'Healthy';
    if (catPercent >= 100) catStatus = 'Exceeded';
    else if (catPercent >= 90) catStatus = 'Almost Exceeded';
    else if (catPercent >= 70) catStatus = 'Warning';

    return {
      id: b._id ? b._id.toString() : b.id,
      category: b.category,
      budgetAmount: catLimit,
      spentAmount: catSpent,
      remainingAmount: catRemaining,
      percentage: catPercent,
      status: catStatus,
    };
  });

  // 5. Savings Goals Report Calculations
  const savingsGoalsReport = allGoals.map((g: any) => {
    const target = Number(g.targetAmount || 1);
    const saved = Number(g.savedAmount !== undefined ? g.savedAmount : (g.currentAmount || 0));
    const remaining = Math.max(0, target - saved);
    const progress = Math.min(100, Math.round((saved / target) * 100));
    const isCompleted = progress >= 100 || g.status === 'completed';

    return {
      id: g._id ? g._id.toString() : g.id,
      title: g.title || g.goalName || 'Savings Goal',
      goalName: g.goalName || g.title || 'Savings Goal',
      targetAmount: target,
      savedAmount: saved,
      currentAmount: saved,
      remainingAmount: remaining,
      progress,
      targetDate: g.targetDate,
      category: g.category || 'General',
      priority: g.priority || 'Medium',
      status: isCompleted ? ('Completed' as const) : ('In Progress' as const),
      colorTheme: g.colorTheme || 'emerald',
      notes: g.notes,
    };
  });

  // 6. Income Report Breakdown & Metrics
  const incomeCount = periodIncomes.length;
  const averageIncome = incomeCount > 0 ? Math.round(totalIncome / incomeCount) : 0;

  const sortedIncomes = [...periodIncomes].sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
  const highestIncome = sortedIncomes.length > 0 ? {
    id: sortedIncomes[0]._id ? sortedIncomes[0]._id.toString() : sortedIncomes[0].id,
    source: sortedIncomes[0].source || sortedIncomes[0].incomeType || 'Other',
    description: sortedIncomes[0].description,
    amount: Number(sortedIncomes[0].amount),
    date: sortedIncomes[0].date,
    bankName: sortedIncomes[0].bankName || 'Primary Bank',
    paymentMethod: sortedIncomes[0].paymentMethod || 'Bank Transfer',
  } : null;

  const lowestIncome = sortedIncomes.length > 0 ? {
    id: sortedIncomes[sortedIncomes.length - 1]._id ? sortedIncomes[sortedIncomes.length - 1]._id.toString() : sortedIncomes[sortedIncomes.length - 1].id,
    source: sortedIncomes[sortedIncomes.length - 1].source || sortedIncomes[sortedIncomes.length - 1].incomeType || 'Other',
    description: sortedIncomes[sortedIncomes.length - 1].description,
    amount: Number(sortedIncomes[sortedIncomes.length - 1].amount),
    date: sortedIncomes[sortedIncomes.length - 1].date,
    bankName: sortedIncomes[sortedIncomes.length - 1].bankName || 'Primary Bank',
    paymentMethod: sortedIncomes[sortedIncomes.length - 1].paymentMethod || 'Bank Transfer',
  } : null;

  const incomeSourceMap = new Map<string, number>();
  const incomeTypeMap = new Map<string, number>();

  periodIncomes.forEach((inc: any) => {
    const src = inc.source || inc.incomeType || 'Other';
    incomeSourceMap.set(src, (incomeSourceMap.get(src) || 0) + (Number(inc.amount) || 0));

    const typ = inc.incomeType || inc.source || 'Other';
    incomeTypeMap.set(typ, (incomeTypeMap.get(typ) || 0) + (Number(inc.amount) || 0));
  });

  const incomeBySource = Array.from(incomeSourceMap.entries()).map(([name, amount]) => ({
    name,
    source: name,
    amount,
    percentage: totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const incomeByType = Array.from(incomeTypeMap.entries()).map(([name, amount]) => ({
    name,
    type: name,
    amount,
    percentage: totalIncome > 0 ? Number(((amount / totalIncome) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const incomeRecords = periodIncomes.map((inc: any) => ({
    id: inc._id ? inc._id.toString() : inc.id,
    date: inc.date,
    source: inc.source || inc.incomeType || 'Other',
    incomeType: inc.incomeType || inc.source || 'Salary',
    bank: inc.bankName || 'Primary Bank',
    bankName: inc.bankName || 'Primary Bank',
    paymentMethod: inc.paymentMethod || 'Bank Transfer',
    description: inc.description,
    amount: Number(inc.amount),
    notes: inc.notes,
  }));

  // 7. Expense Report Breakdown & Metrics
  const expenseCount = periodExpenses.length;
  const averageExpense = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

  const sortedExpenses = [...periodExpenses].sort((a: any, b: any) => Number(b.amount) - Number(a.amount));
  const highestExpense = sortedExpenses.length > 0 ? {
    id: sortedExpenses[0]._id ? sortedExpenses[0]._id.toString() : sortedExpenses[0].id,
    category: sortedExpenses[0].category || 'Other',
    description: sortedExpenses[0].description,
    amount: Number(sortedExpenses[0].amount),
    date: sortedExpenses[0].date,
    bankName: sortedExpenses[0].bankName || 'Primary Account',
    paymentMethod: sortedExpenses[0].paymentMethod || 'UPI',
  } : null;

  const lowestExpense = sortedExpenses.length > 0 ? {
    id: sortedExpenses[sortedExpenses.length - 1]._id ? sortedExpenses[sortedExpenses.length - 1]._id.toString() : sortedExpenses[sortedExpenses.length - 1].id,
    category: sortedExpenses[sortedExpenses.length - 1].category || 'Other',
    description: sortedExpenses[sortedExpenses.length - 1].description,
    amount: Number(sortedExpenses[sortedExpenses.length - 1].amount),
    date: sortedExpenses[sortedExpenses.length - 1].date,
    bankName: sortedExpenses[sortedExpenses.length - 1].bankName || 'Primary Account',
    paymentMethod: sortedExpenses[sortedExpenses.length - 1].paymentMethod || 'UPI',
  } : null;

  const expenseCategoryMap = new Map<string, number>();
  const expenseBankMap = new Map<string, number>();
  const expensePaymentMethodMap = new Map<string, number>();

  periodExpenses.forEach((exp: any) => {
    const cat = exp.category || 'Other';
    expenseCategoryMap.set(cat, (expenseCategoryMap.get(cat) || 0) + (Number(exp.amount) || 0));

    const bnk = exp.bankName || 'Primary Account';
    expenseBankMap.set(bnk, (expenseBankMap.get(bnk) || 0) + (Number(exp.amount) || 0));

    const pm = exp.paymentMethod || 'UPI';
    expensePaymentMethodMap.set(pm, (expensePaymentMethodMap.get(pm) || 0) + (Number(exp.amount) || 0));
  });

  const expenseByCategory = Array.from(expenseCategoryMap.entries()).map(([name, amount]) => ({
    name,
    category: name,
    amount,
    percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const expenseByBank = Array.from(expenseBankMap.entries()).map(([name, amount]) => ({
    name,
    bank: name,
    amount,
    percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const expenseByPaymentMethod = Array.from(expensePaymentMethodMap.entries()).map(([name, amount]) => ({
    name,
    paymentMethod: name,
    amount,
    percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const expenseRecords = periodExpenses.map((exp: any) => ({
    id: exp._id ? exp._id.toString() : exp.id,
    date: exp.date,
    category: exp.category || 'Other',
    expenseType: exp.expenseType || 'Variable',
    bank: exp.bankName || 'Primary Account',
    bankName: exp.bankName || 'Primary Account',
    paymentMethod: exp.paymentMethod || 'UPI',
    description: exp.description,
    amount: Number(exp.amount),
    notes: exp.notes,
  }));

  // 8. Monthly Aggregations & Trend Charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyDataMap = new Map<string, { income: number; expenses: number; balance: number }>();

  // Determine months to include (all unique months present or last 6-12 months)
  const pastMonths: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    pastMonths.push(ym);
  }

  // Ensure all active period months are in the map
  allIncomes.forEach((i: any) => {
    if (i.date) {
      const ym = i.date.substring(0, 7);
      if (!monthlyDataMap.has(ym)) {
        monthlyDataMap.set(ym, { income: 0, expenses: 0, balance: 0 });
      }
      const entry = monthlyDataMap.get(ym)!;
      entry.income += Number(i.amount) || 0;
    }
  });

  allExpenses.forEach((e: any) => {
    if (e.date) {
      const ym = e.date.substring(0, 7);
      if (!monthlyDataMap.has(ym)) {
        monthlyDataMap.set(ym, { income: 0, expenses: 0, balance: 0 });
      }
      const entry = monthlyDataMap.get(ym)!;
      entry.expenses += Number(e.amount) || 0;
    }
  });

  // Calculate balances
  for (const [_ym, data] of monthlyDataMap.entries()) {
    data.balance = data.income - data.expenses;
  }

  // Format monthly list for charts (sorted chronologically)
  const sortedMonthKeys = Array.from(monthlyDataMap.keys()).sort();
  const displayMonthKeys = sortedMonthKeys.length >= 6 ? sortedMonthKeys.slice(-6) : pastMonths.slice(-6);

  const monthlyIncomeChart = displayMonthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const label = `${monthNames[(m || 1) - 1]} ${y !== currentYear ? y : ''}`.trim();
    const data = monthlyDataMap.get(ym) || { income: 0, expenses: 0, balance: 0 };
    return {
      month: label,
      monthKey: ym,
      amount: data.income,
      income: data.income,
    };
  });

  const monthlyExpenseChart = displayMonthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const label = `${monthNames[(m || 1) - 1]} ${y !== currentYear ? y : ''}`.trim();
    const data = monthlyDataMap.get(ym) || { income: 0, expenses: 0, balance: 0 };
    return {
      month: label,
      monthKey: ym,
      amount: data.expenses,
      expenses: data.expenses,
    };
  });

  const incomeVsExpenseChart = displayMonthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const label = `${monthNames[(m || 1) - 1]}`;
    const data = monthlyDataMap.get(ym) || { income: 0, expenses: 0, balance: 0 };
    return {
      month: label,
      monthKey: ym,
      income: data.income,
      expenses: data.expenses,
      expense: data.expenses,
      balance: data.balance,
    };
  });

  const balanceTrendChart = displayMonthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const label = `${monthNames[(m || 1) - 1]}`;
    const data = monthlyDataMap.get(ym) || { income: 0, expenses: 0, balance: 0 };
    return {
      month: label,
      monthKey: ym,
      balance: data.balance,
      income: data.income,
      expenses: data.expenses,
    };
  });

  const cashFlowChart = displayMonthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const label = `${monthNames[(m || 1) - 1]}`;
    const data = monthlyDataMap.get(ym) || { income: 0, expenses: 0, balance: 0 };
    return {
      month: label,
      monthKey: ym,
      cashIn: data.income,
      cashOut: data.expenses,
      income: data.income,
      expenses: data.expenses,
      netCashFlow: data.balance,
      balance: data.balance,
    };
  });

  // 9. Unified Transactions Report
  const transactions = [
    ...periodIncomes.map((inc: any) => ({
      id: inc._id ? inc._id.toString() : inc.id,
      date: inc.date,
      type: 'Income' as const,
      category: inc.source || inc.incomeType || 'Income',
      description: inc.description,
      bank: inc.bankName || 'Primary Bank',
      paymentMethod: inc.paymentMethod || 'Bank Transfer',
      amount: Number(inc.amount),
    })),
    ...periodExpenses.map((exp: any) => ({
      id: exp._id ? exp._id.toString() : exp.id,
      date: exp.date,
      type: 'Expense' as const,
      category: exp.category || 'Other',
      description: exp.description,
      bank: exp.bankName || 'Primary Account',
      paymentMethod: exp.paymentMethod || 'UPI',
      amount: Number(exp.amount),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 10. Upcoming Bills Report
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);

  const upcomingBills = allBills.map((bill: any) => {
    const dueObj = new Date(bill.dueDate);
    dueObj.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueObj.getTime() - todayDateObj.getTime()) / (1000 * 60 * 60 * 24));
    let status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid' = bill.status || 'Upcoming';

    if (bill.isPaid) {
      status = 'Paid';
    } else if (diffDays < 0) {
      status = 'Overdue';
    } else if (diffDays === 0) {
      status = 'Due Today';
    } else {
      status = 'Upcoming';
    }

    return {
      id: bill._id ? bill._id.toString() : bill.id,
      billName: bill.billName,
      dueDate: bill.dueDate,
      amount: Number(bill.amount),
      status,
      category: bill.category || 'Utilities',
      accountName: bill.accountName || 'Primary Bank',
      isPaid: Boolean(bill.isPaid),
      diffDays,
    };
  }).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // 11. Financial Analysis Key Indicators
  const averageDailySpending = Math.round(totalExpenses / dateDiffDays);

  const financialAnalysis = {
    savingsRate,
    expenseRatio,
    averageDailySpending,
    averageIncome,
    averageExpense,
    highestExpense,
    highestIncome,
    lowestExpense,
    lowestIncome,
    periodDays: dateDiffDays,
  };

  // 12. Dynamic Financial Insights
  const financialInsights: Array<{
    id: string;
    icon: string;
    text: string;
    type: 'info' | 'warning' | 'success';
  }> = [];

  if (expensePctChange > 0) {
    financialInsights.push({
      id: 'ins_exp_increase',
      icon: '📈',
      text: `Your expenses increased by ${expensePctChange}% compared with the previous period.`,
      type: 'warning',
    });
  } else if (expensePctChange < 0) {
    financialInsights.push({
      id: 'ins_exp_decrease',
      icon: '📉',
      text: `Your expenses decreased by ${Math.abs(expensePctChange)}% compared with the previous period.`,
      type: 'success',
    });
  }

  if (expenseByCategory.length > 0) {
    financialInsights.push({
      id: 'ins_highest_cat',
      icon: '💳',
      text: `Your highest spending category is ${expenseByCategory[0].name} (₹${expenseByCategory[0].amount.toLocaleString('en-IN')}, ${expenseByCategory[0].percentage}% of total).`,
      type: 'info',
    });
  }

  if (savingsRate > 0) {
    financialInsights.push({
      id: 'ins_savings_rate',
      icon: '💰',
      text: `Your savings rate is ${savingsRate}%. ${savingsRate >= 30 ? 'Excellent financial discipline!' : 'Try targeting 30% savings.'}`,
      type: savingsRate >= 30 ? 'success' : 'info',
    });
  }

  if (totalBudget > 0) {
    financialInsights.push({
      id: 'ins_budget_use',
      icon: budgetPercentage >= 90 ? '⚠️' : '📊',
      text: `You have used ${budgetPercentage}% of your total budget (₹${budgetUsed.toLocaleString('en-IN')} of ₹${totalBudget.toLocaleString('en-IN')}).`,
      type: budgetPercentage >= 90 ? 'warning' : 'info',
    });
  }

  if (totalIncome > totalExpenses) {
    financialInsights.push({
      id: 'ins_surplus',
      icon: '✅',
      text: `Your income is higher than your expenses by ₹${(totalIncome - totalExpenses).toLocaleString('en-IN')}.`,
      type: 'success',
    });
  } else if (totalExpenses > totalIncome && totalIncome > 0) {
    financialInsights.push({
      id: 'ins_deficit',
      icon: '⚠️',
      text: `Your expenses exceed your income by ₹${(totalExpenses - totalIncome).toLocaleString('en-IN')} for this period.`,
      type: 'warning',
    });
  }

  if (highestExpense) {
    financialInsights.push({
      id: 'ins_largest_exp',
      icon: '🏷️',
      text: `Your largest single expense this period was ₹${highestExpense.amount.toLocaleString('en-IN')} for "${highestExpense.description}" (${highestExpense.category}).`,
      type: 'info',
    });
  }

  return {
    success: true,
    lastUpdated: new Date().toISOString(),
    period: {
      periodType: period,
      startDate,
      endDate,
    },
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      savings,
      savingsRate,
      expenseRatio,
      totalBudget,
      budgetUsed,
      budgetRemaining,
      budgetPercentage,
      budgetHealthStatus,
      incomeTransactionsCount: incomeCount,
      expenseTransactionsCount: expenseCount,
      totalTransactionsCount: incomeCount + expenseCount,
    },
    budgetReport: {
      totalBudget,
      budgetUsed,
      budgetRemaining,
      budgetPercentage,
      budgetHealthStatus,
      categories: categoryBudgets,
    },
    savingsGoals: savingsGoalsReport,
    income: {
      total: totalIncome,
      count: incomeCount,
      average: averageIncome,
      highest: highestIncome,
      lowest: lowestIncome,
      bySource: incomeBySource,
      byType: incomeByType,
      monthly: monthlyIncomeChart,
      records: incomeRecords,
    },
    expenses: {
      total: totalExpenses,
      count: expenseCount,
      average: averageExpense,
      highest: highestExpense,
      lowest: lowestExpense,
      byCategory: expenseByCategory,
      byBank: expenseByBank,
      byPaymentMethod: expenseByPaymentMethod,
      monthly: monthlyExpenseChart,
      records: expenseRecords,
    },
    cashFlow: {
      cashIn: totalIncome,
      cashOut: totalExpenses,
      netCashFlow: balance,
      chart: cashFlowChart,
    },
    transactions,
    upcomingBills,
    financialAnalysis,
    financialInsights,
    charts: {
      incomeVsExpense: incomeVsExpenseChart,
      balanceTrend: balanceTrendChart,
      cashFlow: cashFlowChart,
      incomeSources: incomeBySource,
      expenseCategories: expenseByCategory,
      monthlyIncome: monthlyIncomeChart,
      monthlyExpense: monthlyExpenseChart,
    },
  };
};
