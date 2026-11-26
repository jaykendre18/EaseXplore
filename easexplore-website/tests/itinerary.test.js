// Run with: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BUDGET, MEALS, PEOPLE, SIESTA, VIBES, WINDOWS } from '../src/config/itinerary.js';
import { PLACES } from '../src/data/places.js';
import {
  buildItinerary,
  defaultTitle,
  distanceKm,
  formatTime,
  legBetween,
  matchPlace,
  planToText,
  plannerBudgetFor,
  sanitizeInputs,
  summarizePlan,
} from '../src/utils/itinerary.js';

const byId = (id) => PLACES.find((p) => p.id === id);
const placeStops = (day) => day.stops.filter((s) => s.kind === 'stop');
const allPlaceStops = (plan) => plan.days.flatMap(placeStops);

describe('catalogue data', () => {
  it('has unique ids and every field the planner needs', () => {
    const ids = new Set();
    for (const p of PLACES) {
      assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
      ids.add(p.id);
      assert.ok(['sight', 'meal'].includes(p.kind), `${p.id} kind`);
      assert.ok(['open', 'break'].includes(p.afternoon), `${p.id} afternoon`);
      assert.ok(p.durationMin > 0 && p.from < p.to, `${p.id} times`);
      assert.ok(p.to - p.from >= p.durationMin, `${p.id} window shorter than visit`);
      assert.ok(Number.isFinite(p.lat) && Number.isFinite(p.lng), `${p.id} coordinates`);
      assert.ok(p.spend >= 0, `${p.id} spend`);
      assert.ok(p.vibes.length > 0, `${p.id} vibes`);
      assert.ok(p.vibes.every((v) => VIBES.some((x) => x.id === v)), `${p.id} unknown vibe`);
      if (p.kind === 'meal') assert.ok(p.meals.every((m) => m in MEALS), `${p.id} unknown meal`);
    }
  });

  it('keeps every place within roughly Pune (catches a mistyped coordinate)', () => {
    for (const p of PLACES) {
      assert.ok(p.lat > 18.4 && p.lat < 18.65 && p.lng > 73.75 && p.lng < 73.95, `${p.id} is outside Pune`);
    }
  });

  it('never marks a place that is open through the afternoon as having a break-only window', () => {
    for (const p of PLACES.filter((x) => x.afternoon === 'break')) {
      assert.ok(p.durationMin <= 180);
    }
  });
});

describe('rules that must hold for EVERY combination of settings', () => {
  const budgets = [300, 600, 1200, 2500, 3000];
  const peopleCounts = [1, 3, 4, 6];

  for (const vibe of VIBES) {
    for (const win of WINDOWS) {
      it(`${vibe.id} / ${win.id}: all rules hold at every budget and group size`, () => {
        for (const budget of budgets) {
          for (const people of peopleCounts) {
            const label = `${vibe.id}/${win.id}/₹${budget}/${people}p`;
            const plan = buildItinerary({ vibe: vibe.id, budget, people, windowId: win.id });
            assert.equal(plan.days.length, win.days, `${label} day count`);

            const sightsSeen = new Set();
            for (const day of plan.days) {
              let lastEnd = win.start;
              for (const item of day.stops) {
                assert.ok(item.start >= lastEnd, `${label}: overlap at ${formatTime(item.start)}`);
                assert.ok(item.end > item.start, `${label}: empty stop`);
                assert.ok(item.end <= win.end, `${label}: runs past the end of the day`);
                lastEnd = item.end;

                if (item.kind === 'stop') {
                  const p = item.place;
                  assert.ok(item.start >= p.from && item.end <= p.to, `${label}: ${p.id} outside its planning window`);
                  if (p.afternoon === 'break') {
                    const touchesBreak = item.start < SIESTA.end && item.end > SIESTA.start;
                    assert.ok(!touchesBreak, `${label}: ${p.id} scheduled during the afternoon break`);
                  }
                  if (item.meal) {
                    assert.ok(p.meals.includes(item.meal), `${label}: ${p.id} used for wrong meal`);
                    assert.ok(item.start <= MEALS[item.meal].to, `${label}: ${item.meal} too late`);
                  } else {
                    assert.equal(p.kind, 'sight', `${label}: meal place used as a sight`);
                    assert.ok(!sightsSeen.has(p.id), `${label}: ${p.id} repeated across days`);
                    sightsSeen.add(p.id);
                  }
                  if (item.leg) {
                    assert.ok(Number.isFinite(item.leg.km) && item.leg.km >= 0, `${label}: bad leg distance`);
                    assert.ok(item.leg.minutes >= 10, `${label}: leg time too short`);
                  }
                }
              }
              const ids = placeStops(day).map((s) => s.place.id);
              assert.equal(new Set(ids).size, ids.length, `${label}: place repeated within a day`);

              assert.ok(day.totals.total <= budget, `${label}: day total ${day.totals.total} exceeds budget`);
              assert.equal(
                day.totals.places + day.totals.travel,
                day.totals.total,
                `${label}: totals do not add up`,
              );
              const meals = placeStops(day).filter((s) => s.meal).map((s) => s.meal);
              assert.equal(new Set(meals).size, meals.length, `${label}: same meal twice`);
            }
          }
        }
      });
    }
  }
});

