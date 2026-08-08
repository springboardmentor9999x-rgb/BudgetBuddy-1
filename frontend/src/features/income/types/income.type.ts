
/**
 * IncomeCreate interface represents the structure of an income object that can be created.
 * Fields:
 * - source: A string representing the source of the income.
 * - amount: A number representing the amount of income.
 * - date: A string in ISO format representing the date of the income.
 * - account: A string representing the account associated with the income.
 * - description: An optional string providing additional details about the income.
 */
interface IncomeCreate {
  source: string;
  amount: number;
  date: string; // ISO date string
  account: string;
}


/**
 * Income interface represents the structure of an income object.
 * Fields:
 * - id: A unique identifier for the income (number).
 * - source: A string representing the source of the income.
 * - amount: A number representing the amount of income.
 * - date: A string in ISO format representing the date of the income.
 * - account: A string representing the account associated with the income.
 * - description: An optional string providing additional details about the income.
 */
interface Income extends IncomeCreate {
  id: number;
}


/**
 * IncomeUpdate interface represents the structure of an income object that can be updated.
 * All fields are optional, allowing for partial updates of an income record.
 * 
 * Fields:
 * - source: Optional string representing the source of the income.
 * - amount: Optional number representing the amount of income.
 * - date: Optional string in ISO format representing the date of the income.
 * - account: Optional string representing the account associated with the income.
 * - description: Optional string providing additional details about the income.
 */
interface IncomeUpdate {
  source?: string; // Optional field for update
  amount?: number; // Optional field for update
  date?: string; // Optional field for update (ISO date string)
  account?: string; // Optional field for update
}

export type { Income, IncomeCreate, IncomeUpdate };