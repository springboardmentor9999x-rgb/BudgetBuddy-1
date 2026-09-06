import mongoose, { Schema } from 'mongoose';

export interface INotificationPreference {
  id?: string;
  userId: string;
  budgetAlerts: boolean;
  expenseAlerts: boolean;
  incomeAlerts: boolean;
  goalAlerts: boolean;
  billReminders: boolean;
  accountAlerts: boolean;
  weeklySummary: boolean;
  monthlySummary: boolean;
  emailBudgetAlerts: boolean;
  emailGoalAlerts: boolean;
  emailBillReminders: boolean;
  emailWeeklySummary: boolean;
  emailMonthlySummary: boolean;
  largeExpenseThreshold: number;
  soundEnabled: boolean;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    budgetAlerts: { type: Boolean, default: true },
    expenseAlerts: { type: Boolean, default: true },
    incomeAlerts: { type: Boolean, default: true },
    goalAlerts: { type: Boolean, default: true },
    billReminders: { type: Boolean, default: true },
    accountAlerts: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true },
    monthlySummary: { type: Boolean, default: true },

    emailBudgetAlerts: { type: Boolean, default: true },
    emailGoalAlerts: { type: Boolean, default: true },
    emailBillReminders: { type: Boolean, default: true },
    emailWeeklySummary: { type: Boolean, default: true },
    emailMonthlySummary: { type: Boolean, default: true },

    largeExpenseThreshold: { type: Number, default: 10000 },
    soundEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationPreferenceModel =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
