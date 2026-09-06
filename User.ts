import mongoose, { Schema, Model } from 'mongoose';

export type UserRole =
  | 'user'
  | 'premium'
  | 'admin'
  | 'super_admin'
  | 'student'
  | 'professional'
  | 'freelancer';

export type AccountStatus = 'active' | 'suspended' | 'pending';
export type PremiumStatus = 'NONE' | 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';

export interface IUser {
  id?: string;
  name: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  is_verified: boolean;
  currency: string;
  monthlyIncomeGoal: number;
  savingsTargetPercent: number;
  avatarUrl?: string;
  
  // Premium & Subscription state
  premiumStatus: PremiumStatus;
  premiumPlan: string; // 'FREE' | 'MONTHLY' | 'YEARLY' or custom
  premiumStartedAt?: Date;
  premiumExpiresAt?: Date;
  customCategories?: string[];
  
  // Security & Audit
  lastLoginAt?: Date;
  verification_code_hash?: string;
  verification_expires_at?: Date;
  verification_attempts?: number;
  verification_used?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin', 'super_admin', 'student', 'professional', 'freelancer'],
      default: 'professional',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true,
    },
    is_verified: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },
    monthlyIncomeGoal: { type: Number, default: 50000 },
    savingsTargetPercent: { type: Number, default: 25 },
    avatarUrl: { type: String },
    
    // Premium fields
    premiumStatus: {
      type: String,
      enum: ['NONE', 'ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'PAST_DUE'],
      default: 'NONE',
      index: true,
    },
    premiumPlan: { type: String, default: 'FREE' },
    premiumStartedAt: { type: Date },
    premiumExpiresAt: { type: Date },
    customCategories: [{ type: String }],
    
    // Audit & Verification
    lastLoginAt: { type: Date },
    verification_code_hash: { type: String },
    verification_expires_at: { type: Date },
    verification_attempts: { type: Number, default: 0 },
    verification_used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        delete ret.password;
        delete ret.verification_code_hash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
