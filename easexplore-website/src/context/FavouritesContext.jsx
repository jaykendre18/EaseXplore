import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MAX_FAVOURITES } from '@/config/recommendations';
import { useAuth } from '@/context/AuthContext';
import { addFavourite, listFavourites, removeFavourite } from '@/services/favourites';

const FavouritesContext = createContext(null);

/**
 * Shares the person's favourite places with every page that needs them.
 *
 * mode 'account': loaded from and saved to the database (logged-in people).
 * mode 'guest':   kept in memory only, so it is lost when the page is closed or refreshed.
 *
 * Use it with:  const { ids, isSaved, toggle, pending } = useFavourites();
 */
export function FavouritesProvider({ children }) {
  const { user, isConfigured } = useAuth();
  const userId = user?.id;
  const mode = userId && isConfigured ? 'account' : 'guest';

  const [state, setState] = useState({
    status: mode === 'account' ? 'loading' : 'ready', // 'loading' | 'ready' | 'error'
    ids: [],
    error: '',
  });
  const [pending, setPending] = useState([]);
  const [reloadCount, setReloadCount] = useState(0);

  // Always read the latest list inside toggle() without re-creating it on every change.
  const idsRef = useRef(state.ids);
  idsRef.current = state.ids;

  useEffect(() => {
    if (mode !== 'account') {
      setState({ status: 'ready', ids: [], error: '' });
      return undefined;
    }

    let active = true;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    listFavourites()
      .then((ids) => {
        if (active) setState({ status: 'ready', ids, error: '' });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', ids: [], error: error.message });
      });
    return () => {
      active = false;
    };
  }, [mode, userId, reloadCount]);

  /** Saves or removes a favourite. Rejects with a message that is safe to show. */
  const toggle = useCallback(
    async (placeId) => {
      const saved = idsRef.current.includes(placeId);
      if (!saved && idsRef.current.length >= MAX_FAVOURITES) {
        throw new Error(`You have reached the limit of ${MAX_FAVOURITES} favourites. Remove some to add more.`);
      }

      setPending((current) => [...current, placeId]);
      try {
        if (mode === 'account') {
          if (saved) await removeFavourite(placeId);
          else await addFavourite(placeId);
        }
        setState((current) => ({
          ...current,
          ids: saved ? current.ids.filter((id) => id !== placeId) : [...current.ids, placeId],
        }));
      } finally {
        setPending((current) => current.filter((id) => id !== placeId));
      }
    },
    [mode],
  );

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  const value = useMemo(
    () => ({
      ...state,
      mode,
      isConfigured,
      pending,
      isSaved: (placeId) => state.ids.includes(placeId),
      toggle,
      reload,
    }),
    [state, mode, isConfigured, pending, toggle, reload],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error('useFavourites must be used inside <FavouritesProvider>');
  return context;
}
