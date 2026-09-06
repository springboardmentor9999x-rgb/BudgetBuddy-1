import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SupportTicketModel } from '../models/SupportTicket';

export const getUserTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const userEmail = req.user?.email;

    const query: any = {
      $or: [{ userId }, { userEmail }],
    };

    const tickets = await SupportTicketModel.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets', error: error.message });
  }
};

export const createTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'user_1';
    const userEmail = req.user?.email || 'user@budgetbuddy.app';
    const userName = req.user?.name || req.user?.fullName || 'User';
    const { subject, category = 'General', message, priority } = req.body;

    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and initial message are required' });
      return;
    }

    // Determine priority: Premium users automatically receive 'Premium' priority
    let ticketPriority: 'Normal' | 'Premium' | 'Urgent' = priority || 'Normal';
    if (req.user?.premiumStatus === 'ACTIVE' || req.user?.role === 'premium') {
      ticketPriority = priority === 'Urgent' ? 'Urgent' : 'Premium';
    }

    const ticketNumber = `TICK-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    const ticket = await SupportTicketModel.create({
      ticketNumber,
      userId,
      userName,
      userEmail,
      subject,
      category,
      priority: ticketPriority,
      status: 'Open',
      messages: [
        {
          sender: 'user',
          senderName: userName,
          message: message.trim(),
          timestamp: new Date(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message:
        ticketPriority === 'Premium'
          ? 'Ticket submitted with ⭐ Premium Priority! Our dedicated team will review it promptly.'
          : 'Support ticket submitted successfully.',
      data: ticket,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create ticket', error: error.message });
  }
};

export const addMessageToTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message cannot be empty' });
      return;
    }

    const ticket = await SupportTicketModel.findOne({
      _id: id,
      $or: [{ userId }, { userEmail }],
    });

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found or unauthorized' });
      return;
    }

    ticket.messages.push({
      sender: 'user',
      senderName: req.user?.name || req.user?.fullName || 'User',
      message: message.trim(),
      timestamp: new Date(),
    });

    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    res.json({ success: true, message: 'Message sent', data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to add message to ticket', error: error.message });
  }
};
