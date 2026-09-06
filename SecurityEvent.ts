import mongoose, { Schema, Model } from 'mongoose';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'OTP_FAILURE'
  | 'SUSPICIOUS_LOGIN'
  | 'SESSION_REVOKED'
  | 'PASSWORD_RESET'
  | 'RATE_LIMIT_HIT';

export interface ISecurityEvent {
  id?: string;
  type: SecurityEventType;
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const SecurityEventSchema = new Schema<ISecurityEvent>(
  {
    type: {
      type: String,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'OTP_FAILURE',
        'SUSPICIOUS_LOGIN',
        'SESSION_REVOKED',
        'PASSWORD_RESET',
        'RATE_LIMIT_HIT',
      ],
      required: true,
      index: true,
    },
    userId: { type: String, index: true },
    email: { type: String, required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    location: { type: String, default: 'Mumbai, India' },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
      default: 'SUCCESS',
      index: true,
    },
    details: { type: String, required: true },
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

export const SecurityEventModel: Model<ISecurityEvent> =
  (mongoose.models.SecurityEvent as Model<ISecurityEvent>) ||
  mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
