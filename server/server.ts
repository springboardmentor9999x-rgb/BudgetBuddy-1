import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Data Store (seeded with initial data)
interface ExpenseItem {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

interface IncomeItem {
  id: string;
  userId: string;
  amount: number;
  description: string;
  source: string;
  date: string;
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
}

interface BudgetLimit {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  monthYear: string;
  alertThresholdPercent?: number;
}

interface PersonTransfer {
  id: string;
  userId: string;
  personName: string;
  type: 'received' | 'sent' | 'split_charge';
  amount: number;
  category: string;
  date: string;
  status: 'settled' | 'pending';
  paymentMode: string;
  referenceNote?: string;
  createdAt: string;
}

interface PaymentCard {
  id: string;
  userId: string;
  cardName: string;
  bankName: string;
  cardType: 'credit' | 'debit' | 'bank_account';
  last4: string;
  balanceOrDue: number;
  creditLimit?: number;
  expiry?: string;
  isFrozen: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'professional' | 'freelancer' | 'student' | 'admin';
  monthlyIncomeGoal: number;
  currency: string;
  savingsTargetPercent: number;
}

const currentYear = new Date().getFullYear();
const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
const currentMonthYear = `${currentYear}-${currentMonthStr}`;

// Initial Store
let user: UserProfile = {
  id: 'user_1',
  email: 'sarah.jenkins@budgetbuddy.io',
  fullName: 'Sarah Jenkins',
  role: 'professional',
  monthlyIncomeGoal: 85000,
  currency: 'USD',
  savingsTargetPercent: 30,
};

let expenses: ExpenseItem[] = [
  {
    id: 'exp_1',
    userId: 'user_1',
    amount: 145.5,
    description: 'Whole Foods Organic Groceries',
    category: 'Food & Dining',
    date: `${currentMonthYear}-04`,
    paymentMethod: 'Credit Card',
    notes: 'Weekly pantry & fresh produce',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_2',
    userId: 'user_1',
    amount: 1200.0,
    description: 'Luxury Apartment Rent',
    category: 'Rent & Housing',
    date: `${currentMonthYear}-01`,
    paymentMethod: 'Net Banking',
    notes: 'Monthly residential lease',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_3',
    userId: 'user_1',
    amount: 68.2,
    description: 'Uber Business Premium',
    category: 'Transportation',
    date: `${currentMonthYear}-06`,
    paymentMethod: 'UPI / Card',
    notes: 'Airport transfer meeting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_4',
    userId: 'user_1',
    amount: 18.99,
    description: 'Netflix & Spotify Premium',
    category: 'Entertainment',
    date: `${currentMonthYear}-08`,
    paymentMethod: 'Credit Card',
    notes: 'Digital media bundle',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_5',
    userId: 'user_1',
    amount: 85.0,
    description: 'High-speed Fiber Broadband',
    category: 'Utilities',
    date: `${currentMonthYear}-09`,
    paymentMethod: 'UPI / Card',
    notes: '1 Gbps optical line',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_6',
    userId: 'user_1',
    amount: 250.0,
    description: 'S&P 500 Index Auto-Debit',
    category: 'Investment & SIP',
    date: `${currentMonthYear}-05`,
    paymentMethod: 'Net Banking',
    notes: 'Dollar-cost averaging portfolio',
    createdAt: new Date().toISOString(),
  },
];

let incomes: IncomeItem[] = [
  {
    id: 'inc_1',
    userId: 'user_1',
    amount: 6250.0,
    description: 'Senior Software Engineer Salary',
    source: 'Salary / Wages',
    date: `${currentMonthYear}-01`,
    isRecurring: true,
    notes: 'Monthly direct deposit net payroll',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inc_2',
    userId: 'user_1',
    amount: 1400.0,
    description: 'FinTech Architecture Consultation',
    source: 'Freelance / Consulting',
    date: `${currentMonthYear}-07`,
    isRecurring: false,
    notes: 'Milestone delivery payment',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'inc_3',
    userId: 'user_1',
    amount: 180.0,
    description: 'Quarterly Tech Dividend Yield',
    source: 'Investments / Dividends',
    date: `${currentMonthYear}-10`,
    isRecurring: false,
    notes: 'Vanguard ETF payout',
    createdAt: new Date().toISOString(),
  },
];

let budgets: BudgetLimit[] = [
  {
    id: 'b_1',
    userId: 'user_1',
    category: 'Food & Dining',
    monthlyLimit: 600,
    monthYear: currentMonthYear,
    alertThresholdPercent: 80,
  },
  {
    id: 'b_2',
    userId: 'user_1',
    category: 'Rent & Housing',
    monthlyLimit: 1400,
    monthYear: currentMonthYear,
    alertThresholdPercent: 90,
  },
  {
    id: 'b_3',
    userId: 'user_1',
    category: 'Transportation',
    monthlyLimit: 300,
    monthYear: currentMonthYear,
    alertThresholdPercent: 80,
  },
  {
    id: 'b_4',
    userId: 'user_1',
    category: 'Entertainment',
    monthlyLimit: 250,
    monthYear: currentMonthYear,
    alertThresholdPercent: 75,
  },
  {
    id: 'b_5',
    userId: 'user_1',
    category: 'Shopping & Apparel',
    monthlyLimit: 400,
    monthYear: currentMonthYear,
    alertThresholdPercent: 80,
  },
];

let transfers: PersonTransfer[] = [
  {
    id: 'tr_1',
    userId: 'user_1',
    personName: 'Alex Morgan',
    type: 'split_charge',
    amount: 45.0,
    category: 'Team Dinner Share',
    date: `${currentMonthYear}-05`,
    status: 'settled',
    paymentMode: 'UPI',
    referenceNote: 'UPI Ref #893021948',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr_2',
    userId: 'user_1',
    personName: 'David Kim',
    type: 'sent',
    amount: 120.0,
    category: 'Weekend Airbnb Share',
    date: `${currentMonthYear}-07`,
    status: 'pending',
    paymentMode: 'Bank Transfer',
    referenceNote: 'Pending payment confirmation',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr_3',
    userId: 'user_1',
    personName: 'Elena Rostova',
    type: 'received',
    amount: 85.0,
    category: 'Concert Ticket Reimbursement',
    date: `${currentMonthYear}-08`,
    status: 'settled',
    paymentMode: 'Digital Wallet',
    referenceNote: 'Wallet TXN #202931',
    createdAt: new Date().toISOString(),
  },
];

let cards: PaymentCard[] = [
  {
    id: 'card_1',
    userId: 'user_1',
    cardName: 'Sapphire Preferred',
    bankName: 'Chase Bank',
    cardType: 'credit',
    last4: '4892',
    balanceOrDue: 630.5,
    creditLimit: 15000,
    expiry: '09/29',
    isFrozen: false,
  },
  {
    id: 'card_2',
    userId: 'user_1',
    cardName: 'Platinum Infinite',
    bankName: 'HDFC Bank',
    cardType: 'credit',
    last4: '1029',
    balanceOrDue: 240.0,
    creditLimit: 25000,
    expiry: '11/30',
    isFrozen: false,
  },
  {
    id: 'card_3',
    userId: 'user_1',
    cardName: 'Primary Wealth Checking',
    bankName: 'Revolut Private',
    cardType: 'bank_account',
    last4: '8841',
    balanceOrDue: 18450.0,
    expiry: '12/28',
    isFrozen: false,
  },
];

// --- ROUTES ---

// Health & Info Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'BudgetBuddy API Server',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      webSockets: true,
      dataStore: 'in-memory (active)',
      aiAssistant: true,
    },
  });
});

