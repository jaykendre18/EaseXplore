// Content for the Food & Stays page. Edit wording and links here, not in the components.
//
// PLACES: the food spots come from src/data/places.js (the same list the planner uses),
//   so the two can never disagree. To add a food place, add it there.
//
// STAYS: this page does NOT list individual hotels or hostels, because prices, quality and
//   availability change constantly and cannot be verified here. Each area guide gives
//   general character and getting-around notes, plus a Google Maps search for that area.
//   To list real stays later, add them in a new file with a name, area, price and website
//   that you have checked yourself.

import { ROUTES } from '../config/routes.js';

/** Areas used by the food filter. `zone` on each place in places.js must be one of these ids. */
export const ZONES = [
  { id: 'deccan', label: 'FC Road & Deccan' },
  { id: 'peth', label: 'Old city (Peth areas)' },
  { id: 'camp', label: 'Camp & MG Road' },
  { id: 'east', label: 'Kalyani Nagar' },
  { id: 'west', label: 'Law College Road & Kothrud' },
];

/**
 * Ready-made trails. Each one opens the Smart Itinerary with its vibe, time slot and places set,
 * so timings, costs and the afternoon break are worked out by the planner.
 * `pinned` can hold at most 3 places, and they must be able to fit together
 * (the tests check that every trail builds a plan that includes all of them).
 */
export const TRAILS = [
  {
    id: 'old-city-food-day',
    title: 'Old-city food day',
    blurb: 'Misal for breakfast, bakarwadi on Bajirao Road and a mastani in the evening, with heritage stops in between.',
    icon: 'fort',
    vibe: 'food',
    windowId: 'full',
    pinned: ['bedekar', 'chitale-bandhu', 'sujata-mastani'],
  },
  {
    id: 'fc-road-evening',
    title: 'FC Road student evening',
    blurb: 'Tea and bun maska, a walk down FC Road, and dinner at Vaishali.',
    icon: 'local_cafe',
    vibe: 'college',
    windowId: 'evening',
    pinned: ['cafe-goodluck', 'fc-road', 'vaishali'],
  },
  {
    id: 'camp-garden-bakery',
    title: 'Camp: garden and bakery',
    blurb: 'A shady visit to Empress Garden and a Parsi bakery stop later in the day.',
    icon: 'park',
    vibe: 'nature',
    windowId: 'full',
    pinned: ['empress-garden', 'kayani-bakery'],
  },
];

/** The address that opens the Smart Itinerary set up for a trail. */
export function trailUrl(trail) {
  const params = new URLSearchParams({ vibe: trail.vibe, window: trail.windowId, pins: trail.pinned.join(',') });
  return `${ROUTES.itinerary.path}?${params.toString()}`;
}

/** An address that opens one place in the Smart Itinerary. */
export function planPlaceUrl(placeId) {
  return `${ROUTES.itinerary.path}?${new URLSearchParams({ pins: placeId }).toString()}`;
}

/** Google Maps search link, for directions or for finding stays. */
export function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query }).toString()}`;
}

/** General guides to areas to stay in. No individual businesses, prices or ratings. */
export const STAY_AREAS = [
  {
    id: 'deccan',
    name: 'FC Road & Deccan',
    goodFor: 'Students, solo travellers and first-time visitors',
    feel: 'Lively and central, with cafes, bookshops and street food. Busiest in the evening.',
    gettingAround: 'Deccan Gymkhana, Garware College and Chhatrapati Sambhaji Udyan stations are on the Aqua Line.',
    watchOut: 'Traffic on JM Road and FC Road can be slow at peak hours.',
    mapsQuery: 'hostels and hotels near FC Road Pune',
  },
  {
    id: 'koregaon',
    name: 'Koregaon Park',
    goodFor: 'Cafes, nightlife and a relaxed, leafy feel',
    feel: 'Quiet tree-lined lanes with many cafes and restaurants. Often pricier than the old city.',
    gettingAround: 'Check the Pune Metro app for the nearest station, or plan for autos.',
    watchOut: 'A longer ride from the old city and Peth areas.',
    mapsQuery: 'hotels and hostels in Koregaon Park Pune',
  },
  {
    id: 'peth',
    name: 'Old city (Peth areas)',
    goodFor: 'Heritage walks and early starts',
    feel: 'Narrow lanes, old wadas, temples and traditional eateries. Very busy by day, and many shops close in the afternoon.',
    gettingAround: 'Stations on the Purple Line serve parts of the old city. Check the Pune Metro app for the nearest one.',
    watchOut: 'Narrow streets and crowds, which can be hard with a car or large luggage.',
    mapsQuery: 'hotels and hostels near Shaniwar Wada Pune',
  },
  {
    id: 'camp',
    name: 'Camp & MG Road',
    goodFor: 'Old Parsi cafes, bakeries and shopping',
    feel: 'Older streets with an easy-going pace, and good for browsing on foot.',
    gettingAround: 'Not far from Pune Railway Station, which is on the Aqua Line.',
    watchOut: '',
    mapsQuery: 'hotels near MG Road Camp Pune',
  },
  {
    id: 'kothrud',
    name: 'Kothrud & Karve Nagar',
    goodFor: 'Longer stays, families and a quieter base',
    feel: 'Residential and green, with local eateries and easy access to Vetal Tekdi.',
    gettingAround: 'Vanaz, Anand Nagar and Ideal Colony stations are on the Aqua Line.',
    watchOut: 'A longer trip to the old city at peak hours.',
    mapsQuery: 'hotels near Kothrud Pune',
  },
];
