import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import TextField from '@/components/ui/TextField';
import { MAX_DISTANCE_KM, MIN_DISTANCE_KM } from '@/utils/fares';

const QUICK_DISTANCES = [1.5, 3, 5, 10, 15, 20];

const withCity = (place) => (/pune/i.test(place) ? place.trim() : `${place.trim()}, Pune`);

function mapsUrl(from, to) {
  const params = new URLSearchParams({ api: '1', destination: withCity(to), travelmode: 'driving' });
  if (from.trim()) params.set('origin', withCity(from));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Where the person says how far they are going.
 * The distance is typed in (or copied from a map app) so fares are exact rather than guessed.
 */
export default function TripInput({ distanceText, onDistanceChange, distanceValid }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const parsed = parseFloat(distanceText);
  const sliderValue = Number.isFinite(parsed) ? Math.min(50, Math.max(1, parsed)) : 5;
  const showError = distanceText.trim() !== '' && !distanceValid;

  return (
    <Card className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-headline-sm text-on-surface">1. Find your distance</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Type where you are going and open the route in Google Maps. It shows the driving distance.
          </p>
        </div>
        <TextField
          label="From (optional)"
          icon="trip_origin"
          placeholder="e.g. Kothrud Stand"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          autoComplete="off"
        />
        <TextField
          label="To"
          icon="location_on"
          placeholder="e.g. Viman Nagar"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          autoComplete="off"
        />
        {to.trim() ? (
          <Button
            href={mapsUrl(from, to)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            icon="map"
            iconRight="open_in_new"
            className="self-start"
          >
            Open route in Google Maps
          </Button>
        ) : (
          <Button variant="outline" icon="map" disabled className="self-start">
            Enter a destination first
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-headline-sm text-on-surface">2. Enter the trip distance</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Use the distance from Google Maps, or the number shown on your auto&rsquo;s meter.
          </p>
        </div>
        <TextField
          label="Trip distance (km)"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={MIN_DISTANCE_KM}
          max={MAX_DISTANCE_KM}
          value={distanceText}
          onChange={(event) => onDistanceChange(event.target.value)}
          error={showError ? `Enter a distance between ${MIN_DISTANCE_KM} and ${MAX_DISTANCE_KM} km.` : undefined}
        />
        <div>
          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={sliderValue}
            onChange={(event) => onDistanceChange(event.target.value)}
            aria-label="Trip distance in kilometres"
            className="h-2 w-full cursor-pointer accent-primary"
          />
          <div className="mt-1 flex justify-between text-label-md text-on-surface-variant">
            <span>1 km</span>
            <span>25 km</span>
            <span>50 km</span>
          </div>
        </div>
        <div role="group" aria-label="Common trip distances" className="flex flex-wrap items-center gap-2">
          <span className="text-label-md text-on-surface-variant">Quick pick:</span>
          {QUICK_DISTANCES.map((km) => (
            <Chip key={km} selected={parsed === km} onClick={() => onDistanceChange(String(km))}>
              {km} km
            </Chip>
          ))}
        </div>
      </div>
    </Card>
  );
}
