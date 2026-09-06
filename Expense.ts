import mongoose, { Schema, Model } from 'mongoose';

export interface IExpense {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  subcategory?: string;
  expenseType?: string;
  bankName: string;
  paymentMethod: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  recurring?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    expenseType: { type: String, default: 'Variable' },
    bankName: { type: String, default: 'Primary Account' },
    paymentMethod: { type: String, default: 'UPI' },
    description: { type: String, required: true },
    date: { type: String, required: true, index: true },
    recurring: { type: String },
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

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });

export const ExpenseModel: Model<IExpense> =
  (mongoose.models.Expense as Model<IExpense>) || mongoose.model<IExpense>('Expense', ExpenseSchema);
