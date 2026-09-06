import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  id?: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string; // If set, this is a custom category created by a premium user
  status: 'active' | 'disabled';
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, default: 'Tag' },
    color: { type: String, default: '#3b82f6' },
    isDefault: { type: Boolean, default: false },
    userId: { type: String, index: true },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
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

export const CategoryModel: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>('Category', CategorySchema);
