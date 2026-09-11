/**
 * SavingGoalCreate – payload to create a new saving goal
 */
export interface SavingGoalCreate {
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date: string; // ISO date string YYYY-MM-DD
}

/**
 * SavingGoal – full saving goal returned by the API
 */
export interface SavingGoal extends SavingGoalCreate {
  id: number;
}

/**
 * SavingGoalUpdate – partial update payload
 */
export type SavingGoalUpdate = Partial<SavingGoalCreate>;

/**
 * SavingGoalContribution – payload for contributing funds to a goal
 */
export interface SavingGoalContribution {
  amount: number;
  account_id?: number;
}

