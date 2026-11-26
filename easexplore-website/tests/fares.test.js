// Run with: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  autoFare,
  busFare,
  formatDate,
  formatRupees,
  isValidDistance,
  paperCardStatus,
} from '../src/utils/fares.js';

describe('auto-rickshaw fare (rates from 1 September 2026)', () => {
  // Example distances and fares from the published tariff table.
  const published = [
    { km: 1.5, day: 30, city: 38, rural: 42 },
    { km: 2.4, day: 48, city: 60, rural: 67 },
    { km: 3.6, day: 72, city: 90, rural: 101 },
    { km: 5, day: 100, city: 125, rural: 140 },
    { km: 10, day: 200, city: 250, rural: 280 },
    { km: 15, day: 300, city: 375, rural: 420 },
    { km: 21, day: 420, city: 525, rural: 588 },
  ];

  for (const row of published) {
    it(`${row.km} km: day ${row.day}, city night ${row.city}, rural night ${row.rural}`, () => {
      assert.equal(autoFare({ distanceKm: row.km }).total, row.day);
      assert.equal(autoFare({ distanceKm: row.km, night: 'city' }).total, row.city);
      assert.equal(autoFare({ distanceKm: row.km, night: 'rural' }).total, row.rural);
    });
  }

  it('charges the minimum fare for very short trips', () => {
    assert.equal(autoFare({ distanceKm: 0.1 }).total, 30);
    assert.equal(autoFare({ distanceKm: 1 }).total, 30);
    assert.equal(autoFare({ distanceKm: 1.5 }).total, 30);
  });

  it('adds Rs 2 for each extra 100 m after 1.5 km', () => {
    assert.equal(autoFare({ distanceKm: 1.6 }).total, 32);
    assert.equal(autoFare({ distanceKm: 1.7 }).total, 34);
  });

  it('is not thrown off by decimal rounding (2.4 - 1.5 is not exactly 0.9 in JavaScript)', () => {
    assert.equal(autoFare({ distanceKm: 2.4 }).total, 48);
    assert.equal(autoFare({ distanceKm: 4.7 }).total, 94);
    assert.equal(autoFare({ distanceKm: 12.3 }).total, 246);
  });

  it('rounds typed distances to the nearest 0.1 km', () => {
    assert.equal(autoFare({ distanceKm: 3.64 }).total, 72);
    assert.equal(autoFare({ distanceKm: 3.66 }).total, 74);
  });

  it('adds waiting time (Rs 2 per minute) and luggage (Rs 3 per large package)', () => {
    const fare = autoFare({ distanceKm: 5, waitingMinutes: 10, luggage: 2 });
    assert.equal(fare.waitingCharge, 20);
    assert.equal(fare.luggageCharge, 6);
    assert.equal(fare.total, 126);
  });

  it('applies the night surcharge to the metered fare only, not to waiting or luggage', () => {
    const fare = autoFare({ distanceKm: 5, night: 'city', waitingMinutes: 10, luggage: 1 });
    assert.equal(fare.nightSurcharge, 25);
    assert.equal(fare.total, 100 + 25 + 20 + 3);
  });

  it('ignores negative or fractional waiting and luggage values', () => {
    const fare = autoFare({ distanceKm: 5, waitingMinutes: -4, luggage: 1.9 });
    assert.equal(fare.waitingCharge, 0);
    assert.equal(fare.luggageCharge, 3);
  });

  it('breakdown parts add up to the total', () => {
    const f = autoFare({ distanceKm: 7.3, night: 'rural', waitingMinutes: 3, luggage: 2 });
    assert.equal(f.baseFare + f.extraCharge + f.nightSurcharge + f.waitingCharge + f.luggageCharge, f.total);
  });
});

describe('PMPML bus fare (from 1 June 2025)', () => {
  it('uses the confirmed fare stages, including the boundaries', () => {
    assert.equal(busFare(0.5), 10);
    assert.equal(busFare(5), 10);
    assert.equal(busFare(5.1), 20);
    assert.equal(busFare(10), 20);
    assert.equal(busFare(10.1), 30);
    assert.equal(busFare(15), 30);
  });

  it('does not guess fares beyond the confirmed stages', () => {
    assert.equal(busFare(15.1), null);
    assert.equal(busFare(40), null);
  });
});

describe('distance validation', () => {
  it('accepts normal distances', () => {
    assert.equal(isValidDistance(0.1), true);
    assert.equal(isValidDistance(14.2), true);
    assert.equal(isValidDistance(100), true);
  });

  it('rejects empty, zero, negative, too long and non-numeric values', () => {
    assert.equal(isValidDistance(NaN), false);
    assert.equal(isValidDistance(parseFloat('')), false);
    assert.equal(isValidDistance(parseFloat('abc')), false);
    assert.equal(isValidDistance(0), false);
    assert.equal(isValidDistance(-3), false);
    assert.equal(isValidDistance(100.5), false);
    assert.equal(isValidDistance(Infinity), false);
  });
});

describe('printed tariff card deadline', () => {
  it('is in the transition period until 28 February 2027', () => {
    assert.equal(paperCardStatus(new Date('2026-11-08T10:00:00')), 'transition');
    assert.equal(paperCardStatus(new Date('2027-02-28T22:00:00')), 'transition');
  });

  it('switches to digital meters only from 1 March 2027', () => {
    assert.equal(paperCardStatus(new Date('2027-03-01T00:30:00')), 'digital-only');
    assert.equal(paperCardStatus(new Date('2028-01-01T12:00:00')), 'digital-only');
  });
});

describe('rupee formatting', () => {
  it('uses Indian digit grouping', () => {
    assert.equal(formatRupees(30), '₹30');
    assert.equal(formatRupees(1500), '₹1,500');
    assert.equal(formatRupees(125000), '₹1,25,000');
  });
});

describe('date formatting', () => {
  it('writes dates in full', () => {
    assert.equal(formatDate('2026-09-01'), '1 September 2026');
    assert.equal(formatDate('2027-02-28'), '28 February 2027');
  });
});
