// Search and filtering for the Food & Stays page. Pure JavaScript, tested with `npm test`.
// Relative imports (not "@/") so Node can run this file in tests.
import { ZONES } from '../data/recommendations.js';
import { PLACES } from '../data/places.js';

/** The places shown on the Food page: every place that has a "signature" dish. */
export function foodPlaces(places = PLACES) {
  return places.filter((place) => place.signature);
}

/** Areas that actually have food places, in the order they are defined. */
export function zonesWithPlaces(places = foodPlaces()) {
  const used = new Set(places.map((place) => place.zone));
  return ZONES.filter((zone) => used.has(zone.id));
}

/** Everything searchable about a place, in one lowercase string. */
function searchText(place) {
  return [place.name, place.area, place.signature, place.about, place.tip, ...(place.aliases ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Filters places. Every filter that is set must match (they combine with AND).
 * @param {object[]} places
 * @param {object} [filters]
 * @param {string} [filters.query]          words to search for; every word must appear somewhere
 * @param {string} [filters.zone]           an area id, or 'all'
 * @param {string} [filters.bestFor]        'breakfast', 'lunch', ... or 'all'
 * @param {number} [filters.maxSpend]       most a person is willing to spend; Infinity for any
 * @param {boolean} [filters.openAfternoon] only places open through the afternoon
 * @param {boolean} [filters.savedOnly]     only favourites
 * @param {string[]} [filters.favouriteIds]
 */
export function filterPlaces(
  places,
  { query = '', zone = 'all', bestFor = 'all', maxSpend = Infinity, openAfternoon = false, savedOnly = false, favouriteIds = [] } = {},
) {
  const words = String(query ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const saved = new Set(favouriteIds);

  return places.filter((place) => {
    if (zone !== 'all' && place.zone !== zone) return false;
    if (bestFor !== 'all' && !(place.bestFor ?? []).includes(bestFor)) return false;
    if (place.spend > maxSpend) return false;
    if (openAfternoon && place.afternoon !== 'open') return false;
    if (savedOnly && !saved.has(place.id)) return false;
    if (words.length > 0) {
      const text = searchText(place);
      if (!words.every((word) => text.includes(word))) return false;
    }
    return true;
  });
}
