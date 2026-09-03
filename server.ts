import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { connectDatabase } from './db/connect';
import { seedInitialDatabase } from './db/seedData';

// Import Core Route Handlers
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import incomeRoutes from './routes/incomeRoutes';
import expenseRoutes from './routes/expenseRoutes';
import budgetRoutes from './routes/budgetRoutes';
import goalRoutes from './routes/goalRoutes';
import billRoutes from './routes/billRoutes';
import notificationRoutes from './routes/notificationRoutes';
import reportRoutes from './routes/reportRoutes';

// Import Admin & Premium & Support Route Handlers
import adminRoutes from './routes/adminRoutes';
import premiumRoutes from './routes/premiumRoutes';
import supportRoutes from './routes/supportRoutes';
import permissionRoutes from './routes/permissionRoutes';
import { seedDefaultFeaturePermissions } from './controllers/featurePermissionController';

import { setSocketIOInstance, sendBillReminder } from './services/notificationService';
import { BillModel } from './models/Bill';
import { initEmailTransporter } from './services/emailService';

dotenv.config();

// Initialize Email Transporter (Gmail SMTP)
initEmailTransporter();

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
});

setSocketIOInstance(io);

app.use(cors());
app.use(express.json());

// Connect MongoDB + Mongoose & Seed Initial Database
connectDatabase().then(() => {
  seedInitialDatabase();
  seedDefaultFeaturePermissions();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount All Core Application APIs
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api', notificationRoutes);

// Mount Admin, Premium & Support APIs
app.use('/api/admin', adminRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/support', supportRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Socket.IO Connection Setup
io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);

  socket.on('join_user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined room user:${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

// Periodic background check for upcoming Bill Reminders
const checkUpcomingBills = async () => {
  try {
    const today = new Date();
    const reminders: any[] = await (BillModel as any).find({ isPaid: false });

    for (const reminder of reminders) {
      const due = new Date(reminder.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= (reminder.reminderDays || 3)) {
        await sendBillReminder({
          userId: reminder.userId,
          billName: reminder.billName,
          amount: reminder.amount,
          daysUntilDue: Math.max(0, diffDays),
          dueDate: reminder.dueDate,
        });
      }
    }
  } catch (err) {
    console.error('[Cron] Error checking bill reminders:', err);
  }
};

setInterval(checkUpcomingBills, 60 * 60 * 1000); // Hourly check
setTimeout(checkUpcomingBills, 10000); // Check 10s after startup

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Server] BudgetBuddy Fintech Server running on port ${PORT}`);
});

export default app;