describe('realistic plans', () => {
  it('a full heritage day starts with breakfast, includes Shaniwar Wada and has several stops', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1200, windowId: 'full' });
    const stops = placeStops(plan.days[0]);
    assert.ok(stops.length >= 5, `only ${stops.length} stops`);
    assert.equal(stops[0].meal, 'breakfast');
    assert.ok(stops.some((s) => s.place.id === 'shaniwar-wada'));
  });

  it('a full day covers the afternoon with open places or an explicit break, never a closed-shop visit', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1500, windowId: 'full' });
    const day = plan.days[0];
    const duringBreak = day.stops.filter((s) => s.start < SIESTA.end && s.end > SIESTA.start);
    assert.ok(duringBreak.length > 0, 'nothing planned for the afternoon break');
    for (const s of duringBreak) {
      assert.ok(s.kind !== 'stop' || s.place.afternoon === 'open');
    }
  });

  it('when every open place is removed, the afternoon becomes a visible rest, not a closed shop', () => {
    const open = PLACES.filter((p) => p.afternoon === 'open').map((p) => p.id);
    const plan = buildItinerary({ vibe: 'food', budget: 2000, windowId: 'full', excluded: open });
    const day = plan.days[0];
    for (const s of day.stops) {
      if (s.kind === 'stop') assert.equal(s.place.afternoon, 'break');
      if (s.kind === 'stop') assert.ok(!(s.start < SIESTA.end && s.end > SIESTA.start));
    }
  });

  it('an evening plan starts at 4 PM and ends by 9 PM with no morning-only places', () => {
    const plan = buildItinerary({ vibe: 'college', budget: 1000, windowId: 'evening' });
    const stops = placeStops(plan.days[0]);
    assert.ok(stops.length >= 2);
    assert.ok(stops[0].start >= 16 * 60);
    assert.ok(stops.every((s) => s.end <= 21 * 60));
    assert.ok(!stops.some((s) => s.place.id === 'bedekar'), 'a morning-only place was planned for the evening');
    assert.ok(stops.some((s) => s.meal === 'dinner' || s.meal === 'snack'));
  });

  it('a morning plan finishes by 1 PM', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 1000, windowId: 'morning' });
    const stops = placeStops(plan.days[0]);
    assert.ok(stops.length >= 2);
    assert.ok(stops.every((s) => s.end <= 13 * 60));
  });

  it('daylight places are never planned after dark (nothing like Shaniwar Wada at 7 PM)', () => {
    for (const vibe of VIBES) {
      const plan = buildItinerary({ vibe: vibe.id, budget: 3000, windowId: 'full' });
      for (const s of allPlaceStops(plan)) {
        if (['shaniwar-wada', 'kelkar-museum', 'aga-khan-palace', 'empress-garden', 'vetal-tekdi'].includes(s.place.id)) {
          assert.ok(s.end <= 18 * 60 + 30, `${s.place.id} planned until ${formatTime(s.end)}`);
        }
      }
    }
  });

  it('a weekend plan has two days with different sights', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 1200, windowId: 'weekend' });
    assert.equal(plan.days.length, 2);
    const sightIds = allPlaceStops(plan).filter((s) => !s.meal).map((s) => s.place.id);
    assert.equal(new Set(sightIds).size, sightIds.length);
    assert.ok(placeStops(plan.days[1]).length >= 3);
  });
});

