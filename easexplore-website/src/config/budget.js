// Settings for the Budget & Expense manager.
//
// Money is stored and calculated in PAISE (1 rupee = 100 paise) as whole numbers.
// That avoids the rounding errors that decimals cause (0.1 + 0.2 is not 0.3 in JavaScript).
// Only the screen shows rupees.

import { AUTO, BUS } from './fares.js';

/**
 * Spending categories. The ids must match the list in supabase/002_budget.sql.
 * `bar` is the colour used in the spending chart. Amounts are always written next to it,
 * so colour is never the only way to tell categories apart.
 */
export const CATEGORIES = [
  { id: 'food', label: 'Food & chai', icon: 'restaurant', bar: 'bg-secondary-container' },
  { id: 'transport', label: 'Transport', icon: 'directions_transit', bar: 'bg-primary' },
  { id: 'entry', label: 'Entry & activities', icon: 'confirmation_number', bar: 'bg-tertiary-container' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag', bar: 'bg-primary-fixed-dim' },
  { id: 'other', label: 'Other', icon: 'more_horiz', bar: 'bg-outline' },
];

export const LIMITS = {
  maxAmountPaise: 100000000, // Rs 10,00,000 for one expense
  minBudgetRupees: 50,
  maxBudgetRupees: 100000,
  maxNoteLength: 80,
  maxNameLength: 30,
  maxPeople: 12,
  warnAt: 0.8, // "close to your limit" from 80% of the daily budget
  earliestDate: '2020-01-01',
  listLimit: 1000, // most expenses loaded at once
  maxExpenses: 5000, // most one account can store (also enforced in the database)
};

/** One-tap daily budgets, in rupees. */
export const BUDGET_PRESETS = [500, 1000, 1500, 2000];

/** Buttons that fill in the form. Amounts that come from fares read the fare config, so they stay correct. */
export const QUICK_ADDS = [
  { label: 'Chai & snack', amount: 30, category: 'food', note: 'Chai & snack' },
  { label: 'Auto, minimum fare', amount: AUTO.baseFare, category: 'transport', note: 'Auto ride' },
  { label: 'Bus ticket', amount: BUS.slabs[0].fare, category: 'transport', note: 'Bus ticket' },
  { label: 'Meal', amount: 150, category: 'food', note: 'Meal' },
];

export const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Last 7 days' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
];
