import PlanActions from '@/components/itinerary/PlanActions';
import Alert from '@/components/ui/Alert';
import Card from '@/components/ui/Card';
import { formatRupees } from '@/utils/fares';
import { formatTime } from '@/utils/itinerary';

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

/** Totals and budget for the day being shown. */
export default function PlanSummary({ plan, day, inputs, onSaved }) {
  const { totals } = day;
  const share = plan.budget > 0 ? Math.min(100, Math.round((totals.total / plan.budget) * 100)) : 0;
  const heading = plan.days.length > 1 ? `Day ${day.number} summary` : 'Plan summary';

  return (
    <Card as="aside" aria-labelledby="summary-title" className="flex flex-col gap-5">
      <h2 id="summary-title" className="text-headline-sm text-on-surface">
        {heading}
      </h2>

      <div>
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">Estimated per person</p>
        <p className="font-display text-5xl font-bold text-on-surface">{formatRupees(totals.total)}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">of your {formatRupees(plan.budget)} budget</p>
        <div
          role="progressbar"
          aria-label="Budget used"
          aria-valuemin={0}
          aria-valuemax={plan.budget}
          aria-valuenow={totals.total}
          className="mt-3 h-3 w-full overflow-hidden rounded-full bg-surface-container-high"
        >
          <div
            className={`h-full rounded-full transition-all ${share >= 90 ? 'bg-secondary-container' : 'bg-primary'}`}
            style={{ width: `${share}%` }}
          />
        </div>
      </div>

      <dl className="flex flex-col gap-2 border-t border-outline-variant/40 pt-4 text-body-md">
        <Row label="Stops" value={totals.count} />
        <Row label="Entry, food and shopping" value={formatRupees(totals.places)} />
        <Row label="Auto rides" value={formatRupees(totals.travel)} />
        {totals.count > 0 && <Row label="Finish around" value={formatTime(day.endsAt)} />}
      </dl>

      {plan.warnings.map((warning) => (
        <Alert key={warning.text} tone={warning.tone === 'error' ? 'error' : 'info'}>
          {warning.text}
        </Alert>
      ))}

      <p className="text-body-sm text-on-surface-variant">
        Costs are rough estimates for planning, not quotes. Travel distances are estimated, so check the route in
        Maps. Opening times change, so please check before you go.
      </p>

      {totals.count > 0 && <PlanActions plan={plan} dayNumber={day.number} inputs={inputs} onSaved={onSaved} />}
    </Card>
  );
}
