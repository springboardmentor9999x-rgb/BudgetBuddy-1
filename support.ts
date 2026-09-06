export interface SupportTicketMessage {
  sender: 'user' | 'admin' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicketDoc {
  id?: string;
  _id?: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'Billing' | 'Technical' | 'Feature Request' | 'General' | 'Account';
  priority: 'Normal' | 'Premium' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt?: string;
}
