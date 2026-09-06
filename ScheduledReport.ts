import mongoose, { Schema, Model } from 'mongoose';

export interface IScheduledReport {
  id?: string;
  userId: string;
  userEmail: string;
  reportType: 'monthly' | 'income' | 'expense' | 'budget' | 'savings' | 'cash_flow' | 'summary';
  frequency: 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'csv' | 'excel';
  isActive: boolean;
  lastSentAt?: Date;
  nextRunAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ScheduledReportSchema = new Schema<IScheduledReport>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['monthly', 'income', 'expense', 'budget', 'savings', 'cash_flow', 'summary'],
      default: 'monthly',
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly',
    },
    format: {
      type: String,
      enum: ['pdf', 'csv', 'excel'],
      default: 'pdf',
    },
    isActive: { type: Boolean, default: true },
    lastSentAt: { type: Date },
    nextRunAt: { type: Date, required: true },
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

export const ScheduledReportModel: Model<IScheduledReport> =
  (mongoose.models.ScheduledReport as Model<IScheduledReport>) ||
  mongoose.model<IScheduledReport>('ScheduledReport', ScheduledReportSchema);