// Master Data Dump
app.get('/api/data', (req: Request, res: Response) => {
  res.json({
    success: true,
    user,
    expenses,
    incomes,
    budgets,
    transfers,
    cards,
  });
});

// --- EXPENSES ---
app.get('/api/expenses', (req: Request, res: Response) => {
  res.json({ success: true, count: expenses.length, data: expenses });
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const { amount, description, category, date, paymentMethod, notes } = req.body;
  if (!amount || !description || !category || !date) {
    return res.status(400).json({ error: 'Missing required expense fields' });
  }
  const newExp: ExpenseItem = {
    id: `exp_${Date.now()}`,
    userId: user.id,
    amount: parseFloat(amount),
    description,
    category,
    date,
    paymentMethod: paymentMethod || 'UPI / Card',
    notes,
    createdAt: new Date().toISOString(),
  };
  expenses.unshift(newExp);
  io.emit('expense_added', newExp);
  res.status(201).json({ success: true, data: newExp });
});

app.put('/api/expenses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });

  expenses[index] = {
    ...expenses[index],
    ...req.body,
    amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : expenses[index].amount,
  };
  io.emit('expense_updated', expenses[index]);
  res.json({ success: true, data: expenses[index] });
});

app.delete('/api/expenses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = expenses.length;
  expenses = expenses.filter((e) => e.id !== id);
  if (expenses.length === initialLength) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  io.emit('expense_deleted', { id });
  res.json({ success: true, message: 'Expense deleted' });
});

