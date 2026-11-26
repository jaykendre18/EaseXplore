import { LIMITS } from '@/config/budget';
import { makeDbError } from '@/services/dbErrors';
import { supabase } from '@/services/supabase';

// Expenses and the daily budget live in the `expenses` and `budget_settings` tables
// (see supabase/002_budget.sql). Row Level Security makes sure people only ever see
// and change their own rows.
//
// Amounts are whole PAISE in the database and in the app. Rows are converted to the
// shape the app uses: { id, amountPaise, category, spentOn, note, createdAt }.

const NOT_CONFIGURED = 'Accounts are not available right now. Please try again later.';
const EXPENSE_COLUMNS = 'id, amount_paise, category, spent_on, note, created_at';

function fail(error) {
  throw makeDbError(error, {
    limitMessage: `You have reached the limit of ${LIMITS.maxExpenses} saved expenses. Delete some old ones to add more.`,
    checkMessage: 'That expense could not be saved. Please check the amount, date and note.',
  });
}

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

const fromRow = (row) => ({
  id: row.id,
  amountPaise: row.amount_paise,
  category: row.category,
  spentOn: row.spent_on,
  note: row.note ?? '',
  createdAt: row.created_at,
});

/** The person's latest expenses (newest first, up to the list limit). */
export async function listExpenses() {
  const client = requireClient();
  const { data, error } = await client
    .from('expenses')
    .select(EXPENSE_COLUMNS)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(LIMITS.listLimit);
  if (error) fail(error);
  return (data ?? []).map(fromRow);
}

/** Saves one expense and returns it. */
export async function saveExpense({ amountPaise, category, spentOn, note }) {
  const client = requireClient();
  const { data, error } = await client
    .from('expenses')
    .insert({ amount_paise: amountPaise, category, spent_on: spentOn, note })
    .select(EXPENSE_COLUMNS)
    .single();
  if (error) fail(error);
  return fromRow(data);
}

export async function deleteExpense(id) {
  const client = requireClient();
  const { error } = await client.from('expenses').delete().eq('id', id);
  if (error) fail(error);
}

/** The daily budget in paise, or null when none has been set. */
export async function getDailyBudget() {
  const client = requireClient();
  const { data, error } = await client.from('budget_settings').select('daily_budget_paise').maybeSingle();
  if (error) fail(error);
  return data?.daily_budget_paise ?? null;
}

/** Sets (or changes) the daily budget. `userId` must be the logged-in person's id. */
export async function saveDailyBudget(userId, paise) {
  const client = requireClient();
  const { error } = await client
    .from('budget_settings')
    .upsert({ user_id: userId, daily_budget_paise: paise, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) fail(error);
}
