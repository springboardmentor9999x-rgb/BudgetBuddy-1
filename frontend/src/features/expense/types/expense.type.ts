
/**
 * ExpenseCreate interface represents the structure of an expense object that can be created.
 * Fields:
 * - amount: A number representing the amount of the expense.
 * - description: A string providing additional details about the expense.
 * - date: A string in ISO format representing the date of the expense.
 * - category: A string representing the category of the expense.
 * - account: A string representing the account associated with the expense.
 */
export interface ExpenseCreate {
  amount: number;
  description: string;
  date: string;
  category: string;
  account: string;
};

/**
 * Expense interface represents the structure of an expense object.
 * Fields:
 * - id: A unique identifier for the expense (number).
 * - amount: A number representing the amount of the expense.
 * - description: A string providing additional details about the expense.
 * - date: A string in ISO format representing the date of the expense.
 * - category: A string representing the category of the expense.
 * - account: A string representing the account associated with the expense.
 */
export interface Expense extends ExpenseCreate {
  id: number;
}


/**
 * ExpenseUpdate interface represents the structure of an expense object that can be updated.
 * All fields are optional, allowing for partial updates of an expense record.
 * 
 * Fields:
 * - amount: Optional number representing the amount of the expense.
 * - description: Optional string providing additional details about the expense.
 * - date: Optional string in ISO format representing the date of the expense.
 * - category: Optional string representing the category of the expense.
 * - account: Optional string representing the account associated with the expense.
 */
export type ExpenseUpdate = {
  amount?: number;
  description?: string;
  date?: string;
  category?: string;
  account?: string;
};
