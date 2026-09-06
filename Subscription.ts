import mongoose, { Schema, Model } from 'mongoose';

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIAL'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PAST_DUE';

export interface ISubscription {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId?: string;
  planName: string;
  planCode: string;
  billingPeriod: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  cancelledAt?: Date;
  paymentProvider: 'RAZORPAY' | 'STRIPE' | 'BUDGETBUDDY_GATEWAY' | 'MANUAL_ADMIN';
  paymentId?: string;
  customerId?: string;
  subscriptionId?: string;
  autoRenew: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    planId: { type: String },
    planName: { type: String, required: true },
    planCode: { type: String, required: true },
    billingPeriod: { type: String, default: 'monthly' },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PAST_DUE'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    cancelledAt: { type: Date },
    paymentProvider: {
      type: String,
      enum: ['RAZORPAY', 'STRIPE', 'BUDGETBUDDY_GATEWAY', 'MANUAL_ADMIN'],
      default: 'BUDGETBUDDY_GATEWAY',
    },
    paymentId: { type: String },
    customerId: { type: String },
    subscriptionId: { type: String },
    autoRenew: { type: Boolean, default: true },
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

export const SubscriptionModel: Model<ISubscription> =
  (mongoose.models.Subscription as Model<ISubscription>) ||
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
