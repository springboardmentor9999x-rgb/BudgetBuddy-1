import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { IncomeModel } from '../models/Income';
import { NotificationModel } from '../models/Notification';

export const getIncomes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { month, startDate, endDate } = req.query;

    const query: any = { userId };
    if (month) {
      query.date = { $regex: `^${month}` };
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const incomes = await IncomeModel.find(query).sort({ date: -1 });
    res.json({ success: true, count: incomes.length, data: incomes, incomes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Unable to retrieve income records' });
  }
};

export const getIncomeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const income = await IncomeModel.findOne({ _id: req.params.id, userId });
    if (!income) {
      res.status(404).json({ success: false, message: 'Income record not found' });
      return;
    }
    res.json({ success: true, data: income, income });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error retrieving income' });
  }
};

export const createIncome = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const {
      amount,
      incomeType,
      source,
      bankName,
      paymentMethod,
      description,
      date,
      received_date,
      isRecurring,
      notes,
    } = req.body;

    if (!amount || amount <= 0 || !description) {
      res.status(400).json({ success: false, message: 'Amount and description are required' });
      return;
    }

    const finalDate = date || received_date || new Date().toISOString().split('T')[0];
    const finalSource = source || incomeType || 'Other';

    const income = await IncomeModel.create({
      userId,
      amount: Number(amount),
      incomeType: finalSource,
      source: finalSource,
      bankName: bankName || 'Primary Account',
      paymentMethod: paymentMethod || 'Bank Transfer',
      description,
      date: finalDate,
      isRecurring: Boolean(isRecurring),
      notes,
    });

    // Create confirmation notification
    await NotificationModel.create({
      userId,
      type: 'INCOME_ADDED',
      title: '💰 Income Added',
      message: `₹${Number(amount).toLocaleString('en-IN')} added from ${finalSource}.`,
      category: 'income',
      priority: 'low',
      isRead: false,
      actionUrl: '/income',
      metadata: { incomeId: income._id, amount, source: finalSource },
    });

    res.status(201).json({ success: true, data: income, income });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to record income', error: error.message });
  }
};

export const updateIncome = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const income = await IncomeModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!income) {
      res.status(404).json({ success: false, message: 'Income record not found' });
      return;
    }

    res.json({ success: true, data: income, income });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update income record' });
  }
};

export const deleteIncome = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const deleted = await IncomeModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Income record not found' });
      return;
    }

    res.json({ success: true, message: 'Income deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete income record' });
  }
};
