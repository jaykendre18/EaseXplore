import { MAX_SAVED_PLANS } from '@/config/itinerary';
import { makeDbError } from '@/services/dbErrors';
import { supabase } from '@/services/supabase';

// Saved plans live in the `itineraries` table (see supabase/001_itineraries.sql).
// Row Level Security in the database makes sure people only ever see their own rows,
// so none of these functions need to pass a user id.
//
// What is stored is the person's SETTINGS (vibe, budget, group size, time slot, pinned
// and removed places) plus a small summary, not the full plan. Opening a saved plan
// rebuilds it, so it always uses the latest places and fares.

const TABLE = 'itineraries';
const COLUMNS = 'id, title, inputs, summary, created_at';
const NOT_CONFIGURED = 'Accounts are not available right now. Please try again later.';

function fail(error) {
  throw makeDbError(error, {
    limitMessage: `You have reached the limit of ${MAX_SAVED_PLANS} saved plans. Delete one to save another.`,
    checkMessage: 'That plan could not be saved. Try a shorter name.',
  });
}

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

/** The person's saved plans, newest first. */
export async function listItineraries(limit = MAX_SAVED_PLANS) {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) fail(error);
  return data ?? [];
}

/** The most recently saved plan, or null. */
export async function latestItinerary() {
  const [latest] = await listItineraries(1);
  return latest ?? null;
}

/** Saves a plan and returns the saved row. */
export async function saveItinerary({ title, inputs, summary }) {
  const client = requireClient();
  const { data, error } = await client
    .from(TABLE)
    .insert({ title: String(title).trim().slice(0, 80), inputs, summary })
    .select(COLUMNS)
    .single();
  if (error) fail(error);
  return data;
}

export async function deleteItinerary(id) {
  const client = requireClient();
  const { error } = await client.from(TABLE).delete().eq('id', id);
  if (error) fail(error);
}
