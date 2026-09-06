import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
  id?: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  category: 'budget' | 'expenses' | 'income' | 'savings' | 'account' | 'security' | 'summary' | 'system';
  priority: 'low' | 'medium' | 'high';
  status?: 'sent' | 'scheduled' | 'draft';
  targetAudience?: 'all' | 'free' | 'premium' | 'admin';
  scheduledAt?: Date;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['budget', 'expenses', 'income', 'savings', 'account', 'security', 'summary', 'system'],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['sent', 'scheduled', 'draft'],
      default: 'sent',
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'free', 'premium', 'admin'],
      default: 'all',
    },
    scheduledAt: { type: Date },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    expiresAt: { type: Date, index: { expires: 0 } },
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

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1, category: 1 });

export const NotificationModel: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema);
