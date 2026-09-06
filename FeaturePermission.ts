import mongoose, { Schema, Document, Model } from 'mongoose';

export type FeatureCategory = 'BUDGET' | 'ANALYTICS' | 'REPORTS' | 'PREMIUM';

export interface IFeaturePermission extends Document {
  feature: string; // e.g. 'budget.forecast', 'reports.pdf_export'
  name: string; // e.g. 'Budget Forecasting'
  description?: string;
  category: FeatureCategory;
  freeUser: boolean;
  premiumUser: boolean;
  enabled: boolean;
  isPremiumFeature?: boolean;
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const FeaturePermissionSchema = new Schema<IFeaturePermission>(
  {
    feature: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['BUDGET', 'ANALYTICS', 'REPORTS', 'PREMIUM'],
      required: true,
      index: true,
    },
    freeUser: {
      type: Boolean,
      default: false,
    },
    premiumUser: {
      type: Boolean,
      default: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPremiumFeature: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      default: 'system',
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

export const FeaturePermissionModel: Model<IFeaturePermission> =
  (mongoose.models.FeaturePermission as Model<IFeaturePermission>) ||
  mongoose.model<IFeaturePermission>('FeaturePermission', FeaturePermissionSchema);
