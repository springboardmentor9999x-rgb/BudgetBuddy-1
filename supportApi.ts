import { apiClient } from './api';
import { SupportTicketDoc } from '../types/support';

export const supportApi = {
  async getTickets(): Promise<SupportTicketDoc[]> {
    const res = await apiClient.get('/support/tickets');
    return res.data.data || [];
  },

  async createTicket(data: { subject: string; category?: string; message: string; priority?: string }) {
    const res = await apiClient.post('/support/tickets', data);
    return res.data;
  },

  async addMessage(ticketId: string, message: string) {
    const res = await apiClient.post(`/support/tickets/${ticketId}/message`, { message });
    return res.data;
  },
};
