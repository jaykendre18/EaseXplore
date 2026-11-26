import FavouriteButton from '@/components/recommendations/FavouriteButton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Photo from '@/components/ui/Photo';
import { BEST_FOR } from '@/config/recommendations';
import { SIESTA } from '@/config/itinerary';
import { ZONES, mapsSearchUrl, planPlaceUrl } from '@/data/recommendations';
import { formatRupees } from '@/utils/fares';

/** One food place. `onFavouriteError` receives a message when saving a favourite fails. */
export default function PlaceCard({ place, onFavouriteError }) {
  const zone = ZONES.find((item) => item.id === place.zone);
  const goodFor = place.bestFor.map((id) => BEST_FOR.find((item) => item.id === id)?.label).filter(Boolean);

  return (
    <Card as="article" padding="none" hoverable className="group flex flex-col overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Photo
          src={`/images/places/${place.id}.jpg`}
          alt={`${place.name}, ${place.area}`}
          icon="restaurant"
          className="h-full w-full"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />
        {zone && (
          <span className="absolute left-3 top-3 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-label-sm font-bold uppercase tracking-wider text-primary backdrop-blur-md">
            {zone.label}
          </span>
        )}
        <div className="absolute right-3 top-3">
          <FavouriteButton placeId={place.id} name={place.name} onError={onFavouriteError} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-headline-md text-on-surface">{place.name}</h3>
          <p className="text-body-sm text-on-surface-variant">{place.area}</p>
        </div>

        <p className="flex items-start gap-2 text-body-md text-on-surface">
          <Icon name="restaurant_menu" size={18} className="mt-0.5 shrink-0 text-secondary" />
          <span>
            <span className="font-semibold">Try:</span> {place.signature}
          </span>
        </p>
        <p className="text-body-md text-on-surface-variant">{place.about}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="secondary">
            About {formatRupees(place.spend)} per person
          </Badge>
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

        {goodFor.length > 0 && (
          <p className="text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">Good for:</span> {goodFor.join(', ')}
          </p>
        )}

        <p className="flex items-start gap-2 rounded-2xl bg-primary-fixed/40 p-3 text-body-sm text-on-surface">
          <Icon name="tips_and_updates" size={16} className="mt-0.5 shrink-0 text-primary" />
          <span>{place.tip}</span>
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button to={planPlaceUrl(place.id)} size="sm" icon="route">
            Add to my plan
          </Button>
          <Button
            href={mapsSearchUrl(`${place.name}, Pune`)}
            target="_blank"
            rel="noopener noreferrer"
            variant="tonal"
            size="sm"
            icon="directions"
            aria-label={`Directions to ${place.name} in Google Maps`}
          >
            Directions
          </Button>
        </div>
      </div>
    </Card>
  );
}
