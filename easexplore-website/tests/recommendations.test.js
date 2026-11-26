// Run with: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BEST_FOR, MAX_FAVOURITES, PRICE_FILTERS } from '../src/config/recommendations.js';
import { PLACES } from '../src/data/places.js';
import { STAY_AREAS, TRAILS, ZONES, mapsSearchUrl, planPlaceUrl, trailUrl } from '../src/data/recommendations.js';
import { buildItinerary, inputsFromParams } from '../src/utils/itinerary.js';
import { filterPlaces, foodPlaces, zonesWithPlaces } from '../src/utils/recommendations.js';

const food = foodPlaces();
const ids = (list) => list.map((p) => p.id);

describe('food catalogue data', () => {
  it('has food places, each with what to order and what it is good for', () => {
    assert.ok(food.length >= 6);
    for (const p of food) {
      assert.ok(p.signature && p.signature.length > 3, `${p.id} signature`);
      assert.ok(Array.isArray(p.bestFor) && p.bestFor.length > 0, `${p.id} bestFor`);
      assert.ok(p.bestFor.every((b) => BEST_FOR.some((x) => x.id === b)), `${p.id} has an unknown bestFor`);
    }
  });

  it('every place in the catalogue sits in a known area', () => {
    for (const p of PLACES) assert.ok(ZONES.some((z) => z.id === p.zone), `${p.id} has unknown zone "${p.zone}"`);
  });

  it('only offers area filters that have at least one food place', () => {
    const zones = zonesWithPlaces();
    assert.ok(zones.length >= 3);
    for (const z of zones) assert.ok(food.some((p) => p.zone === z.id), `${z.id} is empty`);
  });

  it('every "good for" filter finds at least one place (no dead filter buttons)', () => {
    for (const b of BEST_FOR) assert.ok(filterPlaces(food, { bestFor: b.id }).length > 0, `${b.id} finds nothing`);
    for (const z of zonesWithPlaces()) assert.ok(filterPlaces(food, { zone: z.id }).length > 0);
    for (const f of PRICE_FILTERS) assert.ok(filterPlaces(food, { maxSpend: f.max }).length > 0, `${f.id} finds nothing`);
  });
});

describe('searching and filtering', () => {
  it('returns everything with no filters', () => {
    assert.equal(filterPlaces(food).length, food.length);
    assert.equal(filterPlaces(food, {}).length, food.length);
    assert.equal(filterPlaces(food, { query: '   ' }).length, food.length);
  });

  it('searches names, areas and signature dishes, ignoring capitals', () => {
    assert.deepEqual(ids(filterPlaces(food, { query: 'GOODLUCK' })), ['cafe-goodluck']);
    assert.ok(ids(filterPlaces(food, { query: 'misal' })).includes('bedekar'));
    assert.ok(ids(filterPlaces(food, { query: 'bun maska' })).includes('cafe-goodluck'));
    assert.ok(ids(filterPlaces(food, { query: 'narayan peth' })).includes('bedekar'));
    assert.ok(ids(filterPlaces(food, { query: 'spdp' })).includes('vaishali'));
  });

  it('needs every word to match, in any order', () => {
    assert.ok(ids(filterPlaces(food, { query: 'maska bun' })).includes('cafe-goodluck'));
    assert.equal(filterPlaces(food, { query: 'maska pizza' }).length, 0);
  });

  it('finds nothing for nonsense, and never crashes on special characters', () => {
    assert.equal(filterPlaces(food, { query: 'zzzzzz' }).length, 0);
    for (const odd of ['(', ')', '[', '*', '\\', '.*', '?', '+', '<script>', "'; drop table", '🍕', 'a'.repeat(500)]) {
      assert.doesNotThrow(() => filterPlaces(food, { query: odd }), odd);
    }
  });

  it('filters by area, meal, price and afternoon, and combines them', () => {
    assert.ok(filterPlaces(food, { zone: 'camp' }).every((p) => p.zone === 'camp'));
    assert.ok(filterPlaces(food, { bestFor: 'breakfast' }).every((p) => p.bestFor.includes('breakfast')));
    assert.ok(filterPlaces(food, { maxSpend: 100 }).every((p) => p.spend <= 100));
    assert.ok(filterPlaces(food, { openAfternoon: true }).every((p) => p.afternoon === 'open'));
    const both = filterPlaces(food, { zone: 'deccan', bestFor: 'dinner' });
    assert.ok(both.length > 0 && both.every((p) => p.zone === 'deccan' && p.bestFor.includes('dinner')));
    assert.equal(filterPlaces(food, { zone: 'camp', bestFor: 'breakfast' }).length, 0);
  });

  it('shows only favourites when asked, and nothing when there are none', () => {
    assert.deepEqual(ids(filterPlaces(food, { savedOnly: true, favouriteIds: ['vaishali', 'nope'] })), ['vaishali']);
    assert.equal(filterPlaces(food, { savedOnly: true, favouriteIds: [] }).length, 0);
    assert.equal(filterPlaces(food, { savedOnly: false, favouriteIds: [] }).length, food.length);
  });

  it('does not change the list it was given', () => {
    const copy = [...food];
    filterPlaces(food, { query: 'tea', zone: 'peth' });
    assert.deepEqual(food, copy);
  });
});

