import mongoose, { Schema, Model } from 'mongoose';

export interface IIncome {
  id?: string;
  userId: string;
  amount: number;
  incomeType: string;
  source: string;
  bankName: string;
  paymentMethod: string;
  description: string;
  date: string; // ISO YYYY-MM-DD
  isRecurring: boolean;
  recurring?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    incomeType: { type: String, required: true, index: true },
    source: { type: String, required: true, index: true },
    bankName: { type: String, default: 'Primary Bank' },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    description: { type: String, required: true },
    date: { type: String, required: true, index: true },
    isRecurring: { type: Boolean, default: false },
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

IncomeSchema.index({ userId: 1, date: -1 });

export const IncomeModel: Model<IIncome> =
  (mongoose.models.Income as Model<IIncome>) || mongoose.model<IIncome>('Income', IncomeSchema);
