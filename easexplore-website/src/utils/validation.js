// Each validator returns an error message, or an empty string when the value is fine.

export const MIN_PASSWORD_LENGTH = 8;

export function validateName(value) {
  return value.trim() ? '' : 'Enter your name.';
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address, like name@example.com.';
  return '';
}

/** For choosing a new password (sign up and reset). */
export function validateNewPassword(value) {
  if (!value) return 'Enter a password.';
  if (value.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  return '';
}

/** For logging in. Older accounts may have shorter passwords, so only check it is filled in. */
export function validateExistingPassword(value) {
  return value ? '' : 'Enter your password.';
}
