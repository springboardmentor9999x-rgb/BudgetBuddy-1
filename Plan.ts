import mongoose, { Schema, Model } from 'mongoose';

export interface IPlan {
  id?: string;
  name: string;
  planCode: 'FREE' | 'MONTHLY' | 'YEARLY' | string;
  price: number;
  currency: string;
  billingPeriod: 'free' | 'monthly' | 'yearly';
  durationDays: number; // 0 for free, 30 for monthly, 365 for yearly
  features: string[];
  status: 'active' | 'inactive' | 'archived';
  isPopular?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    planCode: { type: String, required: true, unique: true, uppercase: true },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    billingPeriod: {
      type: String,
      enum: ['free', 'monthly', 'yearly'],
      default: 'monthly',
    },
    durationDays: { type: Number, default: 30 },
    features: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
    isPopular: { type: Boolean, default: false },
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

export const PlanModel: Model<IPlan> =
  (mongoose.models.Plan as Model<IPlan>) || mongoose.model<IPlan>('Plan', PlanSchema);
