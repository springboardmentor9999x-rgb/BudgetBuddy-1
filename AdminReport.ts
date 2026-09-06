import mongoose, { Schema, Model } from 'mongoose';

export type ReportStatus = 'GENERATED' | 'PENDING' | 'FAILED';
export type ReportType =
  | 'USERS_DIRECTORY'
  | 'SUBSCRIPTIONS_REVENUE'
  | 'FINANCE_AGGREGATION'
  | 'SECURITY_AUDIT'
  | 'SYSTEM_DIAGNOSTIC'
  | 'CUSTOM';

export interface IAdminReport {
  id?: string;
  title: string;
  reportType: ReportType;
  format: 'CSV' | 'JSON' | 'PDF';
  status: ReportStatus;
  generatedBy: string;
  fileSize?: string;
  recordCount?: number;
  downloadUrl?: string;
  errorMessage?: string;
  parameters?: Record<string, any>;
  generatedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminReportSchema = new Schema<IAdminReport>(
  {
    title: { type: String, required: true },
    reportType: {
      type: String,
      enum: [
        'USERS_DIRECTORY',
        'SUBSCRIPTIONS_REVENUE',
        'FINANCE_AGGREGATION',
        'SECURITY_AUDIT',
        'SYSTEM_DIAGNOSTIC',
        'CUSTOM',
      ],
      required: true,
      index: true,
    },
    format: {
      type: String,
      enum: ['CSV', 'JSON', 'PDF'],
      default: 'CSV',
    },
    status: {
      type: String,
      enum: ['GENERATED', 'PENDING', 'FAILED'],
      default: 'GENERATED',
      index: true,
    },
    generatedBy: { type: String, required: true },
    fileSize: { type: String, default: '14.2 KB' },
    recordCount: { type: Number, default: 0 },
    downloadUrl: { type: String },
    errorMessage: { type: String },
    parameters: { type: Schema.Types.Mixed, default: {} },
    generatedAt: { type: Date, default: Date.now, index: true },
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

export const AdminReportModel: Model<IAdminReport> =
  (mongoose.models.AdminReport as Model<IAdminReport>) ||
  mongoose.model<IAdminReport>('AdminReport', AdminReportSchema);