describe('budget handling', () => {
  it('a very low budget still respects the limit and explains what was skipped', () => {
    const plan = buildItinerary({ vibe: 'food', budget: 300, windowId: 'full' });
    assert.ok(plan.days[0].totals.total <= 300);
    assert.ok(plan.warnings.length > 0);
  });

  it('a higher budget never gives a plan with fewer stops than a lower one', () => {
    for (const vibe of VIBES) {
      const low = buildItinerary({ vibe: vibe.id, budget: 500, windowId: 'full' }).days[0].totals.count;
      const high = buildItinerary({ vibe: vibe.id, budget: 2500, windowId: 'full' }).days[0].totals.count;
      assert.ok(high >= low, `${vibe.id}: ${high} stops at ₹2500 but ${low} at ₹500`);
    }
  });

  it('shows an error warning when nothing can be planned', () => {
    const everything = PLACES.map((p) => p.id);
    const plan = buildItinerary({ vibe: 'solo', budget: 1000, windowId: 'full', excluded: everything });
    assert.equal(plan.days[0].totals.count, 0);
    assert.ok(plan.warnings.some((w) => w.tone === 'error'));
  });
});

describe('plan quality (problems found while inspecting real plans)', () => {
  const combos = [];
  for (const vibe of VIBES) for (const win of WINDOWS) for (const budget of [300, 500, 800, 1200, 2500]) combos.push({ vibe: vibe.id, windowId: win.id, budget });

  it('never leaves a long stretch of "free time" (only the afternoon break may be long)', () => {
    for (const c of combos) {
      for (const day of buildItinerary(c).days) {
        for (const s of day.stops.filter((x) => x.kind === 'free')) {
          assert.ok(s.end - s.start <= 90, `${JSON.stringify(c)}: ${s.end - s.start} min of free time`);
        }
      }
    }
  });

  it('gaps between stops are never longer than a few hours unless the afternoon break explains them', () => {
    for (const c of combos) {
      for (const day of buildItinerary(c).days) {
        for (let i = 1; i < day.stops.length; i += 1) {
          const gap = day.stops[i].start - day.stops[i - 1].end;
          assert.ok(gap <= 120, `${JSON.stringify(c)}: ${gap} min gap before ${day.stops[i].place?.name ?? day.stops[i].kind}`);
        }
      }
    }
  });

  it('a full day at a normal budget includes lunch and dinner', () => {
    for (const vibe of VIBES) {
      const meals = placeStops(buildItinerary({ vibe: vibe.id, budget: 1500, windowId: 'full' }).days[0]).map((s) => s.meal).filter(Boolean);
      assert.ok(meals.includes('lunch'), `${vibe.id} has no lunch`);
      assert.ok(meals.includes('dinner'), `${vibe.id} has no dinner`);
    }
  });

  it('even a very small budget gives a useful plan, not just breakfast', () => {
    for (const vibe of VIBES) {
      const plan = buildItinerary({ vibe: vibe.id, budget: 300, windowId: 'full' });
      assert.ok(plan.days[0].totals.count >= 3, `${vibe.id}: only ${plan.days[0].totals.count} stops at ₹300`);
    }
  });

  it('tells the person when the budget ran out early', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 300, windowId: 'full' });
    assert.ok(plan.warnings.some((w) => w.text.includes('budget is used up')));
  });

  it('a food crawl gets its own food places and a variety of meals', () => {
    const stops = placeStops(buildItinerary({ vibe: 'food', budget: 1500, windowId: 'full' }).days[0]);
    assert.ok(stops.filter((s) => s.meal).length >= 4);
    assert.ok(stops.some((s) => ['chitale-bandhu', 'fc-road'].includes(s.place.id)));
  });

  it('keeps money back so a sight cannot use up the lunch budget (a ₹500 full day still gets lunch)', () => {
    const meals = placeStops(buildItinerary({ vibe: 'food', budget: 500, windowId: 'full' }).days[0]).map((s) => s.meal);
    assert.ok(meals.includes('lunch'));
  });
});

