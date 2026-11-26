// Pure budget logic. No React, no browser, so it can be tested with `npm test`.
// Settings live in src/config/budget.js. Money is whole PAISE (100 paise = Rs 1).
//
// Relative imports (not "@/") so Node can run this file in tests.
import { CATEGORIES, LIMITS } from '../config/budget.js';

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

export const toPaise = (rupees) => Math.round(rupees * 100);

/** 18500 -> "₹185", 18550 -> "₹185.50", 123456700 -> "₹12,34,567" */
export function formatMoney(paise) {
  const rupees = paise / 100;
  const whole = Number.isInteger(rupees);
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Reads what a person typed ("250", "1,250", "₹99.50"). Returns { paise } or { error }. */
export function parseAmount(text) {
  const cleaned = String(text ?? '').replace(/[₹,\s]/g, '');
  if (cleaned === '') return { error: 'Enter an amount.' };
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { error: 'Enter a number like 250 or 99.50.' };
  const paise = toPaise(Number(cleaned));
  if (paise <= 0) return { error: 'The amount must be more than zero.' };
  if (paise > LIMITS.maxAmountPaise) {
    return { error: `That amount is too large. The most you can enter is ${formatMoney(LIMITS.maxAmountPaise)}.` };
  }
  return { paise };
}

export const sumPaise = (items) => items.reduce((total, item) => total + item.amountPaise, 0);

// ---------------------------------------------------------------------------
// Dates (as YYYY-MM-DD text, using the person's LOCAL date, not UTC)
// ---------------------------------------------------------------------------

/** Today's date where the person is. (toISOString would give the UTC date, which is wrong in India before 5:30 AM.) */
export function todayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(iso, delta) {
  const [year, month, day] = iso.split('-').map(Number);
  return todayISO(new Date(year, month - 1, day + delta));
}

export function isValidISODate(iso) {
  return typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && addDays(iso, 0) === iso;
}

/** "Today", "Yesterday", or "Mon, 9 Nov 2026". */
export function dateLabel(iso, today) {
  if (iso === today) return 'Today';
  if (iso === addDays(today, -1)) return 'Yesterday';
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

/**
 * Checks the add-expense form. Returns { errors, value }. `value` is null when anything is wrong.
 * @param {{amountText: string, category: string, date: string, note: string}} input
 */
export function validateExpense({ amountText, category, date, note }, today = todayISO()) {
  const errors = {};

  const amount = parseAmount(amountText);
  if (amount.error) errors.amount = amount.error;

  if (!CATEGORIES.some((item) => item.id === category)) errors.category = 'Choose a category.';

  if (!isValidISODate(date)) errors.date = 'Choose a valid date.';
  else if (date > today) errors.date = 'The date cannot be in the future.';
  else if (date < LIMITS.earliestDate) errors.date = 'That date is too far in the past.';

  const cleanNote = String(note ?? '').trim();
  if (cleanNote.length > LIMITS.maxNoteLength) errors.note = `Keep the note under ${LIMITS.maxNoteLength} characters.`;

  if (Object.keys(errors).length > 0) return { errors, value: null };
  return { errors, value: { amountPaise: amount.paise, category, spentOn: date, note: cleanNote } };
}

/** Newest first: by date, then by when it was added. */
export function sortExpenses(expenses) {
  return [...expenses].sort((a, b) => {
    if (a.spentOn !== b.spentOn) return a.spentOn < b.spentOn ? 1 : -1;
    if ((a.createdAt ?? '') !== (b.createdAt ?? '')) return (a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
}

/** Today's spending against the daily budget. `budgetPaise` may be null when none is set. */
export function summarizeDay(expenses, dateISO, budgetPaise) {
  const today = expenses.filter((item) => item.spentOn === dateISO);
  const spent = sumPaise(today);
  if (!budgetPaise) {
    return { spent, count: today.length, budget: null, left: null, over: 0, percent: 0, status: 'none' };
  }
  const left = budgetPaise - spent;
  let status = 'ok';
  if (spent > budgetPaise) status = 'over';
  else if (spent >= budgetPaise * LIMITS.warnAt) status = 'warning';
  return {
    spent,
    count: today.length,
    budget: budgetPaise,
    left: Math.max(0, left),
    over: Math.max(0, -left),
    percent: Math.min(100, Math.round((spent / budgetPaise) * 100)),
    status,
  };
}

/** [{ category, paise, share }] for categories with spending, largest first. `share` is 0 to 1. */
export function byCategory(expenses) {
  const total = sumPaise(expenses);
  return CATEGORIES.map((category) => {
    const paise = sumPaise(expenses.filter((item) => item.category === category.id));
    return { category, paise, share: total > 0 ? paise / total : 0 };
  })
    .filter((row) => row.paise > 0)
    .sort((a, b) => b.paise - a.paise);
}

/** The first and last date (inclusive) of a period, or null for "all time". */
export function rangeBounds(range, today) {
  if (range === 'today') return { from: today, to: today };
  if (range === 'week') return { from: addDays(today, -6), to: today };
  if (range === 'month') return { from: `${today.slice(0, 7)}-01`, to: today };
  return null;
}

export function filterByRange(expenses, range, today) {
  const bounds = rangeBounds(range, today);
  if (!bounds) return expenses;
  return expenses.filter((item) => item.spentOn >= bounds.from && item.spentOn <= bounds.to);
}

/** Groups newest-first expenses into [{ date, items, totalPaise }] keeping their order. */
export function groupByDate(expenses) {
  const groups = [];
  for (const item of expenses) {
    const last = groups[groups.length - 1];
    if (last && last.date === item.spentOn) {
      last.items.push(item);
      last.totalPaise += item.amountPaise;
    } else {
      groups.push({ date: item.spentOn, items: [item], totalPaise: item.amountPaise });
    }
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Splitting a bill equally
// ---------------------------------------------------------------------------

/** Checks the splitter form. Returns { errors, totalPaise, names }. */
export function validateSplit({ totalText, names }) {
  const errors = {};
  const total = parseAmount(totalText);
  if (total.error) errors.total = total.error;

  const cleaned = names.map((name) => String(name ?? '').trim());
  if (cleaned.length < 2) errors.names = 'Add at least two people.';
  else if (cleaned.length > LIMITS.maxPeople) errors.names = `The most people is ${LIMITS.maxPeople}.`;
  else if (cleaned.some((name) => name === '')) errors.names = 'Give every person a name.';
  else if (cleaned.some((name) => name.length > LIMITS.maxNameLength)) {
    errors.names = `Keep each name under ${LIMITS.maxNameLength} characters.`;
  } else if (new Set(cleaned.map((name) => name.toLowerCase())).size !== cleaned.length) {
    errors.names = 'Each person needs a different name.';
  }

  return { errors, totalPaise: total.paise ?? null, names: cleaned };
}

/**
 * Splits a bill equally. Every other person pays the same whole-paise amount;
 * the payer's own share absorbs any leftover paise, so the shares always add up exactly.
 */
export function splitEqually({ totalPaise, names, payerIndex = 0 }) {
  const count = names.length;
  const base = Math.floor(totalPaise / count);
  const leftover = totalPaise - base * count;
  const shares = names.map((name, index) => ({
    name,
    paise: index === payerIndex ? base + leftover : base,
  }));
  return {
    shares,
    payerIndex,
    owed: shares.filter((_, index) => index !== payerIndex),
  };
}

/** Plain text for copying or sharing. "You" is written as "I" so it reads right for everyone else. */
export function splitToText({ description, totalPaise, shares, payerIndex }) {
  const you = 'You';
  const subject = (name) => (name === you ? 'I' : name);
  const object = (name) => (name === you ? 'me' : name);
  const payer = shares[payerIndex].name;
  const title = description.trim() ? `Bill split: ${description.trim()}` : 'Bill split';

  const lines = [`EaseXplore ${title}`, `Total ${formatMoney(totalPaise)} shared by ${shares.length} people`, ''];
  lines.push(`${subject(payer)} paid ${formatMoney(totalPaise)}.`);
  shares.forEach((share, index) => {
    if (index === payerIndex) return;
    const verb = share.name === you ? 'owe' : 'owes';
    lines.push(`${subject(share.name)} ${verb} ${object(payer)} ${formatMoney(share.paise)}`);
  });
  lines.push('');
  lines.push(`${payer === you ? 'My' : `${payer}'s`} own share: ${formatMoney(shares[payerIndex].paise)}`);
  return lines.join('\n');
}
