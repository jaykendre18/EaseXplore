import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { useBudget } from '@/context/BudgetContext';
import { latestItinerary } from '@/services/itineraries';
import { formatRupees } from '@/utils/fares';
import { formatMoney, summarizeDay, todayISO } from '@/utils/budget';

const TOOLS = [
  { route: ROUTES.itinerary, text: 'Build a day plan around the afternoon break.' },
  { route: ROUTES.transport, text: 'Compare metro, bus and auto, and check the fare for your distance.' },
  { route: ROUTES.budget, text: 'Track your spending and split bills with friends.' },
  { route: ROUTES.recommendations, text: 'Find local food spots and budget stays.' },
];

function firstNameOf(user) {
  const fullName = (user.user_metadata?.full_name || '').trim();
  if (fullName) return fullName.split(/\s+/)[0];
  return (user.email || 'there').split('@')[0];
}

function EmptyState({ icon, title, text, action }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
        <Icon name={icon} />
      </span>
      <div>
        <h3 className="text-headline-sm text-on-surface">{title}</h3>
        <p className="mt-1 max-w-sm text-body-md text-on-surface-variant">{text}</p>
      </div>
      {action}
    </div>
  );
}

/** Today's spending against the daily budget, or an invitation to set one. */
function TodaysBudget() {
  const { status, expenses, dailyBudget } = useBudget();
  const summary = summarizeDay(expenses, todayISO(), dailyBudget);

  if (status === 'loading') {
    return <EmptyState icon="account_balance_wallet" title="Today's budget" text="Loading your budget…" />;
  }

  if (summary.budget === null) {
    return (
      <EmptyState
        icon="account_balance_wallet"
        title="Today's budget"
        text={
          status === 'error'
            ? 'We could not load your budget just now. You can still open the budget page.'
            : 'You have not set a daily budget yet. Set one to see how much is left as you spend.'
        }
        action={
          <Button to={ROUTES.budget.path} variant="outline" size="sm">
            Set up budget
          </Button>
        }
      />
    );
  }

  const statusText =
    summary.status === 'over'
      ? `Over budget by ${formatMoney(summary.over)}.`
      : summary.status === 'warning'
        ? 'Close to your limit.'
        : 'On track.';

  return (
    <EmptyState
      icon="account_balance_wallet"
      title="Today's budget"
      text={`${formatMoney(summary.spent)} spent of ${formatMoney(summary.budget)}. ${formatMoney(summary.left)} left. ${statusText}`}
      action={
        <Button to={ROUTES.budget.path} variant="outline" size="sm">
          Add an expense
        </Button>
      }
    />
  );
}

/** Shows the most recently saved day plan, or an invitation to make one. */
function LatestPlan() {
  const [state, setState] = useState({ status: 'loading', plan: null });

  useEffect(() => {
    let active = true;
    latestItinerary()
      .then((plan) => active && setState({ status: 'ready', plan }))
      .catch(() => active && setState({ status: 'error', plan: null }));
    return () => {
      active = false;
    };
  }, []);

  const { plan } = state;

  if (plan) {
    const { summary = {} } = plan;
    const details = [
      Number.isFinite(summary.stops) ? `${summary.stops} stops` : null,
      Number.isFinite(summary.perPerson) ? `about ${formatRupees(summary.perPerson)} per person` : null,
    ].filter(Boolean);
    return (
      <EmptyState
        icon="route"
        title={plan.title}
        text={`${details.join(' · ')}${details.length ? '. ' : ''}Your latest saved plan.`}
        action={
          <Button to={ROUTES.itinerary.path} variant="outline" size="sm">
            Open the planner
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon="route"
      title="Your day plan"
      text={
        state.status === 'error'
          ? 'We could not load your saved plans just now. You can still build a new one.'
          : state.status === 'loading'
            ? 'Checking for saved plans…'
            : 'No saved plan yet. Build one that works around the afternoon shop break.'
      }
      action={
        <Button to={ROUTES.itinerary.path} variant="outline" size="sm">
          Plan a day
        </Button>
      }
    />
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  // ProtectedRoute guarantees a user here.
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError('');
    try {
      await signOut();
      navigate(ROUTES.home.path, { replace: true });
    } catch (error) {
      setSignOutError(error.message);
      setSigningOut(false);
    }
  };

  return (
    <Container className="flex flex-col gap-space-xl py-space-xl">
      <header>
        <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">
          Welcome back, {firstNameOf(user)}
        </h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">Here is your Pune toolkit.</p>
      </header>

      <section aria-labelledby="summary-title" className="grid gap-6 md:grid-cols-2">
        <h2 id="summary-title" className="sr-only">
          Your summary
        </h2>
        <Card>
          <TodaysBudget />
        </Card>
        <Card>
          <LatestPlan />
        </Card>
      </section>

      <section aria-labelledby="tools-title">
        <h2 id="tools-title" className="mb-4 text-headline-md text-on-surface">
          Your tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map(({ route, text }) => (
            <Card
              key={route.path}
              as={Link}
              to={route.path}
              padding="md"
              hoverable
              className="group flex flex-col gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed transition-transform group-hover:scale-110">
                <Icon name={route.icon} />
              </span>
              <span className="text-title-md text-on-surface">{route.label}</span>
              <span className="text-body-sm text-on-surface-variant">{text}</span>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="account-title">
        <Card className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 id="account-title" className="text-headline-sm text-on-surface">
              Your account
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">{user.email}</p>
            {memberSince && <p className="text-body-sm text-on-surface-variant">Member since {memberSince}</p>}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button to={ROUTES.resetPassword.path} variant="outline" icon="lock">
                Change password
              </Button>
              <Button variant="tonal" icon="logout" onClick={handleSignOut} loading={signingOut}>
                Log out
              </Button>
            </div>
            {signOutError && <Alert tone="error">{signOutError}</Alert>}
          </div>
        </Card>
      </section>
    </Container>
  );
}
