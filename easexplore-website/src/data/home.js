import { BUS } from '@/config/fares';
import { ROUTES } from '@/config/routes';
import { PLACES } from '@/data/places';
import { formatRupees } from '@/utils/fares';

// Home page content. Edit wording, photos and links here, not in the components.
//
// PHOTOS: put image files in `public/images/` using the names below.
// Until a file exists, a tidy placeholder panel is shown instead.
//
// FACTS: opening hours and ticket prices are deliberately not shown on the Home
// page, because published sources disagree on them. Fares that do appear here are
// read from src/config/fares.js so they can never differ from the Transit page.

const planFor = (place) => `${ROUTES.itinerary.path}?query=${encodeURIComponent(place)}`;

/** Suggestions shown in the hero search box. They come from the place catalogue, so each one works. */
export const SEARCH_SUGGESTIONS = PLACES.map((place) => place.name);

/** Large banner under the hero. */
export const FEATURED = {
  image: '/images/shaniwar-wada.jpg',
  alt: 'The Delhi Darwaza gate of Shaniwar Wada in Pune',
  tag: 'Peshwa bastion • Kasba Peth',
  kicker: 'Heart of historic Pune • Built 1732',
  title: 'Shaniwar Wada & Kasba Ganpati',
  description:
    'Walk through the gates of the Peshwa seat of power, then explore Kasba Ganpati and the old lanes of the Peth area, with snacks and sweets close by.',
  planLink: planFor('Shaniwar Wada'),
  transitLink: ROUTES.transport.path,
};

/** The four feature cards. `tone` picks the colour set. */
export const PILLARS = [
  {
    icon: 'map',
    tone: 'primary',
    title: 'Siesta-aware itinerary',
    text: 'Many old Peth shops and small eateries take an afternoon break, roughly 1 PM to 4 PM. Your day plan works around it, with indoor museums or shady gardens for those hours.',
    cta: 'Open smart planner',
    to: ROUTES.itinerary.path,
  },
  {
    icon: 'calculate',
    tone: 'secondary',
    title: 'Auto fare calculator',
    text: 'Know the legal auto-rickshaw fare for your distance before you board, including the night rate, so you can spot an overcharge.',
    cta: 'Calculate auto fare',
    to: ROUTES.transport.path,
  },
  {
    icon: 'payments',
    tone: 'tertiary',
    title: 'Campus budget splitter',
    text: 'Made for student groups around COEP, BMCC, Fergusson and Symbiosis. Split auto rides, misal breakfasts and day passes, and see who owes what.',
    cta: 'Split trip expenses',
    to: ROUTES.budget.path,
  },
  {
    icon: 'restaurant',
    tone: 'neutral',
    title: 'Local food legends',
    text: 'Iconic spots like Bedekar Tea Stall, Cafe Goodluck and Kayani Bakery, with notes on busy hours and when each one closes.',
    cta: 'View food & stays',
    to: ROUTES.recommendations.path,
  },
];

export const LANDMARK_FILTERS = [
  { id: 'all', label: 'All highlights' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'food', label: 'Food & culture' },
  { id: 'transit', label: 'Transit' },
];

/** Gallery cards. `category` must match a filter id above. */
export const LANDMARKS = [
  {
    id: 'aga-khan-palace',
    category: 'heritage',
    tone: 'primary',
    image: '/images/aga-khan-palace.jpeg',
    alt: 'Arched facade of the Aga Khan Palace and its lawns in Pune',
    icon: 'account_balance',
    badge: 'Historical memorial',
    meta: 'Kalyani Nagar • Gandhi memorial',
    title: 'Aga Khan Palace',
    text: 'Grand Italianate arches and wide lawns, where Mahatma Gandhi and Kasturba Gandhi were interned in 1942.',
    cta: 'Add to itinerary',
    to: planFor('Aga Khan Palace'),
  },
  {
    id: 'fc-road',
    category: 'food',
    tone: 'secondary',
    image: '/images/fc-road.jpg',
    alt: 'Students at a cafe on Fergusson College Road in Pune',
    icon: 'local_cafe',
    badge: 'Food & student life',
    meta: 'Deccan Gymkhana • Fergusson College',
    title: 'FC Road & Cafe Goodluck',
    text: 'The buzzing heart of Pune youth culture: bun maska, hot Irani chai, roadside book stalls and lively evenings.',
    cta: 'Explore food spots',
    to: ROUTES.recommendations.path,
  },
  {
    id: 'pune-metro',
    category: 'transit',
    tone: 'tertiary',
    image: '/images/pune-metro.jpg',
    alt: 'A Pune Metro train on an elevated viaduct',
    icon: 'directions_subway',
    badge: 'Multimodal transit',
    meta: 'Aqua & Purple lines',
    title: 'Pune Metro',
    text: 'Glide above the traffic between Vanaz, Civil Court, Swargate and beyond in air-conditioned comfort.',
    cta: 'See transit options',
    to: ROUTES.transport.path,
  },
];

/** Three short local tips. */
export const PLAYBOOK = [
  {
    badge: 'Rule #1',
    icon: 'bedtime',
    tone: 'secondary',
    title: 'Respect the afternoon break',
    text: 'Many old Peth shops and small eateries close for a break, roughly 1 PM to 4 PM. Save indoor spots, a metro ride or a shady garden like Empress Garden for those hours. EaseXplore plans around it for you.',
  },
  {
    badge: 'Rule #2',
    icon: 'local_taxi',
    tone: 'primary',
    title: 'Ask for the meter',
    text: 'Auto-rickshaws in Pune are expected to run on the meter. Check the fare for your distance in our calculator before you board, then ask the driver to start the meter.',
  },
  {
    badge: 'Rule #3',
    icon: 'confirmation_number',
    tone: 'tertiary',
    title: 'Hop around with a day pass',
    text: `A PMPML day pass costs ${formatRupees(BUS.dayPass)} for Pune and Pimpri-Chinchwad together. It pays off once your single tickets would add up to more than that. See the Transit page for current bus fares.`,
  },
];