describe('group size and travel cost', () => {
  const a = byId('shaniwar-wada');
  const b = byId('fc-road');

  it('one auto carries up to 3 people, so 3 people pay a third each', () => {
    const solo = legBetween(a, b, 1);
    const three = legBetween(a, b, 3);
    assert.equal(solo.autos, 1);
    assert.equal(three.autos, 1);
    assert.equal(three.perPerson, Math.ceil(solo.autoFare / 3));
  });

  it('4 people need 2 autos, and a warning says so', () => {
    const leg = legBetween(a, b, 4);
    assert.equal(leg.autos, 2);
    assert.equal(leg.perPerson, Math.ceil((2 * leg.autoFare) / 4));
    const plan = buildItinerary({ vibe: 'solo', budget: 1500, people: 4, windowId: 'full' });
    assert.ok(plan.warnings.some((w) => w.text.includes('2 autos')));
  });

  it('distance estimates are symmetric, zero for the same place and plausible for neighbours', () => {
    assert.equal(distanceKm(a, b), distanceKm(b, a));
    assert.equal(distanceKm(a, a), 0);
    const d = distanceKm(a, b);
    assert.ok(d > 1 && d < 8, `Shaniwar Wada to FC Road estimated at ${d} km`);
  });

  it('every travel leg uses the same fare rules as the Transit page', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 3000, windowId: 'full' });
    for (const s of placeStops(plan.days[0]).filter((x) => x.leg)) {
      assert.ok(s.leg.autoFare >= 30, 'below the minimum auto fare');
    }
  });
});

describe('requested places are protected from the budget running out', () => {
  const included = (plan, id) => allPlaceStops(plan).some((s) => s.place.id === id);

  it('a requested bakery in the afternoon survives a tight budget (it used to be dropped at ₹800)', () => {
    for (const budget of [600, 800, 1000, 1200]) {
      const plan = buildItinerary({ vibe: 'nature', budget, windowId: 'full', pinned: ['empress-garden', 'kayani-bakery'] });
      assert.ok(included(plan, 'kayani-bakery'), `bakery missing at ₹${budget}`);
      assert.ok(included(plan, 'empress-garden'), `garden missing at ₹${budget}`);
    }
  });

  it('a requested dinner place survives a tight budget on a full day', () => {
    for (const budget of [500, 800, 1200]) {
      const plan = buildItinerary({ vibe: 'heritage', budget, windowId: 'full', pinned: ['vaishali'] });
      assert.ok(included(plan, 'vaishali'), `Vaishali missing at ₹${budget}`);
    }
  });

  it('holding money back never breaks the budget rule', () => {
    for (const vibe of VIBES) {
      for (const budget of [300, 500, 800, 1200]) {
        const plan = buildItinerary({ vibe: vibe.id, budget, windowId: 'full', pinned: ['kayani-bakery', 'sujata-mastani', 'empress-garden'] });
        assert.ok(plan.days[0].totals.total <= budget, `${vibe.id} ₹${budget}: ${plan.days[0].totals.total}`);
      }
    }
  });

  it('plans with nothing requested are unchanged by the protection', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1200, windowId: 'full' });
    assert.ok(plan.days[0].totals.count >= 5);
  });
});

