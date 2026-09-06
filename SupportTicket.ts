import mongoose, { Schema, Model } from 'mongoose';

export interface ITicketMessage {
  sender: 'user' | 'admin' | 'support';
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface ISupportTicket {
  id?: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Feature Request' | 'General' | 'Account';
  priority: 'Normal' | 'Premium' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: ITicketMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: ['Billing', 'Technical', 'Feature Request', 'General', 'Account'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: ['Normal', 'Premium', 'Urgent'],
      default: 'Normal',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    messages: [
      {
        sender: { type: String, enum: ['user', 'admin', 'support'], required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
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

export const SupportTicketModel: Model<ISupportTicket> =
  (mongoose.models.SupportTicket as Model<ISupportTicket>) ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
