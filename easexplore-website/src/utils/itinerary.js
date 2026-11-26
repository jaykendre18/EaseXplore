// The Smart Itinerary planner. Pure JavaScript: no React, no browser, so it can be tested with `npm test`.
// Settings live in src/config/itinerary.js and the places in src/data/places.js.
//
// Relative imports (not "@/") so Node can run this file in tests.
import { BUDGET, MEAL_ORDER, MEALS, PEOPLE, SIESTA, TRAVEL, VIBES, WINDOWS } from '../config/itinerary.js';
import { PLACES } from '../data/places.js';
import { formatMoney } from './budget.js';
import { autoFare, formatRupees } from './fares.js';

const ceil5 = (minutes) => Math.ceil(minutes / 5) * 5;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Rupees kept back for the auto ride to the next meal. */
const MEAL_TRAVEL_RESERVE = 30;

/** The most of the budget that may be held back for the next meal. */
const MAX_RESERVE_SHARE = 0.4;

/** The most of the budget that may be held back in total (for the next meal and for requested places). */
const MAX_TOTAL_RESERVE = 0.6;

/** Longest stretch of "free time" the planner will leave between stops, in minutes. */
const MAX_FREE_GAP = 90;

/** Minutes a sight must leave before the end of the day when a meal is still to come. */
const MIN_MEAL_TIME = 55;

