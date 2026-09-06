import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ExpenseModel } from '../models/Expense';
import { BudgetModel } from '../models/Budget';
import { NotificationModel } from '../models/Notification';

export const getExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { month, startDate, endDate, category } = req.query;

    const query: any = { userId };
    if (category) {
      query.category = category;
    }
    if (month) {
      query.date = { $regex: `^${month}` };
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await ExpenseModel.find(query).sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses, expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Unable to retrieve expense records' });
  }
};

export const getExpenseById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const expense = await ExpenseModel.findOne({ _id: req.params.id, userId });
    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense record not found' });
      return;
    }
    res.json({ success: true, data: expense, expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error retrieving expense' });
  }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const {
      amount,
      category,
      subcategory,
      expenseType,
      bankName,
      paymentMethod,
      description,
      date,
      expense_date,
      recurring,
      notes,
    } = req.body;

    if (!amount || amount <= 0 || !category || !description) {
      res.status(400).json({
        success: false,
        message: 'Amount, category, and description are required',
      });
      return;
    }

    const finalDate = date || expense_date || new Date().toISOString().split('T')[0];
    const monthYear = finalDate.substring(0, 7);

    const expense = await ExpenseModel.create({
      userId,
      amount: Number(amount),
      category,
      subcategory,
      expenseType: expenseType || 'Variable',
      bankName: bankName || 'Primary Account',
      paymentMethod: paymentMethod || 'UPI',
      description,
      date: finalDate,
      recurring,
      notes,
    });

    // Check category budget and trigger notification if threshold exceeded
    const budget = await BudgetModel.findOne({ userId, category, monthYear });
    if (budget) {
      // Calculate total category spending for this month
      const monthExpenses = await ExpenseModel.find({
        userId,
        category,
        date: { $regex: `^${monthYear}` },
      });
      const totalCategorySpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      budget.spentAmount = totalCategorySpent;
      await budget.save();

      const limit = budget.budgetAmount || budget.monthlyLimit || 0;
      if (limit > 0) {
        const usagePct = Math.round((totalCategorySpent / limit) * 100);
        if (usagePct >= 100) {
          await NotificationModel.create({
            userId,
            type: 'BUDGET_EXCEEDED',
            title: '🚨 Budget Exceeded!',
            message: `You have exceeded your ${category} budget! Spent ₹${totalCategorySpent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')} (${usagePct}%).`,
            category: 'budget',
            priority: 'high',
            isRead: false,
            actionUrl: '/budgets',
            metadata: { category, totalSpent: totalCategorySpent, limit, usagePct },
          });
        } else if (usagePct >= (budget.alertThresholdPercent || 80)) {
          await NotificationModel.create({
            userId,
            type: 'BUDGET_WARNING',
            title: '⚠️ Budget Threshold Warning',
            message: `You have used ${usagePct}% of your ${category} budget (₹${totalCategorySpent.toLocaleString('en-IN')} of ₹${limit.toLocaleString('en-IN')}).`,
            category: 'budget',
            priority: 'medium',
            isRead: false,
            actionUrl: '/budgets',
            metadata: { category, totalSpent: totalCategorySpent, limit, usagePct },
          });
        }
      }
    }

    res.status(201).json({ success: true, data: expense, expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record expense', error: error.message });
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense record not found' });
      return;
    }

    res.json({ success: true, data: expense, expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update expense record' });
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const deleted = await ExpenseModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Expense record not found' });
      return;
    }

    res.json({ success: true, message: 'Expense deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete expense record' });
  }
};