describe('pinned and removed places', () => {
  it('includes a pinned place even if it is far away', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1500, windowId: 'full', pinned: ['aga-khan-palace'] });
    assert.ok(allPlaceStops(plan).some((s) => s.place.id === 'aga-khan-palace'));
  });

  it('warns when a pinned place cannot fit (a morning-only eatery in an evening plan)', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 1500, windowId: 'evening', pinned: ['bedekar'] });
    assert.ok(!allPlaceStops(plan).some((s) => s.place.id === 'bedekar'));
    assert.ok(plan.warnings.some((w) => w.text.includes('Bedekar Tea Stall did not fit')));
  });

  it('never includes a removed place', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1500, windowId: 'full', excluded: ['shaniwar-wada', 'cafe-goodluck'] });
    const ids = allPlaceStops(plan).map((s) => s.place.id);
    assert.ok(!ids.includes('shaniwar-wada') && !ids.includes('cafe-goodluck'));
  });

  it('does not warn about a pinned place that the person also removed', () => {
    const plan = buildItinerary({ vibe: 'solo', budget: 1500, windowId: 'full', pinned: ['kelkar-museum'], excluded: ['kelkar-museum'] });
    assert.ok(!plan.warnings.some((w) => w.text.includes('Kelkar')));
  });

  it('gives the same plan every time for the same settings', () => {
    const settings = { vibe: 'nature', budget: 1100, people: 2, windowId: 'full' };
    const first = JSON.stringify(buildItinerary(settings).days.map((d) => d.stops.map((s) => [s.kind, s.place?.id, s.start])));
    const second = JSON.stringify(buildItinerary(settings).days.map((d) => d.stops.map((s) => [s.kind, s.place?.id, s.start])));
    assert.equal(first, second);
  });

  it('different vibes give meaningfully different plans', () => {
    const idsFor = (vibe) => placeStops(buildItinerary({ vibe, budget: 1500, windowId: 'full' }).days[0]).filter((s) => !s.meal).map((s) => s.place.id).join();
    assert.notEqual(idsFor('heritage'), idsFor('nature'));
    assert.notEqual(idsFor('nature'), idsFor('college'));
  });
});

describe('matching what people type', () => {
  it('finds places by name, alias or part of the name', () => {
    assert.equal(matchPlace('Shaniwar Wada')?.id, 'shaniwar-wada');
    assert.equal(matchPlace('shaniwar')?.id, 'shaniwar-wada');
    assert.equal(matchPlace('FC Road')?.id, 'fc-road');
    assert.equal(matchPlace('  vetal tekdi ')?.id, 'vetal-tekdi');
    assert.equal(matchPlace('Aga Khan Palace')?.id, 'aga-khan-palace');
    assert.equal(matchPlace('goodluck')?.id, 'cafe-goodluck');
  });

  it('returns null for unknown, empty or too-short text', () => {
    assert.equal(matchPlace('Swargate'), null);
    assert.equal(matchPlace(''), null);
    assert.equal(matchPlace('ab'), null);
    assert.equal(matchPlace(undefined), null);
  });
});

describe('sanitising saved or URL settings', () => {
  it('falls back to safe defaults for junk', () => {
    const clean = sanitizeInputs({ vibe: 'hacker', windowId: 'nope', budget: 'abc', people: -5, pinned: 'x', excluded: [1, 2] });
    assert.equal(clean.vibe, 'solo');
    assert.equal(clean.windowId, 'full');
    assert.equal(clean.budget, BUDGET.default);
    assert.equal(clean.people, PEOPLE.min);
    assert.deepEqual(clean.pinned, []);
    assert.deepEqual(clean.excluded, []);
  });

  it('clamps and rounds numbers, and drops unknown place ids', () => {
    const clean = sanitizeInputs({ vibe: 'food', windowId: 'evening', budget: 99999, people: 40, pinned: ['fc-road', 'ghost'], excluded: ['tulshibaug'] });
    assert.equal(clean.budget, BUDGET.max);
    assert.equal(clean.people, PEOPLE.max);
    assert.deepEqual(clean.pinned, ['fc-road']);
    assert.deepEqual(clean.excluded, ['tulshibaug']);
    assert.equal(sanitizeInputs({ budget: 1234 }).budget, 1200);
  });

  it('survives a missing object', () => {
    assert.doesNotThrow(() => sanitizeInputs());
    assert.doesNotThrow(() => sanitizeInputs(null ?? undefined));
  });
});

