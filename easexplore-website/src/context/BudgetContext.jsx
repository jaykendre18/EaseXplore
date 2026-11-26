import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { deleteExpense, getDailyBudget, listExpenses, saveDailyBudget, saveExpense } from '@/services/budget';
import { sortExpenses } from '@/utils/budget';

const BudgetContext = createContext(null);

const makeId = () =>
  globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `guest-${Date.now()}-${Math.random()}`;

/**
 * Shares the person's expenses and daily budget with every page that needs them.
 *
 * mode 'account': loaded from and saved to the database (logged-in people).
 * mode 'guest':   kept in memory only. It is lost when the page is closed or refreshed.
 *
 * Use it with:  const { expenses, dailyBudget, addExpense, ... } = useBudget();
 */
export function BudgetProvider({ children }) {
  const { user, isConfigured } = useAuth();
  const userId = user?.id;
  const mode = userId && isConfigured ? 'account' : 'guest';

  const [state, setState] = useState({
    status: mode === 'account' ? 'loading' : 'ready', // 'loading' | 'ready' | 'error'
    expenses: [],
    dailyBudget: null, // paise, or null when not set
    error: '',
  });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (mode !== 'account') {
      // Guests (and anyone who just logged out) start from a clean, empty ledger.
      setState({ status: 'ready', expenses: [], dailyBudget: null, error: '' });
      return undefined;
    }

    let active = true;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    Promise.all([listExpenses(), getDailyBudget()])
      .then(([expenses, dailyBudget]) => {
        if (active) setState({ status: 'ready', expenses, dailyBudget, error: '' });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', expenses: [], dailyBudget: null, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [mode, userId, reloadCount]);

  /** `input` is { amountPaise, category, spentOn, note } and must already be validated. */
  const addExpense = useCallback(
    async (input) => {
      const saved =
        mode === 'account'
          ? await saveExpense(input)
          : { id: makeId(), createdAt: new Date().toISOString(), ...input };
      setState((current) => ({ ...current, expenses: sortExpenses([saved, ...current.expenses]) }));
      return saved;
    },
    [mode],
  );

  const removeExpense = useCallback(
    async (id) => {
      if (mode === 'account') await deleteExpense(id);
      setState((current) => ({ ...current, expenses: current.expenses.filter((item) => item.id !== id) }));
    },
    [mode],
  );

  /** `paise` must already be validated. */
  const saveBudget = useCallback(
    async (paise) => {
      if (mode === 'account') await saveDailyBudget(userId, paise);
      setState((current) => ({ ...current, dailyBudget: paise }));
    },
    [mode, userId],
  );

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const value = useMemo(
    () => ({ ...state, mode, isConfigured, addExpense, removeExpense, saveBudget, reload }),
    [state, mode, isConfigured, addExpense, removeExpense, saveBudget, reload],
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('useBudget must be used inside <BudgetProvider>');
  return context;
}
