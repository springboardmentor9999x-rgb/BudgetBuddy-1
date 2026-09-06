import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SavingsGoalModel } from '../models/SavingsGoal';
import { NotificationModel } from '../models/Notification';

export const getGoals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const goals = await SavingsGoalModel.find({ userId }).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals, goals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Unable to retrieve savings goals' });
  }
};

export const createGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const {
      title,
      goal_name,
      goalName,
      target_amount,
      targetAmount,
      current_amount,
      currentAmount,
      saved_amount,
      savedAmount,
      target_date,
      targetDate,
      category,
      priority,
      colorTheme,
      notes,
    } = req.body;

    const finalTitle = title || goal_name || goalName;
    const finalTarget = Number(targetAmount || target_amount);
    const finalSaved = Number(currentAmount || current_amount || savedAmount || saved_amount || 0);
    const finalDate = targetDate || target_date || '2026-12-31';

    if (!finalTitle || !finalTarget || finalTarget <= 0) {
      res.status(400).json({ success: false, message: 'Goal title and target amount are required' });
      return;
    }

    const goal = await SavingsGoalModel.create({
      userId,
      title: finalTitle,
      goalName: finalTitle,
      targetAmount: finalTarget,
      currentAmount: finalSaved,
      savedAmount: finalSaved,
      category: category || 'General',
      targetDate: finalDate,
      priority: priority || 'Medium',
      colorTheme: colorTheme || 'emerald',
      status: finalSaved >= finalTarget ? 'completed' : 'in_progress',
      notes,
    });

    res.status(201).json({ success: true, data: goal, goal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create savings goal', error: error.message });
  }
};

export const updateGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const goal = await SavingsGoalModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!goal) {
      res.status(404).json({ success: false, message: 'Savings goal not found' });
      return;
    }

    res.json({ success: true, data: goal, goal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update savings goal' });
  }
};

export const depositToGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;
    const { amount } = req.body;

    const depositAmt = Number(amount);
    if (!depositAmt || depositAmt <= 0) {
      res.status(400).json({ success: false, message: 'Valid deposit amount required' });
      return;
    }

    const goal = await SavingsGoalModel.findOne({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, message: 'Savings goal not found' });
      return;
    }

    const newAmount = (goal.currentAmount || 0) + depositAmt;
    goal.currentAmount = newAmount;
    goal.savedAmount = newAmount;

    const target = goal.targetAmount || 1;
    const progressPct = Math.round((newAmount / target) * 100);

    if (newAmount >= target) {
      goal.status = 'completed';
      // Trigger celebratory notification
      await NotificationModel.create({
        userId,
        type: 'GOAL_COMPLETED',
        title: '🎉 Goal Completed!',
        message: `Congratulations! You reached 100% of your "${goal.title}" savings target (₹${newAmount.toLocaleString('en-IN')}).`,
        category: 'savings',
        priority: 'high',
        isRead: false,
        actionUrl: '/savings-goals',
        metadata: { goalId: goal._id, targetAmount: target, savedAmount: newAmount },
      });
    } else {
      await NotificationModel.create({
        userId,
        type: 'GOAL_PROGRESS',
        title: '🎯 Savings Progress',
        message: `Deposited ₹${depositAmt.toLocaleString('en-IN')} to "${goal.title}". Now at ${progressPct}% (₹${newAmount.toLocaleString('en-IN')} / ₹${target.toLocaleString('en-IN')}).`,
        category: 'savings',
        priority: 'medium',
        isRead: false,
        actionUrl: '/savings-goals',
        metadata: { goalId: goal._id, depositAmt, newAmount, progressPct },
      });
    }

    await goal.save();

    res.json({ success: true, data: goal, goal, newAmount, progressPct });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to deposit to savings goal' });
  }
};

export const deleteGoal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const deleted = await SavingsGoalModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Savings goal not found' });
      return;
    }

    res.json({ success: true, message: 'Goal deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete savings goal' });
  }
};