describe('trails open the planner ready-made', () => {
  for (const trail of TRAILS) {
    it(`"${trail.title}": every place fits in one plan at the default budget`, () => {
      assert.ok(trail.pinned.length >= 1 && trail.pinned.length <= 3, 'pins must be 1 to 3');
      const plan = buildItinerary({ vibe: trail.vibe, budget: 1200, windowId: trail.windowId, pinned: trail.pinned });
      const inPlan = new Set(plan.days.flatMap((d) => d.stops.filter((s) => s.kind === 'stop').map((s) => s.place.id)));
      for (const id of trail.pinned) assert.ok(inPlan.has(id), `${id} is missing from the "${trail.title}" plan`);
      assert.ok(!plan.warnings.some((w) => w.tone === 'error' || w.text.includes('did not fit')), JSON.stringify(plan.warnings));
    });

    it(`"${trail.title}": also fits at a smaller ₹800 budget`, () => {
      const plan = buildItinerary({ vibe: trail.vibe, budget: 800, windowId: trail.windowId, pinned: trail.pinned });
      const inPlan = new Set(plan.days.flatMap((d) => d.stops.filter((s) => s.kind === 'stop').map((s) => s.place.id)));
      for (const id of trail.pinned) assert.ok(inPlan.has(id), `${id} is missing at ₹800`);
    });

    it(`"${trail.title}": its link reads back into exactly the same settings`, () => {
      const url = new URL(trailUrl(trail), 'https://example.com');
      assert.equal(url.pathname, '/itinerary');
      const { inputs } = inputsFromParams(url.searchParams);
      assert.equal(inputs.vibe, trail.vibe);
      assert.equal(inputs.windowId, trail.windowId);
      assert.deepEqual(inputs.pinned, trail.pinned);
    });
  }

  it('every trail uses real places and has a title, blurb and icon', () => {
    for (const t of TRAILS) {
      assert.ok(t.title && t.blurb && t.icon);
      for (const id of t.pinned) assert.ok(PLACES.some((p) => p.id === id), `${t.id}: unknown place ${id}`);
    }
    assert.equal(new Set(TRAILS.map((t) => t.id)).size, TRAILS.length);
  });
});

describe('reading planner links', () => {
  const read = (qs) => inputsFromParams(new URLSearchParams(qs));

  it('reads a single place link', () => {
    assert.deepEqual(read(`pins=${'kelkar-museum'}`).inputs.pinned, ['kelkar-museum']);
    assert.deepEqual(new URL(planPlaceUrl('vaishali'), 'https://x.y').searchParams.get('pins'), 'vaishali');
  });

  it('keeps the Home search behaviour (?query=) and merges it with pins', () => {
    const r = read('query=Aga%20Khan%20Palace&pins=fc-road');
    assert.deepEqual(r.inputs.pinned, ['aga-khan-palace', 'fc-road']);
    assert.equal(r.queryMatch.id, 'aga-khan-palace');
    assert.equal(read('query=Swargate').queryMatch, null);
    assert.equal(read('query=Swargate').queryText, 'Swargate');
  });

  it('ignores unknown places, unknown vibes and slots, and caps pins at 3', () => {
    const r = read('vibe=hacker&window=midnight&pins=ghost,fc-road,vaishali,bedekar,kayani-bakery,ghost2');
    assert.equal(r.inputs.vibe, 'solo');
    assert.equal(r.inputs.windowId, 'full');
    assert.deepEqual(r.inputs.pinned, ['fc-road', 'vaishali', 'bedekar']);
  });

  it('does not repeat a place that appears twice', () => {
    assert.deepEqual(read('query=FC%20Road&pins=fc-road').inputs.pinned, ['fc-road']);
  });

  it('copes with nothing at all', () => {
    const r = inputsFromParams(new URLSearchParams(''));
    assert.deepEqual(r.inputs.pinned, []);
    assert.equal(r.queryText, '');
    assert.doesNotThrow(() => inputsFromParams(undefined));
    assert.doesNotThrow(() => inputsFromParams(null));
  });
});

describe('where to stay: area guides', () => {
  it('has complete guides with a Google Maps search for each', () => {
    assert.ok(STAY_AREAS.length >= 4);
    for (const a of STAY_AREAS) {
      for (const field of ['id', 'name', 'goodFor', 'feel', 'gettingAround', 'mapsQuery']) assert.ok(a[field], `${a.id} missing ${field}`);
      const url = new URL(mapsSearchUrl(a.mapsQuery));
      assert.equal(url.hostname, 'www.google.com');
      assert.equal(url.searchParams.get('query'), a.mapsQuery);
    }
    assert.equal(new Set(STAY_AREAS.map((a) => a.id)).size, STAY_AREAS.length);
  });

  it('never invents individual hotels, prices or ratings', () => {
    const text = JSON.stringify(STAY_AREAS);
    assert.ok(!/₹\s?\d/.test(text), 'a price appeared in the stay guides');
    assert.ok(!/\b(rated|stars?|\d\.\d\/5)\b/i.test(text), 'a rating appeared in the stay guides');
    assert.ok(!/(pod|loft|backpacker)/i.test(text), 'one of the old invented stays appeared');
  });
});

describe('limits', () => {
  it('has a sensible favourites limit', () => {
    assert.ok(MAX_FAVOURITES >= 50 && MAX_FAVOURITES <= 1000);
  });
});
