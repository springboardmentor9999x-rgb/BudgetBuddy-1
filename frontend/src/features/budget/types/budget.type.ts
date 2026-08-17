/**
 * Budget type definitions — mirrors backend BudgetBase / BudgetOut schemas.
 */

export interface BudgetCreate {
  category: string;
  monthly_limit: number;
  created_at?: string; // ISO datetime; backend defaults to now
}

export interface Budget extends BudgetCreate {
  id: number;
  created_at: string;
}

export type BudgetUpdate = {
  category?: string;
  monthly_limit?: number;
};