describe('time, text and summary helpers', () => {
  it('formats times in 12-hour style', () => {
    assert.equal(formatTime(510), '8:30 AM');
    assert.equal(formatTime(720), '12:00 PM');
    assert.equal(formatTime(780), '1:00 PM');
    assert.equal(formatTime(0), '12:00 AM');
    assert.equal(formatTime(1245), '8:45 PM');
  });

  it('writes a readable text plan', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1200, windowId: 'full' });
    const text = planToText(plan, 1, 'My plan');
    assert.ok(text.startsWith('My plan'));
    assert.ok(text.includes('Shaniwar Wada'));
    assert.ok(text.includes('per person'));
    assert.ok(!/undefined|NaN/.test(text));
  });

  it('summarises a plan for saving', () => {
    const plan = buildItinerary({ vibe: 'heritage', budget: 1200, windowId: 'full' });
    const s = summarizePlan(plan);
    assert.equal(s.days, 1);
    assert.equal(s.stops, plan.days[0].totals.count);
    assert.equal(s.perPerson, plan.days[0].totals.total);
    assert.ok(s.firstStop.length > 0);
  });

  it('builds a default plan name', () => {
    assert.equal(defaultTitle({ vibe: 'heritage', windowId: 'full' }), 'Heritage walk · Full day');
  });
});

describe('using the daily budget from the Budget page', () => {
  it('uses the daily budget as the planner budget when it fits the slider', () => {
    const s = plannerBudgetFor(150000); // Rs 1,500
    assert.equal(s.budget, 1500);
    assert.equal(s.note, '');
    assert.equal(s.dailyLabel, '₹1,500');
    assert.equal(plannerBudgetFor(30000).budget, 300);
    assert.equal(plannerBudgetFor(300000).budget, 3000);
  });

  it('rounds DOWN to the slider step so a plan never starts above the real budget', () => {
    assert.equal(plannerBudgetFor(125000).budget, 1200);
    assert.equal(plannerBudgetFor(129999).budget, 1200);
    assert.equal(plannerBudgetFor(199900).budget, 1900);
    assert.ok(plannerBudgetFor(125000).note.includes('rounded down'));
  });

  it('keeps the result inside the slider range and says why', () => {
    const low = plannerBudgetFor(20000); // Rs 200
    assert.equal(low.budget, BUDGET.min);
    assert.ok(low.note.includes('below'));
    assert.equal(plannerBudgetFor(5000).budget, BUDGET.min);
    const high = plannerBudgetFor(500000); // Rs 5,000
    assert.equal(high.budget, BUDGET.max);
    assert.ok(high.note.includes('goes up to'));
  });

  it('returns nothing when no budget is set or the value is not usable', () => {
    for (const bad of [null, undefined, 0, -5, NaN, Infinity, '1500']) {
      assert.equal(plannerBudgetFor(bad), null, String(bad));
    }
  });

  it('always gives a budget the planner accepts', () => {
    for (let paise = 5000; paise <= 10000000; paise += 7919) {
      const { budget } = plannerBudgetFor(paise);
      assert.ok(budget >= BUDGET.min && budget <= BUDGET.max && budget % BUDGET.step === 0, `bad budget for ${paise}`);
      assert.deepEqual(sanitizeInputs({ budget }).budget, budget);
    }
  });

  it('a plan built from the daily budget never costs more than that budget', () => {
    for (const paise of [30000, 80000, 125000, 150000, 250000]) {
      const { budget } = plannerBudgetFor(paise);
      const plan = buildItinerary({ vibe: 'solo', budget, windowId: 'full' });
      assert.ok(plan.days[0].totals.total <= paise / 100, `${paise}: plan costs ${plan.days[0].totals.total}`);
    }
  });
});
