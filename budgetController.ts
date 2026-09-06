import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BudgetModel } from '../models/Budget';
import { ExpenseModel } from '../models/Expense';

export const getBudgets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { monthYear } = req.query;

    const now = new Date();
    const curMonthYear = (monthYear as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = await BudgetModel.find({ userId });

    // Calculate dynamic spent amounts for current month
    const expenses = await ExpenseModel.find({
      userId,
      date: { $regex: `^${curMonthYear}` },
    });

    const categorySpentMap = new Map<string, number>();
    expenses.forEach((e) => {
      categorySpentMap.set(e.category, (categorySpentMap.get(e.category) || 0) + e.amount);
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = categorySpentMap.get(b.category) || b.spentAmount || 0;
      const limit = b.budgetAmount || b.monthlyLimit || 0;
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= (b.alertThresholdPercent || 80)) status = 'warning';

      return {
        id: b._id ? b._id.toString() : b.id,
        category: b.category,
        budgetAmount: limit,
        monthlyLimit: limit,
        spentAmount: spent,
        spent,
        remaining,
        percentage,
        status,
        monthYear: b.monthYear || curMonthYear,
        alertThresholdPercent: b.alertThresholdPercent || 80,
      };
    });

    res.json({ success: true, data: enrichedBudgets, budgets: enrichedBudgets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Unable to retrieve budgets' });
  }
};

export const createOrUpdateBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const {
      category,
      budget_amount,
      budgetAmount,
      monthlyLimit,
      monthYear,
      alertThresholdPercent,
    } = req.body;

    const amount = Number(budgetAmount || budget_amount || monthlyLimit);
    if (!category || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid category and budget amount are required' });
      return;
    }

    const now = new Date();
    const curMonthYear = monthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budget = await BudgetModel.findOneAndUpdate(
      { userId, category, monthYear: curMonthYear },
      {
        $set: {
          budgetAmount: amount,
          monthlyLimit: amount,
          alertThresholdPercent: alertThresholdPercent || 80,
        },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: budget, budget });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save budget limit', error: error.message });
  }
};

export const updateBudgetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const budget = await BudgetModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!budget) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    res.json({ success: true, data: budget, budget });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update budget' });
  }
};

export const deleteBudget = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const deleted = await BudgetModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Budget not found' });
      return;
    }

    res.json({ success: true, message: 'Budget deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete budget' });
  }
};
