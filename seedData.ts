import { UserModel } from '../models/User';
import { IncomeModel } from '../models/Income';
import { ExpenseModel } from '../models/Expense';
import { BudgetModel } from '../models/Budget';
import { SavingsGoalModel } from '../models/SavingsGoal';
import { BillModel } from '../models/Bill';
import { NotificationModel } from '../models/Notification';
import { PlanModel } from '../models/Plan';
import { SubscriptionModel } from '../models/Subscription';
import { CategoryModel } from '../models/Category';
import { SystemSettingModel } from '../models/SystemSetting';
import { SupportTicketModel } from '../models/SupportTicket';
import { AuditLogModel } from '../models/AuditLog';
import { AdminReportModel } from '../models/AdminReport';
import { SecurityEventModel } from '../models/SecurityEvent';
import { AdminSessionModel } from '../models/AdminSession';

export const seedInitialDatabase = async () => {
  try {
    console.log('[Seed] Checking database seeding state...');

    const defaultPasswordHash = '$2a$10$wK1k6x.X4P7qQ8.7qO9wLejYv01J/fT4FmB0aB1bC2cD3dE4eF5gG'; // bcrypt for password123

    // 1. Seed or ensure Demo Users with proper tiers
    const demoUsersToSeed = [
      {
        name: 'Karthik',
        fullName: 'Karthik',
        email: 'skarthik874@gmail.com',
        role: 'super_admin',
        accountStatus: 'active',
        is_verified: true,
        currency: 'INR',
        monthlyIncomeGoal: 50000,
        savingsTargetPercent: 30,
        premiumStatus: 'ACTIVE',
        premiumPlan: 'YEARLY',
        premiumStartedAt: new Date(Date.now() - 30 * 86400000),
        premiumExpiresAt: new Date(Date.now() + 335 * 86400000),
      },
      {
        name: 'Alex Morgan',
        fullName: 'Alex Morgan',
        email: 'alex.freelancer@budgetvault.io',
        role: 'freelancer',
        accountStatus: 'active',
        is_verified: true,
        currency: 'USD',
        monthlyIncomeGoal: 75000,
        savingsTargetPercent: 25,
        premiumStatus: 'ACTIVE',
        premiumPlan: 'MONTHLY',
        premiumStartedAt: new Date(Date.now() - 10 * 86400000),
        premiumExpiresAt: new Date(Date.now() + 20 * 86400000),
      },
      {
        name: 'David Kim',
        fullName: 'David Kim',
        email: 'david.student@university.edu',
        role: 'student',
        accountStatus: 'active',
        is_verified: true,
        currency: 'INR',
        monthlyIncomeGoal: 20000,
        savingsTargetPercent: 15,
        premiumStatus: 'NONE',
        premiumPlan: 'FREE',
      },
      {
        name: 'Elena & Family',
        fullName: 'Elena & Family',
        email: 'household.admin@family.org',
        role: 'admin',
        accountStatus: 'active',
        is_verified: true,
        currency: 'EUR',
        monthlyIncomeGoal: 120000,
        savingsTargetPercent: 35,
        premiumStatus: 'ACTIVE',
        premiumPlan: 'YEARLY',
        premiumStartedAt: new Date(Date.now() - 60 * 86400000),
        premiumExpiresAt: new Date(Date.now() + 305 * 86400000),
      },
      {
        name: 'Sarah Jenkins',
        fullName: 'Sarah Jenkins',
        email: 'sarah.jenkins@budgetvault.io',
        role: 'professional',
        accountStatus: 'active',
        is_verified: true,
        currency: 'INR',
        monthlyIncomeGoal: 50000,
        savingsTargetPercent: 30,
        premiumStatus: 'NONE',
        premiumPlan: 'FREE',
      },
    ];

    for (const demoUser of demoUsersToSeed) {
      await (UserModel as any).findOneAndUpdate(
        { email: demoUser.email },
        {
          $set: {
            ...demoUser,
            password: defaultPasswordHash,
          },
        },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Default Pricing Plans
    const planCount = await PlanModel.countDocuments();
    if (planCount === 0) {
      console.log('[Seed] Seeding default pricing plans...');
      await PlanModel.create([
        {
          name: 'Free Starter',
          planCode: 'FREE',
          price: 0,
          currency: 'INR',
          billingPeriod: 'free',
          durationDays: 0,
          features: [
            'Basic Financial Dashboard',
            'Income & Expense Tracking',
            'Basic Category Budgets (Up to 3)',
            'Basic Savings Goals (Up to 2)',
            'Standard Monthly Reports',
            'Community Support',
          ],
          status: 'active',
          isPopular: false,
        },
        {
          name: 'Premium Monthly',
          planCode: 'MONTHLY',
          price: 199,
          currency: 'INR',
          billingPeriod: 'monthly',
          durationDays: 30,
          features: [
            'Everything in Free',
            'Unlimited Category Budgets',
            'Unlimited Savings Goals',
            'Advanced Spend & Income Analytics',
            'Smart Financial Insights & Anomaly Alerts',
            'Goal & Budget Burnout Forecasting',
            'Transparent Financial Health Score',
            'Multi-Format Reports (PDF, Excel, CSV)',
            'Scheduled Email Reports',
            'Custom User Categories',
            'Priority Support Desk',
          ],
          status: 'active',
          isPopular: true,
        },
        {
          name: 'Premium Yearly',
          planCode: 'YEARLY',
          price: 1999,
          currency: 'INR',
          billingPeriod: 'yearly',
          durationDays: 365,
          features: [
            'Everything in Premium Monthly',
            'Save ₹389 / year (2 Months Free)',
            '6-Month Financial Cash Flow Projections',
            'VIP Priority Support Access',
            'Custom Financial Export Templates',
            'Early Access to New Fintech Modules',
          ],
          status: 'active',
          isPopular: false,
        },
      ]);
    }

    // 3. Seed Default Subscriptions
    const subCount = await SubscriptionModel.countDocuments();
    if (subCount === 0) {
      console.log('[Seed] Seeding sample subscription records...');
      await SubscriptionModel.create([
        {
          userId: 'user_1',
          userEmail: 'skarthik874@gmail.com',
          userName: 'Karthik',
          planName: 'Premium Yearly',
          planCode: 'YEARLY',
          billingPeriod: 'yearly',
          amount: 1999,
          currency: 'INR',
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 30 * 86400000),
          endDate: new Date(Date.now() + 335 * 86400000),
          paymentProvider: 'BUDGETBUDDY_GATEWAY',
          paymentId: 'PAY_INITIAL_001',
          autoRenew: true,
          notes: 'Yearly VIP Subscription',
        },
        {
          userId: 'user_2',
          userEmail: 'alex.freelancer@budgetvault.io',
          userName: 'Alex Morgan',
          planName: 'Premium Monthly',
          planCode: 'MONTHLY',
          billingPeriod: 'monthly',
          amount: 199,
          currency: 'USD',
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 10 * 86400000),
          endDate: new Date(Date.now() + 20 * 86400000),
          paymentProvider: 'STRIPE',
          paymentId: 'PAY_INITIAL_002',
          autoRenew: true,
          notes: 'Freelancer Monthly Pro',
        },
        {
          userId: 'user_4',
          userEmail: 'household.admin@family.org',
          userName: 'Elena & Family',
          planName: 'Premium Yearly',
          planCode: 'YEARLY',
          billingPeriod: 'yearly',
          amount: 1999,
          currency: 'EUR',
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 60 * 86400000),
          endDate: new Date(Date.now() + 305 * 86400000),
          paymentProvider: 'RAZORPAY',
          paymentId: 'PAY_INITIAL_003',
          autoRenew: true,
          notes: 'Family Wealth Plan',
        },
      ]);
    }

    // 4. Seed Default Categories
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0) {
      console.log('[Seed] Seeding platform default categories...');
      const defaultCategories = [
        // Income categories
        { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
        { name: 'Freelance', type: 'income', icon: 'Laptop', color: '#3b82f6', isDefault: true },
        { name: 'Business', type: 'income', icon: 'Building2', color: '#8b5cf6', isDefault: true },
        { name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#06b6d4', isDefault: true },
        { name: 'Bonus', type: 'income', icon: 'Gift', color: '#f59e0b', isDefault: true },
        { name: 'Rental', type: 'income', icon: 'Home', color: '#ec4899', isDefault: true },
        { name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748b', isDefault: true },

        // Expense categories
        { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f97316', isDefault: true },
        { name: 'Housing & Utilities', type: 'expense', icon: 'Home', color: '#3b82f6', isDefault: true },
        { name: 'Transportation', type: 'expense', icon: 'Car', color: '#06b6d4', isDefault: true },
        { name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: '#eab308', isDefault: true },
        { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', isDefault: true },
        { name: 'Healthcare', type: 'expense', icon: 'Heart', color: '#ef4444', isDefault: true },
        { name: 'Education & Books', type: 'expense', icon: 'BookOpen', color: '#8b5cf6', isDefault: true },
        { name: 'Entertainment & Fun', type: 'expense', icon: 'Film', color: '#a855f7', isDefault: true },
        { name: 'Travel', type: 'expense', icon: 'Plane', color: '#14b8a6', isDefault: true },
        { name: 'Investments & Savings', type: 'expense', icon: 'Vault', color: '#10b981', isDefault: true },
        { name: 'Other Expense', type: 'expense', icon: 'Tag', color: '#64748b', isDefault: true },
      ];

      await CategoryModel.insertMany(defaultCategories);
    }

    // 5. Seed System Settings
    const settingCount = await SystemSettingModel.countDocuments();
    if (settingCount === 0) {
      console.log('[Seed] Seeding platform system settings...');
      await SystemSettingModel.create({
        appName: 'BudgetBuddy',
        registrationEnabled: true,
        premiumRegistrationEnabled: true,
        maintenanceMode: false,
        emailVerificationRequired: true,
        defaultCurrency: 'INR',
        supportEmail: 'support@budgetbuddy.app',
        systemNotice: 'Welcome to BudgetBuddy Pro Fintech v2.5! All systems operational.',
      });
    }

    // 6. Seed Sample Support Tickets
    const ticketCount = await SupportTicketModel.countDocuments();
    if (ticketCount === 0) {
      console.log('[Seed] Seeding sample support tickets...');
      await SupportTicketModel.create([
        {
          ticketNumber: 'TICK-1001',
          userId: 'user_2',
          userName: 'Alex Morgan',
          userEmail: 'alex.freelancer@budgetvault.io',
          subject: 'Custom invoice export template inquiry',
          category: 'Feature Request',
          priority: 'Premium',
          status: 'Open',
          messages: [
            {
              sender: 'user',
              senderName: 'Alex Morgan',
              message: 'Hello! As a Premium subscriber, could you guide me on customizing the PDF report header logos?',
              timestamp: new Date(Date.now() - 2 * 3600000),
            },
          ],
        },
        {
          ticketNumber: 'TICK-1002',
          userId: 'user_3',
          userName: 'David Kim',
          userEmail: 'david.student@university.edu',
          subject: 'Student budget setup assistance',
          category: 'General',
          priority: 'Normal',
          status: 'Resolved',
          messages: [
            {
              sender: 'user',
              senderName: 'David Kim',
              message: 'How do I track my monthly semester book allowance?',
              timestamp: new Date(Date.now() - 24 * 3600000),
            },
            {
              sender: 'admin',
              senderName: 'Support Lead',
              message: 'Hi David! You can create a category budget under "Education & Books" with your monthly allowance amount.',
              timestamp: new Date(Date.now() - 12 * 3600000),
            },
          ],
        },
      ]);
    }

    // 7. Seed Initial Audit Logs
    const auditCount = await AuditLogModel.countDocuments();
    if (auditCount === 0) {
      console.log('[Seed] Seeding initial audit logs...');
      await AuditLogModel.create([
        {
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          action: 'ADMIN_LOGIN',
          targetType: 'AUTH',
          result: 'SUCCESS',
          details: 'Super Admin logged into BudgetBuddy Admin Console via 2FA',
          ipAddress: '192.168.1.45',
          metadata: { role: 'super_admin', browser: 'Chrome 124' },
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          action: 'PLAN_CREATED',
          targetType: 'PLAN',
          result: 'SUCCESS',
          details: 'Created Premium Yearly plan with 365 days duration',
          ipAddress: '192.168.1.45',
          metadata: { planCode: 'YEARLY', price: 1999 },
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          action: 'PREMIUM_ACTIVATED',
          targetType: 'USER',
          result: 'SUCCESS',
          details: 'Granted 30 days trial premium to user Alex Morgan',
          ipAddress: '192.168.1.45',
          metadata: { plan: 'MONTHLY', userEmail: 'alex.freelancer@budgetvault.io' },
          timestamp: new Date(Date.now() - 14400000),
        },
        {
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          action: 'SETTINGS_UPDATED',
          targetType: 'SYSTEM',
          result: 'SUCCESS',
          details: 'Updated platform registration and security timeout settings',
          ipAddress: '192.168.1.45',
          metadata: { sessionTimeout: 60, rateLimit: 120 },
          timestamp: new Date(Date.now() - 28800000),
        },
      ]);
    }

    // 8. Seed Initial Admin Reports
    const reportCount = await AdminReportModel.countDocuments();
    if (reportCount === 0) {
      console.log('[Seed] Seeding platform administrative reports...');
      await AdminReportModel.create([
        {
          title: 'Monthly Financial Aggregation Summary',
          reportType: 'FINANCE_AGGREGATION',
          format: 'CSV',
          status: 'GENERATED',
          generatedBy: 'skarthik874@gmail.com',
          fileSize: '42.8 KB',
          recordCount: 148,
          generatedAt: new Date(Date.now() - 12 * 3600000),
        },
        {
          title: 'Complete User Directory & Verification Audit',
          reportType: 'USERS_DIRECTORY',
          format: 'CSV',
          status: 'GENERATED',
          generatedBy: 'skarthik874@gmail.com',
          fileSize: '18.4 KB',
          recordCount: 25,
          generatedAt: new Date(Date.now() - 24 * 3600000),
        },
        {
          title: 'Subscription Revenue & MRR Ledger',
          reportType: 'SUBSCRIPTIONS_REVENUE',
          format: 'PDF',
          status: 'GENERATED',
          generatedBy: 'skarthik874@gmail.com',
          fileSize: '86.2 KB',
          recordCount: 42,
          generatedAt: new Date(Date.now() - 48 * 3600000),
        },
        {
          title: 'Quarterly Platform Security & Access Log',
          reportType: 'SECURITY_AUDIT',
          format: 'JSON',
          status: 'GENERATED',
          generatedBy: 'skarthik874@gmail.com',
          fileSize: '31.5 KB',
          recordCount: 89,
          generatedAt: new Date(Date.now() - 72 * 3600000),
        },
        {
          title: 'Real-time Anomaly Detection Run',
          reportType: 'SYSTEM_DIAGNOSTIC',
          format: 'CSV',
          status: 'PENDING',
          generatedBy: 'system_cron',
          fileSize: '—',
          recordCount: 0,
          generatedAt: new Date(),
        },
      ]);
    }

    // 9. Seed Security Events
    const secCount = await SecurityEventModel.countDocuments();
    if (secCount === 0) {
      console.log('[Seed] Seeding security monitoring events...');
      await SecurityEventModel.create([
        {
          type: 'LOGIN_SUCCESS',
          email: 'skarthik874@gmail.com',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          location: 'Bengaluru, India',
          status: 'SUCCESS',
          details: 'Admin verified via password & 2FA OTP',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          type: 'LOGIN_FAILURE',
          email: 'admin_test@unknown.com',
          ipAddress: '203.0.113.195',
          userAgent: 'Python-urllib/3.9',
          location: 'Frankfurt, Germany',
          status: 'BLOCKED',
          details: 'Failed password attempt on administrative endpoint',
          timestamp: new Date(Date.now() - 18 * 3600000),
        },
        {
          type: 'OTP_FAILURE',
          email: 'david.student@university.edu',
          ipAddress: '14.139.128.4',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)',
          location: 'Delhi, India',
          status: 'FAILED',
          details: 'Expired OTP code submitted during email confirmation',
          timestamp: new Date(Date.now() - 36 * 3600000),
        },
        {
          type: 'SUSPICIOUS_LOGIN',
          email: 'alex.freelancer@budgetvault.io',
          ipAddress: '198.51.100.82',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: 'San Francisco, USA',
          status: 'SUCCESS',
          details: 'New geographic region detected for active subscriber session',
          timestamp: new Date(Date.now() - 54 * 3600000),
        },
      ]);
    }

    // 10. Seed Admin Active Sessions
    const sessionCount = await AdminSessionModel.countDocuments();
    if (sessionCount === 0) {
      console.log('[Seed] Seeding active admin sessions...');
      await AdminSessionModel.create([
        {
          sessionId: 'sess_admin_current_01',
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          ipAddress: '192.168.1.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          device: 'Workstation (Windows 11)',
          browser: 'Google Chrome 124',
          location: 'Bengaluru, India',
          isCurrent: true,
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 2 * 3600000),
          lastActiveAt: new Date(),
        },
        {
          sessionId: 'sess_admin_mobile_02',
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          ipAddress: '157.48.201.12',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
          device: 'iPhone 15 Pro (iOS 17.4)',
          browser: 'Mobile Safari',
          location: 'Bengaluru, India',
          isCurrent: false,
          status: 'ACTIVE',
          createdAt: new Date(Date.now() - 24 * 3600000),
          lastActiveAt: new Date(Date.now() - 4 * 3600000),
        },
        {
          sessionId: 'sess_admin_laptop_03',
          adminId: 'user_1',
          adminEmail: 'skarthik874@gmail.com',
          adminName: 'Karthik',
          ipAddress: '103.212.158.4',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3)',
          device: 'MacBook Air M2 (macOS)',
          browser: 'Brave Browser',
          location: 'Mumbai, India',
          isCurrent: false,
          status: 'REVOKED',
          createdAt: new Date(Date.now() - 7 * 86400000),
          lastActiveAt: new Date(Date.now() - 5 * 86400000),
        },
      ]);
    }

    // 8. Financial Seed (Income, Expense, Budget, SavingsGoal, Bill, Notification)
    const incomeCount = await (IncomeModel as any).countDocuments({ userId: 'user_1' });
    if (incomeCount > 0) {
      console.log('[Seed] Database financial tables already populated.');
      return;
    }

    console.log('[Seed] Seeding financial transactions, budgets, goals & bills...');

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curMonthYear = `${curYear}-${curMonth}`;

    const prevDate = new Date(curYear, now.getMonth() - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    const prevMonthYear = `${prevYear}-${prevMonth}`;

    const makeDate = (year: number, month: number, day: number) => {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Budgets
    await BudgetModel.create([
      {
        userId: 'user_1',
        category: 'Food & Dining',
        budgetAmount: 9000,
        monthlyLimit: 9000,
        spentAmount: 4250,
        monthYear: curMonthYear,
        alertThresholdPercent: 80,
      },
      {
        userId: 'user_1',
        category: 'Housing & Utilities',
        budgetAmount: 14000,
        monthlyLimit: 14000,
        spentAmount: 12500,
        monthYear: curMonthYear,
        alertThresholdPercent: 85,
      },
      {
        userId: 'user_1',
        category: 'Transportation',
        budgetAmount: 4000,
        monthlyLimit: 4000,
        spentAmount: 2350,
        monthYear: curMonthYear,
        alertThresholdPercent: 80,
      },
      {
        userId: 'user_1',
        category: 'Education & Books',
        budgetAmount: 5000,
        monthlyLimit: 5000,
        spentAmount: 1800,
        monthYear: curMonthYear,
        alertThresholdPercent: 80,
      },
      {
        userId: 'user_1',
        category: 'Shopping',
        budgetAmount: 4500,
        monthlyLimit: 4500,
        spentAmount: 3200,
        monthYear: curMonthYear,
        alertThresholdPercent: 75,
      },
      {
        userId: 'user_1',
        category: 'Entertainment & Fun',
        budgetAmount: 3000,
        monthlyLimit: 3000,
        spentAmount: 1450,
        monthYear: curMonthYear,
        alertThresholdPercent: 75,
      },
      {
        userId: 'user_1',
        category: 'Health & Wellness',
        budgetAmount: 2500,
        monthlyLimit: 2500,
        spentAmount: 950,
        monthYear: curMonthYear,
        alertThresholdPercent: 80,
      },
      {
        userId: 'user_1',
        category: 'Investments & Savings',
        budgetAmount: 8000,
        monthlyLimit: 8000,
        spentAmount: 8000,
        monthYear: curMonthYear,
        alertThresholdPercent: 90,
      },
    ]);

    // Incomes
    await IncomeModel.create([
      {
        userId: 'user_1',
        amount: 35000,
        incomeType: 'Salary',
        source: 'Salary',
        bankName: 'SBI - Salary Account',
        paymentMethod: 'Bank Transfer',
        description: 'Monthly Tech Corp Salary Deposit',
        date: makeDate(curYear, now.getMonth() + 1, 1),
        isRecurring: true,
      },
      {
        userId: 'user_1',
        amount: 10500,
        incomeType: 'Freelance',
        source: 'Freelance',
        bankName: 'HDFC Wealth',
        paymentMethod: 'UPI',
        description: 'UI/UX Design Contract milestone payment',
        date: makeDate(curYear, now.getMonth() + 1, 10),
        isRecurring: false,
      },
      {
        userId: 'user_1',
        amount: 4500,
        incomeType: 'Investment',
        source: 'Investment',
        bankName: 'Zerodha / ICICI',
        paymentMethod: 'Bank Transfer',
        description: 'Quarterly Mutual Fund & Stock Dividends',
        date: makeDate(curYear, now.getMonth() + 1, 14),
        isRecurring: false,
      },
      {
        userId: 'user_1',
        amount: 35000,
        incomeType: 'Salary',
        source: 'Salary',
        bankName: 'SBI - Salary Account',
        paymentMethod: 'Bank Transfer',
        description: 'Previous Month Salary Deposit',
        date: makeDate(prevYear, prevDate.getMonth() + 1, 1),
        isRecurring: true,
      },
      {
        userId: 'user_1',
        amount: 8000,
        incomeType: 'Freelance',
        source: 'Freelance',
        bankName: 'HDFC Wealth',
        paymentMethod: 'UPI',
        description: 'Consulting project fee',
        date: makeDate(prevYear, prevDate.getMonth() + 1, 12),
        isRecurring: false,
      },
    ]);

    // Expenses
    await ExpenseModel.create([
      {
        userId: 'user_1',
        amount: 12000,
        category: 'Housing & Utilities',
        subcategory: 'Rent',
        expenseType: 'Fixed',
        bankName: 'SBI - Salary Account',
        paymentMethod: 'Net Banking',
        description: 'Monthly Apartment Rent',
        date: makeDate(curYear, now.getMonth() + 1, 2),
      },
      {
        userId: 'user_1',
        amount: 2500,
        category: 'Housing & Utilities',
        subcategory: 'Electricity',
        expenseType: 'Variable',
        bankName: 'HDFC Wealth',
        paymentMethod: 'UPI',
        description: 'State Electricity Board Bill',
        date: makeDate(curYear, now.getMonth() + 1, 5),
      },
      {
        userId: 'user_1',
        amount: 3450,
        category: 'Food & Dining',
        subcategory: 'Groceries',
        expenseType: 'Variable',
        bankName: 'SBI - Salary Account',
        paymentMethod: 'Debit Card',
        description: 'BigBasket Monthly Grocery Restock',
        date: makeDate(curYear, now.getMonth() + 1, 7),
      },
      {
        userId: 'user_1',
        amount: 850,
        category: 'Food & Dining',
        subcategory: 'Restaurants',
        expenseType: 'Discretionary',
        bankName: 'HDFC Bank',
        paymentMethod: 'UPI',
        description: 'Weekend Dining with Colleagues',
        date: makeDate(curYear, now.getMonth() + 1, 11),
      },
      {
        userId: 'user_1',
        amount: 1800,
        category: 'Transportation',
        subcategory: 'Fuel',
        expenseType: 'Variable',
        bankName: 'ICICI Platinum',
        paymentMethod: 'Credit Card',
        description: 'HPCL Petrol Fuel Tank Fill',
        date: makeDate(curYear, now.getMonth() + 1, 13),
      },
      {
        userId: 'user_1',
        amount: 1800,
        category: 'Education & Books',
        subcategory: 'Courses',
        expenseType: 'Discretionary',
        bankName: 'HDFC Wealth',
        paymentMethod: 'UPI',
        description: 'Frontend Masters & Cloud Certification',
        date: makeDate(curYear, now.getMonth() + 1, 15),
      },
      {
        userId: 'user_1',
        amount: 2100,
        category: 'Shopping',
        subcategory: 'Clothing',
        expenseType: 'Discretionary',
        bankName: 'ICICI Platinum',
        paymentMethod: 'Credit Card',
        description: 'Myntra Office Wear Apparel',
        date: makeDate(curYear, now.getMonth() + 1, 17),
      },
      {
        userId: 'user_1',
        amount: 1450,
        category: 'Entertainment & Fun',
        subcategory: 'Streaming',
        expenseType: 'Subscription',
        bankName: 'ICICI Platinum',
        paymentMethod: 'Credit Card',
        description: 'Netflix & Spotify Annual Subscriptions',
        date: makeDate(curYear, now.getMonth() + 1, 18),
      },
    ]);

    // Savings Goals
    await SavingsGoalModel.create([
      {
        userId: 'user_1',
        title: 'Emergency Fund',
        goalName: 'Emergency Fund',
        targetAmount: 100000,
        currentAmount: 63000,
        savedAmount: 63000,
        category: 'Emergency',
        targetDate: '2026-12-31',
        priority: 'High',
        status: 'in_progress',
        colorTheme: 'emerald',
      },
      {
        userId: 'user_1',
        title: 'MacBook Pro M3 Max',
        goalName: 'MacBook Pro M3 Max',
        targetAmount: 80000,
        currentAmount: 60000,
        savedAmount: 60000,
        category: 'Laptop',
        targetDate: '2026-10-15',
        priority: 'Medium',
        status: 'in_progress',
        colorTheme: 'indigo',
      },
      {
        userId: 'user_1',
        title: 'Europe Holiday Trip',
        goalName: 'Europe Holiday Trip',
        targetAmount: 150000,
        currentAmount: 45000,
        savedAmount: 45000,
        category: 'Vacation',
        targetDate: '2027-04-30',
        priority: 'Low',
        status: 'in_progress',
        colorTheme: 'sunset',
      },
    ]);

    // Bills
    await BillModel.create([
      {
        userId: 'user_1',
        billName: 'Electricity Bill',
        amount: 2500,
        dueDate: makeDate(curYear, now.getMonth() + 1, 25),
        status: 'Upcoming',
        category: 'Utilities',
        accountName: 'SBI - Salary Account',
        recurring: 'Monthly',
        reminderDays: 3,
        isPaid: false,
      },
      {
        userId: 'user_1',
        billName: 'Airtel Fiber Broadband',
        amount: 1199,
        dueDate: makeDate(curYear, now.getMonth() + 1, 28),
        status: 'Upcoming',
        category: 'Internet',
        accountName: 'HDFC Wealth',
        recurring: 'Monthly',
        reminderDays: 2,
        isPaid: false,
      },
    ]);

    // Notifications
    await NotificationModel.create([
      {
        userId: 'user_1',
        type: 'MONTHLY_SUMMARY',
        title: '⭐ BudgetBuddy Premium Active',
        message: 'Welcome to BudgetBuddy Pro! You have full access to Financial Insights, Advanced Analytics, and Priority Support.',
        category: 'summary',
        priority: 'high',
        isRead: false,
        actionUrl: '/dashboard',
      },
    ]);

    console.log('[Seed] Database initialization complete!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};
