import { useState } from 'react';
import PasswordField from '@/components/auth/PasswordField';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { updatePassword } from '@/services/auth';
import { MIN_PASSWORD_LENGTH, validateNewPassword } from '@/utils/validation';

/**
 * Used in two ways:
 *  1. Someone clicks the link in a password reset email. Supabase logs them in
 *     briefly, and this page lets them choose a new password.
 *  2. A logged-in person chooses "Change password" on the Dashboard.
 */
export default function ResetPassword() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const found = {};
    const passwordMessage = validateNewPassword(password);
    if (passwordMessage) found.password = passwordMessage;
    if (!passwordMessage && confirm !== password) found.confirm = 'The two passwords do not match.';
    setErrors(found);
    if (found.password) return document.getElementById('reset-password')?.focus();
    if (found.confirm) return document.getElementById('reset-confirm')?.focus();

    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  let body;

  if (loading) {
    body = (
      <p className="flex items-center gap-2 text-on-surface-variant" role="status">
        <Icon name="progress_activity" className="animate-spin" />
        Checking your link…
      </p>
    );
  } else if (!user) {
    body = (
      <>
        <Alert tone="error" title="This link is invalid or has expired">
          Password reset links work once and expire after a short time.
        </Alert>
        <Button to={ROUTES.login.path} state={{ mode: 'forgot' }} className="mt-5 self-start">
          Request a new link
        </Button>
      </>
    );
  } else if (done) {
    body = (
      <>
        <Alert tone="success" title="Password updated">
          Your new password is saved. You are logged in.
        </Alert>
        <Button to={ROUTES.dashboard.path} className="mt-5 self-start" iconRight="arrow_forward">
          Go to dashboard
        </Button>
      </>
    );
  } else {
    body = (
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: '' }));
          }}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        />
        <PasswordField
          id="reset-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value);
            setErrors((current) => ({ ...current, confirm: '' }));
          }}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Save new password
        </Button>
      </form>
    );
  }

  return (
    <Container className="py-space-xl">
      <Card className="mx-auto flex max-w-md flex-col">
        <h1 className="mb-6 font-display text-3xl font-bold text-on-surface">Choose a new password</h1>
        {body}
      </Card>
    </Container>
  );
}
