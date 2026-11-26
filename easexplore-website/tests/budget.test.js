// Run with: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CATEGORIES, LIMITS, QUICK_ADDS } from '../src/config/budget.js';
import { AUTO, BUS } from '../src/config/fares.js';
import {
  addDays,
  byCategory,
  dateLabel,
  filterByRange,
  formatMoney,
  groupByDate,
  isValidISODate,
  parseAmount,
  rangeBounds,
  sortExpenses,
  splitEqually,
  splitToText,
  sumPaise,
  summarizeDay,
  todayISO,
  toPaise,
  validateExpense,
  validateSplit,
} from '../src/utils/budget.js';

const expense = (id, spentOn, amountPaise, category = 'food', createdAt = `${spentOn}T10:00:00Z`) => ({
  id,
  spentOn,
  amountPaise,
  category,
  note: '',
  createdAt,
});

describe('money', () => {
  it('converts rupees to whole paise without decimal errors', () => {
    assert.equal(toPaise(0.1 + 0.2), 30);
    assert.equal(toPaise(99.5), 9950);
    assert.equal(toPaise(1234.56), 123456);
    assert.equal(toPaise(19.99), 1999);
  });

  it('formats rupees with Indian digit grouping, and decimals only when needed', () => {
    assert.equal(formatMoney(18500), '₹185');
    assert.equal(formatMoney(18550), '₹185.50');
    assert.equal(formatMoney(123456700), '₹12,34,567');
    assert.equal(formatMoney(5), '₹0.05');
    assert.equal(formatMoney(0), '₹0');
  });

  it('reads typed amounts in common styles', () => {
    assert.equal(parseAmount('250').paise, 25000);
    assert.equal(parseAmount('  1,250 ').paise, 125000);
    assert.equal(parseAmount('₹99.50').paise, 9950);
    assert.equal(parseAmount('99.5').paise, 9950);
    assert.equal(parseAmount('0.05').paise, 5);
  });

  it('rejects empty, zero, negative, text, three decimals, and absurdly large amounts', () => {
    for (const bad of ['', '   ', '0', '0.00', '-5', 'abc', '12.345', '1e5', '5.', '.5', '12,,3x', '10000000.01']) {
      assert.ok(parseAmount(bad).error, `"${bad}" should be rejected`);
    }
    assert.equal(parseAmount(null).error, 'Enter an amount.');
    assert.equal(parseAmount(undefined).error, 'Enter an amount.');
  });

  it('accepts exactly the largest allowed amount', () => {
    assert.equal(parseAmount('1000000').paise, LIMITS.maxAmountPaise);
    assert.ok(parseAmount('1000000.01').error);
  });
});

