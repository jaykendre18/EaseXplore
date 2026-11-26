// Pure fare calculations. No React, no browser, so they can be tested with `npm test`.
// The rules themselves live in src/config/fares.js.
//
// This file imports with a relative path (not the "@/" shortcut) so Node can run it in tests.
import { AUTO, BUS } from '../config/fares.js';

export const MIN_DISTANCE_KM = 0.1;
export const MAX_DISTANCE_KM = 100;

/** Distances are handled in steps of 0.1 km (100 m), like the meter. */
const toTenth = (km) => Math.round(km * 10) / 10;

export function isValidDistance(km) {
  return Number.isFinite(km) && km >= MIN_DISTANCE_KM && km <= MAX_DISTANCE_KM;
}

/**
 * Auto-rickshaw meter fare.
 * @param {object} options
 * @param {number} options.distanceKm  Trip distance. Rounded to 0.1 km.
 * @param {'none'|'city'|'rural'} [options.night]  Night surcharge to apply to the metered fare.
 * @param {number} [options.waitingMinutes]  Minutes the auto waited.
 * @param {number} [options.luggage]  Packages of 60 x 40 cm or larger.
 */
export function autoFare({ distanceKm, night = 'none', waitingMinutes = 0, luggage = 0 }) {
  const km = toTenth(distanceKm);
  const extraKm = Math.max(0, toTenth(km - AUTO.baseDistanceKm));
  // extraKm is already a multiple of 0.1, so this is a whole number of 100 m steps.
  const steps = Math.round(extraKm / AUTO.stepKm);
  const extraCharge = Math.round(steps * AUTO.perKm * AUTO.stepKm * 100) / 100;
  const meterFare = AUTO.baseFare + extraCharge;

  const nightRule = night === 'none' ? null : AUTO.nightSurcharge[night];
  const nightPercent = nightRule ? nightRule.percent : 0;
  const nightSurcharge = nightRule ? Math.round((meterFare * nightRule.percent) / 100) : 0;

  const waitingCharge = Math.max(0, Math.floor(waitingMinutes)) * AUTO.waitingPerMinute;
  const luggageCharge = Math.max(0, Math.floor(luggage)) * AUTO.luggagePerPackage;

  return {
    distanceKm: km,
    baseFare: AUTO.baseFare,
    extraKm,
    extraCharge,
    meterFare,
    nightPercent,
    nightSurcharge,
    waitingCharge,
    luggageCharge,
    total: meterFare + nightSurcharge + waitingCharge + luggageCharge,
  };
}

/** PMPML single-ticket fare, or null when the distance is beyond the confirmed fare stages. */
export function busFare(distanceKm) {
  const km = toTenth(distanceKm);
  const slab = BUS.slabs.find((item) => km <= item.upToKm);
  return slab ? slab.fare : null;
}

/**
 * Whether printed tariff cards are still accepted.
 * 'transition' until the end of the recalibration period, then 'digital-only'.
 */
export function paperCardStatus(today = new Date()) {
  const lastDay = new Date(`${AUTO.paperCardsValidUntil}T23:59:59`);
  return today <= lastDay ? 'transition' : 'digital-only';
}

/** "2026-09-01" -> "1 September 2026" */
export function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** 1500 -> "₹1,500" */
export function formatRupees(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
