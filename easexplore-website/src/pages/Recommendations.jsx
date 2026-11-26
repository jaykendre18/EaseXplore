import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FilterBar, { INITIAL_FILTERS, hasActiveFilters } from '@/components/recommendations/FilterBar';
import PlaceCard from '@/components/recommendations/PlaceCard';
import StayAreas from '@/components/recommendations/StayAreas';
import TrailCards from '@/components/recommendations/TrailCards';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { PRICE_FILTERS } from '@/config/recommendations';
import { ROUTES } from '@/config/routes';
import { useFavourites } from '@/context/FavouritesContext';
import { withSetupHint } from '@/services/dbErrors';
import { filterPlaces, foodPlaces, zonesWithPlaces } from '@/utils/recommendations';

const ANCHORS = [
  { href: '#food', label: 'Food spots' },
  { href: '#trails', label: 'Food trails' },
  { href: '#stays', label: 'Where to stay' },
];

export default function Recommendations() {
  const { mode, isConfigured, status, error, ids: favouriteIds, reload } = useFavourites();
  const location = useLocation();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [actionError, setActionError] = useState('');

  const food = useMemo(() => foodPlaces(), []);
  const zones = useMemo(() => zonesWithPlaces(food), [food]);
  const maxSpend = PRICE_FILTERS.find((item) => item.id === filters.priceId)?.max ?? Infinity;

  const results = useMemo(
    () =>
      filterPlaces(food, {
        query: filters.query,
        zone: filters.zone,
        bestFor: filters.bestFor,
        maxSpend,
        openAfternoon: filters.openAfternoon,
        savedOnly: filters.savedOnly,
        favouriteIds,
      }),
    [food, filters, maxSpend, favouriteIds],
  );

  const update = (changes) => setFilters((current) => ({ ...current, ...changes }));

  return (
    <Container className="flex flex-col gap-space-xl py-space-xl">
      <header className="flex flex-col gap-3">
        <Badge tone="secondary" icon="restaurant" className="self-start">
          Local picks
        </Badge>
        <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">Food &amp; Stays</h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">
          Famous local food spots, ready-made food trails and a guide to where to stay in Pune. Save favourites with the
          heart.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2">
          {ANCHORS.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="rounded-full bg-surface-container px-4 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
            >
              {anchor.label}
            </a>
          ))}
        </nav>
      </header>

      {mode === 'guest' && (
        <Alert tone="info" title="Favourites are not kept until you log in">
          {isConfigured
            ? 'You can save favourites to try it out, but they are lost when you close or refresh this page.'
            : 'Accounts are not switched on yet, so favourites cannot be saved. You can still browse everything.'}
          {isConfigured && (
            <span className="mt-3 block">
              <Button to={ROUTES.login.path} state={{ from: location }} size="sm" icon="login">
                Log in to save favourites
              </Button>
            </span>
          )}
        </Alert>
      )}

      {status === 'error' && (
        <Alert tone="error" title="We could not load your favourites">
          {withSetupHint(error, { file: '003_favourites.sql', part: 'Part 8' })}
          <span className="mt-3 block">
            <Button variant="outline" size="sm" icon="refresh" onClick={reload}>
              Try again
            </Button>
          </span>
        </Alert>
      )}

      <section id="food" aria-labelledby="food-title" className="flex scroll-mt-28 flex-col gap-6">
        <SectionHeading
          id="food-title"
          eyebrow="Eat like a Punekar"
          title="Food spots"
          description="Prices are rough estimates per person. Opening times change, so check before you go."
        />

        <FilterBar
          filters={filters}
          onChange={update}
          zones={zones}
          resultCount={results.length}
          totalCount={food.length}
          savedCount={favouriteIds.length}
        />

        {actionError && <Alert tone="error">{withSetupHint(actionError, { file: '003_favourites.sql', part: 'Part 8' })}</Alert>}

        {results.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((place) => (
              <PlaceCard key={place.id} place={place} onFavouriteError={setActionError} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-start gap-3" role="status">
            <Icon name="search_off" size={32} className="text-primary" />
            <h3 className="text-headline-sm text-on-surface">No places match</h3>
            <p className="text-body-md text-on-surface-variant">
              {filters.savedOnly && favouriteIds.length === 0
                ? 'You have no favourites yet. Tap the heart on a place to save it.'
                : 'Try a different word, or remove a filter.'}
            </p>
            {hasActiveFilters(filters) && (
              <Button variant="outline" size="sm" icon="filter_alt_off" onClick={() => update({ ...INITIAL_FILTERS })}>
                Clear filters
              </Button>
            )}
          </Card>
        )}
      </section>

      <TrailCards />
      <StayAreas />
    </Container>
  );
}
