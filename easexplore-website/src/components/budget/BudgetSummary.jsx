import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import TextField from '@/components/ui/TextField';
import { BUDGET_PRESETS, LIMITS } from '@/config/budget';
import { formatMoney, parseAmount, toPaise } from '@/utils/budget';

function Kpi({ icon, label, children, footer }) {
  return (
    <Card as="article" padding="md" className="flex flex-col justify-between gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-label-md uppercase tracking-wider text-on-surface-variant">{label}</p>
          <div className="mt-1">{children}</div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary">
          <Icon name={icon} size={20} />
        </span>
      </div>
      {footer}
    </Card>
  );
}

const STATUS = {
  none: { tone: 'neutral', icon: 'info', text: 'Set a budget to see what is left' },
  ok: { tone: 'primary', icon: 'verified', text: 'On track' },
  warning: { tone: 'secondary', icon: 'schedule', text: 'Close to your limit' },
  over: { tone: 'error', icon: 'warning', text: 'Over budget' },
};

/**
 * @param {object} props
 * @param {object} props.summary     from summarizeDay()
 * @param {number} props.weekPaise   total spent in the last 7 days
 * @param {(paise: number) => Promise<void>} props.onSaveBudget
 */
export default function BudgetSummary({ summary, weekPaise, onSaveBudget }) {
  const hasBudget = summary.budget !== null;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const formOpen = editing || !hasBudget;

  const openForm = () => {
    setText(hasBudget ? String(summary.budget / 100) : '');
    setError('');
    setEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    const parsed = parseAmount(text);
    if (parsed.error) return setError(parsed.error);
    if (parsed.paise < toPaise(LIMITS.minBudgetRupees) || parsed.paise > toPaise(LIMITS.maxBudgetRupees)) {
      return setError(
        `Choose a daily budget between ${formatMoney(toPaise(LIMITS.minBudgetRupees))} and ${formatMoney(toPaise(LIMITS.maxBudgetRupees))}.`,
      );
    }
    setSaving(true);
    try {
      await onSaveBudget(parsed.paise);
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const status = STATUS[summary.status];
  const statusText = summary.status === 'over' ? `Over budget by ${formatMoney(summary.over)}` : status.text;

  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-4">
      <h2 id="summary-title" className="sr-only">
        Budget summary
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon="account_balance_wallet"
          label="Daily budget"
          footer={
            hasBudget && !editing ? (
              <Button variant="outline" size="sm" icon="edit" onClick={openForm} className="self-start">
                Change
              </Button>
            ) : null
          }
        >
          <p className="font-display text-3xl font-bold text-on-surface">
            {hasBudget ? formatMoney(summary.budget) : 'Not set'}
          </p>
        </Kpi>

        <Kpi
          icon="payments"
          label="Spent today"
          footer={
            hasBudget ? (
              <div
                role="progressbar"
                aria-label="Share of today's budget spent"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={summary.percent}
                className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-high"
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    summary.status === 'over' ? 'bg-error' : summary.status === 'warning' ? 'bg-secondary-container' : 'bg-primary'
                  }`}
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
            ) : null
          }
        >
          <p className="font-display text-3xl font-bold text-on-surface">{formatMoney(summary.spent)}</p>
          <p className="text-body-sm text-on-surface-variant">
            {summary.count} {summary.count === 1 ? 'expense' : 'expenses'}
            {hasBudget ? ` · ${summary.percent}% used` : ''}
          </p>
        </Kpi>

        <Kpi icon="savings" label="Left today" footer={<Badge tone={status.tone} icon={status.icon} className="self-start">{statusText}</Badge>}>
          <p className="font-display text-3xl font-bold text-on-surface">
            {hasBudget ? formatMoney(summary.left) : '—'}
          </p>
        </Kpi>

        <Kpi icon="date_range" label="Last 7 days">
          <p className="font-display text-3xl font-bold text-on-surface">{formatMoney(weekPaise)}</p>
          <p className="text-body-sm text-on-surface-variant">Total spent, including today</p>
        </Kpi>
      </div>

      {formOpen && (
        <Card as="form" noValidate onSubmit={handleSave} padding="md" className="flex flex-col gap-4">
          <h3 className="text-headline-sm text-on-surface">{hasBudget ? 'Change your daily budget' : 'Set a daily budget'}</h3>
          <p className="text-body-sm text-on-surface-variant">
            How much you plan to spend in a day. We will show how much is left as you add expenses.
          </p>
          <div role="group" aria-label="Quick budgets" className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((amount) => (
              <Chip key={amount} selected={parseAmount(text).paise === toPaise(amount)} onClick={() => setText(String(amount))}>
                {formatMoney(toPaise(amount))}
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField
              id="daily-budget"
              label="Daily budget (₹)"
              inputMode="decimal"
              placeholder="e.g. 1500"
              value={text}
              onChange={(event) => setText(event.target.value)}
              error={error || undefined}
              className="sm:max-w-xs sm:flex-1"
              autoComplete="off"
            />
            <div className="flex gap-2">
              <Button type="submit" loading={saving} icon="check">
                Save budget
              </Button>
              {hasBudget && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {summary.status === 'over' && (
        <Alert tone="error" title="You have gone over today's budget">
          You have spent {formatMoney(summary.over)} more than the {formatMoney(summary.budget)} you planned for today.
        </Alert>
      )}
    </section>
  );
}
