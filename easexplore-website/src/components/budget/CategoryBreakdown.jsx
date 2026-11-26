import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { byCategory, formatMoney, sumPaise } from '@/utils/budget';

/** Where the money went in the chosen period. `expenses` is already filtered to that period. */
export default function CategoryBreakdown({ expenses, periodLabel }) {
  const rows = byCategory(expenses);
  const total = sumPaise(expenses);

  return (
    <Card as="section" aria-labelledby="breakdown-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="breakdown-title" className="text-headline-sm text-on-surface">
          Where the money went
        </h2>
        <p className="text-body-sm text-on-surface-variant">{periodLabel}</p>
      </div>

      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-body-md text-on-surface-variant">
          <Icon name="donut_small" className="text-primary" />
          Nothing spent in this period yet.
        </p>
      ) : (
        <>
          <p className="font-display text-3xl font-bold text-on-surface">{formatMoney(total)}</p>

          {/* The bar is a picture of the list below, so screen readers skip it. */}
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-surface-container-high" aria-hidden="true">
            {rows.map((row) => (
              <div key={row.category.id} className={row.category.bar} style={{ width: `${row.share * 100}%` }} />
            ))}
          </div>

          <ul className="flex flex-col gap-1">
            {rows.map((row) => (
              <li key={row.category.id} className="flex items-center justify-between gap-3 rounded-xl p-2">
                <span className="flex items-center gap-3">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${row.category.bar}`} aria-hidden="true" />
                  <Icon name={row.category.icon} size={20} className="text-on-surface-variant" />
                  <span className="text-title-md text-on-surface">{row.category.label}</span>
                </span>
                <span className="text-right">
                  <span className="block text-title-md font-bold text-on-surface">{formatMoney(row.paise)}</span>
                  <span className="block text-label-md text-on-surface-variant">{Math.round(row.share * 100)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
