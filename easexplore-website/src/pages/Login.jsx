import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PasswordField from '@/components/auth/PasswordField';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import TextField from '@/components/ui/TextField';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { requestPasswordReset, signIn, signUp } from '@/services/auth';
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateExistingPassword,
  validateName,
  validateNewPassword,
} from '@/utils/validation';

const MODES = {
  login: {
    title: 'Welcome back',
    description: 'Log in to your EaseXplore account.',
    submit: 'Log in',
  },
  signup: {
    title: 'Create your account',
    description: 'Free to join. Save your plans and keep track of your budget.',
    submit: 'Create account',
  },
  forgot: {
    title: 'Reset your password',
    description: 'Enter your email and we will send you a link to choose a new password.',
    submit: 'Send reset link',
  },
};

const BENEFITS = [
  { icon: 'route', text: 'Save your day plans and come back to them' },
  { icon: 'account_balance_wallet', text: 'Track your daily budget and split bills' },
  { icon: 'favorite', text: 'Keep a list of your favourite food spots' },
];

// Maps an error key to the id of its input, so the first error can receive focus.
const FIELD_IDS = { fullName: 'auth-name', email: 'auth-email', password: 'auth-password' };

/** Email links that failed (expired or already used) arrive with an error in the address. */
function readLinkError() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return params.get('error_description') ? 'That link is invalid or has expired. Please request a new one.' : '';
}

export default function Login() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  const [mode, setMode] = useState(location.state?.mode === 'forgot' ? 'forgot' : 'login');
  const [values, setValues] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(readLinkError);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in (or just logged in): go back to where they came from.
  if (!loading && user) {
    const from = location.state?.from?.pathname;
    const target = from && from !== ROUTES.login.path ? from : ROUTES.dashboard.path;
    return <Navigate to={target} replace />;
  }

  const copy = MODES[mode];

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError('');
    setNotice('');
    setValues((current) => ({ ...current, password: '' }));
  };

  const validate = () => {
    const found = {};
    if (mode === 'signup') {
      const message = validateName(values.fullName);
      if (message) found.fullName = message;
    }
    const emailMessage = validateEmail(values.email);
    if (emailMessage) found.email = emailMessage;
    if (mode === 'signup') {
      const message = validateNewPassword(values.password);
      if (message) found.password = message;
    } else if (mode === 'login') {
      const message = validateExistingPassword(values.password);
      if (message) found.password = message;
    }
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    const found = validate();
    setErrors(found);
    const firstInvalid = Object.keys(FIELD_IDS).find((key) => found[key]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    const email = values.email.trim();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn({ email, password: values.password });
        // The page redirects by itself as soon as the login is confirmed.
      } else if (mode === 'signup') {
        const result = await signUp({ email, password: values.password, fullName: values.fullName.trim() });
        if (result.alreadyRegistered) {
          setFormError('We could not create a new account with that email. If you already have one, log in or reset your password.');
        } else if (result.needsEmailConfirmation) {
          setNotice(`We sent a confirmation link to ${email}. Open it to finish creating your account, then log in.`);
          setValues((current) => ({ ...current, password: '' }));
        }
      } else {
        await requestPasswordReset(email);
        setNotice('If an account exists for that email, a link to reset your password is on its way. Check your inbox and spam folder.');
      }
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-space-xl">
      <div className="mx-auto grid max-w-5xl items-stretch gap-6 lg:grid-cols-2">
        {/* Benefits panel (large screens only) */}
        <div className="hidden flex-col justify-between rounded-3xl bg-gradient-to-br from-primary via-primary-container to-secondary p-10 text-on-primary shadow-xl lg:flex">
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight text-white">Your Pune, planned.</h2>
            <p className="mt-3 text-body-lg text-white/90">
              An account keeps your plans, budget and favourites safe, on any device.
            </p>
          </div>
          <ul className="mt-10 flex flex-col gap-5">
            {BENEFITS.map((benefit) => (
              <li key={benefit.text} className="flex items-center gap-4 text-body-lg text-white">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Icon name={benefit.icon} />
                </span>
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>

        <Card className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold text-on-surface">{copy.title}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">{copy.description}</p>

          {!isConfigured && (
            <Alert tone="info" title="Accounts are not switched on yet" className="mt-5">
              You can still use the planner, fare calculator and food guide.
              {import.meta.env.DEV && (
                <span className="mt-1 block text-body-sm">
                  For developers: add your Supabase keys to the .env file (see SUPABASE_SETUP.md), then restart
                  npm run dev.
                </span>
              )}
            </Alert>
          )}
          {formError && (
            <Alert tone="error" className="mt-5">
              {formError}
            </Alert>
          )}
          {notice && (
            <Alert tone="success" className="mt-5">
              {notice}
            </Alert>
          )}

          <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {mode === 'signup' && (
              <TextField
                id={FIELD_IDS.fullName}
                label="Your name"
                autoComplete="name"
                value={values.fullName}
                onChange={update('fullName')}
                error={errors.fullName}
              />
            )}
            <TextField
              id={FIELD_IDS.email}
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={update('email')}
              error={errors.email}
            />
            {mode !== 'forgot' && (
              <PasswordField
                id={FIELD_IDS.password}
                label="Password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={values.password}
                onChange={update('password')}
                error={errors.password}
                hint={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
              />
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="self-start text-label-lg text-primary hover:underline"
              >
                Forgot your password?
              </button>
            )}

            <Button type="submit" size="lg" fullWidth loading={submitting} disabled={!isConfigured}>
              {copy.submit}
            </Button>
          </form>

          <p className="mt-6 text-center text-body-md text-on-surface-variant">
            {mode === 'login' && (
              <>
                New to EaseXplore?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-bold text-primary hover:underline">
                  Create an account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-bold text-primary hover:underline">
                  Log in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => switchMode('login')} className="font-bold text-primary hover:underline">
                Back to log in
              </button>
            )}
          </p>
        </Card>
      </div>
    </Container>
  );
}
