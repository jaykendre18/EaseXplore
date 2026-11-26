import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { withSetupHint } from '@/services/dbErrors';
import { deleteItinerary, listItineraries } from '@/services/itineraries';
import { formatRupees } from '@/utils/fares';

function describe(plan) {
  const { summary = {} } = plan;
  const parts = [];
  if (summary.days > 1) parts.push(`${summary.days} days`);
  if (Number.isFinite(summary.stops)) parts.push(`${summary.stops} stops`);
  if (Number.isFinite(summary.perPerson)) parts.push(`about ${formatRupees(summary.perPerson)} each`);
  parts.push(new Date(plan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
  return parts.join(' · ');
}

/** The logged-in person's saved plans. Renders nothing for logged-out visitors. */
export default function SavedPlans({ refreshKey, onLoad }) {
  const { user, isConfigured } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState({ status: 'loading', plans: [], error: '' });
  const [busyId, setBusyId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!userId || !isConfigured) return undefined;
    let active = true;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    listItineraries()
      .then((plans) => active && setState({ status: 'ready', plans, error: '' }))
      .catch((error) => active && setState({ status: 'error', plans: [], error: error.message }));
    return () => {
      active = false;
    };
  }, [userId, isConfigured, refreshKey]);

  if (!isConfigured || !userId) return null;

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete “${plan.title}”? This cannot be undone.`)) return;
    setBusyId(plan.id);
    setDeleteError('');
    try {
      await deleteItinerary(plan.id);
      setState((current) => ({ ...current, plans: current.plans.filter((item) => item.id !== plan.id) }));
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card as="section" aria-labelledby="saved-title" className="flex flex-col gap-4 print:hidden">
      <h2 id="saved-title" className="text-headline-sm text-on-surface">
        Your saved plans
      </h2>

      {state.status === 'loading' && (
        <p className="flex items-center gap-2 text-body-md text-on-surface-variant" role="status">
          <Icon name="progress_activity" className="animate-spin" />
          Loading your plans…
        </p>
      )}
      {state.status === 'error' && (
        <Alert tone="error">{withSetupHint(state.error, { file: '001_itineraries.sql', part: 'Part 6' })}</Alert>
      )}
      {deleteError && <Alert tone="error">{deleteError}</Alert>}

      {state.status === 'ready' && state.plans.length === 0 && (
        <p className="text-body-md text-on-surface-variant">
          No saved plans yet. Build a plan above and save it from the summary panel.
        </p>
      )}

      {state.plans.length > 0 && (
        <ul className="flex flex-col gap-3">
          {state.plans.map((plan) => (
            <li
              key={plan.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-title-md text-on-surface">{plan.title}</p>
                <p className="text-body-sm text-on-surface-variant">{describe(plan)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" icon="folder_open" onClick={() => onLoad(plan)}>
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon="delete"
                  loading={busyId === plan.id}
                  onClick={() => handleDelete(plan)}
                  aria-label={`Delete ${plan.title}`}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
