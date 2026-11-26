// Turns Supabase database errors into plain sentences that are safe to show on screen.
// Raw error text (table names, policy names) is never shown to visitors.

/**
 * @param {object} error  the error returned by Supabase
 * @param {object} [options]
 * @param {string} [options.limitMessage]  shown when the per-account limit is reached
 * @param {string} [options.checkMessage]  shown when a value breaks a database rule
 */
export function friendlyDbError(
  error,
  {
    limitMessage = 'You have reached the limit. Delete something to add more.',
    checkMessage = 'That could not be saved. Please check what you entered.',
  } = {},
) {
  const code = error?.code ?? '';
  const message = (error?.message ?? '').toLowerCase();

  if (message.includes('too many')) return limitMessage;
  if (code === 'PGRST205' || code === '42P01' || message.includes('could not find the table')) {
    return 'Saving is not set up yet. Please try again later.';
  }
  if (code === '42501' || message.includes('permission denied') || message.includes('row-level security')) {
    return 'Saving is not allowed yet. Please try again later.';
  }
  if (code === 'PGRST301' || message.includes('jwt')) return 'Your login has expired. Please log in again.';
  if (code === '23514') return checkMessage;
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

/** An Error whose message is safe to show. The original error is kept in `cause` for debugging. */
export function makeDbError(error, options) {
  const friendly = new Error(friendlyDbError(error, options));
  friendly.cause = error;
  return friendly;
}

/**
 * While developing (never in the live site), adds a pointer to the setup file when the
 * message says the database tables are missing. Visitors never see this.
 */
export function withSetupHint(message, { file, part }) {
  const developing = import.meta.env?.DEV;
  if (!developing || !String(message).includes('not set up yet')) return message;
  return `${message} (Site owner: run supabase/${file} in the Supabase SQL Editor. See SUPABASE_SETUP.md, ${part}.)`;
}
