import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPermissionHistory extends Document {
  adminId: string;
  adminEmail: string;
  adminName: string;
  feature: string;
  featureName: string;
  category: string;
  changeType: 'TOGGLE_ENABLED' | 'TOGGLE_FREE' | 'TOGGLE_PREMIUM' | 'RESET_DEFAULTS' | 'BULK_UPDATE';
  previousValue: string;
  newValue: string;
  action: string;
  ipAddress?: string;
  createdAt: Date;
}

const PermissionHistorySchema = new Schema<IPermissionHistory>(
  {
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      default: 'Admin',
    },
    feature: {
      type: String,
      required: true,
      index: true,
    },
    featureName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      enum: ['TOGGLE_ENABLED', 'TOGGLE_FREE', 'TOGGLE_PREMIUM', 'RESET_DEFAULTS', 'BULK_UPDATE'],
      default: 'TOGGLE_ENABLED',
    },
    previousValue: {
      type: String,
      default: '',
    },
    newValue: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PermissionHistoryModel: Model<IPermissionHistory> =
  (mongoose.models.PermissionHistory as Model<IPermissionHistory>) ||
  mongoose.model<IPermissionHistory>('PermissionHistory', PermissionHistorySchema);
