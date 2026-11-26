import { useRef, useState } from 'react';
import CategoryPicker from '@/components/budget/CategoryPicker';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import TextField from '@/components/ui/TextField';
import { CATEGORIES, LIMITS, QUICK_ADDS } from '@/config/budget';
import { formatMoney, todayISO, toPaise, validateExpense } from '@/utils/budget';

const FIELD_IDS = { amount: 'expense-amount', date: 'expense-date', note: 'expense-note' };

/** `onAdd(value)` receives { amountPaise, category, spentOn, note } and returns a promise. */
export default function ExpenseForm({ onAdd }) {
  const amountRef = useRef(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(() => todayISO());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { tone, text }

  const quickAdd = (item) => {
    setAmount(String(item.amount));
    setCategory(item.category);
    setNote(item.note);
    setErrors({});
    setMessage(null);
    amountRef.current?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    const { errors: found, value } = validateExpense({ amountText: amount, category, date, note });
    setErrors(found);
    const first = ['amount', 'date', 'note'].find((key) => found[key]);
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await onAdd(value);
      const label = CATEGORIES.find((item) => item.id === value.category)?.label ?? 'expenses';
      setMessage({ tone: 'success', text: `Added ${formatMoney(value.amountPaise)} to ${label}.` });
      setAmount('');
      setNote('');
      amountRef.current?.focus();
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card as="section" aria-labelledby="add-title" className="flex flex-col gap-5">
      <h2 id="add-title" className="text-headline-sm text-on-surface">
        Add an expense
      </h2>

      <div role="group" aria-label="Quick add" className="flex flex-wrap items-center gap-2">
        <span className="text-label-md text-on-surface-variant">Quick add:</span>
        {QUICK_ADDS.map((item) => (
          <Chip key={item.label} onClick={() => quickAdd(item)}>
            {item.label} {formatMoney(toPaise(item.amount))}
          </Chip>
        ))}
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            ref={amountRef}
            id={FIELD_IDS.amount}
            label="Amount (₹)"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={errors.amount}
            autoComplete="off"
          />
          <TextField
            id={FIELD_IDS.date}
            label="Date"
            type="date"
            min={LIMITS.earliestDate}
            max={todayISO()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            error={errors.date}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p id="expense-category-label" className="text-label-lg text-on-surface">
            Category
          </p>
          <CategoryPicker
            value={category}
            onChange={setCategory}
            labelledBy="expense-category-label"
            error={errors.category}
          />
        </div>

        <TextField
          id={FIELD_IDS.note}
          label="Note (optional)"
          placeholder="e.g. Sujata Mastani"
          maxLength={LIMITS.maxNoteLength + 20}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          error={errors.note}
          autoComplete="off"
        />

        <Button type="submit" size="lg" icon="add" loading={submitting}>
          Add expense
        </Button>
      </form>

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
    </Card>
  );
}
