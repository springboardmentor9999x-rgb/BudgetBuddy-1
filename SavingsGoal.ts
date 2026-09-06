import mongoose, { Schema, Model } from 'mongoose';

export interface ISavingsGoal {
  id?: string;
  userId: string;
  title: string;
  goalName?: string;
  targetAmount: number;
  currentAmount: number;
  savedAmount?: number;
  category: string;
  targetDate: string; // YYYY-MM-DD
  priority: 'High' | 'Medium' | 'Low';
  status: 'in_progress' | 'completed' | 'paused';
  colorTheme?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    goalName: { type: String },
    targetAmount: { type: Number, required: true, min: 1 },
    currentAmount: { type: Number, default: 0, min: 0 },
    savedAmount: { type: Number, min: 0 },
    category: {
      type: String,
      default: 'General',
    },
    targetDate: { type: String, required: true },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused'],
      default: 'in_progress',
    },
    colorTheme: { type: String, default: 'emerald' },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        if (ret._id) {
          ret.id = ret._id.toString();
          delete ret._id;
        }
        if (!ret.goalName) ret.goalName = ret.title;
        if (!ret.title) ret.title = ret.goalName;
        if (ret.savedAmount === undefined) ret.savedAmount = ret.currentAmount;
        if (ret.currentAmount === undefined) ret.currentAmount = ret.savedAmount;
        delete ret.__v;
        return ret;
      },
    },
  }
);

SavingsGoalSchema.index({ userId: 1, createdAt: -1 });

export const SavingsGoalModel: Model<ISavingsGoal> =
  (mongoose.models.SavingsGoal as Model<ISavingsGoal>) ||
  mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
