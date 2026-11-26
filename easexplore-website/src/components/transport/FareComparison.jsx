import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { AUTO, BUS, METRO } from '@/config/fares';
import { autoFare, busFare, formatRupees } from '@/utils/fares';

const TILE_TONES = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  neutral: 'bg-surface-container-highest text-on-surface',
};

function FareCard({ icon, tone, label, title, fare, caption, badge, children }) {
  return (
    <Card as="article" padding="none" hoverable className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TILE_TONES[tone]}`}>
          <Icon name={icon} />
        </span>
        {badge}
      </div>
      <div>
        <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</p>
        <h3 className="text-headline-sm text-on-surface">{title}</h3>
      </div>
      <div className="rounded-2xl bg-surface-container-low p-4">
        <p className="font-display text-3xl font-bold text-on-surface">{fare}</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">{caption}</p>
      </div>
      <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">{children}</div>
    </Card>
  );
}

function Note({ icon, children }) {
  return (
    <p className="flex items-start gap-2">
      <Icon name={icon} size={16} className="mt-0.5 shrink-0 text-primary" />
      <span>{children}</span>
    </p>
  );
}

/** `distanceKm` is a number, or null when the distance field is empty or invalid. */
export default function FareComparison({ distanceKm }) {
  const hasDistance = distanceKm !== null;
  const auto = hasDistance ? autoFare({ distanceKm }) : null;
  const autoAtNight = hasDistance ? autoFare({ distanceKm, night: 'city' }) : null;
  const bus = hasDistance ? busFare(distanceKm) : null;
  const saving = auto && bus !== null ? auto.total - bus : null;

  const metroLow = Math.min(...METRO.slabs.map((slab) => slab.fare));
  const metroHigh = Math.max(...METRO.slabs.map((slab) => slab.fare));

  return (
    <section aria-labelledby="compare-title">
      <SectionHeading
        id="compare-title"
        eyebrow="3. Compare"
        title="What this trip costs"
        description={
          hasDistance
            ? `Fares for a ${distanceKm} km trip. Auto and bus fares are worked out from your distance.`
            : 'Enter a trip distance above to see the fares.'
        }
        className="mb-6"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FareCard
          icon="electric_rickshaw"
          tone="secondary"
          label="Auto-rickshaw"
          title="Meter fare"
          fare={hasDistance ? formatRupees(auto.total) : '—'}
          caption={hasDistance ? 'Day rate, by the RTO meter' : 'Needs a distance'}
          badge={<Badge tone="secondary">Fixed tariff</Badge>}
        >
          {hasDistance && (
            <Note icon="bedtime">
              At night ({AUTO.nightSurcharge.city.hours}): {formatRupees(autoAtNight.total)}
            </Note>
          )}
          <Note icon="calculate">Waiting and luggage are extra. Use the calculator below.</Note>
        </FareCard>

        <FareCard
          icon="directions_bus"
          tone="primary"
          label="PMPML bus"
          title="Single ticket"
          fare={!hasDistance ? '—' : bus !== null ? formatRupees(bus) : 'See fare chart'}
          caption={
            !hasDistance
              ? 'Needs a distance'
              : bus !== null
                ? 'Same fare on AC and non-AC buses'
                : `Fares beyond ${BUS.coveredUpToKm} km depend on the bus route`
          }
          badge={saving !== null && saving > 0 ? <Badge tone="primary">Saves {formatRupees(saving)} vs auto</Badge> : null}
        >
          <Note icon="confirmation_number">
            Day pass {formatRupees(BUS.dayPass)} for unlimited rides in Pune and Pimpri-Chinchwad.
          </Note>
          <Note icon="info">The bus route can be longer than the road distance, so treat this as an estimate.</Note>
        </FareCard>

        <FareCard
          icon="directions_subway"
          tone="tertiary"
          label="Pune Metro"
          title="Ticket"
          fare={`${formatRupees(metroLow)} – ${formatRupees(metroHigh)}`}
          caption="Depends on the stations you ride between"
          badge={<Badge tone="tertiary">Skips traffic</Badge>}
        >
          <Note icon="fact_check">
            Check the exact fare in the Pune Metro app, or see the <a className="font-semibold text-primary underline" href="#metro-fares">fare chart</a>.
          </Note>
        </FareCard>

        <FareCard
          icon="local_taxi"
          tone="neutral"
          label="Cab"
          title="App fare"
          fare="Varies"
          caption="Set by the app, not by a fixed tariff"
          badge={<Badge tone="neutral">Live quote</Badge>}
        >
          <Note icon="trending_up">
            The price changes with the app, time of day and demand. Check Ola, Uber or Rapido for a live quote before you book.
          </Note>
        </FareCard>
      </div>
    </section>
  );
}