/** 510 -> "8:30 AM" */
export function formatTime(minutes) {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${hours24 >= 12 ? 'PM' : 'AM'}`;
}

/** Estimated road distance in km: straight-line distance times a road factor, to 0.1 km. */
export function distanceKm(a, b) {
  const earthRadiusKm = 6371;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
  return Math.round(straight * TRAVEL.roadFactor * 10) / 10;
}

export function mapsDirectionsUrl(from, to) {
  const params = new URLSearchParams({
    api: '1',
    origin: `${from.name}, Pune`,
    destination: `${to.name}, Pune`,
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Travel between two places: estimated distance, time, and auto fare (shared between `people`). */
export function legBetween(from, to, people) {
  const km = distanceKm(from, to);
  const minutes = ceil5(TRAVEL.fixedMinutes + km * TRAVEL.minutesPerKm);
  const fareEach = autoFare({ distanceKm: Math.max(km, 0.1) }).total;
  const autos = Math.ceil(people / PEOPLE.perAuto);
  const perPerson = Math.ceil((autos * fareEach) / people);
  return { km, minutes, autoFare: fareEach, autos, perPerson, mapsUrl: mapsDirectionsUrl(from, to) };
}

/** Whether a meal's usual time overlaps enough with the planned window to be worth including. */
function mealUsable(mealId, win) {
  const meal = MEALS[mealId];
  return win.end >= meal.from + 30 && win.start <= meal.to - 30;
}

/**
 * The meal that should happen now, or null. Meals whose time has already passed are
 * marked as done (so they are not offered again).
 */
function dueMeal(cursor, done, win) {
  for (const id of MEAL_ORDER) {
    if (done.has(id) || !mealUsable(id, win)) continue;
    const meal = MEALS[id];
    if (cursor > meal.to) {
      done.add(id);
      continue;
    }
    return cursor >= meal.from - 30 ? id : null;
  }
  return null;
}

/** The next meal still to come (not yet due), used to keep sights from running over it. */
function nextMeal(cursor, done, win) {
  for (const id of MEAL_ORDER) {
    if (done.has(id) || !mealUsable(id, win)) continue;
    const meal = MEALS[id];
    if (cursor > meal.to) continue;
    return { id, dueAt: meal.from - 30, to: meal.to };
  }
  return null;
}

function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function planDay({ win, vibe, budget, people, pinned, excluded, usedBefore, places }) {
  const sights = places.filter((p) => p.kind === 'sight' && !excluded.has(p.id) && !usedBefore.has(p.id));
  const mealPlaces = places.filter((p) => p.kind === 'meal' && !excluded.has(p.id));

  const stops = [];
  const skipped = [];
  const mealsDone = new Set();
  const chosen = new Set();
  let cursor = win.start;
  let previous = null;
  let spent = 0;
  let placesSpent = 0;
  let travelSpent = 0;

  /** The least a meal could cost right now (cheapest matching place plus a typical auto ride). */
  const cheapestMeal = (mealId) => {
    const costs = mealPlaces.filter((p) => p.meals.includes(mealId) && !chosen.has(p.id)).map((p) => p.spend);
    return costs.length > 0 ? Math.min(...costs) + MEAL_TRAVEL_RESERVE : 0;
  };

  const pinnedPlaces = [...pinned]
    .map((id) => places.find((p) => p.id === id))
    .filter((p) => p && !excluded.has(p.id) && !usedBefore.has(p.id));

  /** A rough check that a requested place could still be visited later today. */
  const stillPossible = (p) => {
    if (chosen.has(p.id)) return false;
    if (Math.max(cursor, p.from) + p.durationMin > Math.min(p.to, win.end)) return false;
    if (p.kind === 'meal') {
      return p.meals.some((id) => mealUsable(id, win) && !mealsDone.has(id) && cursor <= MEALS[id].to);
    }
    return true;
  };

  /** Money to hold back for requested places still to come: their cost plus a ride to them from `from`. */
  const pinnedHold = (from) =>
    pinnedPlaces
      .filter((p) => p.id !== from.id && stillPossible(p))
      .reduce((sum, p) => sum + p.spend + legBetween(from, p, people).perPerson, 0);

  /** Can `place` be visited next? Returns its start, end, travel leg and cost, or null. */
  const fit = (place, { reserve = 0, ignoreBudget = false } = {}) => {
    const leg = previous ? legBetween(previous, place, people) : null;
    let start = ceil5(cursor + (leg ? leg.minutes : 0));
    if (start < place.from) {
      if (place.from - start > 45) return null; // too long to wait for it to open
      start = place.from;
    }
    const end = start + place.durationMin;
    if (end > place.to || end > win.end) return null;
    if (place.afternoon === 'break' && start < SIESTA.end && end > SIESTA.start) return null;
    const travel = leg ? leg.perPerson : 0;
    if (!ignoreBudget && spent + place.spend + travel + reserve > budget) return null;
    return { start, end, leg, travel };
  };

  const pick = (list, mealId) => {
    const upcoming = mealId ? null : nextMeal(cursor, mealsDone, win);
    const deadline = upcoming ? Math.min(upcoming.to - 10, win.end - MIN_MEAL_TIME) : Infinity;
    // Keep enough money back for the next meal, so sights do not use it all up.
    const wanted = upcoming ? cheapestMeal(upcoming.id) : 0;
    const mealReserve = wanted <= budget * MAX_RESERVE_SHARE ? wanted : 0;
    let best = null;
    for (const place of list) {
      if (chosen.has(place.id)) continue;
      // Also keep money back for any requested place that is still to come.
      const reserve = Math.min(mealReserve + pinnedHold(place), budget * MAX_TOTAL_RESERVE);
      const slot = fit(place, { reserve });
      if (!slot) continue;
      if (mealId && slot.start > MEALS[mealId].to) continue;
      if (!mealId && slot.end > deadline) continue;

      const km = previous ? distanceKm(previous, place) : 0;
      let score = (place.vibes.includes(vibe) ? 10 : 0) - km * 1.5 - (place.spend / budget) * 8;
      if (pinned.has(place.id)) score += 100;
      if (place.best === 'morning' && slot.start < 12 * 60) score += 2;
      if (place.best === 'evening' && slot.start >= 16 * 60) score += 2;
      if (usedBefore.has(place.id)) score -= 5; // a meal place already used on an earlier day
      if (mealId) {
        // Do not use up a place that is the only remaining option for a later meal.
        const later = MEAL_ORDER.slice(MEAL_ORDER.indexOf(mealId) + 1).filter((id) => mealUsable(id, win) && !mealsDone.has(id));
        const soleOption = later.filter((id) => {
          const options = mealPlaces.filter((p) => p.meals.includes(id) && !chosen.has(p.id));
          return options.length === 1 && options[0].id === place.id;
        }).length;
        score -= soleOption * 15;
      }

      if (!best || score > best.score || (score === best.score && place.id < best.place.id)) {
        best = { place, slot, score };
      }
    }
    return best;
  };

  const commit = ({ place, slot }, mealId) => {
    stops.push({ kind: 'stop', place, meal: mealId, start: slot.start, end: slot.end, leg: slot.leg });
    chosen.add(place.id);
    placesSpent += place.spend;
    travelSpent += slot.travel;
    spent += place.spend + slot.travel;
    cursor = slot.end;
    previous = place;
  };

  /** Adds free time or the afternoon break, joining it to a gap that is already there. */
  const addGap = (kind, start, end) => {
    const overlap = Math.max(0, Math.min(end, SIESTA.end) - Math.max(start, SIESTA.start));
    const label = kind === 'rest' || overlap >= 60 ? 'rest' : 'free';
    const last = stops[stops.length - 1];
    if (last && last.kind !== 'stop') {
      last.end = end;
      last.kind = last.kind === 'rest' || label === 'rest' ? 'rest' : 'free';
    } else {
      stops.push({ kind: label, start, end });
    }
  };

  for (let guard = 0; guard < 60; guard += 1) {
    const mealId = dueMeal(cursor, mealsDone, win);

    if (mealId) {
      const choice = pick(
        mealPlaces.filter((p) => p.meals.includes(mealId)),
        mealId,
      );
      mealsDone.add(mealId);
      if (choice) commit(choice, mealId);
      else skipped.push(MEALS[mealId].label.toLowerCase());
      continue;
    }

    const choice = pick(sights, null);
    if (choice) {
      commit(choice, null);
      continue;
    }

    // Nothing fits right now. If it is around the afternoon break, or a meal is coming up,
    // wait until then and see whether something fits afterwards. If the person asked for a
    // specific place that is still to come, wait as long as it takes rather than drop it.
    const pinnedWaiting = pinnedPlaces.some(stillPossible);
    const upcoming = nextMeal(cursor, mealsDone, win);
    let target = null;
    let kind = 'free';
    if (cursor >= SIESTA.start - 60 && cursor < SIESTA.end) {
      target = SIESTA.end;
      kind = 'rest';
    } else if (upcoming && upcoming.dueAt > cursor && (upcoming.dueAt - cursor <= MAX_FREE_GAP || pinnedWaiting)) {
      target = upcoming.dueAt;
    }

    if (target !== null && target < win.end - 30) {
      const before = cursor;
      cursor = target;
      const nextDue = dueMeal(cursor, new Set(mealsDone), win);
      const canContinue =
        pinnedWaiting ||
        (nextDue
          ? Boolean(
              pick(
                mealPlaces.filter((p) => p.meals.includes(nextDue)),
                nextDue,
              ),
            )
          : Boolean(pick(sights, null)));
      if (canContinue) {
        if (target - before >= 30) addGap(kind, before, target);
        continue;
      }
      cursor = before;
    }
    break;
  }

  // A plan should never end with free time.
  while (stops.length > 0 && stops[stops.length - 1].kind !== 'stop') stops.pop();

  const placeStops = stops.filter((s) => s.kind === 'stop');
  const endsAt = stops.length > 0 ? stops[stops.length - 1].end : win.start;
  // Would anything still have fitted by time if the budget were unlimited?
  const budgetLimited = [...sights, ...mealPlaces].some((p) => !chosen.has(p.id) && fit(p, { ignoreBudget: true }));
  return {
    stops,
    skipped,
    endsAt,
    budgetLimited,
    totals: { places: placesSpent, travel: travelSpent, total: spent, count: placeStops.length },
  };
}

/**
 * Build a plan.
 * @param {object} options
 * @param {string} options.vibe         id from VIBES
 * @param {number} options.budget       rupees per person, per day
 * @param {number} [options.people]     group size (1 to 6)
 * @param {string} [options.windowId]   id from WINDOWS
 * @param {string[]} [options.pinned]   place ids the person asked to include
 * @param {string[]} [options.excluded] place ids the person removed
 */
export function buildItinerary({
  vibe,
  budget,
  people = PEOPLE.default,
  windowId = 'full',
  pinned = [],
  excluded = [],
  places = PLACES,
}) {
  const win = WINDOWS.find((w) => w.id === windowId) ?? WINDOWS.find((w) => w.id === 'full');
  const pinnedSet = new Set(pinned);
  const excludedSet = new Set(excluded);
  const used = new Set();
  const autos = Math.ceil(people / PEOPLE.perAuto);

  const days = [];
  for (let number = 1; number <= win.days; number += 1) {
    const day = planDay({ win, vibe, budget, people, pinned: pinnedSet, excluded: excludedSet, usedBefore: used, places });
    day.stops.forEach((s) => s.kind === 'stop' && used.add(s.place.id));
    days.push({ number, ...day });
  }

  const warnings = [];
  const totalStops = days.reduce((sum, d) => sum + d.totals.count, 0);
  if (totalStops === 0) {
    warnings.push({
      tone: 'error',
      text: 'We could not build a plan with these settings. Try a higher budget or a different time of day.',
    });
  }
  if (autos > 1) {
    warnings.push({
      tone: 'info',
      text: `With ${people} people, travel costs assume ${autos} autos (up to ${PEOPLE.perAuto} passengers each).`,
    });
  }
  days.forEach((day) => {
    const early = day.endsAt < win.end - 90;
    if (day.totals.count > 0 && early && day.budgetLimited) {
      const prefix = days.length > 1 ? `Day ${day.number}: ` : '';
      warnings.push({
        tone: 'info',
        text: `${prefix}Your budget is used up by ${formatTime(day.endsAt)}. Raise it to add more stops.`,
      });
    }
    if (day.skipped.length > 0) {
      const prefix = days.length > 1 ? `Day ${day.number}: ` : '';
      warnings.push({ tone: 'info', text: `${prefix}There was not enough budget or time to fit ${joinList(day.skipped)}.` });
    }
  });
  for (const id of pinned) {
    const place = places.find((p) => p.id === id);
    if (place && !excludedSet.has(id) && !used.has(id)) {
      warnings.push({
        tone: 'info',
        text: `${place.name} did not fit this plan. Try a different time of day or a higher budget.`,
      });
    }
  }

  return { window: win, vibe, budget, people, autos, days, warnings };
}

/** Find a catalogue place from text a person typed (for example from the Home page search). */
export function matchPlace(query, places = PLACES) {
  const q = String(query ?? '')
    .trim()
    .toLowerCase();
  if (q.length < 3) return null;
  return (
    places.find((p) => p.name.toLowerCase() === q || p.aliases.includes(q)) ??
    places.find((p) => p.name.toLowerCase().includes(q) || p.aliases.some((alias) => q.includes(alias))) ??
    null
  );
}

/** Make saved or URL-supplied settings safe: unknown values fall back to defaults. */
export function sanitizeInputs(raw = {}, places = PLACES) {
  const ids = new Set(places.map((p) => p.id));
  const budgetNumber = Number(raw.budget);
  const peopleNumber = Math.round(Number(raw.people));
  return {
    vibe: VIBES.some((v) => v.id === raw.vibe) ? raw.vibe : 'solo',
    windowId: WINDOWS.some((w) => w.id === raw.windowId) ? raw.windowId : 'full',
    budget: Number.isFinite(budgetNumber)
      ? clamp(Math.round(budgetNumber / BUDGET.step) * BUDGET.step, BUDGET.min, BUDGET.max)
      : BUDGET.default,
    people: Number.isFinite(peopleNumber) ? clamp(peopleNumber, PEOPLE.min, PEOPLE.max) : PEOPLE.default,
    pinned: Array.isArray(raw.pinned) ? raw.pinned.filter((id) => ids.has(id)).slice(0, 3) : [],
    excluded: Array.isArray(raw.excluded) ? raw.excluded.filter((id) => ids.has(id)).slice(0, 20) : [],
  };
}

export function defaultTitle(inputs) {
  const vibe = VIBES.find((v) => v.id === inputs.vibe)?.label ?? 'Day';
  const win = WINDOWS.find((w) => w.id === inputs.windowId)?.label ?? 'plan';
  return `${vibe} · ${win}`;
}

/** A small description of a plan, saved alongside it so lists can show it without rebuilding. */
export function summarizePlan(plan) {
  const placeStops = plan.days.flatMap((d) => d.stops.filter((s) => s.kind === 'stop'));
  return {
    days: plan.days.length,
    stops: placeStops.length,
    perPerson: Math.max(0, ...plan.days.map((d) => d.totals.total)),
    firstStop: placeStops[0]?.place.name ?? '',
  };
}

/** Plain-text version of one day, for copying or sharing on WhatsApp. */
export function planToText(plan, dayNumber = 1, title = '') {
  const day = plan.days.find((d) => d.number === dayNumber) ?? plan.days[0];
  const lines = [title || `EaseXplore day plan (${plan.window.label})`];
  if (plan.days.length > 1) lines.push(`Day ${day.number}`);
  lines.push('');

  day.stops.forEach((item) => {
    const time = `${formatTime(item.start)} - ${formatTime(item.end)}`;
    if (item.kind === 'rest') {
      lines.push(`${time}  Afternoon break`);
    } else if (item.kind === 'free') {
      lines.push(`${time}  Free time`);
    } else {
      if (item.leg) {
        lines.push(`   Travel: about ${item.leg.km} km by auto, around ${formatRupees(item.leg.autoFare)}`);
      }
      const meal = item.meal ? ` (${MEALS[item.meal].label})` : '';
      lines.push(`${time}  ${item.place.name}${meal}`);
    }
  });

  lines.push('');
  lines.push(
    `Estimated total: ${formatRupees(day.totals.total)} per person (places ${formatRupees(day.totals.places)}, travel ${formatRupees(day.totals.travel)})`,
  );
  lines.push('Costs are rough estimates. Please check timings before you go.');
  return lines.join('\n');
}

/**
 * The planner budget to suggest from a person's daily budget on the Budget page (in paise).
 * It rounds DOWN to the slider's step, so a plan never starts above their budget, and keeps it
 * inside the slider's range. Returns null when no daily budget is set.
 */
export function plannerBudgetFor(dailyBudgetPaise) {
  if (!Number.isFinite(dailyBudgetPaise) || dailyBudgetPaise <= 0) return null;
  const rupees = Math.floor(dailyBudgetPaise / 100);
  const stepped = Math.floor(rupees / BUDGET.step) * BUDGET.step;
  const budget = clamp(stepped, BUDGET.min, BUDGET.max);

  let note = '';
  if (rupees < BUDGET.min) {
    note = `That is below the planner's minimum, so ${formatRupees(budget)} is used.`;
  } else if (rupees > BUDGET.max) {
    note = `The planner goes up to ${formatRupees(BUDGET.max)}, so that is used.`;
  } else if (budget !== rupees) {
    note = `The planner uses ${formatRupees(budget)}, rounded down to its nearest step.`;
  }
  return { dailyPaise: dailyBudgetPaise, dailyLabel: formatMoney(dailyBudgetPaise), budget, note };
}

/**
 * Planner settings from a page address, so links can open the planner ready-made.
 * Understands ?query=Place name (from the Home search), ?pins=id1,id2 (up to 3 places),
 * ?vibe=food and ?window=full. Anything unknown or invalid falls back to a default.
 * @param {URLSearchParams} params
 * @returns {{ inputs: object, queryText: string, queryMatch: object|null }}
 */
export function inputsFromParams(params, places = PLACES) {
  const read = (key) => (typeof params?.get === 'function' ? params.get(key) : null);
  const queryText = String(read('query') ?? '').trim();
  const queryMatch = matchPlace(queryText, places);
  const pins = String(read('pins') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const pinned = [...new Set([...(queryMatch ? [queryMatch.id] : []), ...pins])];
  const inputs = sanitizeInputs({ vibe: read('vibe'), windowId: read('window'), pinned }, places);
  return { inputs, queryText, queryMatch };
}
