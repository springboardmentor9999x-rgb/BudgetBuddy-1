export interface SubscriptionRequestItem {
  id: number;
  user_id: number;
  user_email: string;
  user_name?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user_note?: string | null;
  admin_response?: string | null;
  reviewed_by?: number | null;
  reviewer_email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SubscriptionStatusResponse {
  has_pending: boolean;
  current_role: string;
  latest_request?: SubscriptionRequestItem | null;
}

export interface SubscriptionListResponse {
  requests: SubscriptionRequestItem[];
  total: number;
  pending_count: number;
  page: number;
  page_size: number;
}
