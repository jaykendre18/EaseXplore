import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import Icon from '@/components/ui/Icon';
import { BUDGET, PEOPLE, SIESTA, VIBES, WINDOWS } from '@/config/itinerary';
import { ROUTES } from '@/config/routes';
import { formatRupees } from '@/utils/fares';

function StepButton({ label, icon, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

/**
 * `inputs` is { vibe, windowId, budget, people, ... }. `onChange` receives just the changed fields.
 * `dailyBudget` is the suggestion from plannerBudgetFor() (or null), shown once the budget has loaded
 * (`budgetReady`). `onUseDailyBudget` sets the planner budget to it.
 */
export default function PlannerForm({ inputs, onChange, dailyBudget = null, budgetReady = true, onUseDailyBudget }) {
  const vibe = VIBES.find((item) => item.id === inputs.vibe);
  const win = WINDOWS.find((item) => item.id === inputs.windowId);

  return (
    <Card className="flex flex-col gap-8 print:hidden">
      <div className="flex flex-col gap-3">
        <h2 id="vibe-label" className="text-headline-sm text-on-surface">
          1. Choose your vibe
        </h2>
        <div role="group" aria-labelledby="vibe-label" className="flex flex-wrap gap-2">
          {VIBES.map((item) => (
            <Chip
              key={item.id}
              icon={item.icon}
              selected={inputs.vibe === item.id}
              onClick={() => onChange({ vibe: item.id })}
            >
              {item.label}
            </Chip>
          ))}
        </div>
        {vibe && <p className="text-body-sm text-on-surface-variant">{vibe.blurb}</p>}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="budget" className="text-headline-sm text-on-surface">
              2. Budget
            </label>
            <span className="font-display text-2xl font-bold text-primary">{formatRupees(inputs.budget)}</span>
          </div>
          <input
            id="budget"
            type="range"
            min={BUDGET.min}
            max={BUDGET.max}
            step={BUDGET.step}
            value={inputs.budget}
            onChange={(event) => onChange({ budget: Number(event.target.value) })}
            aria-valuetext={`${formatRupees(inputs.budget)} per person per day`}
            className="h-2 w-full cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-label-md text-on-surface-variant">
            <span>{formatRupees(BUDGET.min)}</span>
            <span>{formatRupees(BUDGET.max)}</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Per person, per day. Entry fees, food, shopping and auto rides all count.
          </p>
          {budgetReady &&
            (dailyBudget ? (
              <div className="rounded-2xl bg-primary-fixed/40 p-3 text-body-sm text-on-surface">
                <p className="flex items-start gap-2">
                  <Icon name="savings" size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    Your daily budget is <strong className="font-bold">{dailyBudget.dailyLabel}</strong>.{' '}
                    {dailyBudget.note}
                    {inputs.budget === dailyBudget.budget ? ' The planner is using it.' : ''}
                  </span>
                </p>
                {inputs.budget !== dailyBudget.budget && (
                  <Button variant="outline" size="sm" onClick={onUseDailyBudget} className="mt-2">
                    Use my daily budget ({formatRupees(dailyBudget.budget)})
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                Tip:{' '}
                <Link to={ROUTES.budget.path} className="font-semibold text-primary underline">
                  set a daily budget
                </Link>{' '}
                and the planner will use it.
              </p>
            ))}
        </div>

        <div className="flex flex-col gap-3">
          <h2 id="people-label" className="text-headline-sm text-on-surface">
            3. How many people?
          </h2>
          <div role="group" aria-labelledby="people-label" className="flex items-center gap-4">
            <StepButton
              label="Fewer people"
              icon="remove"
              disabled={inputs.people <= PEOPLE.min}
              onClick={() => onChange({ people: inputs.people - 1 })}
            />
            <output aria-live="polite" className="min-w-[2ch] text-center font-display text-3xl font-bold text-on-surface">
              {inputs.people}
            </output>
            <StepButton
              label="More people"
              icon="add"
              disabled={inputs.people >= PEOPLE.max}
              onClick={() => onChange({ people: inputs.people + 1 })}
            />
          </div>
          <p className="text-body-sm text-on-surface-variant">
            An auto carries up to {PEOPLE.perAuto} people, and auto fares are shared.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 id="window-label" className="text-headline-sm text-on-surface">
          4. When are you going?
        </h2>
        <div role="group" aria-labelledby="window-label" className="flex flex-wrap gap-2">
          {WINDOWS.map((item) => (
            <Chip key={item.id} selected={inputs.windowId === item.id} onClick={() => onChange({ windowId: item.id })}>
              {item.label}
            </Chip>
          ))}
        </div>
        {win && (
          <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Icon name="schedule" size={16} className="text-primary" />
            {win.hours}. Places that likely close from {SIESTA.label} are planned around it.
          </p>
        )}
      </div>
    </Card>
  );
}
