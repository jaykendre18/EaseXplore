import { useState } from 'react';
import CategoryPicker from '@/components/budget/CategoryPicker';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import TextField from '@/components/ui/TextField';
import { LIMITS } from '@/config/budget';
import { formatMoney, splitEqually, splitToText, todayISO, validateSplit } from '@/utils/budget';

const MIN_PEOPLE = 2;

/**
 * Splits one bill equally between friends. The first person is always "You".
 * `onAddShare(value)` adds your share to your expenses. The `default...` props only set
 * the starting values (used by tests and examples).
 */
export default function BillSplitter({
  onAddShare,
  defaultDescription = '',
  defaultTotal = '',
  defaultNames = ['You', ''],
  defaultPayer = 0,
}) {
  const [description, setDescription] = useState(defaultDescription);
  const [totalText, setTotalText] = useState(defaultTotal);
  const [names, setNames] = useState(defaultNames);
  const [payer, setPayer] = useState(defaultPayer);
  const [category, setCategory] = useState('food');
  const [message, setMessage] = useState(null);
  const [adding, setAdding] = useState(false);

  const { errors, totalPaise, names: cleanNames } = validateSplit({ totalText, names });
  // "Give every person a name" just means the result is not ready yet, so it is not shown as an error.
  const nameError = errors.names && errors.names !== 'Give every person a name.' ? errors.names : null;
  const ready = Object.keys(errors).length === 0;

  const payerIndex = Math.min(payer, names.length - 1);
  const result = ready ? splitEqually({ totalPaise, names: cleanNames, payerIndex }) : null;
  const text = result ? splitToText({ description, totalPaise, ...result }) : '';
  const myShare = result ? result.shares[0].paise : 0;

  const setName = (index, value) => {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
    setMessage(null);
  };
  const addPerson = () => setNames((current) => [...current, '']);
  const removePerson = (index) => {
    setNames((current) => current.filter((_, i) => i !== index));
    setPayer((current) => (current === index ? 0 : current > index ? current - 1 : current));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ tone: 'success', text: 'Copied. You can paste it into any chat.' });
    } catch {
      setMessage({ tone: 'error', text: 'Could not copy automatically. Try the WhatsApp button instead.' });
    }
  };

  const handleAddShare = async () => {
    setAdding(true);
    setMessage(null);
    try {
      await onAddShare({
        amountPaise: myShare,
        category,
        spentOn: todayISO(),
        note: `Split: ${description.trim() || 'shared bill'}`.slice(0, LIMITS.maxNoteLength),
      });
      setMessage({ tone: 'success', text: `Added your share, ${formatMoney(myShare)}, to today's expenses.` });
    } catch (error) {
      setMessage({ tone: 'error', text: error.message });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card as="section" aria-labelledby="split-title" className="flex flex-col gap-6">
      <div>
        <h2 id="split-title" className="text-headline-sm text-on-surface">
          Split a bill
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Share a bill equally between friends and see who owes whom. It does not move any money. You can send the
          result in a chat.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="What was it for? (optional)"
          placeholder="e.g. Dinner at Vaishali"
          value={description}
          maxLength={60}
          onChange={(event) => setDescription(event.target.value)}
          autoComplete="off"
        />
        <TextField
          label="Total bill (₹)"
          inputMode="decimal"
          placeholder="740"
          value={totalText}
          onChange={(event) => setTotalText(event.target.value)}
          error={totalText.trim() ? errors.total : undefined}
          autoComplete="off"
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-label-lg text-on-surface">Who is sharing it?</legend>
        {names.map((name, index) => (
          <div key={index} className="flex items-end gap-2">
            {index === 0 ? (
              <TextField label="Person 1" value="You" readOnly className="flex-1" />
            ) : (
              <TextField
                label={`Person ${index + 1}`}
                placeholder="Friend's name"
                value={name}
                maxLength={LIMITS.maxNameLength + 10}
                onChange={(event) => setName(index, event.target.value)}
                className="flex-1"
                autoComplete="off"
              />
            )}
            {index >= MIN_PEOPLE && (
              <Button
                variant="ghost"
                icon="close"
                onClick={() => removePerson(index)}
                aria-label={`Remove person ${index + 1}`}
                className="mb-0.5"
              >
                <span className="sr-only">Remove</span>
              </Button>
            )}
          </div>
        ))}
        {nameError && <p className="text-body-sm text-error">{nameError}</p>}
        <Button
          variant="outline"
          size="sm"
          icon="person_add"
          onClick={addPerson}
          disabled={names.length >= LIMITS.maxPeople}
          className="self-start"
        >
          Add a person
        </Button>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="split-payer" className="text-label-lg text-on-surface">
          Who paid the bill?
        </label>
        <select
          id="split-payer"
          value={payerIndex}
          onChange={(event) => setPayer(Number(event.target.value))}
          className="h-12 rounded-2xl bg-surface-container-low px-4 text-body-lg text-on-surface outline-none focus:ring-2 focus:ring-primary-container sm:max-w-xs"
        >
          {names.map((name, index) => (
            <option key={index} value={index}>
              {name.trim() || `Person ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      {result ? (
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-low p-5" aria-live="polite">
          <div>
            <p className="text-label-md uppercase tracking-wider text-on-surface-variant">Each friend owes</p>
            <p className="font-display text-4xl font-bold text-primary">{formatMoney(result.owed[0].paise)}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {result.shares.map((share, index) => (
              <li key={share.name} className="flex items-center justify-between gap-3 text-body-md">
                <span className="flex items-center gap-2 text-on-surface">
                  <Icon name={index === result.payerIndex ? 'account_balance_wallet' : 'person'} size={18} className="text-primary" />
                  {share.name}
                  {index === result.payerIndex && <span className="text-body-sm text-on-surface-variant">(paid the bill)</span>}
                </span>
                <span className="font-semibold text-on-surface">
                  {index === result.payerIndex
                    ? `Own share ${formatMoney(share.paise)}`
                    : `Owes ${result.shares[result.payerIndex].name} ${formatMoney(share.paise)}`}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button
              href={`https://wa.me/?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="tonal"
              size="sm"
              icon="chat"
            >
              Share on WhatsApp
            </Button>
            <Button variant="tonal" size="sm" icon="content_copy" onClick={handleCopy}>
              Copy
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-outline-variant/40 pt-4">
            <p id="split-category-label" className="text-label-lg text-on-surface">
              Add your share ({formatMoney(myShare)}) to your expenses
            </p>
            <CategoryPicker value={category} onChange={setCategory} labelledBy="split-category-label" />
            <Button icon="add" loading={adding} onClick={handleAddShare} className="self-start">
              Add my share
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-container-low p-4 text-body-md text-on-surface-variant">
          Enter the total and everyone&rsquo;s names to see the split.
        </p>
      )}

      {message && <Alert tone={message.tone}>{message.text}</Alert>}
    </Card>
  );
}
