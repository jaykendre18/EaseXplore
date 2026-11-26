// Settings for the Smart Itinerary planner.
// All times are minutes since midnight, so 8:30 AM = 510.

const hm = (hours, minutes = 0) => hours * 60 + minutes;

/** The traditional afternoon break many old Peth shops and small eateries take. */
export const SIESTA = { start: hm(13), end: hm(16), label: '1 PM to 4 PM' };

/** The time slots a person can plan for. */
export const WINDOWS = [
  { id: 'morning', label: 'Morning', hours: '8:30 AM to 1 PM', start: hm(8, 30), end: hm(13), days: 1 },
  { id: 'evening', label: 'Evening', hours: '4 PM to 9 PM', start: hm(16), end: hm(21), days: 1 },
  { id: 'full', label: 'Full day', hours: '8:30 AM to 8:30 PM', start: hm(8, 30), end: hm(20, 30), days: 1 },
  { id: 'weekend', label: 'Weekend', hours: '2 days, 8:30 AM to 8:30 PM each', start: hm(8, 30), end: hm(20, 30), days: 2 },
];

export const VIBES = [
  { id: 'solo', label: 'Solo explorer', icon: 'person', blurb: 'A balanced mix of sights, food and a viewpoint.' },
  { id: 'college', label: 'College squad', icon: 'group', blurb: 'Student hangouts, cheap eats and open-air spots.' },
  { id: 'heritage', label: 'Heritage walk', icon: 'fort', blurb: 'Peshwa-era Pune: wadas, temples, museums and old lanes.' },
  { id: 'food', label: 'Food crawl', icon: 'restaurant', blurb: 'Irani cafes, misal, mastani and bakeries.' },
  { id: 'nature', label: 'Hills & gardens', icon: 'hiking', blurb: 'Tekdi trails, parks and green lawns.' },
];

/** Budget per person, per day, in rupees. */
export const BUDGET = { min: 300, max: 3000, step: 100, default: 1200 };

/** Group size. An auto-rickshaw carries up to `perAuto` passengers. */
export const PEOPLE = { min: 1, max: 6, default: 1, perAuto: 3 };

/**
 * Travel assumptions. Distances are estimated from straight-line distance,
 * so they are labelled "about" everywhere. Exact routes open in Google Maps.
 */
export const TRAVEL = { roadFactor: 1.3, fixedMinutes: 10, minutesPerKm: 4 };

/** When each kind of meal usually happens. */
export const MEALS = {
  breakfast: { label: 'Breakfast', from: hm(7, 30), to: hm(10, 30) },
  lunch: { label: 'Lunch', from: hm(12), to: hm(14, 30) },
  snack: { label: 'Tea & snacks', from: hm(16, 30), to: hm(18, 30) },
  dinner: { label: 'Dinner', from: hm(19), to: hm(21) },
};
export const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];

/** Most plans one account can save (also enforced in the database). */
export const MAX_SAVED_PLANS = 50;
