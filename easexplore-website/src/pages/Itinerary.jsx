import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DayTimeline from '@/components/itinerary/DayTimeline';
import PlannerForm from '@/components/itinerary/PlannerForm';
import PlanSummary from '@/components/itinerary/PlanSummary';
import SavedPlans from '@/components/itinerary/SavedPlans';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { useBudget } from '@/context/BudgetContext';
import { PLACES } from '@/data/places';
import { formatRupees } from '@/utils/fares';
import { buildItinerary, inputsFromParams, plannerBudgetFor, sanitizeInputs } from '@/utils/itinerary';

const nameOf = (id) => PLACES.find((place) => place.id === id)?.name ?? id;

export default function Itinerary() {
  const [searchParams] = useSearchParams();
  // Links can open the planner ready-made: ?query=, ?pins=, ?vibe= and ?window= (see inputsFromParams).
  const { inputs: urlInputs, queryText, queryMatch } = useMemo(() => inputsFromParams(searchParams), [searchParams]);

  // The planner starts from the daily budget set on the Budget page (if there is one).
  const { status: budgetStatus, dailyBudget } = useBudget();
  const dailySuggestion = useMemo(() => plannerBudgetFor(dailyBudget), [dailyBudget]);
  const suggestedBudget = dailySuggestion?.budget;

  // The starting settings come from the link (a Home search, a trail, or "Add to my plan").
  // The budget comes from the daily budget when there is one.
  const [inputs, setInputs] = useState(() => ({ ...urlInputs, budget: suggestedBudget ?? urlInputs.budget }));
  // Once the person moves the budget slider (or opens a saved plan), their choice wins.
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [dayIndex, setDayIndex] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [openedNote, setOpenedNote] = useState('');

  const plan = useMemo(() => buildItinerary(inputs), [inputs]);
  const day = plan.days[Math.min(dayIndex, plan.days.length - 1)];

  // The daily budget can arrive after the page opens (it loads from the account), so apply it then too.
  useEffect(() => {
    if (suggestedBudget === undefined || budgetTouched) return;
    setInputs((current) => (current.budget === suggestedBudget ? current : { ...current, budget: suggestedBudget }));
  }, [suggestedBudget, budgetTouched]);

  const update = (changes) => {
    setOpenedNote('');
    if ('budget' in changes) setBudgetTouched(true);
    setInputs((current) => ({ ...current, ...changes }));
  };

  const useDailyBudget = () => {
    if (!dailySuggestion) return;
    setBudgetTouched(false);
    setInputs((current) => ({ ...current, budget: dailySuggestion.budget }));
  };

  const removeStop = (id) => {
    setOpenedNote('');
    setInputs((current) => ({
      ...current,
      excluded: current.excluded.includes(id) ? current.excluded : [...current.excluded, id],
      pinned: current.pinned.filter((pinnedId) => pinnedId !== id),
    }));
  };

  const openSaved = (saved) => {
    setBudgetTouched(true);
    setInputs(sanitizeInputs(saved.inputs));
    setDayIndex(0);
    setOpenedNote(`Opened “${saved.title}”. It was rebuilt with the latest places and fares.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container className="py-space-xl">
      <header className="flex flex-col gap-3">
        <Badge tone="secondary" icon="bedtime" className="self-start">
          Afternoon-break aware
        </Badge>
        <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">
          Smart Itinerary &amp; Day Curator
        </h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">
          Pick your vibe, budget and time. We build a day around Pune&rsquo;s afternoon shop break, with the cost of
          every stop and every auto ride added up for you.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <PlannerForm
            inputs={inputs}
            onChange={update}
            dailyBudget={dailySuggestion}
            budgetReady={budgetStatus === 'ready'}
            onUseDailyBudget={useDailyBudget}
          />

          {queryText && !queryMatch && (
            <Alert tone="info" title={`“${queryText}” is not in our place list yet`}>
              Here is a plan around popular spots instead. You can look up {queryText} in Google Maps.
            </Alert>
          )}
          {openedNote && <Alert tone="success">{openedNote}</Alert>}

          {(inputs.pinned.length > 0 || inputs.excluded.length > 0) && (
            <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-4 text-body-sm print:hidden">
              {inputs.pinned.length > 0 && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-on-surface">Trying to include:</span>
                  {inputs.pinned.map((id) => (
                    <Chip
                      key={id}
                      icon="push_pin"
                      selected
                      aria-label={`Stop trying to include ${nameOf(id)}`}
                      onClick={() => update({ pinned: inputs.pinned.filter((pinnedId) => pinnedId !== id) })}
                    >
                      {nameOf(id)}
                    </Chip>
                  ))}
                </p>
              )}
              {inputs.excluded.length > 0 && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-on-surface">Removed: {inputs.excluded.map(nameOf).join(', ')}</span>
                  <Button variant="outline" size="sm" icon="undo" onClick={() => update({ excluded: [] })}>
                    Put them back
                  </Button>
                </p>
              )}
            </div>
          )}

          {plan.days.length > 1 && (
            <div role="group" aria-label="Choose a day" className="flex gap-2 print:hidden">
              {plan.days.map((item, index) => (
                <Chip key={item.number} selected={day.number === item.number} onClick={() => setDayIndex(index)}>
                  Day {item.number}
                </Chip>
              ))}
            </div>
          )}

          <p className="sr-only" role="status">
            Plan updated: {day.totals.count} stops, about {formatRupees(day.totals.total)} per person.
          </p>

          <section aria-label={`Your plan${plan.days.length > 1 ? `, day ${day.number}` : ''}`}>
            <DayTimeline day={day} people={plan.people} onRemove={removeStop} />
          </section>

          <SavedPlans refreshKey={savedVersion} onLoad={openSaved} />
        </div>

        <div className="lg:sticky lg:top-24 lg:col-span-4">
          <PlanSummary
            plan={plan}
            day={day}
            inputs={inputs}
            onSaved={() => setSavedVersion((version) => version + 1)}
          />
        </div>
      </div>
    </Container>
  );
}
