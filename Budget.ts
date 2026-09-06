import mongoose, { Schema, Model } from 'mongoose';

export interface IBudget {
  id?: string;
  userId: string;
  category: string;
  budgetAmount: number;
  monthlyLimit?: number;
  spentAmount: number;
  monthYear: string; // YYYY-MM
  startDate?: string;
  endDate?: string;
  alertThresholdPercent: number; // default 80
  createdAt?: Date;
  updatedAt?: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    budgetAmount: { type: Number, required: true, min: 0 },
    monthlyLimit: { type: Number, min: 0 },
    spentAmount: { type: Number, default: 0, min: 0 },
    monthYear: { type: String, required: true, index: true },
    startDate: { type: String },
    endDate: { type: String },
    alertThresholdPercent: { type: Number, default: 80 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (!ret.monthlyLimit) {
          ret.monthlyLimit = ret.budgetAmount;
        }
        if (!ret.budgetAmount) {
          ret.budgetAmount = ret.monthlyLimit;
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

BudgetSchema.index({ userId: 1, monthYear: 1, category: 1 }, { unique: true });

export const BudgetModel: Model<IBudget> =
  (mongoose.models.Budget as Model<IBudget>) || mongoose.model<IBudget>('Budget', BudgetSchema);
