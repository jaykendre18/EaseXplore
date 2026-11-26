import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import BillSplitter from '@/components/budget/BillSplitter';
import BudgetSummary from '@/components/budget/BudgetSummary';
import CategoryBreakdown from '@/components/budget/CategoryBreakdown';
import ExpenseForm from '@/components/budget/ExpenseForm';
import ExpenseList from '@/components/budget/ExpenseList';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Container from '@/components/ui/Container';
import Icon from '@/components/ui/Icon';
import { LIMITS, PERIODS } from '@/config/budget';
import { ROUTES } from '@/config/routes';
import { useBudget } from '@/context/BudgetContext';
import { withSetupHint } from '@/services/dbErrors';
import { filterByRange, summarizeDay, sumPaise, todayISO } from '@/utils/budget';

export default function Budget() {
  const { status, error, mode, isConfigured, expenses, dailyBudget, addExpense, removeExpense, saveBudget, reload } =
    useBudget();
  const location = useLocation();
  const [period, setPeriod] = useState('week');

  const today = todayISO();
  const summary = summarizeDay(expenses, today, dailyBudget);
  const weekPaise = sumPaise(filterByRange(expenses, 'week', today));
  const inPeriod = filterByRange(expenses, period, today);
  const periodLabel = PERIODS.find((item) => item.id === period)?.label ?? '';

  let body;
  if (status === 'loading') {
    body = (
      <p className="flex items-center gap-2 text-body-lg text-on-surface-variant" role="status">
        <Icon name="progress_activity" className="animate-spin" />
        Loading your budget…
      </p>
    );
  } else if (status === 'error') {
    body = (
      <div className="flex flex-col items-start gap-4">
        <Alert tone="error" title="We could not load your budget">
          {withSetupHint(error, { file: '002_budget.sql', part: 'Part 7' })}
        </Alert>
        <Button variant="outline" icon="refresh" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  } else {
    body = (
      <>
        <BudgetSummary summary={summary} weekPaise={weekPaise} onSaveBudget={saveBudget} />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <ExpenseForm onAdd={addExpense} />
          <BillSplitter onAddShare={addExpense} />
        </div>

        <section aria-labelledby="history-title" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="history-title" className="text-headline-md text-on-surface">
              Your spending
            </h2>
            <div role="group" aria-label="Choose a period" className="flex flex-wrap gap-2">
              {PERIODS.map((item) => (
                <Chip key={item.id} selected={period === item.id} onClick={() => setPeriod(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
            <div className="lg:col-span-2">
              <CategoryBreakdown expenses={inPeriod} periodLabel={periodLabel} />
            </div>
            <div className="lg:col-span-3">
              <ExpenseList key={period} expenses={inPeriod} today={today} onRemove={removeExpense} />
            </div>
          </div>
          {expenses.length >= LIMITS.listLimit && (
            <p className="text-body-sm text-on-surface-variant">
              Showing your latest {LIMITS.listLimit.toLocaleString('en-IN')} expenses.
            </p>
          )}
        </section>
      </>
    );
  }

  return (
    <Container className="flex flex-col gap-space-xl py-space-xl">
      <header className="flex flex-col gap-3">
        <Badge tone="primary" icon="savings" className="self-start">
          {mode === 'account' ? 'Saved to your account' : 'Try it out'}
        </Badge>
        <h1 className="font-display text-display-lg-mobile text-on-surface sm:text-display-lg">
          Budget &amp; Expense
        </h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">
          Set a daily budget, log what you spend, and split bills with friends. Amounts are in rupees.
        </p>
      </header>

      {mode === 'guest' && (
        <Alert tone="info" title="Nothing is saved until you log in">
          {isConfigured
            ? 'You can try everything here, but your expenses are lost when you close or refresh this page.'
            : 'Accounts are not switched on yet, so nothing can be saved. You can still try everything here.'}
          {isConfigured && (
            <span className="mt-3 block">
              <Button to={ROUTES.login.path} state={{ from: location }} size="sm" icon="login">
                Log in to save
              </Button>
            </span>
          )}
        </Alert>
      )}

      {body}
    </Container>
  );
}
