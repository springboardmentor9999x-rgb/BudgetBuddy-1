import mongoose, { Schema, Model } from 'mongoose';

export interface IBill {
  id?: string;
  userId: string;
  billName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Upcoming' | 'Due Today' | 'Overdue' | 'Paid';
  category: string;
  accountName?: string;
  recurring?: string;
  reminderDays: number;
  isPaid: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BillSchema = new Schema<IBill>(
  {
    userId: { type: String, required: true, index: true },
    billName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Due Today', 'Overdue', 'Paid'],
      default: 'Upcoming',
    },
    category: { type: String, default: 'Utilities' },
    accountName: { type: String, default: 'Primary Account' },
    recurring: { type: String, default: 'Monthly' },
    reminderDays: { type: Number, default: 3 },
    isPaid: { type: Boolean, default: false },
    notes: { type: String },
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

BillSchema.index({ userId: 1, dueDate: 1 });

export const BillModel: Model<IBill> =
  (mongoose.models.Bill as Model<IBill>) || mongoose.model<IBill>('Bill', BillSchema);
