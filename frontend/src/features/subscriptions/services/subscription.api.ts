import { api } from '../../../api/api.ts';
import type {
  SubscriptionStatusResponse,
  SubscriptionListResponse,
  SubscriptionRequestItem,
} from '../types/subscription.type.ts';

export const requestSubscriptionApi = async (userNote?: string): Promise<SubscriptionStatusResponse> => {
  const res = await api.post<SubscriptionStatusResponse>('/subscriptions/request', {
    user_note: userNote?.trim() || null,
  });
  return res.data;
};

export const fetchMySubscriptionStatusApi = async (): Promise<SubscriptionStatusResponse> => {
  const res = await api.get<SubscriptionStatusResponse>('/subscriptions/my-status');
  return res.data;
};

export const fetchAdminSubscriptionRequestsApi = async (
  status?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SubscriptionListResponse> => {
  const params: Record<string, string | number> = { page, page_size: pageSize };
  if (status && status !== 'all') {
    params.status = status;
  }
  const res = await api.get<SubscriptionListResponse>('/subscriptions/admin/requests', { params });
  return res.data;
};

export const approveSubscriptionRequestApi = async (
  requestId: number,
  adminResponse?: string
): Promise<SubscriptionRequestItem> => {
  const res = await api.post<SubscriptionRequestItem>(`/subscriptions/admin/requests/${requestId}/approve`, {
    admin_response: adminResponse?.trim() || null,
  });
  return res.data;
};

export const rejectSubscriptionRequestApi = async (
  requestId: number,
  adminResponse?: string
): Promise<SubscriptionRequestItem> => {
  const res = await api.post<SubscriptionRequestItem>(`/subscriptions/admin/requests/${requestId}/reject`, {
    admin_response: adminResponse?.trim() || null,
  });
  return res.data;
};
