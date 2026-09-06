import mongoose, { Schema, Model } from 'mongoose';

export interface IAuditLog {
  id?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: 'USER' | 'SUBSCRIPTION' | 'PLAN' | 'CATEGORY' | 'REPORT' | 'SYSTEM' | 'SUPPORT' | 'AUTH' | 'NOTIFICATION' | 'SECURITY';
  targetId?: string;
  result: 'SUCCESS' | 'FAILED';
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ['USER', 'SUBSCRIPTION', 'PLAN', 'CATEGORY', 'REPORT', 'SYSTEM', 'SUPPORT', 'AUTH', 'NOTIFICATION', 'SECURITY'],
      required: true,
      index: true,
    },
    targetId: { type: String },
    result: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS', index: true },
    details: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now, index: true },
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

export const AuditLogModel: Model<IAuditLog> =
  (mongoose.models.AuditLog as Model<IAuditLog>) ||
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