// --- INCOMES ---
app.get('/api/incomes', (req: Request, res: Response) => {
  res.json({ success: true, count: incomes.length, data: incomes });
});

app.post('/api/incomes', (req: Request, res: Response) => {
  const { amount, description, source, date, isRecurring, notes } = req.body;
  if (!amount || !description || !source || !date) {
    return res.status(400).json({ error: 'Missing required income fields' });
  }
  const newInc: IncomeItem = {
    id: `inc_${Date.now()}`,
    userId: user.id,
    amount: parseFloat(amount),
    description,
    source,
    date,
    isRecurring: Boolean(isRecurring),
    notes,
    createdAt: new Date().toISOString(),
  };
  incomes.unshift(newInc);
  io.emit('income_added', newInc);
  res.status(201).json({ success: true, data: newInc });
});

app.put('/api/incomes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = incomes.findIndex((i) => i.id === id);
  if (index === -1) return res.status(404).json({ error: 'Income not found' });

  incomes[index] = {
    ...incomes[index],
    ...req.body,
    amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : incomes[index].amount,
  };
  io.emit('income_updated', incomes[index]);
  res.json({ success: true, data: incomes[index] });
});

app.delete('/api/incomes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = incomes.length;
  incomes = incomes.filter((i) => i.id !== id);
  if (incomes.length === initialLength) {
    return res.status(404).json({ error: 'Income not found' });
  }
  io.emit('income_deleted', { id });
  res.json({ success: true, message: 'Income deleted' });
});

// --- TRANSFERS ---
app.get('/api/transfers', (req: Request, res: Response) => {
  res.json({ success: true, count: transfers.length, data: transfers });
});

app.post('/api/transfers', (req: Request, res: Response) => {
  const { personName, type, amount, category, date, status, paymentMode, referenceNote } = req.body;
  if (!personName || !type || !amount || !date) {
    return res.status(400).json({ error: 'Missing required transfer fields' });
  }
  const newTransfer: PersonTransfer = {
    id: `tr_${Date.now()}`,
    userId: user.id,
    personName,
    type,
    amount: parseFloat(amount),
    category: category || 'General Transfer',
    date,
    status: status || 'settled',
    paymentMode: paymentMode || 'UPI',
    referenceNote,
    createdAt: new Date().toISOString(),
  };
  transfers.unshift(newTransfer);
  io.emit('transfer_added', newTransfer);
  res.status(201).json({ success: true, data: newTransfer });
});

app.patch('/api/transfers/:id/settle', (req: Request, res: Response) => {
  const { id } = req.params;
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

  transfer.status = transfer.status === 'settled' ? 'pending' : 'settled';
  io.emit('transfer_updated', transfer);
  res.json({ success: true, data: transfer });
});

