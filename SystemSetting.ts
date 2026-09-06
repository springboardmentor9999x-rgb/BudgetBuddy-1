import mongoose, { Schema, Model } from 'mongoose';

export interface ISystemSetting {
  id?: string;
  appName: string;
  appDescription: string;
  registrationEnabled: boolean;
  premiumRegistrationEnabled: boolean;
  maintenanceMode: boolean;
  emailVerificationRequired: boolean;
  defaultCurrency: string;
  supportEmail: string;
  systemNotice?: string;
  
  // Security settings
  otpExpirationDuration: number; // in minutes (e.g., 10)
  maxLoginAttempts: number;      // e.g., 5
  sessionTimeout: number;        // in minutes (e.g., 60)
  rateLimitPerMinute: number;    // e.g., 100
  notificationSettings: {
    emailAlerts: boolean;
    pushAlerts: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    appName: { type: String, default: 'BudgetBuddy' },
    appDescription: {
      type: String,
      default: 'Intelligent Personal & Household Financial Management Platform with Advanced Analytics.',
    },
    registrationEnabled: { type: Boolean, default: true },
    premiumRegistrationEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    emailVerificationRequired: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'INR' },
    supportEmail: { type: String, default: 'support@budgetbuddy.app' },
    systemNotice: { type: String, default: 'All platform systems operating normally.' },
    
    // Security & Rate Limits
    otpExpirationDuration: { type: Number, default: 10 },
    maxLoginAttempts: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 60 },
    rateLimitPerMinute: { type: Number, default: 120 },
    notificationSettings: {
      emailAlerts: { type: Boolean, default: true },
      pushAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
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

export const SystemSettingModel: Model<ISystemSetting> =
  (mongoose.models.SystemSetting as Model<ISystemSetting>) ||
  mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
