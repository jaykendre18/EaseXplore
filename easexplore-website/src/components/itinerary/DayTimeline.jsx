import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { MEALS, SIESTA } from '@/config/itinerary';
import { ROUTES } from '@/config/routes';
import { formatRupees } from '@/utils/fares';
import { formatTime } from '@/utils/itinerary';

const CATEGORY = {
  heritage: { label: 'Heritage', tone: 'tertiary' },
  nature: { label: 'Nature', tone: 'primary' },
  food: { label: 'Food', tone: 'secondary' },
  culture: { label: 'Culture', tone: 'neutral' },
  shopping: { label: 'Shopping', tone: 'neutral' },
};

function TravelRow({ leg, people }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-surface-container-low px-4 py-2.5 text-body-sm text-on-surface-variant">
      <span className="inline-flex items-center gap-1.5 font-semibold text-on-surface">
        <Icon name="electric_rickshaw" size={18} className="text-secondary" />
        About {leg.km} km, allow {leg.minutes} min
      </span>
      <span>
        Auto about {formatRupees(leg.autoFare)}
        {people > 1 ? ` (${formatRupees(leg.perPerson)} each)` : ''}
      </span>
      <a
        href={leg.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-primary underline print:hidden"
      >
        Route in Maps
        <Icon name="open_in_new" size={14} />
      </a>
      <Link
        to={`${ROUTES.transport.path}?km=${leg.km}`}
        className="font-semibold text-primary underline print:hidden"
      >
        Compare fares
      </Link>
    </div>
  );
}

function StopCard({ item, onRemove }) {
  const { place } = item;
  const category = CATEGORY[place.category] ?? CATEGORY.culture;

  return (
    <Card as="article" padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-label-md font-semibold text-primary">
            <Icon name="schedule" size={16} />
            {formatTime(item.start)} to {formatTime(item.end)}
            <span className="font-normal text-on-surface-variant">· about {place.durationMin} min</span>
          </p>
          <h3 className="mt-1 text-headline-sm text-on-surface">{place.name}</h3>
          <p className="text-body-sm text-on-surface-variant">{place.area}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          onClick={() => onRemove(place.id)}
          aria-label={`Remove ${place.name} from the plan`}
          className="print:hidden"
        >
          Remove
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={category.tone}>{category.label}</Badge>
        {item.meal && (
          <Badge tone="secondary" icon="restaurant">
            {MEALS[item.meal].label}
          </Badge>
        )}
        {place.afternoon === 'break' ? (
          <Badge tone="neutral" icon="bedtime">
            Likely closed {SIESTA.label}
          </Badge>
        ) : (
          <Badge tone="neutral" icon="wb_sunny">
            Open through the afternoon
          </Badge>
        )}
      </div>

      <p className="text-body-md text-on-surface-variant">{place.about}</p>
      <p className="flex items-start gap-2 text-body-sm text-on-surface-variant">
        <Icon name="tips_and_updates" size={16} className="mt-0.5 shrink-0 text-primary" />
        <span>{place.tip}</span>
      </p>
      <p className="text-label-lg text-on-surface">
        About {formatRupees(place.spend)} <span className="font-normal text-on-surface-variant">({place.spendLabel})</span>
      </p>
    </Card>
  );
}

function GapCard({ item }) {
  const isRest = item.kind === 'rest';
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-4">
      <Icon name={isRest ? 'bedtime' : 'hourglass_empty'} className="text-secondary" />
      <div>
        <p className="text-label-md font-semibold text-primary">
          {formatTime(item.start)} to {formatTime(item.end)}
        </p>
        <h3 className="text-title-md text-on-surface">{isRest ? 'Afternoon break' : 'Free time'}</h3>
        <p className="text-body-sm text-on-surface-variant">
          {isRest
            ? `Many old shops and small eateries close from ${SIESTA.label}. Rest, or relax at a cafe.`
            : 'Take your time, or stay a little longer at the last stop.'}
        </p>
      </div>
    </div>
  );
}

/** One day of the plan as a vertical timeline. */
export default function DayTimeline({ day, people, onRemove }) {
  if (day.totals.count === 0) {
    return (
      <Card className="flex items-center gap-3 text-body-md text-on-surface-variant" role="status">
        <Icon name="search_off" className="text-primary" />
        Nothing fits these settings. Try a higher budget or a different time of day.
      </Card>
    );
  }

  return (
    <ol className="relative flex flex-col gap-5 border-l-2 border-primary-fixed-dim pl-5 sm:pl-7">
      {day.stops.map((item, index) => (
        <li key={`${item.kind}-${item.place?.id ?? item.start}-${index}`} className="relative">
          <span
            className="absolute -left-[31px] top-5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary sm:-left-[39px]"
            aria-hidden="true"
          />
          {item.kind === 'stop' ? (
            <>
              {item.leg && <TravelRow leg={item.leg} people={people} />}
              <StopCard item={item} onRemove={onRemove} />
            </>
          ) : (
            <GapCard item={item} />
          )}
        </li>
      ))}
    </ol>
  );
}