app.delete('/api/transfers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  transfers = transfers.filter((t) => t.id !== id);
  io.emit('transfer_deleted', { id });
  res.json({ success: true, message: 'Transfer deleted' });
});

// --- CARDS ---
app.get('/api/cards', (req: Request, res: Response) => {
  res.json({ success: true, count: cards.length, data: cards });
});

app.post('/api/cards', (req: Request, res: Response) => {
  const { cardName, bankName, cardType, last4, balanceOrDue, creditLimit, expiry } = req.body;
  const newCard: PaymentCard = {
    id: `card_${Date.now()}`,
    userId: user.id,
    cardName,
    bankName,
    cardType,
    last4: (last4 || '1234').slice(-4),
    balanceOrDue: parseFloat(balanceOrDue) || 0,
    creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
    expiry: expiry || '12/28',
    isFrozen: false,
  };
  cards.push(newCard);
  io.emit('card_added', newCard);
  res.status(201).json({ success: true, data: newCard });
});

app.patch('/api/cards/:id/freeze', (req: Request, res: Response) => {
  const { id } = req.params;
  const card = cards.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  card.isFrozen = !card.isFrozen;
  io.emit('card_updated', card);
  res.json({ success: true, data: card });
});

app.delete('/api/cards/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  cards = cards.filter((c) => c.id !== id);
  io.emit('card_deleted', { id });
  res.json({ success: true, message: 'Card deleted' });
});

// --- BUDGETS ---
app.get('/api/budgets', (req: Request, res: Response) => {
  res.json({ success: true, count: budgets.length, data: budgets });
});

app.post('/api/budgets', (req: Request, res: Response) => {
  const { category, monthlyLimit, monthYear, alertThresholdPercent } = req.body;
  if (!category || !monthlyLimit) {
    return res.status(400).json({ error: 'Category and monthlyLimit are required' });
  }

  const existingIndex = budgets.findIndex((b) => b.category === category && b.monthYear === monthYear);
  if (existingIndex !== -1) {
    budgets[existingIndex].monthlyLimit = parseFloat(monthlyLimit);
    budgets[existingIndex].alertThresholdPercent = alertThresholdPercent || 80;
    io.emit('budget_updated', budgets[existingIndex]);
    return res.json({ success: true, data: budgets[existingIndex] });
  }

  const newBudget: BudgetLimit = {
    id: `b_${Date.now()}`,
    userId: user.id,
    category,
    monthlyLimit: parseFloat(monthlyLimit),
    monthYear: monthYear || currentMonthYear,
    alertThresholdPercent: alertThresholdPercent || 80,
  };
  budgets.push(newBudget);
  io.emit('budget_added', newBudget);
  res.status(201).json({ success: true, data: newBudget });
});

// --- USER PROFILE & AUTH ---
app.get('/api/user', (req: Request, res: Response) => {
  res.json({ success: true, data: user });
});

app.put('/api/user', (req: Request, res: Response) => {
  user = { ...user, ...req.body };
  io.emit('user_updated', user);
  res.json({ success: true, data: user });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({
    success: true,
    token: `jwt_token_${Date.now()}`,
    user: {
      ...user,
      email: email || user.email,
    },
  });
});

// --- AI INSIGHTS ---
app.get('/api/ai/insights', (req: Request, res: Response) => {
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  res.json({
    success: true,
    insights: {
      summary: `Your cash flow is strong with a net positive balance of ${user.currency} ${netSavings.toLocaleString()}. Your current savings rate is ${savingsRate}%.`,
      recommendations: [
        'Great job keeping Rent and Fixed Housing under 30% of total inflow.',
        'Food & Dining is nearing 78% of your monthly cap; consider cooking at home this weekend.',
        'Your S&P 500 SIP auto-debit has been successfully executed.',
      ],
      healthScore: 92,
      burnRatePercent: totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0,
    },
  });
});

// Socket Connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.emit('server_welcome', { message: 'Connected to BudgetBuddy Real-time Financial Ledger' });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 BudgetBuddy Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server active with Socket.IO`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
});