describe('dates use the local day, not UTC', () => {
  it('formats a local date', () => {
    assert.equal(todayISO(new Date(2026, 10, 9, 0, 30)), '2026-11-09');
    assert.equal(todayISO(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  });

  it('gives the Indian date at 1 AM IST (when UTC is still the previous day)', () => {
    const before = process.env.TZ;
    process.env.TZ = 'Asia/Kolkata';
    try {
      const oneAmIst = new Date('2026-11-08T19:30:00Z'); // 1:00 AM on 9 Nov in India
      assert.equal(todayISO(oneAmIst), '2026-11-09');
      assert.notEqual(oneAmIst.toISOString().slice(0, 10), '2026-11-09', 'sanity check: UTC date really differs');
    } finally {
      if (before === undefined) delete process.env.TZ;
      else process.env.TZ = before;
    }
  });

  it('adds and subtracts days across month and year ends', () => {
    assert.equal(addDays('2026-11-09', -1), '2026-11-08');
    assert.equal(addDays('2026-11-01', -1), '2026-10-31');
    assert.equal(addDays('2026-01-01', -1), '2025-12-31');
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  });

  it('validates date text, including impossible dates', () => {
    assert.equal(isValidISODate('2026-11-09'), true);
    assert.equal(isValidISODate('2028-02-29'), true);
    assert.equal(isValidISODate('2027-02-29'), false);
    assert.equal(isValidISODate('2026-13-01'), false);
    assert.equal(isValidISODate('09-11-2026'), false);
    assert.equal(isValidISODate(''), false);
    assert.equal(isValidISODate(null), false);
  });

  it('labels dates for the list', () => {
    assert.equal(dateLabel('2026-11-09', '2026-11-09'), 'Today');
    assert.equal(dateLabel('2026-11-08', '2026-11-09'), 'Yesterday');
    assert.ok(dateLabel('2026-11-02', '2026-11-09').includes('2 Nov'));
    assert.ok(dateLabel('2026-11-02', '2026-11-09').includes('2026'));
  });
});

describe('adding an expense', () => {
  const today = '2026-11-09';
  const good = { amountText: '150', category: 'food', date: today, note: ' Cafe Goodluck ' };

  it('accepts a good expense and tidies it up', () => {
    const { errors, value } = validateExpense(good, today);
    assert.deepEqual(errors, {});
    assert.deepEqual(value, { amountPaise: 15000, category: 'food', spentOn: today, note: 'Cafe Goodluck' });
  });

  it('reports every problem at once and returns no value', () => {
    const { errors, value } = validateExpense({ amountText: 'x', category: 'cars', date: '2027-01-01', note: 'n'.repeat(81) }, today);
    assert.equal(value, null);
    assert.deepEqual(Object.keys(errors).sort(), ['amount', 'category', 'date', 'note']);
  });

  it('rejects future, invalid and ancient dates', () => {
    assert.ok(validateExpense({ ...good, date: '2026-11-10' }, today).errors.date);
    assert.ok(validateExpense({ ...good, date: '2026-02-30' }, today).errors.date);
    assert.ok(validateExpense({ ...good, date: '2019-12-31' }, today).errors.date);
    assert.ok(!validateExpense({ ...good, date: '2020-01-01' }, today).errors.date);
  });

  it('allows an empty note', () => {
    assert.equal(validateExpense({ ...good, note: '' }, today).value.note, '');
    assert.equal(validateExpense({ ...good, note: undefined }, today).value.note, '');
  });

  it('every category used by the quick-add buttons exists', () => {
    for (const quick of QUICK_ADDS) {
      assert.ok(CATEGORIES.some((c) => c.id === quick.category), quick.label);
      assert.equal(validateExpense({ amountText: String(quick.amount), category: quick.category, date: today, note: quick.note }, today).value !== null, true);
    }
  });

  it('quick-add fares follow the fare config (so they can never be out of date)', () => {
    assert.equal(QUICK_ADDS.find((q) => q.label.startsWith('Auto')).amount, AUTO.baseFare);
    assert.equal(QUICK_ADDS.find((q) => q.label.startsWith('Bus')).amount, BUS.slabs[0].fare);
  });
});

describe("today's budget summary", () => {
  const today = '2026-11-09';
  const list = [
    expense('a', today, 18000),
    expense('b', today, 2500),
    expense('c', '2026-11-08', 99900), // yesterday: must not count
  ];

  it('adds up only today and shows what is left', () => {
    const s = summarizeDay(list, today, 100000);
    assert.equal(s.spent, 20500);
    assert.equal(s.count, 2);
    assert.equal(s.left, 79500);
    assert.equal(s.over, 0);
    assert.equal(s.percent, 21);
    assert.equal(s.status, 'ok');
  });

  it('warns from 80% of the budget', () => {
    assert.equal(summarizeDay([expense('x', today, 79999)], today, 100000).status, 'ok');
    assert.equal(summarizeDay([expense('x', today, 80000)], today, 100000).status, 'warning');
    assert.equal(summarizeDay([expense('x', today, 100000)], today, 100000).status, 'warning');
  });

  it('says over budget only when spending is above it, and by how much', () => {
    const s = summarizeDay([expense('x', today, 100001)], today, 100000);
    assert.equal(s.status, 'over');
    assert.equal(s.over, 1);
    assert.equal(s.left, 0);
    assert.equal(s.percent, 100);
  });

  it('works with no budget set', () => {
    const s = summarizeDay(list, today, null);
    assert.equal(s.status, 'none');
    assert.equal(s.budget, null);
    assert.equal(s.spent, 20500);
    assert.equal(summarizeDay([], today, 50000).spent, 0);
    assert.equal(summarizeDay([], today, 50000).percent, 0);
  });
});

describe('spending by category', () => {
  it('totals each category, largest first, with shares that add to 100%', () => {
    const rows = byCategory([
      expense('1', '2026-11-09', 10000, 'food'),
      expense('2', '2026-11-09', 5000, 'food'),
      expense('3', '2026-11-09', 20000, 'transport'),
      expense('4', '2026-11-09', 5000, 'entry'),
    ]);
    assert.deepEqual(rows.map((r) => [r.category.id, r.paise]), [['transport', 20000], ['food', 15000], ['entry', 5000]]);
    assert.ok(Math.abs(rows.reduce((s, r) => s + r.share, 0) - 1) < 1e-9);
    assert.equal(rows[0].share, 0.5);
  });

  it('is empty when there is nothing, and ignores unknown categories safely', () => {
    assert.deepEqual(byCategory([]), []);
    assert.deepEqual(byCategory([expense('1', '2026-11-09', 100, 'mystery')]), []);
  });
});

describe('periods and ordering', () => {
  const today = '2026-11-09';
  const list = [
    expense('t', today, 100),
    expense('y', '2026-11-08', 200),
    expense('w', '2026-11-03', 300), // 6 days ago: inside the last 7 days
    expense('o', '2026-11-02', 400), // 7 days ago: outside
    expense('m', '2026-11-01', 500), // first of the month
    expense('p', '2026-10-31', 600), // previous month
  ];

  it('works out the bounds', () => {
    assert.deepEqual(rangeBounds('today', today), { from: today, to: today });
    assert.deepEqual(rangeBounds('week', today), { from: '2026-11-03', to: today });
    assert.deepEqual(rangeBounds('month', today), { from: '2026-11-01', to: today });
    assert.equal(rangeBounds('all', today), null);
  });

  it('filters each period', () => {
    const ids = (range) => filterByRange(list, range, today).map((e) => e.id).join();
    assert.equal(ids('today'), 't');
    assert.equal(ids('week'), 't,y,w');
    assert.equal(ids('month'), 't,y,w,o,m');
    assert.equal(ids('all'), 't,y,w,o,m,p');
  });

  it('sorts newest first, then by when it was added, and does not change the original', () => {
    const shuffled = [
      expense('a', '2026-11-08', 1, 'food', '2026-11-08T09:00:00Z'),
      expense('b', '2026-11-09', 1, 'food', '2026-11-09T08:00:00Z'),
      expense('c', '2026-11-09', 1, 'food', '2026-11-09T12:00:00Z'),
    ];
    const copy = [...shuffled];
    assert.deepEqual(sortExpenses(shuffled).map((e) => e.id), ['c', 'b', 'a']);
    assert.deepEqual(shuffled, copy);
  });

  it('groups by date with daily totals', () => {
    const groups = groupByDate(sortExpenses([expense('a', today, 100), expense('b', today, 250), expense('c', '2026-11-08', 40)]));
    assert.equal(groups.length, 2);
    assert.equal(groups[0].date, today);
    assert.equal(groups[0].totalPaise, 350);
    assert.equal(groups[1].items.length, 1);
    assert.equal(sumPaise(list), 2100);
  });
});

describe('splitting a bill equally', () => {
  it('splits evenly with no leftovers', () => {
    const r = splitEqually({ totalPaise: 74000, names: ['You', 'Rohan', 'Ananya', 'Kabir'], payerIndex: 0 });
    assert.deepEqual(r.shares.map((s) => s.paise), [18500, 18500, 18500, 18500]);
    assert.equal(r.owed.length, 3);
    assert.ok(r.owed.every((o) => o.paise === 18500));
  });

  it('gives leftover paise to the payer, so nobody else overpays', () => {
    const r = splitEqually({ totalPaise: 10000, names: ['You', 'A', 'B'], payerIndex: 0 });
    assert.deepEqual(r.shares.map((s) => s.paise), [3334, 3333, 3333]);
    const r2 = splitEqually({ totalPaise: 10000, names: ['You', 'A', 'B'], payerIndex: 2 });
    assert.deepEqual(r2.shares.map((s) => s.paise), [3333, 3333, 3334]);
    assert.deepEqual(r2.owed.map((o) => o.name), ['You', 'A']);
  });

  it('ALWAYS adds up exactly, for every total and group size tried', () => {
    for (const total of [1, 2, 3, 7, 99, 100, 101, 12345, 99999, 123457, 100000000]) {
      for (let people = 2; people <= 12; people += 1) {
        const names = Array.from({ length: people }, (_, i) => `P${i}`);
        for (const payerIndex of [0, people - 1]) {
          const r = splitEqually({ totalPaise: total, names, payerIndex });
          assert.equal(sumPaise(r.shares.map((s) => ({ amountPaise: s.paise }))), total, `${total} / ${people}`);
          const others = r.owed.map((o) => o.paise);
          assert.ok(Math.max(...others) - Math.min(...others) === 0, 'the people who owe all owe the same');
          assert.ok(r.shares.every((s) => s.paise >= 0));
        }
      }
    }
  });

  it('validates the form', () => {
    assert.deepEqual(validateSplit({ totalText: '740', names: ['You', 'Rohan'] }).errors, {});
    assert.ok(validateSplit({ totalText: '', names: ['You', 'Rohan'] }).errors.total);
    assert.ok(validateSplit({ totalText: '740', names: ['You'] }).errors.names);
    assert.ok(validateSplit({ totalText: '740', names: ['You', ' '] }).errors.names);
    assert.ok(validateSplit({ totalText: '740', names: ['You', 'you'] }).errors.names, 'duplicate names, ignoring capitals');
    assert.ok(validateSplit({ totalText: '740', names: ['You', 'x'.repeat(31)] }).errors.names);
    assert.ok(validateSplit({ totalText: '740', names: Array.from({ length: 13 }, (_, i) => `P${i}`) }).errors.names);
    assert.equal(validateSplit({ totalText: '740', names: [' You ', 'Rohan'] }).names[0], 'You');
    assert.equal(validateSplit({ totalText: '740', names: ['You', 'Rohan'] }).totalPaise, 74000);
  });

  it('writes a clear text for sharing, from the payer’s point of view', () => {
    const base = { description: 'Dinner at Vaishali', totalPaise: 74000 };
    const mine = splitToText({ ...base, ...splitEqually({ totalPaise: 74000, names: ['You', 'Rohan', 'Ananya', 'Kabir'], payerIndex: 0 }) });
    assert.ok(mine.includes('Bill split: Dinner at Vaishali'));
    assert.ok(mine.includes('I paid ₹740.'));
    assert.ok(mine.includes('Rohan owes me ₹185'));
    assert.ok(mine.includes('My own share: ₹185'));
    assert.ok(!mine.includes('You '));

    const theirs = splitToText({ ...base, ...splitEqually({ totalPaise: 74000, names: ['You', 'Rohan', 'Ananya', 'Kabir'], payerIndex: 1 }) });
    assert.ok(theirs.includes('Rohan paid ₹740.'));
    assert.ok(theirs.includes('I owe Rohan ₹185'));
    assert.ok(theirs.includes("Rohan's own share: ₹185"));
    assert.ok(!/undefined|NaN/.test(mine + theirs));
  });

  it('copes with no description and with paise', () => {
    const text = splitToText({ description: '  ', ...splitEqually({ totalPaise: 10001, names: ['You', 'A'], payerIndex: 0 }), totalPaise: 10001 });
    assert.ok(text.startsWith('EaseXplore Bill split\n'));
    assert.ok(text.includes('A owes me ₹50'));
  });
});
