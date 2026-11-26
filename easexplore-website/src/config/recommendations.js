// Settings for the Food & Stays page.

/** "Good for" filter. The ids must match the `bestFor` values on food places in src/data/places.js. */
export const BEST_FOR = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snacks', label: 'Tea & snacks' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'sweets', label: 'Sweets & bakes' },
];

/** Price filter, by the estimated spend per person in rupees. */
export const PRICE_FILTERS = [
  { id: 'any', label: 'Any price', max: Infinity },
  { id: '100', label: 'Up to ₹100', max: 100 },
  { id: '150', label: 'Up to ₹150', max: 150 },
];

/** Most favourites one account can save (also enforced in the database). */
export const MAX_FAVOURITES = 200;
