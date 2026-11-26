import Icon from '@/components/ui/Icon';
import { useFavourites } from '@/context/FavouritesContext';

/** A heart that saves or removes a favourite. `onError` receives a message (or '' to clear it). */
export default function FavouriteButton({ placeId, name, onError }) {
  const { isSaved, toggle, pending } = useFavourites();
  const saved = isSaved(placeId);
  const busy = pending.includes(placeId);

  const handleClick = async () => {
    try {
      await toggle(placeId);
      onError?.('');
    } catch (error) {
      onError?.(error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest/90 text-error shadow-sm backdrop-blur-md transition-colors hover:bg-surface-container-lowest disabled:opacity-60"
    >
      <Icon name="favorite" filled={saved} />
    </button>
  );
}
