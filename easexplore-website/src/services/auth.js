import { ROUTES } from '@/config/routes';
import { supabase } from '@/services/supabase';

// All Supabase auth calls live here so pages and components never talk to
// Supabase directly. Every function throws an Error whose message is safe to
// show to the person using the site.

const NOT_CONFIGURED = 'Accounts are not available right now. Please try again later.';

/** Turns Supabase's technical errors into plain sentences. */
function friendlyMessage(error) {
  const code = error?.code ?? '';
  const message = (error?.message ?? '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'The email or password is incorrect.';
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for the confirmation link.';
  }
  if (code === 'user_already_exists' || message.includes('already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  // Must come before the weak-password check: Supabase words this error as
  // "New password should be different...", which would otherwise match "password should".
  if (code === 'same_password' || message.includes('different from the old password')) {
    return 'Choose a password that is different from your current one.';
  }
  if (code === 'weak_password' || message.includes('password should')) {
    return 'That password is too weak. Use at least 8 characters with a mix of letters and numbers.';
  }
  if (code.includes('rate_limit') || message.includes('rate limit') || error?.status === 429) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (code === 'email_address_not_authorized' || message.includes('not authorized')) {
    return 'We could not send an email to that address. Please contact support.';
  }
  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

function fail(error) {
  const friendly = new Error(friendlyMessage(error));
  friendly.cause = error;
  throw friendly;
}

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

const pageUrl = (path) => `${window.location.origin}${path}`;

/** Returns the current session, or null when nobody is logged in. */
export async function getSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Calls `callback(session)` whenever someone logs in or out. Returns an unsubscribe function. */
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/**
 * Creates an account. Resolves to:
 *  - needsEmailConfirmation: true when a confirmation email was sent
 *  - alreadyRegistered: true when that email already has an account
 *  - otherwise the person is logged in straight away
 */
export async function signUp({ email, password, fullName }) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: pageUrl(ROUTES.login.path),
    },
  });
  if (error) fail(error);

  // Supabase does not reveal whether an email is registered. An existing address
  // comes back as a user with no identities.
  const alreadyRegistered = Boolean(data.user) && Array.isArray(data.user.identities) && data.user.identities.length === 0;

  return {
    alreadyRegistered,
    needsEmailConfirmation: !data.session && !alreadyRegistered,
  };
}

export async function signIn({ email, password }) {
  const client = requireClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) fail(error);
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) fail(error);
}

/** Sends an email with a link to /reset-password. */
export async function requestPasswordReset(email) {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: pageUrl(ROUTES.resetPassword.path),
  });
  if (error) fail(error);
}

/** Sets a new password for the person who is currently logged in (including via a reset link). */
export async function updatePassword(password) {
  const client = requireClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) fail(error);
}
