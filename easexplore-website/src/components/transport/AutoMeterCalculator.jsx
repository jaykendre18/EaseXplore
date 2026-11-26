import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import SectionHeading from '@/components/ui/SectionHeading';
import TextField from '@/components/ui/TextField';
import { AUTO } from '@/config/fares';
import { autoFare, formatDate, formatRupees, paperCardStatus } from '@/utils/fares';

const TIME_OPTIONS = [
  { id: 'none', label: 'Day' },
  { id: 'city', label: AUTO.nightSurcharge.city.label },
  { id: 'rural', label: AUTO.nightSurcharge.rural.label },
];

/** "12" -> 12, "" -> 0, "-3" -> 0, "4.7" -> 4, capped at `max`. */
function wholeNumber(text, max) {
  const value = Math.floor(Number(text));
  return Number.isFinite(value) && value > 0 ? Math.min(value, max) : 0;
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={strong ? 'text-on-surface' : 'text-on-surface-variant'}>{label}</dt>
      <dd className="font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function RateTile({ label, value, note }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-4">
      <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="font-display text-2xl font-bold text-primary">{value}</p>
      <p className="text-body-sm text-on-surface-variant">{note}</p>
    </div>
  );
}

/** `distanceKm` is a number, or null when the distance field is empty or invalid. */
export default function AutoMeterCalculator({ distanceKm }) {
  const [time, setTime] = useState('none');
  const [waiting, setWaiting] = useState('');
  const [luggage, setLuggage] = useState('');

  const waitingMinutes = wholeNumber(waiting, 180);
  const luggagePieces = wholeNumber(luggage, 20);
  const fare =
    distanceKm === null ? null : autoFare({ distanceKm, night: time, waitingMinutes, luggage: luggagePieces });
  const nightRule = time === 'none' ? null : AUTO.nightSurcharge[time];
  const cardStatus = paperCardStatus();

  return (
    <section aria-labelledby="meter-title">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="secondary" icon="verified">
          Rates from {formatDate(AUTO.effectiveFrom)}
        </Badge>
      </div>
      <SectionHeading
        id="meter-title"
        tone="secondary"
        title="Auto-rickshaw meter calculator"
        description="Work out the legal fare before you board, so you can spot an overcharge. Pune and Pimpri-Chinchwad."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Card className="flex flex-col gap-6 lg:col-span-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <RateTile
              label="Minimum fare"
              value={formatRupees(AUTO.baseFare)}
              note={`First ${AUTO.baseDistanceKm} km`}
            />
            <RateTile label="After that" value={`${formatRupees(AUTO.perKm)} / km`} note="Charged per 100 m" />
            <RateTile
              label="Night"
              value={`+${AUTO.nightSurcharge.city.percent}%`}
              note={`${AUTO.nightSurcharge.city.hours} in the city`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-label-lg text-on-surface" id="time-label">
              Time of travel
            </p>
            <div role="group" aria-labelledby="time-label" className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((option) => (
                <Chip key={option.id} selected={time === option.id} onClick={() => setTime(option.id)}>
                  {option.label}
                </Chip>
              ))}
            </div>
            {nightRule && (
              <p className="text-body-sm text-on-surface-variant">
                {nightRule.percent}% extra on the metered fare from {nightRule.hours}.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Waiting time (minutes)"
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              placeholder="0"
              value={waiting}
              onChange={(event) => setWaiting(event.target.value)}
              hint={`${formatRupees(AUTO.waitingPerMinute)} per minute`}
            />
            <TextField
              label="Large luggage (pieces)"
              type="number"
              inputMode="numeric"
              min="0"
              max="20"
              placeholder="0"
              value={luggage}
              onChange={(event) => setLuggage(event.target.value)}
              hint={`${formatRupees(AUTO.luggagePerPackage)} per piece of 60 x 40 cm or bigger. Handbags are free.`}
            />
          </div>

          {cardStatus === 'transition' ? (
            <Alert tone="info" title={`New fares started on ${formatDate(AUTO.effectiveFrom)}`}>
              While meters are being recalibrated, drivers may use a printed revised tariff card. Printed cards are
              accepted until {formatDate(AUTO.paperCardsValidUntil)}. After that, fares must follow the recalibrated
              digital meter.
            </Alert>
          ) : (
            <Alert tone="info" title="Digital meters only">
              Printed tariff cards are no longer accepted. The fare must follow the recalibrated digital meter.
            </Alert>
          )}
        </Card>

        <Card className="flex flex-col gap-5 bg-surface-container-lowest lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
              Legal fare
            </h3>
            {fare && <Badge tone="primary">{fare.distanceKm} km</Badge>}
          </div>

          {fare ? (
            <>
              <div aria-live="polite" aria-atomic="true">
                <p className="font-display text-6xl font-bold text-on-surface">{formatRupees(fare.total)}</p>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Estimate. The meter may differ by a few rupees.
                </p>
              </div>

              <dl className="flex flex-col gap-2 border-t border-outline-variant/40 pt-4 text-body-md">
                {fare.extraKm > 0 ? (
                  <>
                    <Row label={`First ${AUTO.baseDistanceKm} km`} value={formatRupees(fare.baseFare)} />
                    <Row
                      label={`Next ${fare.extraKm} km at ${formatRupees(AUTO.perKm)}`}
                      value={formatRupees(fare.extraCharge)}
                    />
                  </>
                ) : (
                  <Row label={`Minimum fare (up to ${AUTO.baseDistanceKm} km)`} value={formatRupees(fare.baseFare)} />
                )}
                {fare.nightSurcharge > 0 && (
                  <Row label={`Night rate (+${fare.nightPercent}%)`} value={formatRupees(fare.nightSurcharge)} />
                )}
                {fare.waitingCharge > 0 && (
                  <Row label={`Waiting, ${waitingMinutes} min`} value={formatRupees(fare.waitingCharge)} />
                )}
                {fare.luggageCharge > 0 && (
                  <Row label={`Luggage, ${luggagePieces} pc`} value={formatRupees(fare.luggageCharge)} />
                )}
                <div className="mt-1 border-t border-outline-variant/40 pt-3">
                  <Row label="Total" value={formatRupees(fare.total)} strong />
                </div>
              </dl>
            </>
          ) : (
            <p className="rounded-2xl bg-surface-container-low p-4 text-body-md text-on-surface-variant" role="status">
              Enter a trip distance above and the fare appears here.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}
