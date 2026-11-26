import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import TextField from '@/components/ui/TextField';
import { BEST_FOR, PRICE_FILTERS } from '@/config/recommendations';

export const INITIAL_FILTERS = {
  query: '',
  zone: 'all',
  bestFor: 'all',
  priceId: 'any',
  openAfternoon: false,
  savedOnly: false,
};

export function hasActiveFilters(filters) {
  return (
    filters.query.trim() !== '' ||
    filters.zone !== 'all' ||
    filters.bestFor !== 'all' ||
    filters.priceId !== 'any' ||
    filters.openAfternoon ||
    filters.savedOnly
  );
}

function Group({ id, label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p id={id} className="text-label-lg text-on-surface">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.filters       see INITIAL_FILTERS
 * @param {(changes: object) => void} props.onChange
 * @param {{id: string, label: string}[]} props.zones   areas that have places
 * @param {number} props.resultCount
 * @param {number} props.totalCount
 * @param {number} props.savedCount    how many favourites the person has
 */
export default function FilterBar({ filters, onChange, zones, resultCount, totalCount, savedCount }) {
  return (
    <Card className="flex flex-col gap-5">
      <TextField
        label="Search food spots"
        type="search"
        icon="search"
        placeholder="Try misal, bakery, FC Road, tea…"
        value={filters.query}
        onChange={(event) => onChange({ query: event.target.value })}
        autoComplete="off"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Group id="filter-area" label="Area">
          <Chip selected={filters.zone === 'all'} onClick={() => onChange({ zone: 'all' })}>
            All areas
          </Chip>
          {zones.map((zone) => (
            <Chip key={zone.id} selected={filters.zone === zone.id} onClick={() => onChange({ zone: zone.id })}>
              {zone.label}
            </Chip>
          ))}
        </Group>

        <Group id="filter-meal" label="Good for">
          <Chip selected={filters.bestFor === 'all'} onClick={() => onChange({ bestFor: 'all' })}>
            Anything
          </Chip>
          {BEST_FOR.map((item) => (
            <Chip key={item.id} selected={filters.bestFor === item.id} onClick={() => onChange({ bestFor: item.id })}>
              {item.label}
            </Chip>
          ))}
        </Group>

        <Group id="filter-price" label="Price per person">
          {PRICE_FILTERS.map((item) => (
            <Chip key={item.id} selected={filters.priceId === item.id} onClick={() => onChange({ priceId: item.id })}>
              {item.label}
            </Chip>
          ))}
        </Group>

        <Group id="filter-more" label="Also">
          <Chip
            icon="wb_sunny"
            selected={filters.openAfternoon}
            onClick={() => onChange({ openAfternoon: !filters.openAfternoon })}
          >
            Open through the afternoon
          </Chip>
          <Chip
            icon="favorite"
            selected={filters.savedOnly}
            onClick={() => onChange({ savedOnly: !filters.savedOnly })}
          >
            Saved ({savedCount})
          </Chip>
        </Group>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-4">
        <p role="status" className="text-body-md text-on-surface-variant">
          Showing {resultCount} of {totalCount} {totalCount === 1 ? 'place' : 'places'}
        </p>
        {hasActiveFilters(filters) && (
          <Button variant="outline" size="sm" icon="filter_alt_off" onClick={() => onChange({ ...INITIAL_FILTERS })}>
            Clear filters
          </Button>
        )}
      </div>
    </Card>
  );
}
