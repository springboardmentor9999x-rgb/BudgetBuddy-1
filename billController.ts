import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BillModel } from '../models/Bill';
import { NotificationModel } from '../models/Notification';

export const getBills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const bills = await BillModel.find({ userId }).sort({ dueDate: 1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedBills = bills.map((b) => {
      const due = new Date(b.dueDate);
      due.setHours(0, 0, 0, 0);
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let computedStatus: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid' = b.status || 'Upcoming';
      if (b.isPaid) {
        computedStatus = 'Paid';
      } else if (diff < 0) {
        computedStatus = 'Overdue';
      } else if (diff === 0) {
        computedStatus = 'Due Today';
      } else {
        computedStatus = 'Upcoming';
      }

      return {
        id: b._id ? b._id.toString() : b.id,
        billName: b.billName,
        amount: b.amount,
        dueDate: b.dueDate,
        status: computedStatus,
        category: b.category,
        accountName: b.accountName,
        recurring: b.recurring,
        reminderDays: b.reminderDays,
        isPaid: b.isPaid,
        diffDays: diff,
      };
    });

    res.json({ success: true, count: enrichedBills.length, data: enrichedBills, bills: enrichedBills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Unable to retrieve bills' });
  }
};

export const createBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const {
      billName,
      bill_name,
      amount,
      dueDate,
      due_date,
      category,
      accountName,
      recurring,
      reminderDays,
      notes,
    } = req.body;

    const name = billName || bill_name;
    const date = dueDate || due_date;

    if (!name || !amount || !date) {
      res.status(400).json({ success: false, message: 'Bill name, amount, and due date are required' });
      return;
    }

    const bill = await BillModel.create({
      userId,
      billName: name,
      amount: Number(amount),
      dueDate: date,
      category: category || 'Utilities',
      accountName: accountName || 'Primary Account',
      recurring: recurring || 'Monthly',
      reminderDays: reminderDays || 3,
      isPaid: false,
      notes,
    });

    res.status(201).json({ success: true, data: bill, bill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create bill', error: error.message });
  }
};

export const updateBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const bill = await BillModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!bill) {
      res.status(404).json({ success: false, message: 'Bill not found' });
      return;
    }

    res.json({ success: true, data: bill, bill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update bill' });
  }
};

export const markBillPaid = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const bill = await BillModel.findOne({ _id: id, userId });
    if (!bill) {
      res.status(404).json({ success: false, message: 'Bill not found' });
      return;
    }

    bill.isPaid = true;
    bill.status = 'Paid';
    await bill.save();

    await NotificationModel.create({
      userId,
      type: 'BILL_PAID',
      title: '✅ Bill Paid',
      message: `Bill "${bill.billName}" of ₹${bill.amount.toLocaleString('en-IN')} marked as paid.`,
      category: 'system',
      priority: 'low',
      isRead: false,
      actionUrl: '/dashboard',
    });

    res.json({ success: true, data: bill, bill });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update bill status' });
  }
};

export const deleteBill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const { id } = req.params;

    const deleted = await BillModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Bill not found' });
      return;
    }

    res.json({ success: true, message: 'Bill deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete bill' });
  }
};
