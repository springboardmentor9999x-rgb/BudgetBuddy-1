import mongoose, { Schema } from 'mongoose';

export interface IBillReminder {
  id?: string;
  userId: string;
  billName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  accountId?: string;
  accountName?: string;
  recurring: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-Time';
  reminderDays: number;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BillReminderSchema = new Schema<IBillReminder>(
  {
    userId: { type: String, required: true, index: true },
    billName: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    category: { type: String, required: true, default: 'Utilities' },
    accountId: { type: String },
    accountName: { type: String },
    recurring: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Yearly', 'One-Time'],
      default: 'Monthly',
    },
    reminderDays: { type: Number, default: 2 },
    isPaid: { type: Boolean, default: false },
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

export const BillReminderModel =
  mongoose.models.BillReminder ||
  mongoose.model<IBillReminder>('BillReminder', BillReminderSchema);
