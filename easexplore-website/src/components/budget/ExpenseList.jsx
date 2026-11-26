import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { CATEGORIES } from '@/config/budget';
import { dateLabel, formatMoney, groupByDate } from '@/utils/budget';

const PAGE_SIZE = 50;

/**
 * @param {object} props
 * @param {object[]} props.expenses  newest first, already filtered to the chosen period
 * @param {string} props.today       today's date as YYYY-MM-DD
 * @param {(id: string) => Promise<void>} props.onRemove
 */
export default function ExpenseList({ expenses, today, onRemove }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const visible = expenses.slice(0, shown);
  const groups = groupByDate(visible);

  const handleRemove = async (item) => {
    const label = item.note || CATEGORIES.find((c) => c.id === item.category)?.label || 'this expense';
    if (!window.confirm(`Delete “${label}” (${formatMoney(item.amountPaise)})? This cannot be undone.`)) return;
    setBusyId(item.id);
    setError('');
    try {
      await onRemove(item.id);
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card as="section" aria-labelledby="list-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="list-title" className="text-headline-sm text-on-surface">
          Your expenses
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {expenses.length === 0 ? (
        <p className="flex items-center gap-2 text-body-md text-on-surface-variant">
          <Icon name="receipt_long" className="text-primary" />
          No expenses in this period. Add one above.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 border-b border-outline-variant/40 pb-2">
                <h3 className="text-label-lg font-bold text-on-surface">{dateLabel(group.date, today)}</h3>
                <p className="text-label-md text-on-surface-variant">{formatMoney(group.totalPaise)}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => {
                  const category = CATEGORIES.find((c) => c.id === item.category) ?? CATEGORIES[CATEGORIES.length - 1];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary">
                          <Icon name={category.icon} size={20} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-title-md text-on-surface">{item.note || category.label}</p>
                          <p className="text-body-sm text-on-surface-variant">{category.label}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <p className="text-title-md font-bold text-on-surface">{formatMoney(item.amountPaise)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="delete"
                          loading={busyId === item.id}
                          onClick={() => handleRemove(item)}
                          aria-label={`Delete ${item.note || category.label}, ${formatMoney(item.amountPaise)}`}
                        >
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {expenses.length > shown && (
            <Button variant="outline" onClick={() => setShown((count) => count + PAGE_SIZE)} className="self-center">
              Show more ({expenses.length - shown} more)
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
