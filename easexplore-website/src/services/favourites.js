import { MAX_FAVOURITES } from '@/config/recommendations';
import { makeDbError } from '@/services/dbErrors';
import { supabase } from '@/services/supabase';

// Favourites live in the `favourites` table (see supabase/003_favourites.sql): one row per
// person and place id. Row Level Security makes sure people only ever see their own rows.

const NOT_CONFIGURED = 'Accounts are not available right now. Please try again later.';

function fail(error) {
  throw makeDbError(error, {
    limitMessage: `You have reached the limit of ${MAX_FAVOURITES} favourites. Remove some to add more.`,
    checkMessage: 'That place could not be saved.',
  });
}

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

/** The ids of the person's favourite places, oldest first. */
export async function listFavourites() {
  const client = requireClient();
  const { data, error } = await client
    .from('favourites')
    .select('place_id')
    .order('created_at', { ascending: true })
    .limit(MAX_FAVOURITES);
  if (error) fail(error);
  return (data ?? []).map((row) => row.place_id);
}

export async function addFavourite(placeId) {
  const client = requireClient();
  const { error } = await client.from('favourites').insert({ place_id: placeId });
  // 23505 means it was already saved (for example from another tab). That is fine.
  if (error && error.code !== '23505') fail(error);
}

export async function removeFavourite(placeId) {
  const client = requireClient();
  const { error } = await client.from('favourites').delete().eq('place_id', placeId);
  if (error) fail(error);
}
