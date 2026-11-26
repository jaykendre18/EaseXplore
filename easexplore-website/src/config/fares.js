// ---------------------------------------------------------------------------
// EVERY fare rule used on the Transit page lives in this file.
//
// When a fare changes: edit the numbers here, update LAST_CHECKED, then run
// `npm test`. The tests will tell you if the calculator no longer matches
// the published examples.
//
// Items marked CONFIRM were found in one news source only and should be checked
// against an official page before launch (see "Before launch" in README.md).
// ---------------------------------------------------------------------------

/** Date (YYYY-MM-DD) when these numbers were last checked against published sources. */
export const LAST_CHECKED = '2026-11-08';

/** Auto-rickshaw tariff, Pune and Pimpri-Chinchwad (revised, effective 1 September 2026). */
export const AUTO = {
  effectiveFrom: '2026-09-01',
  baseFare: 30, // rupees for the first baseDistanceKm
  baseDistanceKm: 1.5,
  perKm: 20, // rupees per km after the base distance, charged per 100 m (Rs 2)
  stepKm: 0.1,
  // CONFIRM: night, waiting and luggage rules come from a single source.
  nightSurcharge: {
    city: { percent: 25, hours: '12:00 AM to 5:00 AM', label: 'Night (city)' },
    rural: { percent: 40, hours: '11:00 PM to 5:00 AM', label: 'Night (rural)' },
  },
  waitingPerMinute: 2, // 10% of the per-km rate, per minute
  luggagePerPackage: 3, // packages of 60 x 40 cm or larger; handbags are free
  // Printed tariff cards may be used while meters are recalibrated. After this
  // date fares must follow the recalibrated digital meter. The Transit page
  // switches its wording automatically.
  paperCardsValidUntil: '2027-02-28',
};

/** PMPML bus fares (effective 1 June 2025). AC and non-AC cost the same. */
export const BUS = {
  effectiveFrom: '2025-06-01',
  // Only the first three fare stages were confirmed. Longer trips are not guessed.
  slabs: [
    { upToKm: 5, fare: 10 },
    { upToKm: 10, fare: 20 },
    { upToKm: 15, fare: 30 },
  ],
  coveredUpToKm: 15,
  dayPass: 70, // Pune + Pimpri-Chinchwad together
  dayPassPmrda: 150,
  monthlyPass: 1500,
  seniorDayPass: 35, // age 60+, 50% concession (also on single tickets from 1 Nov 2026)
};

/** Pune Metro. Fare depends on the stations travelled between, so no per-trip estimate is made. */
export const METRO = {
  // CONFIRM: slab table is from a third-party site that mirrors the MahaMetro fare chart.
  slabs: [
    { label: 'Up to 1 km', fare: 10 },
    { label: '1 to 2 km', fare: 15 },
    { label: '2 to 4 km', fare: 20 },
    { label: '4 to 8 km', fare: 25 },
    { label: '8 to 16 km', fare: 30 },
    { label: 'Over 16 km', fare: 35 },
  ],
  lines: [
    { id: 'aqua', name: 'Aqua Line', route: 'Vanaz to Ramwadi', stations: 16 },
    { id: 'purple', name: 'Purple Line', route: 'PCMC to Swargate', stations: 14 },
  ],
  interchange: 'District Court (formerly Civil Court)',
  noTicketFine: 85,
};

/** RTO contacts for auto-rickshaw complaints. CONFIRM before launch. */
export const RTO_CONTACT = {
  whatsapp: '8275330101',
  phone: '020-26058080',
  email: 'rto.12-mh@gov.in',
  officesUrl: 'https://transport.maharashtra.gov.in/1184/Regional-Offices',
};

/** Where each group of numbers came from. Shown on the Transit page. */
export const SOURCES = [
  {
    topic: 'Auto-rickshaw fares from 1 September 2026',
    name: 'Pune Pulse, 1 September 2026',
    url: 'https://www.mypunepulse.com/pune-auto-fare-hike-rickshaw-fares-rise-from-today-minimum-fare-increased-to-%E2%82%B930/',
  },
  {
    topic: 'RTA approval of the new auto fares',
    name: 'Pune Now, 7 October 2026',
    url: 'https://www.punenow.com/pune-and-pimpri-chinchwad-autorickshaw-fares-to-rise-from-september-1-as-rta-increases-minimum-fare-to-%E2%82%B930/',
  },
  {
    topic: 'Auto night, waiting and luggage rules; RTO contacts',
    name: 'Puneri.news fare calculator',
    url: 'https://puneri.news/pune-pcmc-fare-calculator',
  },
  {
    topic: 'PMPML bus fares and passes (from 1 June 2025)',
    name: 'Free Press Journal',
    url: 'https://www.freepressjournal.in/pune/attention-punekars-pmpml-fare-hike-announced-for-first-time-since-2014-base-fare-now-10-check-full-fare-details',
  },
  {
    topic: 'PMPML first fare stages',
    name: 'Punekar News',
    url: 'https://www.punekarnews.in/?p=208350',
  },
  {
    topic: 'PMPML senior citizen concession (from 1 November 2026)',
    name: 'Free Press Journal',
    url: 'https://www.freepressjournal.in/pune/pune-pmpml-extends-50-bus-fare-discount-to-individual-tickets-for-senior-citizens-from-nov-1',
  },
  {
    topic: 'Pune Metro fare slabs',
    name: 'YoMetro, Pune Metro fare chart',
    url: 'https://yometro.com/pune-metro-fare',
  },
  {
    topic: 'Pune Metro discounts and fines',
    name: 'Free Press Journal',
    url: 'https://www.freepressjournal.in/amp/pune/from-fines-to-ticket-usage-time-5-essential-things-to-know-before-taking-the-pune-metro',
  },
  {
    topic: 'RTO regional offices (official)',
    name: 'Maharashtra Transport Department',
    url: RTO_CONTACT.officesUrl,
  },
];
