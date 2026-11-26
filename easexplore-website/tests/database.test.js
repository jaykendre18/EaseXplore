// Run with: npm test
// Checks that the database setup files (supabase/*.sql) agree with the settings in the app,
// so people never hit confusing errors because one side was changed and the other was not.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { CATEGORIES, LIMITS } from '../src/config/budget.js';
import { MAX_SAVED_PLANS } from '../src/config/itinerary.js';
import { MAX_FAVOURITES } from '../src/config/recommendations.js';
import { PLACES } from '../src/data/places.js';

const sql = (name) => readFileSync(new URL(`../supabase/${name}`, import.meta.url), 'utf8');
const itineraries = sql('001_itineraries.sql');
const budget = sql('002_budget.sql');
const favourites = sql('003_favourites.sql');

describe('002_budget.sql matches the app settings', () => {
  it('allows exactly the categories the app offers', () => {
    const match = budget.match(/category\s+text not null check \(category in \(([^)]*)\)\)/);
    assert.ok(match, 'category rule not found');
    const inDatabase = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    assert.deepEqual(inDatabase, CATEGORIES.map((c) => c.id).sort());
  });

  it('uses the same largest expense, note length, budget range and expense cap', () => {
    assert.ok(budget.includes(`amount_paise <= ${LIMITS.maxAmountPaise}`), 'max amount differs');
    assert.ok(budget.includes(`char_length(note) <= ${LIMITS.maxNoteLength}`), 'note length differs');
    assert.ok(
      budget.includes(`between ${LIMITS.minBudgetRupees * 100} and ${LIMITS.maxBudgetRupees * 100}`),
      'daily budget range differs',
    );
    assert.ok(budget.includes(`>= ${LIMITS.maxExpenses}`), 'expense cap differs');
    assert.ok(budget.includes(`date '${LIMITS.earliestDate}'`), 'earliest date differs');
  });
});

describe('001_itineraries.sql matches the app settings', () => {
  it('uses the same saved-plan cap and title length', () => {
    assert.ok(itineraries.includes(`>= ${MAX_SAVED_PLANS}`), 'plan cap differs');
    assert.ok(itineraries.includes('char_length(title) between 1 and 80'), 'title length differs');
  });
});

describe('003_favourites.sql matches the app settings', () => {
  it('uses the same favourites cap', () => {
    assert.ok(favourites.includes(`>= ${MAX_FAVOURITES}`), 'favourites cap differs');
  });

  it('accepts every place id in the catalogue (a rejected id would silently fail to save)', () => {
    const match = favourites.match(/place_id\s+text not null check \(place_id ~ '([^']+)'\)/);
    assert.ok(match, 'place id rule not found');
    const rule = new RegExp(match[1]);
    for (const place of PLACES) assert.ok(rule.test(place.id), `place id "${place.id}" would be rejected by the database`);
  });

  it('allows each person one row per place (no duplicates)', () => {
    assert.ok(favourites.includes('primary key (user_id, place_id)'));
  });
});

describe('security rules in every SQL file', () => {
  for (const [name, text, tables] of [
    ['001_itineraries.sql', itineraries, ['itineraries']],
    ['002_budget.sql', budget, ['expenses', 'budget_settings']],
    ['003_favourites.sql', favourites, ['favourites']],
  ]) {
    for (const table of tables) {
      it(`${name}: ${table} has row level security, no anonymous access and per-user policies`, () => {
        assert.ok(text.includes(`alter table public.${table} enable row level security`), 'RLS not enabled');
        assert.ok(text.includes(`revoke all on table public.${table} from anon`), 'anonymous access not revoked');
        const block = text.split('\n').filter((line) => line.includes(`on public.${table} for`));
        assert.ok(block.length >= 2, 'policies missing');
        for (const line of block) assert.ok(line.includes('to authenticated'), `policy not limited to logged-in users: ${line}`);
        const grant = text.match(new RegExp(`grant ([a-z, ]+) on table public\\.${table} to authenticated`));
        assert.ok(grant, 'grant missing');
        assert.ok(!/\ball\b|truncate|references|trigger/.test(grant[1]), `grant too broad: ${grant[1]}`);
      });
    }
  }

  it('every policy compares against the logged-in person (auth.uid) and the owner column', () => {
    for (const text of [itineraries, budget, favourites]) {
      const policies = text.split(/create policy/).slice(1);
      assert.ok(policies.length > 0);
      for (const policy of policies) {
        assert.ok(/\(select auth\.uid\(\)\) = user_id/.test(policy), `policy does not check the owner: ${policy.slice(0, 60)}`);
      }
    }
  });

  it('can be run twice safely (every create is guarded)', () => {
    for (const text of [itineraries, budget, favourites]) {
      for (const line of text.split('\n').filter((l) => /^create (table|index)/.test(l))) {
        assert.ok(line.includes('if not exists'), `not re-runnable: ${line}`);
      }
      const policies = (text.match(/create policy "([^"]+)"/g) || []).map((p) => p.replace('create policy ', ''));
      for (const name of policies) assert.ok(text.includes(`drop policy if exists ${name}`), `no drop before ${name}`);
    }
  });

  it('never grants delete on budget settings or update on expenses (nothing the app does not need)', () => {
    assert.ok(!/grant[^;]*delete[^;]*budget_settings/.test(budget));
    assert.ok(!/grant[^;]*update[^;]*public\.expenses/.test(budget));
  });
});
