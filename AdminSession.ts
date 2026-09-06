import mongoose, { Schema, Model } from 'mongoose';

export interface IAdminSession {
  id?: string;
  sessionId: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  ipAddress: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string;
  isCurrent: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  createdAt: Date;
  lastActiveAt: Date;
}

const AdminSessionSchema = new Schema<IAdminSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    adminName: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    device: { type: String, default: 'Desktop (Windows 11)' },
    browser: { type: String, default: 'Chrome 124.0.0' },
    location: { type: String, default: 'Bengaluru, India' },
    isCurrent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now, index: true },
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

export const AdminSessionModel: Model<IAdminSession> =
  (mongoose.models.AdminSession as Model<IAdminSession>) ||
  mongoose.model<IAdminSession>('AdminSession', AdminSessionSchema);
